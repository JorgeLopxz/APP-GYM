import { useMemo, useState } from 'react'
import { BicepsFlexed, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { EmptyState, PageHeader, Row, Section } from '../components/ui'
import { AvatarButton } from '../components/chrome'

/** Series semanales a partir de las cuales un músculo se pinta al máximo. */
const FULL_SETS = 12

function fmtSets(n: number): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 1 })
}

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

  const ranked = (Object.entries(week.sets) as [MuscleId, number][]).sort((a, b) => b[1] - a[1])
  const untouched = (Object.keys(MUSCLE_NAMES) as MuscleId[]).filter((m) => !(m in week.sets))

  const selectedMuscles = selected ? REGION_MUSCLES[selected] ?? [] : []
  const selectedTotal = selectedMuscles.reduce((acc, m) => acc + (week.sets[m] ?? 0), 0)
  const sourcesText = (m: MuscleId) => {
    const sources = week.sources[m]
    return sources
      ? [...sources.entries()].map(([name, n]) => `${name} (${fmtSets(n)})`).join(', ')
      : 'Sin trabajo esta semana'
  }

  return (
    <div className="view is-wide">
      <PageHeader
        title="Músculos"
        subtitle={`${week.sessionCount} ${week.sessionCount === 1 ? 'entreno' : 'entrenos'} en la semana`}
        trailing={<AvatarButton />}
        wide
      />

      <div className="week-switcher">
        <button
          type="button"
          className="circle-btn"
          onClick={() => {
            setOffset((o) => o - 1)
            setSelected(null)
            setOpenRow(null)
          }}
          aria-label="Semana anterior"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
        <span className="week-label" aria-live="polite">
          {weekLabel(offset)}
        </span>
        <button
          type="button"
          className="circle-btn"
          disabled={offset >= 0}
          onClick={() => {
            setOffset((o) => Math.min(0, o + 1))
            setSelected(null)
            setOpenRow(null)
          }}
          aria-label="Semana siguiente"
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      </div>

      <div className="split">
        <div className="stack is-sticky">
          <div className="bodymap-card">
            <BodyMap
              heat={heat}
              selected={selected}
              onSelect={(r) => {
                setSelected(r)
                setOpenRow(null)
              }}
              sexo={data.profile.sexo}
            />
            <div className="heat-legend" aria-hidden="true">
              <span>0</span>
              <span className="heat-bar" />
              <span>{FULL_SETS}+ series</span>
            </div>
          </div>

          {selected && openRow === null && (
            <Section
              title={`${REGION_NAMES[selected.split(':')[1]] ?? 'Zona'} · ${fmtSets(selectedTotal)} series`}
            >
              {selectedMuscles.map((m) => (
                <Row key={m} title={MUSCLE_NAMES[m]} subtitle={sourcesText(m)} detail={fmtSets(week.sets[m] ?? 0)} />
              ))}
            </Section>
          )}
        </div>

        <div className="stack">
          <Section
            title="Series por músculo"
            footer="Cada serie directa suma 1 y cada serie como músculo secundario suma 0,5. Referencia habitual para ganar músculo: 10–20 series por músculo a la semana."
          >
            {ranked.map(([m, sets]) => {
              const region = regionForMuscle(m)
              const open = openRow === m
              const intensity = Math.min(1, sets / FULL_SETS)
              return (
                <div key={m}>
                  <button
                    type="button"
                    className={`muscle-row ${open ? 'is-selected' : ''}`}
                    aria-expanded={open}
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
                    <span className="muscle-dot" style={{ background: heatColor(intensity) }} />
                    <span className="muscle-name">{MUSCLE_NAMES[m]}</span>
                    <span className="muscle-bar">
                      <span style={{ transform: `scaleX(${intensity})`, background: heatColor(intensity) }} />
                    </span>
                    <span className="muscle-value">{fmtSets(sets)}</span>
                  </button>
                  {open && (
                    <div className="muscle-sources">
                      {week.sources[m] ? (
                        [...week.sources[m]!.entries()].map(([name, n]) => (
                          <span key={name}>
                            {name}: {fmtSets(n)} series
                          </span>
                        ))
                      ) : (
                        <span>Sin trabajo esta semana.</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {ranked.length === 0 && (
              <EmptyState icon={<BicepsFlexed size={28} />} title="Semana en blanco">
                Cuando termines un entreno verás aquí cómo se reparte el trabajo por músculo.
              </EmptyState>
            )}
          </Section>

          {untouched.length > 0 && ranked.length > 0 && (
            <Section title="Sin trabajar esta semana" bare>
              <div className="chips">
                {untouched.map((m) => (
                  <span key={m} className="chip">
                    {MUSCLE_NAMES[m]}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <WeakPoints data={data} />
        </div>
      </div>
    </div>
  )
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
    <Section
      title="Puntos débiles"
      footer={`Media de ${weeks === 1 ? 'la última semana' : `las últimas ${weeks} semanas`}. Por debajo de unas 6 series semanales un músculo apenas crece.`}
    >
      {weakest.map(({ muscle, sets }) => {
        const suggestions = data.exercises.filter((e) => e.primary.includes(muscle)).slice(0, 2)
        return (
          <Row
            key={muscle}
            title={MUSCLE_NAMES[muscle]}
            subtitle={suggestions.length > 0 ? `Prueba: ${suggestions.map((e) => e.name).join(' · ')}` : undefined}
            detail={<span className="is-down">{fmtSets(sets)}/sem</span>}
          />
        )
      })}
    </Section>
  )
}
