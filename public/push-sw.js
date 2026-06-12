// Manejador de push de HIERRO (se importa desde el service worker de Workbox).
// Los push llegan SIN payload: decidimos el texto según la marca que dejó la
// app en la Cache API (si hay un temporizador pendiente, es el del descanso).
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let title = '💊 Tómate la creatina'
      let body = 'Tu recordatorio diario de HIERRO.'
      try {
        const cache = await caches.open('hierro-push-meta')
        const res = await cache.match('push-meta-timer')
        if (res) {
          const meta = await res.json()
          if (meta.endsAt && Math.abs(Date.now() - meta.endsAt) < 5 * 60 * 1000) {
            title = '⏱ ¡Descanso terminado!'
            body = 'A por la siguiente serie 💪'
            await cache.delete('push-meta-timer')
          }
        }
      } catch (e) {
        // sin marca: texto de creatina por defecto
      }
      await self.registration.showNotification(title, {
        body,
        icon: 'icon-192.png',
        badge: 'icon-192.png'
      })
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('./')
    })
  )
})
