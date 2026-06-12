import { useMemo, useState } from 'react'
import type { AppData, Objetivo } from '../types'
import { currentBodyweight } from '../types'
import { bestSets, exerciseSeries, fmtWeight, getExercise, todayKey } from '../lib/stats'
import { estimateCalories, OBJETIVO_LABEL } from '../lib/nutrition'
import { LineChart, NumberField, Segmented } from '../components/ui'
import { ProfileSheet } from './SettingsView'

type Update = (fn: (d: AppData) => AppData) => void

export function ProgressView({ data, update }: { data: AppData; update: Update }) {
  const [mode, setMode] = useState<'ejercicios' | 'cuerpo'>('ejercicios')

  return (
    <div className="view">
      <h1 className="view-title">Progreso</h1>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'ejercicios', label: 'Ejercicios' },
          { value: 'cuerpo', label: 'Mi cuerpo' }
        ]}
      />
      {mode === 'ejercicios' ? (
        <ExerciseProgress data={data} />
      ) : (
        <BodyProgress data={data} update={update} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progreso por ejercicio
// ---------------------------------------------------------------------------

type Metric = 'maxWeight' | 'maxE1rm' | 'maxReps'

const METRIC_LABEL: Record<Metric, string> = {
  maxWeight: 'Peso máx',
  maxE1rm: 'RM est.',
  maxReps: 'Reps'
}

const METRIC_UNIT: Record<Metric, string> = {
  maxWeight: 'kg',
  maxE1rm: 'kg',
  maxReps: 'reps'
}

function ExerciseProgress({ data }: { data: AppData }) {
  // ejercicios con al menos un registro
  const trained = useMemo(() => {
    const ids = new Set<string>()
    for (const s of data.sessions) {
      if (!s.finished) continue
      for (const log of s.exercises) if (log.sets.length > 0) ids.add(log.exerciseId)
    }
    return data.exercises.filter((e) => ids.has(e.id))
  }, [data])

  const [exerciseId, setExerciseId] = useState<string>(trained[0]?.id ?? '')
  const def = getExercise(data, exerciseId) ?? trained[0]
  const effectiveId = def?.id ?? ''

  const [variant, setVariant] = useState<string>('__all__')
  const [metric, setMetric] = useState<Metric>('maxWeight')

  if (!def) {
    return <p className="view-subtitle">Termina tu primer entreno para ver gráficas.</p>
  }

  const bw = currentBodyweight(data.profile)
  const variantValue =
    def.variants.length > 0 && variant !== '__all__' && def.variants.includes(variant)
      ? variant
      : undefined

  const points = exerciseSeries(data, effectiveId, variantValue)
  // en ejercicios a peso corporal sin peso registrado, los kg no significan nada
  const chartMetric: Metric =
    def.bodyweight && !bw && metric === 'maxWeight' ? 'maxReps' : metric

  const chartPoints = points.map((p) => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    value: p[chartMetric]
  }))

  const bests = bestSets(data, effectiveId, variantValue)

  const first = chartPoints[0]?.value ?? 0
  const lastVal = chartPoints[chartPoints.length - 1]?.value ?? 0
  const delta = lastVal - first
  const relative = bw && bests.byE1rm ? bests.byE1rm.value / bw : null

  const fmtBest = (b: { weight: number; reps: number } | null) =>
    b ? `${fmtWeight(b.weight)}×${b.reps}` : '—'

  return (
    <>
      <select
        className="big-select"
        value={effectiveId}
        onChange={(e) => {
          setExerciseId(e.target.value)
          setVariant('__all__')
        }}
      >
        {trained.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {def.variants.length > 0 && (
        <Segmented
          value={def.variants.includes(variant) ? variant : '__all__'}
          onChange={setVariant}
          options={[
            { value: '__all__', label: 'Todas' },
            ...def.variants.map((v) => ({ value: v, label: v }))
          ]}
        />
      )}

      <Segmented
        value={chartMetric}
        onChange={(m) => setMetric(m)}
        options={(def.bodyweight && !bw
          ? (['maxReps', 'maxE1rm'] as Metric[])
          : (['maxWeight', 'maxE1rm', 'maxReps'] as Metric[])
        ).map((m) => ({
          value: m,
          label: def.bodyweight && m === 'maxWeight' ? 'Peso total' : METRIC_LABEL[m]
        }))}
      />

      {def.bodyweight && bw ? (
        <p className="hint-block">
          Dominadas y similares cuentan tu peso corporal ({fmtWeight(bw)} kg) + lastre.
        </p>
      ) : null}

      <LineChart points={chartPoints} unit={METRIC_UNIT[chartMetric]} />

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{fmtBest(bests.byWeight)}</span>
          <span className="stat-label">{def.bodyweight ? 'peso total máx' : 'mejor peso'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{fmtBest(bests.byReps)}</span>
          <span className="stat-label">más reps</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {bests.byE1rm ? `${fmtWeight(Math.round(bests.byE1rm.value * 10) / 10)} kg` : '—'}
          </span>
          <span className="stat-label">
            RM estimado{bests.byE1rm ? ` (con ${fmtBest(bests.byE1rm)})` : ''}
          </span>
        </div>
        {relative ? (
          <div className="stat-card">
            <span className="stat-value">{relative.toFixed(2)}×</span>
            <span className="stat-label">tu peso corporal</span>
          </div>
        ) : (
          <div className="stat-card">
            <span className={`stat-value ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
              {delta > 0 ? '+' : ''}
              {fmtWeight(Math.round(delta * 10) / 10)}
            </span>
            <span className="stat-label">desde el inicio</span>
          </div>
        )}
      </div>

      <p className="hint-block">
        El <strong>RM estimado</strong> (fórmula de Epley) convierte cada serie en su
        equivalente a 1 repetición máxima. Así puedes comparar sesiones aunque cambies
        de rango de repeticiones: 80×7 y 90×3 se miden en la misma escala.
      </p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Mi cuerpo: peso corporal + estimación de calorías
// ---------------------------------------------------------------------------

function BodyProgress({ data, update }: { data: AppData; update: Update }) {
  const { profile } = data
  const bw = currentBodyweight(profile)
  const [newWeight, setNewWeight] = useState(bw ?? 70)
  const [editingProfile, setEditingProfile] = useState(false)

  const chartPoints = profile.pesoLog.map((e) => ({
    label: new Date(e.date + 'T12:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    }),
    value: e.kg
  }))

  const cal = estimateCalories(data)
  const objetivo = profile.objetivo ?? 'recomp'

  const logWeight = () => {
    update((d) => {
      const today = todayKey()
      const log = d.profile.pesoLog.filter((e) => e.date !== today)
      return {
        ...d,
        profile: {
          ...d.profile,
          pesoLog: [...log, { date: today, kg: newWeight }].sort((a, b) =>
            a.date.localeCompare(b.date)
          )
        }
      }
    })
  }

  return (
    <>
      <LineChart points={chartPoints} unit="kg" />

      <div className="weight-add">
        <NumberField label="kg hoy" value={newWeight} step={0.5} min={30} onChange={setNewWeight} />
        <button type="button" className="btn-primary" onClick={logWeight}>
          Registrar peso
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{profile.edad ?? '—'}</span>
          <span className="stat-label">edad</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.alturaCm ? `${profile.alturaCm} cm` : '—'}</span>
          <span className="stat-label">altura</span>
        </div>
      </div>
      <button type="button" className="btn-ghost small" onClick={() => setEditingProfile(true)}>
        ✏️ Editar perfil
      </button>

      {cal ? (
        <div className="settings-section">
          <h2 className="settings-title">🔥 Calorías estimadas</h2>
          <Segmented
            value={objetivo}
            onChange={(o: Objetivo) =>
              update((d) => ({ ...d, profile: { ...d.profile, objetivo: o } }))
            }
            options={(Object.keys(OBJETIVO_LABEL) as Objetivo[]).map((o) => ({
              value: o,
              label: OBJETIVO_LABEL[o]
            }))}
          />
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{cal.tdee.toLocaleString('es-ES')}</span>
              <span className="stat-label">mantenimiento kcal</span>
            </div>
            <div className="stat-card">
              <span className="stat-value up">{cal.target.toLocaleString('es-ES')}</span>
              <span className="stat-label">objetivo kcal/día</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {cal.proteinMin}–{cal.proteinMax} g
              </span>
              <span className="stat-label">proteína/día</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{cal.sessionsPerWeek}</span>
              <span className="stat-label">entrenos/semana</span>
            </div>
          </div>
          <p className="hint-block">
            Estimación con Mifflin-St Jeor y tu frecuencia real de entreno (no es
            consejo médico). La báscula manda: si en 2-3 semanas no te mueves hacia tu
            objetivo, ajusta ±150 kcal.
          </p>
        </div>
      ) : (
        <button type="button" className="btn-ghost" onClick={() => setEditingProfile(true)}>
          Completa tu perfil (edad, sexo, altura y peso) para estimar tus calorías
        </button>
      )}

      {editingProfile && (
        <ProfileSheet data={data} update={update} onClose={() => setEditingProfile(false)} />
      )}
    </>
  )
}
