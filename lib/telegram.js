import dbConnect from '@/lib/mongodb'
import TelegramSubscriber from '@/models/TelegramSubscriber'

const MAX_MESSAGE_LENGTH = 4096

function envChatIds() {
  return (process.env.TELEGRAM_CHAT_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

function splitMessage(text) {
  const parts = []
  let rest = String(text)
  while (rest.length > MAX_MESSAGE_LENGTH) {
    let splitAt = rest.lastIndexOf('\n', MAX_MESSAGE_LENGTH)
    if (splitAt < MAX_MESSAGE_LENGTH / 2) splitAt = MAX_MESSAGE_LENGTH
    parts.push(rest.slice(0, splitAt))
    rest = rest.slice(splitAt).replace(/^\n/, '')
  }
  if (rest) parts.push(rest)
  return parts
}

export async function getTelegramChatIds() {
  const ids = new Set(envChatIds())
  try {
    await dbConnect()
    const subscribers = await TelegramSubscriber.find(
      { enabled: true },
      { chatId: 1 },
    ).lean()
    subscribers.forEach(({ chatId }) => ids.add(chatId))
  } catch (error) {
    console.error('Не удалось загрузить Telegram-подписчиков:', error.message)
  }
  return [...ids]
}

export async function sendTelegramToChat(chatId, text, { url } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN не настроен')

  const parts = splitMessage(text)
  const responses = []
  for (let index = 0; index < parts.length; index += 1) {
    const payload = {
      chat_id: chatId,
      text: parts[index],
      parse_mode: 'HTML',
    }
    if (url && index === parts.length - 1) {
      const absoluteUrl = new URL(url, process.env.NEXTAUTH_SITE || 'https://sibercone.ru').toString()
      payload.reply_markup = {
        inline_keyboard: [[{ text: 'Открыть в админке', url: absoluteUrl }]],
      }
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) {
      throw new Error(result.description || `Telegram: HTTP ${response.status}`)
    }
    responses.push(result)
  }
  return responses
}

export async function sendTelegramMessage(text, options = {}) {
  const chatIds = await getTelegramChatIds()
  if (chatIds.length === 0) return []

  return Promise.allSettled(
    chatIds.map((chatId) => sendTelegramToChat(chatId, text, options)),
  )
}

export function formatOrderMessage(order) {
  const items = order.items
    .map(
      (item, i) =>
        `  ${i + 1}. ${item.name} × ${item.quantity} — ${item.price * item.quantity} ₽`,
    )
    .join('\n')

  const deliveryLabels = {
    cdek: 'СДЭК',
    pochta: 'Почта России',
    pickup: 'Самовывоз',
  }

  return `🛒 <b>Новый заказ!</b>

<b>Клиент:</b> ${order.customerName}
<b>Телефон:</b> ${order.phone}
<b>Адрес:</b> ${order.address}
<b>Доставка:</b> ${deliveryLabels[order.deliveryMethod] || order.deliveryMethod}

<b>Товары:</b>
${items}

<b>Итого: ${order.total} ₽</b>`
}
