import { useEffect, useRef, useState } from 'react'
import type { AppData } from '../types'

type Update = (fn: (d: AppData) => AppData) => void

const PRESETS = [60, 90, 120, 180]

function fmt(s: number): string {
  const mm = Math.floor(s / 60)
  const ss = String(Math.floor(s % 60)).padStart(2, '0')
  return `${mm}:${ss}`
}

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // sin audio: el cambio visual basta
  }
  navigator.vibrate?.([200, 100, 200])
}

export function TimerView({ data, update }: { data: AppData; update: Update }) {
  const [duration, setDuration] = useState(data.settings.restSeconds)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [paused, setPaused] = useState<number | null>(null) // segundos restantes al pausar
  const [now, setNow] = useState(Date.now())
  const beeped = useRef(false)

  useEffect(() => {
    if (endsAt === null) return
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [endsAt])

  const remaining =
    paused !== null
      ? paused
      : endsAt !== null
        ? Math.max(0, (endsAt - now) / 1000)
        : duration

  useEffect(() => {
    if (endsAt !== null && paused === null && remaining <= 0 && !beeped.current) {
      beeped.current = true
      beep()
    }
  }, [remaining, endsAt, paused])

  const running = endsAt !== null && paused === null && remaining > 0
  const finished = endsAt !== null && paused === null && remaining <= 0

  const setNewDuration = (s: number) => {
    const clamped = Math.max(15, s)
    setDuration(clamped)
    setEndsAt(null)
    setPaused(null)
    beeped.current = false
    // recuerda tu descanso preferido
    update((d) => ({ ...d, settings: { ...d.settings, restSeconds: clamped } }))
  }

  const start = () => {
    beeped.current = false
    setPaused(null)
    setEndsAt(Date.now() + (paused ?? duration) * 1000)
    setNow(Date.now())
  }

  const pause = () => setPaused(remaining)

  const reset = () => {
    setEndsAt(null)
    setPaused(null)
    beeped.current = false
  }

  // anillo de progreso
  const R = 84
  const CIRC = 2 * Math.PI * R
  const progress = endsAt === null ? 1 : Math.max(0, remaining / duration)

  return (
    <div className="view">
      <h1 className="view-title">Descanso</h1>
      <p className="view-subtitle">Tu temporizador entre series</p>

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
            strokeDashoffset={CIRC * (1 - progress)}
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
            {paused !== null ? '▶ Seguir' : '▶ Empezar'}
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
            className={`chip ${duration === p ? 'active' : ''}`}
            onClick={() => setNewDuration(p)}
          >
            {fmt(p)}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => setNewDuration(duration - 15)}>
          −15s
        </button>
        <button type="button" className="chip" onClick={() => setNewDuration(duration + 15)}>
          +15s
        </button>
      </div>

      <p className="hint-block">
        El tiempo elegido se queda guardado. Suena un aviso y vibra (si el móvil lo
        permite) al llegar a cero.
      </p>
    </div>
  )
}
