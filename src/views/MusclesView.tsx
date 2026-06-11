import { useMemo, useState } from 'react'
import type { AppData, MuscleId } from '../types'
import { MUSCLE_NAMES } from '../types'
import { muscleWeek, muscleWeeklyAverage, weekLabel } from '../lib/stats'
import { BodyMap, heatColor } from '../components/BodyMap'

/** Series semanales a partir de las cuales un músculo se pinta al máximo. */
const FULL_SETS = 12

export function MusclesView({ data }: { data: AppData }) {
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<MuscleId | null>(null)

  const week = useMemo(() => muscleWeek(data, offset), [data, offset])

  const heat: Partial<Record<MuscleId, number>> = {}
  for (const [m, sets] of Object.entries(week.sets)) {
    heat[m as MuscleId] = Math.min(1, (sets ?? 0) / FULL_SETS)
  }

  const ranked = (Object.entries(week.sets) as [MuscleId, number][])
    .sort((a, b) => b[1] - a[1])

  const untouched = (Object.keys(MUSCLE_NAMES) as MuscleId[]).filter(
    (m) => !(m in week.sets)
  )

  return (
    <div className="view">
      <h1 className="view-title">Músculos</h1>
      <div className="week-nav">
        <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)}>
          ◀
        </button>
        <span className="week-label">{weekLabel(offset)}</span>
        <button
          type="button"
          className="icon-btn"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          ▶
        </button>
      </div>

      <BodyMap heat={heat} selected={selected} onSelect={setSelected} />

      {selected && (
        <div className="muscle-detail">
          <p className="muscle-detail-title">
            {MUSCLE_NAMES[selected]} — {fmtSets(week.sets[selected] ?? 0)} series
          </p>
          {week.sources[selected] ? (
            [...week.sources[selected]!.entries()].map(([name, sets]) => (
              <p key={name} className="muscle-detail-line">
                {name}: {fmtSets(sets)} series
              </p>
            ))
          ) : (
            <p className="muscle-detail-line">Sin trabajo esta semana.</p>
          )}
        </div>
      )}

      <div className="muscle-list">
        {ranked.map(([m, sets]) => (
          <button
            type="button"
            key={m}
            className={`muscle-row ${selected === m ? 'selected' : ''}`}
            onClick={() => setSelected(selected === m ? null : m)}
          >
            <span className="muscle-dot" style={{ background: heatColor(Math.min(1, sets / FULL_SETS)) }} />
            <span className="muscle-name">{MUSCLE_NAMES[m]}</span>
            <span className="muscle-bar">
              <span
                className="muscle-bar-fill"
                style={{
                  width: `${Math.min(100, (sets / FULL_SETS) * 100)}%`,
                  background: heatColor(Math.min(1, sets / FULL_SETS))
                }}
              />
            </span>
            <span className="muscle-sets">{fmtSets(sets)}</span>
          </button>
        ))}
        {ranked.length === 0 && (
          <p className="view-subtitle">Sin entrenos esta semana todavía.</p>
        )}
      </div>

      <WeakPoints data={data} />

      {untouched.length > 0 && ranked.length > 0 && (
        <p className="hint-block">
          Sin trabajo esta semana: {untouched.map((m) => MUSCLE_NAMES[m]).join(', ')}.
        </p>
      )}
      <p className="hint-block">
        Cada serie directa suma 1 y cada serie de músculo secundario suma 0,5. Una
        referencia habitual de hipertrofia: <strong>10–20 series</strong> por músculo y
        semana.
      </p>
    </div>
  )
}

function fmtSets(n: number): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 1 })
}

// ---------------------------------------------------------------------------
// Puntos débiles: músculos con poco volumen + ejercicios recomendados
// ---------------------------------------------------------------------------

function WeakPoints({ data }: { data: AppData }) {
  const { avg, weeks } = useMemo(() => muscleWeeklyAverage(data), [data])

  if (weeks === 0) return null

  const weakest = (Object.keys(MUSCLE_NAMES) as MuscleId[])
    .map((m) => ({ muscle: m, sets: avg[m] ?? 0 }))
    .filter((x) => x.sets < 6)
    .sort((a, b) => a.sets - b.sets)
    .slice(0, 4)

  if (weakest.length === 0) return null

  return (
    <div className="settings-section">
      <h2 className="settings-title">💡 Puntos débiles</h2>
      <p className="hint-block">
        Media de las últimas {weeks === 1 ? 'semana' : `${weeks} semanas`}. Por debajo
        de ~6 series semanales un músculo apenas crece; estos son los tuyos más
        olvidados y ejercicios para atacarlos:
      </p>
      {weakest.map(({ muscle, sets }) => {
        const suggestions = data.exercises
          .filter((e) => e.primary.includes(muscle))
          .slice(0, 2)
        return (
          <div key={muscle} className="weak-row">
            <div className="weak-head">
              <span className="weak-name">{MUSCLE_NAMES[muscle]}</span>
              <span className="weak-sets">{fmtSets(sets)} series/sem</span>
            </div>
            {suggestions.length > 0 && (
              <span className="weak-suggest">
                → {suggestions.map((e) => e.name).join(' · ')}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
