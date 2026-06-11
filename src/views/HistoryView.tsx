import { useState } from 'react'
import type { AppData } from '../types'
import {
  fmtSet,
  fmtWeight,
  getExercise,
  sessionSetCount,
  sessionVolume
} from '../lib/stats'

type Update = (fn: (d: AppData) => AppData) => void

export function HistoryView({ data, update }: { data: AppData; update: Update }) {
  const [openId, setOpenId] = useState<string | null>(null)

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

      {sessions.map((session) => {
        const open = openId === session.id
        const date = new Date(session.date)
        return (
          <div key={session.id} className={`history-card ${open ? 'open' : ''}`}>
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
                <span>{fmtWeight(sessionVolume(data, session))} kg</span>
                {session.durationMin ? <span>{session.durationMin} min</span> : null}
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
