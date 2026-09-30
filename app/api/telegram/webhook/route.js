import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import TelegramLinkCode from '@/models/TelegramLinkCode'
import TelegramSubscriber from '@/models/TelegramSubscriber'
import NotificationSettings, {
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/models/NotificationSettings'
import { sendTelegramToChat } from '@/lib/telegram'

async function reply(chatId, text) {
  try {
    await sendTelegramToChat(chatId, text)
  } catch (error) {
    console.error('Ошибка ответа Telegram webhook:', error)
  }
}

export async function POST(request) {
  if (
    !process.env.TELEGRAM_WEBHOOK_SECRET ||
    request.headers.get('x-telegram-bot-api-secret-token') !==
      process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const update = await request.json()
    const message = update.message
    if (!message?.chat?.id || !message.text) return NextResponse.json({ ok: true })

    const chatId = String(message.chat.id)
    const [command, argument] = message.text.trim().split(/\s+/, 2)
    await dbConnect()

    if (command === '/start' && argument) {
      const linkCode = await TelegramLinkCode.findOneAndDelete({
        code: argument,
        expiresAt: { $gt: new Date() },
      })
      if (!linkCode) {
        await reply(chatId, 'Код недействителен или уже истёк. Создайте новую ссылку в админке.')
      } else {
        await TelegramSubscriber.findOneAndUpdate(
          { chatId },
          {
            username: message.from?.username || '',
            firstName: message.from?.first_name || '',
            enabled: true,
            linkedAt: new Date(),
            codeUsed: argument,
          },
          { upsert: true, new: true, runValidators: true },
        )
        await reply(chatId, '✅ Чат подключён к уведомлениям Sibercone.')
      }
    } else if (command === '/stop') {
      await TelegramSubscriber.updateOne({ chatId }, { enabled: false })
      await reply(chatId, 'Уведомления отключены. Подключить чат снова можно из админки.')
    } else if (command === '/status') {
      const [subscriber, settings] = await Promise.all([
        TelegramSubscriber.findOne({ chatId }).lean(),
        NotificationSettings.findOne({ key: 'admin' }).lean(),
      ])
      const flags = settings || DEFAULT_NOTIFICATION_SETTINGS
      const enabledEvents = [
        flags.newOrder && 'новые заказы',
        flags.newUser && 'регистрации',
        flags.codeRedeemed && 'активации кодов',
      ].filter(Boolean)
      await reply(
        chatId,
        subscriber?.enabled
          ? `✅ Чат подключён. Включено: ${enabledEvents.join(', ') || 'нет событий'}.`
          : 'Этот чат не подключён. Создайте ссылку в админке.',
      )
    } else {
      await reply(chatId, 'Используйте /status для проверки или /stop для отключения уведомлений.')
    }
  } catch (error) {
    console.error('Ошибка Telegram webhook:', error)
  }

  return NextResponse.json({ ok: true })
}
