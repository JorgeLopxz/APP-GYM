import { useMemo, useState } from 'react'
import type { AppData } from '../types'
import {
  exerciseSeries,
  fmtWeight,
  getExercise
} from '../lib/stats'
import { LineChart, Segmented } from '../components/ui'

type Metric = 'maxWeight' | 'maxE1rm' | 'volume' | 'maxReps'

const METRIC_LABEL: Record<Metric, string> = {
  maxWeight: 'Peso máx',
  maxE1rm: 'RM est.',
  volume: 'Volumen',
  maxReps: 'Reps'
}

const METRIC_UNIT: Record<Metric, string> = {
  maxWeight: 'kg',
  maxE1rm: 'kg',
  volume: 'kg',
  maxReps: 'reps'
}

export function ProgressView({ data }: { data: AppData }) {
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
    return (
      <div className="view">
        <h1 className="view-title">Progreso</h1>
        <p className="view-subtitle">Termina tu primer entreno para ver gráficas.</p>
      </div>
    )
  }

  const variantValue =
    def.variants.length > 0 && variant !== '__all__' && def.variants.includes(variant)
      ? variant
      : undefined

  const points = exerciseSeries(data, effectiveId, variantValue)
  const chartMetric: Metric = def.bodyweight && metric === 'maxWeight' ? 'maxReps' : metric

  const chartPoints = points.map((p) => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    value: p[chartMetric]
  }))

  const best = {
    maxWeight: points.length ? Math.max(...points.map((p) => p.maxWeight)) : 0,
    maxE1rm: points.length ? Math.max(...points.map((p) => p.maxE1rm)) : 0,
    maxReps: points.length ? Math.max(...points.map((p) => p.maxReps)) : 0
  }

  const first = chartPoints[0]?.value ?? 0
  const lastVal = chartPoints[chartPoints.length - 1]?.value ?? 0
  const delta = lastVal - first

  return (
    <div className="view">
      <h1 className="view-title">Progreso</h1>

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
        options={(def.bodyweight
          ? (['maxReps', 'maxE1rm', 'volume'] as Metric[])
          : (['maxWeight', 'maxE1rm', 'volume'] as Metric[])
        ).map((m) => ({ value: m, label: METRIC_LABEL[m] }))}
      />

      <LineChart points={chartPoints} unit={METRIC_UNIT[chartMetric]} />

      <div className="stat-grid">
        {!def.bodyweight && (
          <div className="stat-card">
            <span className="stat-value">{fmtWeight(best.maxWeight)} kg</span>
            <span className="stat-label">mejor peso</span>
          </div>
        )}
        <div className="stat-card">
          <span className="stat-value">
            {fmtWeight(Math.round(best.maxE1rm * 10) / 10)} kg
          </span>
          <span className="stat-label">RM estimado</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{best.maxReps}</span>
          <span className="stat-label">más reps</span>
        </div>
        <div className="stat-card">
          <span className={`stat-value ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
            {delta > 0 ? '+' : ''}
            {fmtWeight(Math.round(delta * 10) / 10)}
          </span>
          <span className="stat-label">desde el inicio</span>
        </div>
      </div>

      <p className="hint-block">
        El <strong>RM estimado</strong> (fórmula de Epley) convierte cada serie en su
        equivalente a 1 repetición máxima. Así puedes comparar sesiones aunque cambies
        de rango de repeticiones: 80×7 y 90×3 se miden en la misma escala.
      </p>
    </div>
  )
}
