import { ProxyAgent } from 'undici'

let proxyUrl
let proxyAgent

export function getTelegramProxyDispatcher() {
  const configuredUrl = String(process.env.TELEGRAM_PROXY_URL || '').trim()
  if (!configuredUrl) return undefined

  if (!proxyAgent || proxyUrl !== configuredUrl) {
    proxyUrl = configuredUrl
    proxyAgent = new ProxyAgent(configuredUrl)
  }

  return proxyAgent
}

export function withTelegramProxy(options = {}) {
  const dispatcher = getTelegramProxyDispatcher()
  return dispatcher ? { ...options, dispatcher } : options
}
