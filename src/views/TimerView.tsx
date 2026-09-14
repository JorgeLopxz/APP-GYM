import { useEffect, useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import type { Update } from '../types'
import type { TimerState } from '../lib/storage'
import { unlockAudio } from '../lib/notify'
import { cancelPushTimer, schedulePushTimer } from '../lib/push'
import { PageHeader, Section } from '../components/ui'
import { AvatarButton } from '../components/chrome'

type SetTimer = (t: TimerState) => void

const PRESETS = [60, 90, 120, 150, 180, 240]

/** m:ss redondeando hacia arriba, como el Reloj de iOS. */
export function fmtClock(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds - 0.05))
  const mm = Math.floor(total / 60)
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [active])
  return now
}

/** Estado y acciones del descanso, compartidos por la pestaña y el accesorio. */
function useRestTimer(timer: TimerState, setTimer: SetTimer, update: Update) {
  const ticking = timer.endsAt !== null && timer.pausedRemaining === null
  const now = useNow(ticking)
  const remaining =
    timer.pausedRemaining ??
    (timer.endsAt !== null ? Math.max(0, (timer.endsAt - now) / 1000) : timer.duration)
  const paused = timer.pausedRemaining !== null
  const running = ticking && remaining > 0
  const finished = ticking && remaining <= 0
  const idle = timer.endsAt === null && timer.pausedRemaining === null

  const start = () => {
    unlockAudio() // iOS solo deja sonar audio desbloqueado en un gesto
    const seconds = timer.pausedRemaining ?? timer.duration
    const endsAt = Date.now() + seconds * 1000
    setTimer({ ...timer, endsAt, pausedRemaining: null })
    // push exacto de fin de descanso si este dispositivo está suscrito
    void schedulePushTimer(endsAt)
  }

  const pause = () => {
    setTimer({ ...timer, pausedRemaining: remaining, endsAt: null })
    void cancelPushTimer()
  }

  const reset = () => {
    setTimer({ duration: timer.duration, endsAt: null, pausedRemaining: null })
    void cancelPushTimer()
  }

  const setDuration = (s: number) => {
    const clamped = Math.max(15, Math.min(3600, s))
    if (!idle) void cancelPushTimer()
    setTimer({ duration: clamped, endsAt: null, pausedRemaining: null })
    // recuerda tu descanso preferido
    update((d) => ({ ...d, settings: { ...d.settings, restSeconds: clamped } }))
  }

  /** ±15 s: en reposo cambia la duración; en marcha o en pausa, el tiempo que queda. */
  const nudge = (delta: number) => {
    if (idle || finished) {
      setDuration(timer.duration + delta)
    } else if (paused) {
      setTimer({ ...timer, pausedRemaining: Math.max(1, remaining + delta) })
    } else if (timer.endsAt !== null) {
      const endsAt = Math.max(Date.now() + 1000, timer.endsAt + delta * 1000)
      setTimer({ ...timer, endsAt })
      void Promise.resolve(cancelPushTimer()).then(() => schedulePushTimer(endsAt))
    }
  }

  const base = paused || running ? Math.max(timer.duration, remaining) : timer.duration
  const progress = idle ? 1 : Math.max(0, Math.min(1, remaining / base))

  return { remaining, paused, running, finished, idle, progress, start, pause, reset, setDuration, nudge }
}

export function TimerView(props: { update: Update; timer: TimerState; setTimer: SetTimer }) {
  const { update, timer, setTimer } = props
  const t = useRestTimer(timer, setTimer, update)
  const R = 92
  const C = 2 * Math.PI * R

  const status = t.finished
    ? '¡A por la siguiente serie!'
    : t.paused
      ? 'En pausa'
      : t.running
        ? `de ${fmtClock(timer.duration)}`
        : 'Listo para empezar'

  return (
    <div className="view">
      <PageHeader
        title="Descanso"
        subtitle="Sigue contando aunque cambies de pestaña o bloquees el móvil"
        trailing={<AvatarButton />}
      />

      <div className="timer">
        <div className="timer-dial">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="ring-track" cx="100" cy="100" r={R} fill="none" strokeWidth="7" />
            <circle
              className={`ring-progress ${t.finished ? 'is-done' : t.idle ? 'is-idle' : ''}`}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              strokeWidth="7"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - t.progress)}
            />
          </svg>
          <div className="timer-center" role="timer" aria-live="off">
            <span className={`timer-digits ${t.finished ? 'is-done' : ''}`}>
              {fmtClock(t.finished ? 0 : t.remaining)}
            </span>
            <span className="timer-sub">{status}</span>
          </div>
        </div>

        <div className="timer-controls">
          <button type="button" className="round-btn is-gray" onClick={t.reset} disabled={t.idle}>
            Cancelar
          </button>
          {t.running ? (
            <button type="button" className="round-btn is-tint" onClick={t.pause}>
              Pausa
            </button>
          ) : (
            <button type="button" className="round-btn is-filled" onClick={t.start}>
              {t.paused ? 'Seguir' : 'Iniciar'}
            </button>
          )}
        </div>
      </div>

      <Section
        title="Duración"
        bare
        footer="Al llegar a cero suena un triple bip. Con los avisos activados en Ajustes te llega además una notificación con el móvil bloqueado."
      >
        <div className="chips">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip tabular ${timer.duration === p ? 'is-active' : ''}`}
              onClick={() => t.setDuration(p)}
            >
              {fmtClock(p)}
            </button>
          ))}
          <button type="button" className="chip" onClick={() => t.nudge(-15)}>
            −15 s
          </button>
          <button type="button" className="chip" onClick={() => t.nudge(15)}>
            +15 s
          </button>
        </div>
      </Section>
    </div>
  )
}

/** Accesorio flotante sobre la barra de pestañas mientras hay un descanso activo. */
export function TimerAccessory(props: {
  timer: TimerState
  setTimer: SetTimer
  update: Update
  onOpen: () => void
}) {
  const { timer, setTimer, update, onOpen } = props
  const t = useRestTimer(timer, setTimer, update)
  const R = 15
  const C = 2 * Math.PI * R

  return (
    <div className={`accessory ${t.finished ? 'is-done' : ''}`}>
      <div className="accessory-inner">
        <button type="button" className="accessory-main" onClick={onOpen} aria-label="Abrir descanso">
          <svg className="accessory-ring" viewBox="0 0 38 38" aria-hidden="true">
            <circle className="ring-track" cx="19" cy="19" r={R} fill="none" strokeWidth="3.5" />
            <circle
              className={`ring-progress ${t.finished ? 'is-done' : ''}`}
              cx="19"
              cy="19"
              r={R}
              fill="none"
              strokeWidth="3.5"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - t.progress)}
              transform="rotate(-90 19 19)"
            />
          </svg>
          <span className="accessory-text">
            <span className="accessory-time">{t.finished ? '¡Listo!' : fmtClock(t.remaining)}</span>
            <span className="accessory-label">
              {t.finished ? 'Descanso terminado' : t.paused ? 'Descanso en pausa' : 'Descanso'}
            </span>
          </span>
        </button>
        {!t.finished &&
          (t.running ? (
            <button type="button" className="accessory-btn" onClick={t.pause} aria-label="Pausar descanso">
              <Pause size={20} strokeWidth={2.4} fill="currentColor" />
            </button>
          ) : (
            <button type="button" className="accessory-btn" onClick={t.start} aria-label="Seguir descanso">
              <Play size={20} strokeWidth={2.4} fill="currentColor" />
            </button>
          ))}
        <button type="button" className="accessory-btn" onClick={t.reset} aria-label="Quitar descanso">
          <X size={20} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
