import dbConnect from '@/lib/mongodb'
import NotificationSettings, {
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/models/NotificationSettings'
import { sendPushToAdmins } from '@/lib/push'
import { sendTelegramMessage } from '@/lib/telegram'

export async function notifyAdmins({ event, title, body, url, telegramText }) {
  const summary = {
    push: { sent: 0, failed: 0 },
    telegram: { sent: 0, failed: 0 },
  }

  try {
    if (event !== 'test') {
      let settings = null
      try {
        await dbConnect()
        settings = await NotificationSettings.findOne({ key: 'admin' }).lean()
      } catch (error) {
        console.error('Ошибка чтения настроек уведомлений:', error)
      }
      const enabled = settings
        ? settings[event]
        : DEFAULT_NOTIFICATION_SETTINGS[event]
      if (!enabled) return summary
    }

    const [pushResult, telegramResult] = await Promise.allSettled([
      sendPushToAdmins({ title, body, url, tag: event }),
      sendTelegramMessage(telegramText || body, { url }),
    ])

    if (pushResult.status === 'fulfilled') summary.push = pushResult.value
    else console.error('Рассылка Web Push не выполнена:', pushResult.reason)

    if (telegramResult.status === 'fulfilled') {
      summary.telegram.sent = telegramResult.value.filter(
        (result) => result.status === 'fulfilled',
      ).length
      summary.telegram.failed = telegramResult.value.filter(
        (result) => result.status === 'rejected',
      ).length
      telegramResult.value
        .filter((result) => result.status === 'rejected')
        .forEach((result) =>
          console.error('Ошибка отправки Telegram:', result.reason),
        )
    } else {
      console.error('Рассылка Telegram не выполнена:', telegramResult.reason)
    }
  } catch (error) {
    console.error('Ошибка уведомления администраторов:', error)
  }

  return summary
}
