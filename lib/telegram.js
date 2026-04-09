const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.description || `Telegram send failed: ${res.status}`)
  }

  return res.json()
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
