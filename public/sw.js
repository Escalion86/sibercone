self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sibercone', {
      body: data.body || 'Новое уведомление',
      icon: '/apple-touch-icon.png',
      badge: '/favicon.ico',
      tag: data.tag || 'sibercone-admin',
      data: { url: data.url || '/admin/notifications' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(
    event.notification.data?.url || '/admin/notifications',
    self.location.origin,
  ).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url === targetUrl)
      if (existing) return existing.focus()
      return self.clients.openWindow(targetUrl)
    }),
  )
})
