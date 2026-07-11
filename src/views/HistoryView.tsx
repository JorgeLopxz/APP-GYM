import { useState } from 'react'
import type { AppData } from '../types'
import { fmtSet, getExercise, sessionSetCount } from '../lib/stats'

type Update = (fn: (d: AppData) => AppData) => void

// ---------------------------------------------------------------------------
// Calendario mensual: qué días has entrenado
// ---------------------------------------------------------------------------

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function MonthCalendar(props: {
  data: AppData
  onPickDay: (sessionId: string) => void
}) {
  const { data, onPickDay } = props
  const [offset, setOffset] = useState(0)

  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const year = month.getFullYear()
  const m = month.getMonth()
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const firstDow = (month.getDay() + 6) % 7 // 0 = lunes

  // primera sesión terminada de cada día del mes
  const byDay = new Map<number, string>()
  let monthCount = 0
  for (const s of data.sessions) {
    if (!s.finished) continue
    const d = new Date(s.date)
    if (d.getFullYear() !== year || d.getMonth() !== m) continue
    monthCount++
    if (!byDay.has(d.getDate())) byDay.set(d.getDate(), s.id)
  }

  const label = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const isToday = (day: number) =>
    offset === 0 && day === now.getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  return (
    <div className="calendar">
      <div className="week-nav">
        <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)}>
          ‹
        </button>
        <span className="week-label">
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </span>
        <button
          type="button"
          className="icon-btn"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          ›
        </button>
      </div>
      <div className="cal-grid">
        {DOW.map((d) => (
          <span key={d} className="cal-dow">
            {d}
          </span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`x${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              disabled={!byDay.has(day)}
              className={`cal-cell ${byDay.has(day) ? 'trained' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => {
                const id = byDay.get(day)
                if (id) onPickDay(id)
              }}
            >
              {day}
            </button>
          )
        )}
      </div>
      <p className="cal-count">
        {monthCount === 0
          ? 'Sin entrenos este mes todavía'
          : `${monthCount} ${monthCount === 1 ? 'entreno' : 'entrenos'} este mes`}
      </p>
    </div>
  )
}

export function HistoryView({ data, update }: { data: AppData; update: Update }) {
  const [openId, setOpenId] = useState<string | null>(null)

  // abre un entreno Y se desplaza hasta él (desde el calendario)
  const openAndScroll = (id: string) => {
    setOpenId(id)
    setTimeout(() => {
      document
        .getElementById(`hsession-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const sessions = data.sessions
    .filter((s) => s.finished)
    .sort((a, b) => b.date.localeCompare(a.date))

  const remove = (id: string) => {
    if (!confirm('¿Borrar este entreno del historial?')) return
    update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }))
  }

  const reopen = (id: string) => {
    if (data.sessions.some((s) => !s.finished)) {
      alert('Ya tienes un entreno en curso. Termínalo antes de reabrir otro.')
      return
    }
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === id ? { ...s, finished: false } : s))
    }))
  }

  return (
    <div className="view">
      <h1 className="view-title">Historial</h1>
      <p className="view-subtitle">{sessions.length} entrenos registrados</p>

      <MonthCalendar data={data} onPickDay={openAndScroll} />

      {sessions.map((session) => {
        const open = openId === session.id
        const date = new Date(session.date)
        return (
          <div
            key={session.id}
            id={`hsession-${session.id}`}
            className={`history-card ${open ? 'open' : ''}`}
          >
            <button
              type="button"
              className="history-head"
              onClick={() => setOpenId(open ? null : session.id)}
            >
              <div className="history-headline">
                <span className="history-routine">{session.routineName}</span>
                <span className="history-date">
                  {date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
              <div className="history-meta">
                <span>{sessionSetCount(session)} series</span>
                <span>{session.exercises.length} ejercicios</span>
              </div>
            </button>
            {open && (
              <div className="history-body">
                {session.exercises.map((log, i) => {
                  const def = getExercise(data, log.exerciseId)
                  if (!def) return null
                  return (
                    <div key={i} className="history-exercise">
                      <span className="history-exercise-name">
                        {def.name}
                        {log.variant ? ` · ${log.variant}` : ''}
                      </span>
                      <span className="history-sets">
                        {log.sets.map((s) => fmtSet(s, def.bodyweight)).join('  ·  ')}
                      </span>
                    </div>
                  )
                })}
                <div className="history-actions">
                  <button type="button" className="btn-ghost small" onClick={() => reopen(session.id)}>
                    Reabrir y editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger-ghost small"
                    onClick={() => remove(session.id)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {sessions.length === 0 && (
        <p className="view-subtitle">Todavía no hay entrenos terminados.</p>
      )}
    </div>
  )
}
