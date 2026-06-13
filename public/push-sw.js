// Manejador de push de HIERRO (se importa desde el service worker de Workbox).
// Los push llegan SIN payload: decidimos el texto según la marca que dejó la
// app en la Cache API (si hay un temporizador pendiente, es el del descanso).
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let title = '💊 Tómate la creatina'
      let body = 'Tu recordatorio diario de HIERRO.'
      let kind = 'creatine'
      // el servidor manda el texto cifrado en el payload (Apple no entrega
      // pushes vacíos a iOS)
      if (event.data) {
        try {
          const d = event.data.json()
          if (d.title) title = d.title
          if (d.body) body = d.body
          if (d.kind) kind = d.kind
        } catch (e) {
          // payload ilegible: textos por defecto
        }
      }
      // patrón de vibración fuerte para el timer (Android lo respeta; iOS usa
      // el sonido del sistema). tag distinto por tipo para no apilarse.
      const isTimer = kind === 'timer'
      await self.registration.showNotification(title, {
        body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: kind,
        renotify: true,
        requireInteraction: isTimer,
        vibrate: isTimer
          ? [300, 120, 300, 120, 300, 120, 600]
          : [200, 100, 200],
        data: { kind }
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
