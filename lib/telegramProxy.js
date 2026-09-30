import { ProxyAgent, fetch as undiciFetch } from 'undici'

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

/**
 * fetch для api.telegram.org. Через прокси используется fetch из самого undici:
 * встроенный в Node fetch несовместим с ProxyAgent из undici 8 и падает с
 * `invalid onRequestStart method`.
 */
export function telegramFetch(url, options = {}) {
  const dispatcher = getTelegramProxyDispatcher()
  if (!dispatcher) return fetch(url, options)
  return undiciFetch(url, { ...options, dispatcher })
}

export function isTelegramProxyConfigured() {
  return Boolean(String(process.env.TELEGRAM_PROXY_URL || '').trim())
}
