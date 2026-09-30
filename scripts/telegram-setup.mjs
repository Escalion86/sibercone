import { withTelegramProxy } from '../lib/telegramProxy.js'

const token = process.env.TELEGRAM_BOT_TOKEN
const secret = process.env.TELEGRAM_WEBHOOK_SECRET
const site = process.env.NEXTAUTH_SITE

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан')
  process.exit(1)
}

const method = process.argv.includes('--delete')
  ? 'deleteWebhook'
  : process.argv.includes('--info')
    ? 'getWebhookInfo'
    : 'setWebhook'

let payload = {}
if (method === 'setWebhook') {
  if (!site || !secret) {
    console.error('Для установки webhook нужны NEXTAUTH_SITE и TELEGRAM_WEBHOOK_SECRET')
    process.exit(1)
  }
  payload = {
    url: `${site.replace(/\/$/, '')}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ['message'],
  }
}

try {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    withTelegramProxy({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
  const result = await response.json()
  console.log(JSON.stringify(result, null, 2))
  if (!response.ok || !result.ok) process.exitCode = 1
} catch (error) {
  console.error('Ошибка запроса к Telegram:', error.message)
  process.exitCode = 1
}
