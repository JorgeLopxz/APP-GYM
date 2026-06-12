/**
 * Sonido, vibración, notificaciones y badge del icono.
 *
 * iOS solo permite reproducir audio si el AudioContext se creó/desbloqueó en
 * un gesto del usuario: llamamos a unlockAudio() al pulsar "Empezar" y
 * reutilizamos ese contexto cuando el temporizador llega a cero.
 */

let audioCtx: AudioContext | null = null

export function unlockAudio(): void {
  try {
    audioCtx = audioCtx ?? new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
  } catch {
    // sin audio disponible
  }
}

/** Triple bip + vibración (la vibración solo existe en Android). */
export function timerBeep(): void {
  try {
    audioCtx = audioCtx ?? new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    const ctx = audioCtx
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = i === 2 ? 1175 : 880
      const t0 = ctx.currentTime + i * 0.35
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
      osc.start(t0)
      osc.stop(t0 + 0.32)
    }
  } catch {
    // sin audio: queda la notificación y el cambio visual
  }
  try {
    navigator.vibrate?.([250, 100, 250, 100, 400])
  } catch {
    // iOS no soporta vibrate
  }
}

/** Notificación local al terminar el descanso (si hay permiso concedido). */
export async function notifyTimerDone(): Promise<void> {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const reg = await navigator.serviceWorker?.getRegistration()
    await reg?.showNotification('⏱ ¡Descanso terminado!', {
      body: 'A por la siguiente serie 💪',
      icon: 'icon-192.png',
      badge: 'icon-192.png'
    })
  } catch {
    // sin permiso o sin SW: el bip ya hizo el trabajo
  }
}

/**
 * Puntito en el icono de la app (Badging API, iOS 16.4+ con la PWA instalada
 * y permiso de notificaciones) mientras la creatina del día esté pendiente.
 */
export function updateCreatineBadge(pending: boolean): void {
  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
  try {
    if (pending) void nav.setAppBadge?.(1)
    else void nav.clearAppBadge?.()
  } catch {
    // no soportado
  }
}
