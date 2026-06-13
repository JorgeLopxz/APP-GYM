import { useEffect, useState } from 'react'
import type { AppData } from '../types'
import type { TimerState } from '../lib/storage'
import { unlockAudio } from '../lib/notify'
import { cancelPushTimer, schedulePushTimer } from '../lib/push'

type Update = (fn: (d: AppData) => AppData) => void
type SetTimer = (t: TimerState) => void

const PRESETS = [60, 90, 120, 180]

function fmt(s: number): string {
  const mm = Math.floor(s / 60)
  const ss = String(Math.floor(s % 60)).padStart(2, '0')
  return `${mm}:${ss}`
}

function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [active])
  return now
}

function remainingOf(timer: TimerState, now: number): number {
  if (timer.pausedRemaining !== null) return timer.pausedRemaining
  if (timer.endsAt !== null) return Math.max(0, (timer.endsAt - now) / 1000)
  return timer.duration
}

export function TimerView(props: {
  data: AppData
  update: Update
  timer: TimerState
  setTimer: SetTimer
}) {
  const { update, timer, setTimer } = props

  const now = useNow(timer.endsAt !== null && timer.pausedRemaining === null)
  const remaining = remainingOf(timer, now)

  const running = timer.endsAt !== null && timer.pausedRemaining === null && remaining > 0
  const finished = timer.endsAt !== null && timer.pausedRemaining === null && remaining <= 0

  const setNewDuration = (s: number) => {
    const clamped = Math.max(15, s)
    setTimer({ duration: clamped, endsAt: null, pausedRemaining: null })
    // recuerda tu descanso preferido
    update((d) => ({ ...d, settings: { ...d.settings, restSeconds: clamped } }))
  }

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

  // anillo de progreso
  const R = 84
  const CIRC = 2 * Math.PI * R
  const progress =
    timer.endsAt === null && timer.pausedRemaining === null
      ? 1
      : Math.max(0, remaining / timer.duration)

  return (
    <div className="view">
      <h1 className="view-title">Descanso</h1>
      <p className="view-subtitle">
        Sigue corriendo aunque cambies de pestaña o cierres la app
      </p>

      <div className="timer-wrap">
        <svg viewBox="0 0 200 200" className="timer-ring">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0f0f6" />
              <stop offset="1" stopColor="#8e8e9a" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#26262c" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={finished ? '#46c98c' : 'url(#ringGrad)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - Math.min(1, progress))}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.2s linear' }}
          />
          <text x="100" y="108" textAnchor="middle" className="timer-text">
            {finished ? '¡Listo!' : fmt(remaining)}
          </text>
        </svg>
      </div>

      <div className="timer-controls">
        {running ? (
          <button type="button" className="btn-ghost timer-btn" onClick={pause}>
            ⏸ Pausa
          </button>
        ) : (
          <button type="button" className="btn-primary timer-btn" onClick={start}>
            {timer.pausedRemaining !== null ? '▶ Seguir' : '▶ Empezar'}
          </button>
        )}
        <button type="button" className="btn-ghost timer-btn" onClick={reset}>
          ↺ Reiniciar
        </button>
      </div>

      <div className="timer-presets">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`chip ${timer.duration === p ? 'active' : ''}`}
            onClick={() => setNewDuration(p)}
          >
            {fmt(p)}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => setNewDuration(timer.duration - 15)}>
          −15s
        </button>
        <button type="button" className="chip" onClick={() => setNewDuration(timer.duration + 15)}>
          +15s
        </button>
      </div>

      <p className="hint-block">
        Al llegar a cero suena un triple bip. Con los avisos activados (en Ajustes)
        te llega también una notificación aunque tengas el móvil bloqueado.
      </p>
    </div>
  )
}

/** Chip flotante con el tiempo restante cuando estás en otra pestaña. */
export function TimerChip(props: {
  timer: TimerState
  onClick: () => void
  onReset: () => void
}) {
  const { timer, onClick, onReset } = props
  const now = useNow(timer.pausedRemaining === null)
  const remaining = remainingOf(timer, now)
  const paused = timer.pausedRemaining !== null
  const finished = !paused && timer.endsAt !== null && remaining <= 0

  return (
    <button
      type="button"
      className={`timer-chip ${finished ? 'done' : ''}`}
      onClick={finished ? onReset : onClick}
    >
      {finished ? '⏱ ¡Descanso terminado! ✕' : `${paused ? '⏸' : '⏱'} ${fmt(remaining)}`}
    </button>
  )
}
