import { useMemo, useState } from 'react'
import type { AppData, MuscleId } from '../types'
import { MUSCLE_NAMES } from '../types'
import { muscleWeek, muscleWeeklyAverage, weekLabel } from '../lib/stats'
import {
  BodyMap,
  heatColor,
  REGION_MUSCLES,
  REGION_NAMES,
  regionForMuscle
} from '../components/BodyMap'

/** Series semanales a partir de las cuales un músculo se pinta al máximo. */
const FULL_SETS = 12

export function MusclesView({ data }: { data: AppData }) {
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  // fila expandida en la lista (desplegable bajo el músculo tocado)
  const [openRow, setOpenRow] = useState<MuscleId | null>(null)

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

  const selectedMuscles = selected ? REGION_MUSCLES[selected] ?? [] : []
  const selectedTotal = selectedMuscles.reduce(
    (acc, m) => acc + (week.sets[m] ?? 0),
    0
  )

  return (
    <div className="view">
      <h1 className="view-title">Músculos</h1>
      <div className="week-nav">
        <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)}>
          ‹
        </button>
        <span className="week-label">{weekLabel(offset)}</span>
        <button
          type="button"
          className="icon-btn"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          ›
        </button>
      </div>

      <BodyMap
        heat={heat}
        selected={selected}
        onSelect={(r) => {
          setSelected(r)
          setOpenRow(null)
        }}
        sexo={data.profile.sexo}
      />

      {selected && openRow === null && (
        <div className="muscle-detail">
          <p className="muscle-detail-title">
            {REGION_NAMES[selected.split(':')[1]] ?? selected} —{' '}
            {fmtSets(selectedTotal)} series
          </p>
          {selectedMuscles.map((m) => {
            const sets = week.sets[m] ?? 0
            const sources = week.sources[m]
            return (
              <p key={m} className="muscle-detail-line">
                <strong>{MUSCLE_NAMES[m]}</strong> · {fmtSets(sets)} series
                {sources
                  ? ` — ${[...sources.entries()]
                      .map(([name, n]) => `${name} (${fmtSets(n)})`)
                      .join(', ')}`
                  : ''}
              </p>
            )
          })}
        </div>
      )}

      <div className="muscle-list">
        {ranked.map(([m, sets]) => {
          const region = regionForMuscle(m)
          const open = openRow === m
          return (
            <div key={m}>
              <button
                type="button"
                className={`muscle-row ${selected !== null && selected === region ? 'selected' : ''}`}
                onClick={() => {
                  if (open) {
                    setOpenRow(null)
                    setSelected(null)
                  } else {
                    setOpenRow(m)
                    setSelected(region)
                  }
                }}
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
              {open && (
                <div className="muscle-row-detail">
                  {week.sources[m] ? (
                    [...week.sources[m]!.entries()].map(([name, n]) => (
                      <p key={name} className="muscle-detail-line">
                        {name}: {fmtSets(n)} series
                      </p>
                    ))
                  ) : (
                    <p className="muscle-detail-line">Sin trabajo esta semana.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
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
      <h2 className="settings-title">Puntos débiles</h2>
      <p className="hint-block">
        Media de las últimas {weeks === 1 ? 'semana' : `${weeks} semanas`}. Por debajo
        de ~6 series semanales un músculo apenas crece — estos son los tuyos más flojos,
        con ejercicios para darles caña:
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
