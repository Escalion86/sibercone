const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

export async function sendTelegramMessage(text) {
  if (TELEGRAM_CHAT_IDS.length === 0) return []

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

  const results = await Promise.allSettled(
    TELEGRAM_CHAT_IDS.map((chatId) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(
            err.description || `Telegram send failed: ${res.status}`,
          )
        }
        return res.json()
      }),
    ),
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length === TELEGRAM_CHAT_IDS.length) {
    throw new Error(failed[0].reason?.message || 'All Telegram sends failed')
  }

  return results
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
