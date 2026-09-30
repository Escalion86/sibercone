'use client'

import { useCallback, useEffect, useState } from 'react'

const eventLabels = {
  newOrder: ['Новые заказы', 'Уведомлять сразу после оформления заказа'],
  newUser: ['Новые пользователи', 'Уведомлять после регистрации клиента'],
  codeRedeemed: ['Активации кодов', 'Уведомлять при использовании кода курса'],
}

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

async function responseJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
  return data
}

export default function AdminNotifications() {
  const [push, setPush] = useState({ subscriptions: [], count: 0 })
  const [telegram, setTelegram] = useState({ subscribers: [], count: 0 })
  const [settings, setSettings] = useState(null)
  const [permission, setPermission] = useState('unsupported')
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pushData, telegramData, settingsData] = await Promise.all([
        fetch('/api/admin/push/status').then(responseJson),
        fetch('/api/admin/telegram/status').then(responseJson),
        fetch('/api/admin/notifications/settings').then(responseJson),
      ])
      setPush(pushData)
      setTelegram(telegramData)
      setSettings(settingsData)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setPermission(Notification.permission)
      navigator.serviceWorker
        .getRegistration('/sw.js')
        .then((registration) => registration?.pushManager.getSubscription())
        .then((subscription) => setCurrentSubscription(subscription || null))
        .catch(() => {})
    }
  }, [loadData])

  async function enablePush() {
    setBusy('push')
    setMessage('')
    try {
      if (!push.publicKey) throw new Error('VAPID-ключи не настроены на сервере')
      const granted = await Notification.requestPermission()
      setPermission(granted)
      if (granted !== 'granted') throw new Error('Браузер не разрешил уведомления')
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(push.publicKey),
        }))
      await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      }).then(responseJson)
      setCurrentSubscription(subscription)
      setMessage('Push-уведомления включены в этом браузере')
      await loadData()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function disablePush() {
    setBusy('push')
    try {
      if (currentSubscription) {
        await fetch('/api/admin/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: currentSubscription.endpoint }),
        }).then(responseJson)
        await currentSubscription.unsubscribe()
      }
      setCurrentSubscription(null)
      setMessage('Push-уведомления отключены в этом браузере')
      await loadData()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function testNotifications() {
    setBusy('test')
    try {
      const result = await fetch('/api/admin/push/test', { method: 'POST' }).then(responseJson)
      setMessage(`Push: ${result.push.sent} доставлено, ${result.push.failed} ошибок. Telegram: ${result.telegram.sent} доставлено, ${result.telegram.failed} ошибок.`)
      await loadData()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function removeItem(type, id) {
    setBusy(id)
    try {
      await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' }).then(responseJson)
      await loadData()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function connectTelegram() {
    setBusy('telegram')
    try {
      const data = await fetch('/api/admin/telegram/link', { method: 'POST' }).then(responseJson)
      window.open(data.url, '_blank', 'noopener,noreferrer')
      setMessage('Откройте бота и нажмите Start. Ссылка действует 15 минут.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function toggleEvent(key) {
    const next = !settings[key]
    setSettings((value) => ({ ...value, [key]: next }))
    try {
      const saved = await fetch('/api/admin/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next }),
      }).then(responseJson)
      setSettings(saved)
    } catch (error) {
      setSettings((value) => ({ ...value, [key]: !next }))
      setMessage(error.message)
    }
  }

  if (loading && !settings) return <div className="text-gray-400 py-16 text-center">Загрузка...</div>

  const pushSupported = permission !== 'unsupported'

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
        <p className="mt-1 text-sm text-gray-500">Настройте устройства, Telegram-чаты и события для рассылки.</p>
      </div>

      {message && <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</div>}

      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Push-уведомления</h2>
            <p className="mt-1 text-sm text-gray-500">Разрешение браузера: {permission === 'granted' ? 'разрешено' : permission === 'denied' ? 'запрещено' : permission === 'default' ? 'не запрошено' : 'не поддерживается'}.</p>
          </div>
          <button type="button" onClick={testNotifications} disabled={Boolean(busy)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{busy === 'test' ? 'Отправка...' : 'Отправить тестовое'}</button>
        </div>

        {!pushSupported ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Этот браузер не поддерживает Web Push. Используйте актуальную версию Chrome, Firefox, Edge или Safari.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={enablePush} disabled={Boolean(busy) || permission === 'denied'} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">Включить уведомления в этом браузере</button>
            {currentSubscription && <button type="button" onClick={disablePush} disabled={Boolean(busy)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">Отключить в этом браузере</button>}
          </div>
        )}

        <h3 className="mt-6 text-sm font-semibold text-gray-900">Подключённые устройства: {push.count || 0}</h3>
        <div className="mt-2 divide-y divide-gray-100">
          {push.subscriptions?.length ? push.subscriptions.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-4 py-3">
              <div><p className="text-sm font-medium text-gray-800">{item.label}</p><p className="text-xs text-gray-500">Подключено {new Date(item.createdAt).toLocaleString('ru-RU')}</p></div>
              <button type="button" onClick={() => removeItem('push/subscriptions', item._id)} disabled={busy === item._id} className="text-sm font-medium text-red-600 hover:text-red-700">Удалить</button>
            </div>
          )) : <p className="py-4 text-sm text-gray-500">Устройств пока нет.</p>}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="text-lg font-semibold text-gray-900">Telegram</h2><p className="mt-1 text-sm text-gray-500">Подключено чатов: {telegram.count || 0}</p></div>
          <button type="button" onClick={connectTelegram} disabled={Boolean(busy)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">Подключить Telegram</button>
        </div>
        <p className="mt-3 text-sm text-gray-500">Откройте бота по созданной ссылке и нажмите Start. Код действует 15 минут.</p>
        <div className="mt-3 divide-y divide-gray-100">
          {telegram.subscribers?.length ? telegram.subscribers.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-4 py-3">
              <div><p className="text-sm font-medium text-gray-800">{item.firstName || 'Telegram-чат'}{item.username ? ` (@${item.username})` : ''}</p><p className="text-xs text-gray-500">ID {item.chatId} · подключён {new Date(item.linkedAt).toLocaleString('ru-RU')}</p></div>
              <button type="button" onClick={() => removeItem('telegram/subscribers', item._id)} disabled={busy === item._id} className="text-sm font-medium text-red-600 hover:text-red-700">Отключить</button>
            </div>
          )) : <p className="py-4 text-sm text-gray-500">Чатов, подключённых через админку, пока нет.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">События</h2>
        <div className="mt-3 divide-y divide-gray-100">
          {settings && Object.entries(eventLabels).map(([key, [title, description]]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-5 py-4">
              <span><span className="block text-sm font-medium text-gray-900">{title}</span><span className="block text-xs text-gray-500">{description}</span></span>
              <input type="checkbox" checked={Boolean(settings[key])} onChange={() => toggleEvent(key)} className="h-5 w-5 rounded border-gray-300 text-indigo-600" />
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
