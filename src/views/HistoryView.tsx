import { useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { AppData, Session, Update } from '../types'
import { logLabel } from '../lib/exercise'
import { fmtSet, getExercise, sessionSetCount } from '../lib/stats'
import { EmptyState, PageHeader, Row, Section } from '../components/ui'
import { AvatarButton } from '../components/chrome'

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ---------------------------------------------------------------------------
// Calendario mensual: qué días has entrenado
// ---------------------------------------------------------------------------

function MonthCalendar(props: { data: AppData; onPickDay: (sessionId: string) => void }) {
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

  const label = capitalize(month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))
  const isToday = (day: number) => offset === 0 && day === now.getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  return (
    <div className="calendar">
      <div className="cal-head">
        <span className="cal-title" aria-live="polite">
          {label}
        </span>
        <div className="cal-nav">
          <button type="button" className="circle-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Mes anterior">
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="circle-btn"
            disabled={offset >= 0}
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW.map((d) => (
          <span key={d} className="cal-dow" aria-hidden="true">
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
              className={`cal-day ${byDay.has(day) ? 'is-trained' : ''} ${isToday(day) ? 'is-today' : ''}`}
              aria-label={`${day}${byDay.has(day) ? ', entrenaste' : ''}${isToday(day) ? ', hoy' : ''}`}
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
      <p className="cal-foot">
        {monthCount === 0
          ? 'Sin entrenos este mes'
          : `${monthCount} ${monthCount === 1 ? 'entreno' : 'entrenos'} este mes`}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Historial por meses
// ---------------------------------------------------------------------------

export function HistoryView({ data, update }: { data: AppData; update: Update }) {
  const [openId, setOpenId] = useState<string | null>(null)

  // abre un entreno Y se desplaza hasta él (desde el calendario)
  const openAndScroll = (id: string) => {
    setOpenId(id)
    setTimeout(() => {
      document.getElementById(`hsession-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const sessions = data.sessions.filter((s) => s.finished).sort((a, b) => b.date.localeCompare(a.date))

  const groups: [string, Session[]][] = []
  for (const s of sessions) {
    const key = capitalize(new Date(s.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))
    const last = groups[groups.length - 1]
    if (last && last[0] === key) last[1].push(s)
    else groups.push([key, [s]])
  }

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
    alert('Entreno reabierto: lo tienes en la pestaña Entreno para editarlo.')
  }

  return (
    <div className="view">
      <PageHeader
        title="Historial"
        subtitle={`${sessions.length} ${sessions.length === 1 ? 'entreno registrado' : 'entrenos registrados'}`}
        trailing={<AvatarButton />}
      />

      <MonthCalendar data={data} onPickDay={openAndScroll} />

      {groups.map(([month, list]) => (
        <Section key={month} title={month}>
          {list.map((session) => {
            const open = openId === session.id
            const sets = sessionSetCount(session)
            return (
              <div key={session.id} id={`hsession-${session.id}`} className="history-item">
                <Row
                  title={session.routineName}
                  subtitle={capitalize(
                    new Date(session.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })
                  )}
                  detail={`${sets} series`}
                  accessory={
                    <ChevronDown
                      className={`disclosure ${open ? 'is-open' : ''}`}
                      size={18}
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  }
                  onClick={() => setOpenId(open ? null : session.id)}
                  ariaLabel={`${session.routineName}, ${sets} series. ${open ? 'Ocultar' : 'Ver'} detalle`}
                />
                {open && (
                  <div className="history-detail">
                    {session.exercises.map((log, i) => {
                      const def = getExercise(data, log.exerciseId)
                      if (!def) return null
                      const label = logLabel(log.variant, log.brand)
                      return (
                        <div key={i} className="history-ex">
                          <span className="history-ex-name">
                            {def.name}
                            {label && <span className="muted"> · {label}</span>}
                          </span>
                          <span className="history-ex-sets">
                            {log.sets.map((s) => fmtSet(s, def.bodyweight)).join('  ·  ')}
                          </span>
                        </div>
                      )
                    })}
                    <div className="history-actions">
                      <button type="button" className="btn btn-gray btn-sm" onClick={() => reopen(session.id)}>
                        <Pencil size={15} strokeWidth={2.4} />
                        Reabrir y editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-gray btn-sm is-destructive"
                        onClick={() => remove(session.id)}
                      >
                        <Trash2 size={15} strokeWidth={2.4} />
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </Section>
      ))}

      {sessions.length === 0 && (
        <div className="group">
          <EmptyState icon={<CalendarDays size={28} />} title="Sin entrenos todavía">
            Cuando termines tu primer entreno aparecerá aquí, con cada serie apuntada.
          </EmptyState>
        </div>
      )}
    </div>
  )
}
