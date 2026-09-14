import { useMemo, useState } from 'react'
import { Flame, TrendingUp } from 'lucide-react'
import type { AppData, Objetivo, Update } from '../types'
import { currentBodyweight } from '../types'
import {
  bestSets,
  brandsForExercise,
  exerciseSeries,
  finishedSessions,
  fmtWeight,
  getExercise,
  loggedDimensions,
  todayKey
} from '../lib/stats'
import { estimateCalories, OBJETIVO_LABEL } from '../lib/nutrition'
import {
  EmptyState,
  LineChart,
  NumberField,
  PageHeader,
  PopupSelect,
  Row,
  Section,
  Segmented
} from '../components/ui'
import { AvatarButton } from '../components/chrome'
import { ProfileSheet } from './SettingsView'

export function ProgressView({ data, update }: { data: AppData; update: Update }) {
  const [mode, setMode] = useState<'ejercicios' | 'cuerpo'>('ejercicios')

  return (
    <div className="view is-wide">
      <PageHeader title="Progreso" trailing={<AvatarButton />} wide />
      <Segmented
        ariaLabel="Qué quieres ver"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'ejercicios', label: 'Ejercicios' },
          { value: 'cuerpo', label: 'Mi cuerpo' }
        ]}
      />
      {mode === 'ejercicios' ? <ExerciseProgress data={data} /> : <BodyProgress data={data} update={update} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progreso por ejercicio, filtrable por variante y por marca
// ---------------------------------------------------------------------------

type Metric = 'maxWeight' | 'maxE1rm' | 'maxReps'

const METRIC_LABEL: Record<Metric, string> = {
  maxWeight: 'Peso máx.',
  maxE1rm: 'RM est.',
  maxReps: 'Reps'
}

const METRIC_UNIT: Record<Metric, string> = {
  maxWeight: 'kg',
  maxE1rm: 'kg',
  maxReps: 'reps'
}

const ALL = '__all__'
const NONE = '__none__'

function ExerciseProgress({ data }: { data: AppData }) {
  // ejercicios con registros, del más reciente al más antiguo
  const trained = useMemo(() => {
    const order: string[] = []
    const sessions = finishedSessions(data)
    for (let i = sessions.length - 1; i >= 0; i--) {
      for (const log of sessions[i].exercises) {
        if (log.sets.length > 0 && !order.includes(log.exerciseId)) order.push(log.exerciseId)
      }
    }
    return order.map((id) => getExercise(data, id)).filter((e) => !!e)
  }, [data])

  // con varias marcas, arranca en la última usada: mezclar máquinas distintas
  // dibujaría subidas y bajadas que no son reales
  const defaultBrand = (id?: string) => {
    if (!id) return ALL
    const brands = brandsForExercise(data, id)
    return brands.length >= 2 ? brands[0] : ALL
  }
  const [exerciseId, setExerciseId] = useState<string>(trained[0]?.id ?? '')
  const [variant, setVariant] = useState<string>(ALL)
  const [brand, setBrand] = useState<string>(() => defaultBrand(trained[0]?.id))
  const [metric, setMetric] = useState<Metric>('maxWeight')

  const def = trained.find((e) => e.id === exerciseId) ?? trained[0]

  if (!def) {
    return (
      <div className="group">
        <EmptyState icon={<TrendingUp size={28} />} title="Aún sin gráficas">
          Termina tu primer entreno y aquí verás cómo suben tus kilos, sesión a sesión.
        </EmptyState>
      </div>
    )
  }

  const dims = loggedDimensions(data, def.id)
  const variantValue = variant !== ALL && dims.variants.includes(variant) ? variant : undefined
  const brandValue =
    brand === NONE ? '' : brand !== ALL && dims.brands.includes(brand) ? brand : undefined

  const bw = currentBodyweight(data.profile)
  const points = exerciseSeries(data, def.id, variantValue, brandValue)
  // en ejercicios a peso corporal sin peso registrado, los kg no significan nada
  const chartMetric: Metric = def.bodyweight && !bw && metric === 'maxWeight' ? 'maxReps' : metric
  const unit = METRIC_UNIT[chartMetric]

  const chartPoints = points.map((p) => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    value: p[chartMetric]
  }))

  const bests = bestSets(data, def.id, variantValue, brandValue)
  const first = chartPoints[0]?.value ?? 0
  const lastVal = chartPoints[chartPoints.length - 1]?.value ?? 0
  const delta = Math.round((lastVal - first) * 10) / 10
  const relative = bw && bests.byE1rm && !def.bodyweight ? bests.byE1rm.value / bw : null

  const fmtBest = (b: { weight: number; reps: number } | null) =>
    b ? `${fmtWeight(Math.round(b.weight * 10) / 10)} kg × ${b.reps}` : '—'

  const variantOptions = [
    { value: ALL, label: 'Todas las variantes' },
    ...dims.variants.map((v) => ({ value: v, label: v }))
  ]
  const brandOptions = [
    { value: ALL, label: 'Todas las marcas' },
    ...dims.brands.map((b) => ({ value: b, label: b })),
    ...(dims.unbranded && dims.brands.length > 0 ? [{ value: NONE, label: 'Sin marca' }] : [])
  ]

  return (
    <div className="split">
      <div className="stack is-sticky">
        <PopupSelect
          className="is-large"
          ariaLabel="Ejercicio"
          value={def.id}
          options={trained.map((e) => ({ value: e.id, label: e.name }))}
          onChange={(v) => {
            setExerciseId(v)
            setVariant(ALL)
            setBrand(defaultBrand(v))
          }}
        />
        {(dims.variants.length > 1 || dims.brands.length > 0) && (
          <div className="filter-bar">
            {dims.variants.length > 1 && (
              <PopupSelect ariaLabel="Variante" value={variantValue ?? ALL} options={variantOptions} onChange={setVariant} />
            )}
            {dims.brands.length > 0 && (
              <PopupSelect
                ariaLabel="Marca"
                value={brand === NONE ? NONE : brandValue ?? ALL}
                options={brandOptions}
                onChange={setBrand}
              />
            )}
          </div>
        )}
        <Segmented
          ariaLabel="Métrica"
          value={chartMetric}
          onChange={setMetric}
          options={(def.bodyweight && !bw
            ? (['maxReps', 'maxE1rm'] as Metric[])
            : (['maxWeight', 'maxE1rm', 'maxReps'] as Metric[])
          ).map((m) => ({
            value: m,
            label: def.bodyweight && m === 'maxWeight' ? 'Peso total' : METRIC_LABEL[m]
          }))}
        />
        <LineChart points={chartPoints} unit={unit} emptyText="Sin registros con este filtro." />
      </div>

      <div className="stack">
        <Section
          title="Récords"
          footer="El RM estimado traduce cada serie a su equivalente a una repetición máxima: así comparas 80×7 con 90×3 en la misma escala."
        >
          <Row title={def.bodyweight ? 'Peso total máximo' : 'Mejor peso'} detail={fmtBest(bests.byWeight)} />
          <Row title="Más repeticiones" detail={fmtBest(bests.byReps)} />
          <Row
            title="RM estimado"
            subtitle={bests.byE1rm ? `Con ${fmtBest(bests.byE1rm)}` : undefined}
            detail={bests.byE1rm ? `${fmtWeight(Math.round(bests.byE1rm.value * 10) / 10)} kg` : '—'}
          />
          {relative && <Row title="Respecto a tu peso" detail={`${relative.toFixed(2)}×`} />}
          {points.length > 1 && (
            <Row
              title="Desde el primer registro"
              detail={
                <span className={delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : ''}>
                  {delta > 0 ? '+' : ''}
                  {fmtWeight(delta)} {unit}
                </span>
              }
            />
          )}
          <Row title="Sesiones registradas" detail={points.length} />
        </Section>
        {def.bodyweight && bw ? (
          <p className="section-foot">
            En {def.name.toLowerCase()} el peso total suma tu peso corporal ({fmtWeight(bw)} kg) y el lastre.
          </p>
        ) : null}
      </div>
    </div>
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
  const [saved, setSaved] = useState(false)

  const chartPoints = profile.pesoLog.map((e) => ({
    label: new Date(e.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
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
          pesoLog: [...log, { date: today, kg: newWeight }].sort((a, b) => a.date.localeCompare(b.date))
        }
      }
    })
    setSaved(true)
  }

  return (
    <div className="split">
      <div className="stack is-sticky">
        <LineChart points={chartPoints} unit="kg" emptyText="Registra tu peso para ver cómo evoluciona." />
        <Section footer={saved ? 'Peso de hoy guardado.' : 'Si ya registraste hoy, se sustituye.'}>
          <Row
            title="Peso de hoy"
            accessory={
              <NumberField
                value={newWeight}
                step={0.5}
                min={30}
                ariaLabel="Peso de hoy en kilos"
                onChange={(v) => {
                  setNewWeight(v)
                  setSaved(false)
                }}
              />
            }
          />
          <Row title="Registrar peso" tint onClick={logWeight} />
        </Section>
      </div>

      <div className="stack">
        <Section title="Perfil">
          <Row title="Edad" detail={profile.edad ? `${profile.edad} años` : '—'} />
          <Row title="Altura" detail={profile.alturaCm ? `${profile.alturaCm} cm` : '—'} />
          <Row title="Sexo" detail={profile.sexo === 'F' ? 'Mujer' : profile.sexo === 'M' ? 'Hombre' : '—'} />
          <Row title="Editar perfil" tint onClick={() => setEditingProfile(true)} />
        </Section>

        {cal ? (
          <Section
            title="Calorías estimadas"
            footer="Estimación con Mifflin-St Jeor y tu frecuencia real de entreno; no es consejo médico. Si en 2–3 semanas la báscula no se mueve hacia tu objetivo, ajusta ±150 kcal."
          >
            <div className="row">
              <div className="row-fill">
                <Segmented
                  ariaLabel="Objetivo"
                  value={objetivo}
                  onChange={(o: Objetivo) => update((d) => ({ ...d, profile: { ...d.profile, objetivo: o } }))}
                  options={(Object.keys(OBJETIVO_LABEL) as Objetivo[]).map((o) => ({
                    value: o,
                    label: OBJETIVO_LABEL[o]
                  }))}
                />
              </div>
            </div>
            <Row title="Mantenimiento" detail={`${cal.tdee.toLocaleString('es-ES')} kcal`} />
            <Row
              title="Objetivo diario"
              detail={<span className="tint-text">{cal.target.toLocaleString('es-ES')} kcal</span>}
            />
            <Row title="Proteína" detail={`${cal.proteinMin}–${cal.proteinMax} g`} />
            <Row title="Entrenos por semana" detail={cal.sessionsPerWeek.toLocaleString('es-ES')} />
          </Section>
        ) : (
          <Section>
            <Row
              icon={<Flame />}
              title="Estima tus calorías"
              subtitle="Completa edad, sexo, altura y peso"
              chevron
              onClick={() => setEditingProfile(true)}
            />
          </Section>
        )}
      </div>

      {editingProfile && (
        <ProfileSheet data={data} update={update} onClose={() => setEditingProfile(false)} />
      )}
    </div>
  )
}
