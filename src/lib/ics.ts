/**
 * Genera un archivo .ics (calendario) con un evento diario repetitivo y alarma.
 * En iOS, al abrirlo desde Safari se añade al Calendario y el sistema avisa
 * cada día a la hora elegida — sin servidores ni permisos de notificación.
 */
export function downloadCreatineICS(hour: string): void {
  const [h, m] = hour.split(':').map(Number)
  const start = new Date()
  start.setHours(h, m ?? 0, 0, 0)
  if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1)

  const pad = (n: number) => String(n).padStart(2, '0')
  const local = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const end = new Date(start.getTime() + 5 * 60 * 1000)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HIERRO//Creatina//ES',
    'BEGIN:VEVENT',
    `UID:hierro-creatina-${Date.now()}@hierro.app`,
    `DTSTAMP:${local(new Date())}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:💊 Tómate la creatina',
    'DESCRIPTION:Recordatorio diario de HIERRO. 3-5 g de creatina monohidrato.',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:💊 Tómate la creatina',
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'creatina-hierro.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/** Notificación local inmediata (solo funciona con la PWA instalada en iOS 16.4+). */
export async function testNotification(): Promise<string> {
  if (!('Notification' in window)) {
    return 'Este navegador no soporta notificaciones. En iPhone: instala la app en la pantalla de inicio y ábrela desde ahí.'
  }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    return 'Permiso denegado. Actívalo en Ajustes de iOS → HIERRO → Notificaciones.'
  }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification('HIERRO 🏋️', {
        body: 'Las notificaciones funcionan. ¡A entrenar!',
        icon: 'icon-192.v2.png'
      })
      return 'Notificación enviada ✓'
    }
  } catch {
    // caemos al constructor clásico
  }
  new Notification('HIERRO 🏋️', { body: 'Las notificaciones funcionan. ¡A entrenar!' })
  return 'Notificación enviada ✓'
}
