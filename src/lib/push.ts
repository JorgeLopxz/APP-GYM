/**
 * Cliente Web Push: habla con el worker de Cloudflare (worker/) que envía
 * las notificaciones aunque la app esté cerrada o el móvil bloqueado.
 * Los push van sin payload; el texto lo decide public/push-sw.js.
 */

export const PUSH_SERVER = 'https://hierro-push.dawn-dust-950a.workers.dev'

const VAPID_PUBLIC =
  'BM0qMKlL8y_qrqmq26M3hrVHCRQo2DCSSCu_6OGZVf2Fry6h_LFKI7iVYBUR2NUNHgINDTB3KU_y-LpwCHlt9DM'

const TIMER_META = 'push-meta-timer'

function vapidKeyBytes(): ArrayBuffer {
  const b64 = VAPID_PUBLIC.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buf = new ArrayBuffer(raw.length)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return buf
}

/** Estado del dispositivo para diagnosticar por qué no llega el push. */
export function pushDiagnostics(): {
  standalone: boolean
  supported: boolean
  permission: string
} {
  const nav = navigator as Navigator & { standalone?: boolean }
  const standalone =
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(display-mode: standalone)')?.matches) ||
    nav.standalone === true
  return {
    standalone,
    supported: pushSupported(),
    permission:
      typeof Notification !== 'undefined' ? Notification.permission : 'sin API'
  }
}

export function pushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function getSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    return (await reg?.pushManager.getSubscription()) ?? null
  } catch {
    return null
  }
}

async function post(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${PUSH_SERVER}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return res.ok
  } catch {
    return false
  }
}

/** Activa el push diario de la creatina. Devuelve 'ok' o un mensaje de error. */
export async function enablePush(hour: string): Promise<string> {
  if (!pushSupported()) {
    return 'Este navegador no soporta push. En iPhone: instala HIERRO en la pantalla de inicio (iOS 16.4+) y actívalo desde la app instalada.'
  }
  const before = Notification.permission
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    return before === 'denied'
      ? 'iOS NO pregunta porque las notificaciones ya estaban bloqueadas para HIERRO. Ve a Ajustes de iOS → Notificaciones → HIERRO → Permitir, y vuelve a pulsar este botón.'
      : 'Permiso no concedido. Vuelve a pulsar y acepta el aviso.'
  }
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKeyBytes()
    })
    const ok = await post('/subscribe', {
      subscription: sub.toJSON(),
      hour,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
    return ok ? 'ok' : 'No se pudo registrar en el servidor. Prueba de nuevo con conexión.'
  } catch {
    return 'No se pudo crear la suscripción push en este dispositivo.'
  }
}

export async function disablePush(): Promise<void> {
  const sub = await getSubscription()
  if (!sub) return
  await post('/unsubscribe', { endpoint: sub.endpoint })
  await sub.unsubscribe().catch(() => {})
}

/** Reenvía la hora al servidor cuando la cambias (si el push está activo). */
export async function syncPushHour(hour: string): Promise<void> {
  const sub = await getSubscription()
  if (!sub) return
  await post('/subscribe', {
    subscription: sub.toJSON(),
    hour,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

/** Programa el push exacto de fin de descanso (si hay suscripción). */
export async function schedulePushTimer(endsAt: number): Promise<void> {
  const sub = await getSubscription()
  if (!sub) return
  try {
    // marca para que el service worker sepa que el próximo push es del timer
    const cache = await caches.open('hierro-push-meta')
    await cache.put(TIMER_META, new Response(JSON.stringify({ endsAt })))
  } catch {
    // sin Cache API: el push saldrá con el texto genérico
  }
  await post('/timer', { subscription: sub.toJSON(), fireAt: endsAt })
}

/** Prueba end-to-end: el servidor envía un push REAL ahora mismo. */
export async function testServerPush(): Promise<string> {
  const sub = await getSubscription()
  if (!sub) return 'No hay suscripción en este dispositivo: pulsa antes «Activar notificación push».'
  try {
    const res = await fetch(`${PUSH_SERVER}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint })
    })
    const data = (await res.json()) as { status?: number; error?: string }
    if (data.error) return `Servidor: ${data.error}. Desactiva y vuelve a activar el push.`
    if (data.status === 201 || data.status === 200) {
      return 'Apple aceptó el push (201) — debería sonarte AHORA MISMO. Si no llega, dime este número.'
    }
    return `Apple respondió ${data.status} — dime este número y lo cazo.`
  } catch {
    return 'No se pudo contactar con el servidor (¿sin conexión?).'
  }
}

export async function cancelPushTimer(): Promise<void> {
  const sub = await getSubscription()
  if (!sub) return
  await post('/timer-cancel', { endpoint: sub.endpoint })
  try {
    const cache = await caches.open('hierro-push-meta')
    await cache.delete(TIMER_META)
  } catch {
    // nada
  }
}
