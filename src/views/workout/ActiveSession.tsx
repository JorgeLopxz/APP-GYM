import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Dumbbell,
  Ellipsis,
  Info,
  Plus,
  Tag,
  Trash2,
  Trophy
} from 'lucide-react'
import type {
  AppData,
  ExerciseDef,
  ExerciseLog,
  Routine,
  Session,
  SetEntry,
  SetTag,
  Update
} from '../../types'
import { brandRelevant, getRoutineItems, logLabel } from '../../lib/exercise'
import {
  e1rm,
  fmtDate,
  fmtRelative,
  fmtSet,
  fmtWeight,
  getExercise,
  lastLog,
  lastLogAny,
  prefillSets,
  prsBefore,
  sessionSetCount
} from '../../lib/stats'
import { uid } from '../../lib/storage'
import {
  EmptyState,
  Menu,
  NumberField,
  PageHeader,
  Section,
  Sheet,
  type MenuItem
} from '../../components/ui'
import { BrandPickerSheet } from './BrandPicker'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { ExercisePickerSheet } from './ExercisePicker'

// ---------------------------------------------------------------------------
// Pre-relleno: 1) tu última vez con esa variante y esa marca, 2) las series
// objetivo de la rutina, 3) tu última vez con cualquier variante o marca.
// ---------------------------------------------------------------------------

export function prefillFor(
  data: AppData,
  exerciseId: string,
  variant: string | undefined,
  brand: string | undefined,
  targetSets?: SetEntry[],
  excludeSessionId?: string
): SetEntry[] {
  const exact = lastLog(data, exerciseId, variant, brand, excludeSessionId)
  if (exact) return prefillSets(exact.sets)
  if (targetSets && targetSets.length > 0) return prefillSets(targetSets)
  const any = lastLogAny(data, exerciseId, excludeSessionId)
  return any ? prefillSets(any.sets) : []
}

/** Marca usada la última vez con esa variante (para no tener que elegirla cada día). */
export function lastBrandFor(
  data: AppData,
  exerciseId: string,
  variant: string | undefined
): string | undefined {
  const sessions = data.sessions
    .filter((s) => s.finished)
    .sort((a, b) => b.date.localeCompare(a.date))
  for (const s of sessions) {
    for (const l of s.exercises) {
      if (l.exerciseId === exerciseId && (l.variant ?? '') === (variant ?? '') && l.sets.length > 0) {
        return l.brand
      }
    }
  }
  return undefined
}

/** Crea la sesión de un día con todo pre-rellenado. */
export function startSession(data: AppData, update: Update, routine: Routine) {
  const exercises = getRoutineItems(data, routine)
    .map((item): ExerciseLog | null => {
      if (!getExercise(data, item.exerciseId)) return null
      const brand = item.brand ?? lastBrandFor(data, item.exerciseId, item.variant)
      return {
        exerciseId: item.exerciseId,
        variant: item.variant,
        brand,
        sets: prefillFor(data, item.exerciseId, item.variant, brand, item.targetSets)
      }
    })
    .filter((l): l is ExerciseLog => l !== null)
  const session: Session = {
    id: uid(),
    date: new Date().toISOString(),
    routineId: routine.id,
    routineName: routine.name,
    finished: false,
    exercises
  }
  update((d) => ({ ...d, sessions: [...d.sessions, session] }))
  window.scrollTo(0, 0)
}

// ---------------------------------------------------------------------------
// Sesión activa
// ---------------------------------------------------------------------------

export function ActiveSession(props: { data: AppData; session: Session; update: Update }) {
  const { data, session, update } = props
  const [adding, setAdding] = useState(false)
  const [finishing, setFinishing] = useState(false)

  // pantalla siempre encendida mientras entrenas (Wake Lock API)
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const acquire = () => {
      const wl = (navigator as Navigator & {
        wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> }
      }).wakeLock
      wl?.request('screen').then(
        (l) => {
          lock = l
        },
        () => {}
      )
    }
    acquire()
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [])

  const patchSession = (fn: (s: Session) => Session) =>
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === session.id ? fn(s) : s))
    }))

  const cancel = () => {
    if (!confirm('¿Descartar este entreno? Se perderán las series apuntadas.')) return
    update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== session.id) }))
  }

  const addExercise = (def: ExerciseDef) => {
    // recuerda la variante y la marca que usaste la última vez
    const any = lastLogAny(data, def.id)
    const variant = any?.variant ?? def.variants[0]
    const brand = any ? any.brand : undefined
    patchSession((s) => ({
      ...s,
      exercises: [
        ...s.exercises,
        { exerciseId: def.id, variant, brand, sets: prefillFor(data, def.id, variant, brand) }
      ]
    }))
    setAdding(false)
  }

  const total = sessionSetCount(session)
  const done = session.exercises.reduce((acc, l) => acc + l.sets.filter((s) => s.done).length, 0)
  const current = session.exercises.findIndex((l) => l.sets.some((s) => !s.done))

  return (
    <div className="view">
      <PageHeader
        title={session.routineName}
        subtitle={
          total === 0
            ? 'Añade tu primera serie'
            : done === total
              ? `Las ${total} series hechas · pulsa Terminar`
              : `${done} de ${total} series hechas`
        }
        trailing={
          <button type="button" className="glass-btn is-text is-tint" onClick={() => setFinishing(true)}>
            Terminar
          </button>
        }
      />

      {total > 0 && (
        <div
          className="session-progress"
          role="progressbar"
          aria-label="Series hechas"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <span style={{ transform: `scaleX(${done / total})` }} />
        </div>
      )}

      {session.exercises.length === 0 ? (
        <EmptyState icon={<Dumbbell size={28} />} title="Entreno vacío">
          Añade el primer ejercicio para empezar a apuntar.
        </EmptyState>
      ) : (
        <div className="ex-list">
          {session.exercises.map((log, i) => (
            <ExerciseCard
              key={`${log.exerciseId}-${i}`}
              data={data}
              session={session}
              log={log}
              index={i}
              count={session.exercises.length}
              current={i === current}
              patchSession={patchSession}
              update={update}
            />
          ))}
        </div>
      )}

      <div className="session-actions">
        <button type="button" className="btn btn-gray btn-lg btn-block" onClick={() => setAdding(true)}>
          <Plus size={20} strokeWidth={2.6} />
          Añadir ejercicio
        </button>
        <button type="button" className="btn btn-plain is-destructive btn-block" onClick={cancel}>
          Descartar entreno
        </button>
      </div>

      {adding && (
        <ExercisePickerSheet
          data={data}
          update={update}
          onPick={addExercise}
          onClose={() => setAdding(false)}
        />
      )}

      {finishing && (
        <FinishSheet
          data={data}
          session={session}
          onClose={() => setFinishing(false)}
          onFinish={() => {
            patchSession((s) => {
              // si has usado los ✓, las series sin marcar eran pre-relleno
              // que no llegaste a hacer: no deben guardarse como hechas
              const usedTicks = s.exercises.some((l) => l.sets.some((x) => x.done))
              return {
                ...s,
                finished: true,
                exercises: s.exercises
                  .map((l) => ({ ...l, sets: usedTicks ? l.sets.filter((x) => x.done) : l.sets }))
                  .filter((l) => l.sets.length > 0)
              }
            })
            setFinishing(false)
            window.scrollTo(0, 0)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tarjeta de ejercicio: etiqueta nombre · variante · marca y tabla de series
// ---------------------------------------------------------------------------

function ExerciseCard(props: {
  data: AppData
  session: Session
  log: ExerciseLog
  index: number
  count: number
  current: boolean
  patchSession: (fn: (s: Session) => Session) => void
  update: Update
}) {
  const { data, session, log, index, count, current, patchSession, update } = props
  const [showInfo, setShowInfo] = useState(false)
  const [pickingBrand, setPickingBrand] = useState(false)
  const def = getExercise(data, log.exerciseId)

  const last = useMemo(
    () => lastLog(data, log.exerciseId, log.variant, log.brand, session.id),
    [data, log.exerciseId, log.variant, log.brand, session.id]
  )
  const reference = useMemo(
    () => (last ? null : lastLogAny(data, log.exerciseId, session.id)),
    [data, last, log.exerciseId, session.id]
  )

  if (!def) return null

  const patchLog = (fn: (l: ExerciseLog) => ExerciseLog) =>
    patchSession((s) => ({
      ...s,
      exercises: s.exercises.map((l, i) => (i === index ? fn(l) : l))
    }))

  /** Cambia variante o marca; si aún no marcaste nada, re-rellena con ESA combinación. */
  const retarget = (variant: string | undefined, brand: string | undefined) =>
    patchLog((l) => {
      if (l.sets.some((s) => s.done)) return { ...l, variant, brand }
      const ref = lastLog(data, l.exerciseId, variant, brand, session.id)
      return { ...l, variant, brand, sets: ref ? prefillSets(ref.sets) : l.sets }
    })

  const addSet = () => {
    const prev = log.sets[log.sets.length - 1]
    const ref = prev ?? last?.sets[0]
    patchLog((l) => ({
      ...l,
      sets: [
        ...l.sets,
        { weight: ref?.weight ?? (def.bodyweight ? 0 : 20), reps: ref?.reps ?? 10, done: false }
      ]
    }))
  }

  const move = (dir: -1 | 1) =>
    patchSession((s) => {
      const j = index + dir
      if (j < 0 || j >= s.exercises.length) return s
      const copy = [...s.exercises]
      ;[copy[index], copy[j]] = [copy[j], copy[index]]
      return { ...s, exercises: copy }
    })

  const remove = () => {
    if (log.sets.some((s) => s.done) && !confirm(`¿Quitar ${def.name} de este entreno?`)) return
    patchSession((s) => ({ ...s, exercises: s.exercises.filter((_, i) => i !== index) }))
  }

  const showBrand = !!log.brand || brandRelevant(def, log.variant)
  const hasVariants = def.variants.length > 0 || !!log.variant
  const complete = log.sets.length > 0 && log.sets.every((s) => s.done)
  const nextSet = log.sets.findIndex((s) => !s.done)

  const variantItems: MenuItem[] = [
    ...def.variants.map((v) => ({
      label: v,
      checked: log.variant === v,
      onSelect: () => retarget(v, log.brand)
    })),
    ...(log.variant && !def.variants.includes(log.variant)
      ? [{ label: log.variant, checked: true, onSelect: () => {} }]
      : []),
    {
      label: 'Otra variante…',
      divider: def.variants.length > 0,
      onSelect: () => {
        const v = prompt('Variante o nota (agarre, ángulo, material…)', log.variant ?? '')
        if (v !== null) retarget(v.trim() || undefined, log.brand)
      }
    }
  ]

  const menuItems: MenuItem[] = [
    { label: 'Ficha y técnica', icon: <Info size={18} />, onSelect: () => setShowInfo(true) },
    {
      label: log.brand ? 'Cambiar marca' : 'Elegir marca',
      icon: <Tag size={18} />,
      onSelect: () => setPickingBrand(true)
    },
    ...(index > 0
      ? [{ label: 'Subir', icon: <ArrowUp size={18} />, onSelect: () => move(-1) }]
      : []),
    ...(index < count - 1
      ? [{ label: 'Bajar', icon: <ArrowDown size={18} />, onSelect: () => move(1) }]
      : []),
    {
      label: 'Quitar del entreno',
      icon: <Trash2 size={18} />,
      destructive: true,
      divider: true,
      onSelect: remove
    }
  ]

  const refLabel = reference ? logLabel(reference.variant, reference.brand) : ''

  return (
    <article className={`ex-card ${current ? 'is-current' : ''}`} aria-label={def.name}>
      <div className="ex-head">
        <div className="ex-title-wrap">
          <button type="button" className="ex-title" onClick={() => setShowInfo(true)}>
            {def.name}
            {complete && <Check className="ex-done" size={20} strokeWidth={3} aria-label="Completado" />}
          </button>
          {(hasVariants || showBrand) && (
            <div className="ex-tags">
              {hasVariants && (
                <Menu items={variantItems} label={`Variante de ${def.name}`} title="Variante" className="tag-chip">
                  <span>{log.variant ?? 'Variante'}</span>
                  <ChevronDown size={14} strokeWidth={2.6} />
                </Menu>
              )}
              {showBrand && (
                <button
                  type="button"
                  className={`tag-chip ${log.brand ? '' : 'is-empty'}`}
                  onClick={() => setPickingBrand(true)}
                  aria-label={log.brand ? `Marca: ${log.brand}. Cambiar` : 'Elegir marca de la máquina'}
                >
                  {log.brand ? (
                    <>
                      <span>{log.brand}</span>
                      <ChevronDown size={14} strokeWidth={2.6} />
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.8} />
                      <span>Marca</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        <Menu items={menuItems} label={`Opciones de ${def.name}`} className="ex-menu">
          <Ellipsis size={20} strokeWidth={2.4} />
        </Menu>
      </div>

      {last ? (
        <p className="ex-last has-prev">
          Última vez, {fmtRelative(last.date)}:{' '}
          <strong>{last.sets.map((s) => fmtSet(s, def.bodyweight)).join(' · ')}</strong>
        </p>
      ) : reference ? (
        <p className="ex-last">
          Primera vez {log.brand ? `en ${log.brand}` : 'así'}. Referencia{refLabel ? ` (${refLabel})` : ''}:{' '}
          <strong>{reference.sets.map((s) => fmtSet(s, def.bodyweight)).join(' · ')}</strong>
        </p>
      ) : (
        <p className="ex-last">Sin historial todavía: apunta el peso con el que empiezas.</p>
      )}

      {log.sets.length > 0 && (
        <div className="set-table">
          <div className="set-head" aria-hidden="true">
            <span>Serie</span>
            <span className="set-prev">
              {last ? `Anterior · ${fmtRelative(last.date)}` : 'Anterior'}
            </span>
            <span>{def.bodyweight ? 'Lastre' : 'kg'}</span>
            <span>Reps</span>
            <span />
          </div>
          {log.sets.map((set, si) => (
            <SetRow
              key={si}
              set={set}
              previous={last?.sets[si]}
              index={si}
              next={current && si === nextSet}
              bodyweight={def.bodyweight}
              onChange={(updated) =>
                patchLog((l) => ({ ...l, sets: l.sets.map((x, i) => (i === si ? updated : x)) }))
              }
              onRemove={() => patchLog((l) => ({ ...l, sets: l.sets.filter((_, i) => i !== si) }))}
            />
          ))}
        </div>
      )}

      <div className="ex-foot">
        <button type="button" className="btn btn-plain" onClick={addSet}>
          <Plus size={18} strokeWidth={2.6} />
          Añadir serie
        </button>
      </div>

      {showInfo && (
        <ExerciseInfoSheet
          data={data}
          def={def}
          variant={log.variant}
          update={update}
          onClose={() => setShowInfo(false)}
        />
      )}
      {pickingBrand && (
        <BrandPickerSheet
          data={data}
          exerciseId={def.id}
          exerciseName={def.name}
          value={log.brand}
          onChange={(brand) => retarget(log.variant, brand)}
          onClose={() => setPickingBrand(false)}
        />
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Fila de serie
// ---------------------------------------------------------------------------

const TAG_LETTER: Record<SetTag, string> = { dropset: 'D', fallo: 'F', negativas: 'N' }

function SetRow(props: {
  set: SetEntry
  /** La misma serie la última vez (columna «Anterior» en pantallas anchas) */
  previous?: SetEntry
  index: number
  next: boolean
  bodyweight?: boolean
  onChange: (s: SetEntry) => void
  onRemove: () => void
}) {
  const { set, previous, index, next, bodyweight, onChange, onRemove } = props
  const n = index + 1

  const setTag = (tag?: SetTag) =>
    onChange({
      ...set,
      tag,
      dropWeight: tag === 'dropset' ? set.dropWeight ?? Math.max(0, set.weight - 10) : undefined,
      dropReps: tag === 'dropset' ? set.dropReps ?? 5 : undefined,
      negReps: tag === 'negativas' ? set.negReps ?? 3 : undefined
    })

  const items: MenuItem[] = [
    { label: 'Serie normal', checked: !set.tag, onSelect: () => setTag(undefined) },
    { label: 'Dropset', checked: set.tag === 'dropset', onSelect: () => setTag('dropset') },
    { label: 'Al fallo', checked: set.tag === 'fallo', onSelect: () => setTag('fallo') },
    { label: 'Negativas', checked: set.tag === 'negativas', onSelect: () => setTag('negativas') },
    {
      label: 'Eliminar serie',
      icon: <Trash2 size={18} />,
      destructive: true,
      divider: true,
      onSelect: onRemove
    }
  ]

  return (
    <>
      <div className={`set-row ${set.done ? 'is-done' : ''} ${next ? 'is-next' : ''}`}>
        <Menu
          items={items}
          label={`Serie ${n}: tipo o eliminar`}
          title={`Serie ${n}`}
          className={`set-badge ${set.tag ? 'has-tag' : ''}`}
        >
          {set.tag ? TAG_LETTER[set.tag] : n}
        </Menu>
        <span className="set-prev">{previous ? fmtSet(previous, bodyweight) : '—'}</span>
        <NumberField
          value={set.weight}
          step={2.5}
          ariaLabel={`Serie ${n}, ${bodyweight ? 'lastre en kilos' : 'kilos'}`}
          onChange={(weight) => onChange({ ...set, weight })}
        />
        <NumberField
          value={set.reps}
          step={1}
          ariaLabel={`Serie ${n}, repeticiones`}
          onChange={(reps) => onChange({ ...set, reps })}
        />
        <button
          type="button"
          className={`set-check ${set.done ? 'is-done' : ''}`}
          aria-pressed={!!set.done}
          aria-label={`Serie ${n} hecha`}
          onClick={() => {
            if (!set.done) navigator.vibrate?.(8)
            onChange({ ...set, done: !set.done })
          }}
        >
          <Check size={20} strokeWidth={3} />
        </button>
      </div>
      {set.tag === 'dropset' && (
        <div className="set-extra">
          <span className="set-extra-label">Drop</span>
          <span className="set-prev" aria-hidden="true" />
          <NumberField
            value={set.dropWeight ?? 0}
            step={2.5}
            ariaLabel={`Dropset de la serie ${n}, kilos`}
            onChange={(dropWeight) => onChange({ ...set, dropWeight })}
          />
          <NumberField
            value={set.dropReps ?? 0}
            step={1}
            ariaLabel={`Dropset de la serie ${n}, repeticiones`}
            onChange={(dropReps) => onChange({ ...set, dropReps })}
          />
          <span />
        </div>
      )}
      {set.tag === 'negativas' && (
        <div className="set-extra">
          <span className="set-extra-label">Neg</span>
          <span className="set-prev" aria-hidden="true" />
          <span className="ex-note">Negativas extra</span>
          <NumberField
            value={set.negReps ?? 0}
            step={1}
            ariaLabel={`Negativas de la serie ${n}`}
            onChange={(negReps) => onChange({ ...set, negReps })}
          />
          <span />
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Resumen al terminar + récords (por variante y marca)
// ---------------------------------------------------------------------------

function FinishSheet(props: {
  data: AppData
  session: Session
  onClose: () => void
  onFinish: () => void
}) {
  const { data, session: rawSession, onClose, onFinish } = props

  // lo que de verdad se guardará: si usaste los ✓, solo las series marcadas
  const usedTicks = rawSession.exercises.some((l) => l.sets.some((x) => x.done))
  const session = useMemo<Session>(
    () => ({
      ...rawSession,
      exercises: rawSession.exercises
        .map((l) => ({ ...l, sets: usedTicks ? l.sets.filter((x) => x.done) : l.sets }))
        .filter((l) => l.sets.length > 0)
    }),
    [rawSession, usedTicks]
  )
  const skipped = sessionSetCount(rawSession) - sessionSetCount(session)

  const prs = useMemo(() => {
    const found: { name: string; value: string; before: string }[] = []
    for (const log of session.exercises) {
      const def = getExercise(data, log.exerciseId)
      if (!def || log.sets.length === 0) continue
      const before = prsBefore(data, log.exerciseId, log.variant, log.brand, session.id, session.date)
      const label = logLabel(log.variant, log.brand)
      const name = def.name + (label ? ` · ${label}` : '')
      const maxW = Math.max(...log.sets.map((s) => s.weight))
      const maxE = Math.max(...log.sets.map((s) => e1rm(s.weight, s.reps)))
      const maxR = Math.max(...log.sets.map((s) => s.reps))
      if (def.bodyweight) {
        if (before.maxReps > 0 && maxR > before.maxReps) {
          found.push({ name, value: `${maxR} reps`, before: `Antes: ${before.maxReps} reps` })
        }
      } else if (before.maxWeight > 0 && maxW > before.maxWeight) {
        found.push({
          name,
          value: `${fmtWeight(maxW)} kg`,
          before: `Antes: ${fmtWeight(before.maxWeight)} kg`
        })
      } else if (before.maxE1rm > 0 && maxE > before.maxE1rm + 0.01) {
        found.push({
          name,
          value: `${fmtWeight(Math.round(maxE * 10) / 10)} kg`,
          before: `RM estimado · antes ${fmtWeight(Math.round(before.maxE1rm * 10) / 10)} kg`
        })
      }
    }
    return found
  }, [data, session])

  const sets = sessionSetCount(session)

  return (
    <Sheet onClose={onClose} title="Resumen">
      <div className="finish-hero">
        <span className={`finish-icon ${prs.length > 0 ? 'is-record' : ''}`} aria-hidden="true">
          {prs.length > 0 ? <Trophy size={36} strokeWidth={2.2} /> : <Check size={38} strokeWidth={3} />}
        </span>
        <p className="finish-title">
          {sets === 0
            ? 'Aún no hay series'
            : prs.length > 1
              ? `¡${prs.length} récords!`
              : prs.length === 1
                ? '¡Récord personal!'
                : '¡Buen entreno!'}
        </p>
        <p className="finish-sub">
          {session.routineName} · {fmtDate(session.date)}
        </p>
      </div>

      <div className="finish-stats">
        <div className="finish-stat">
          <span className="finish-stat-value">{sets}</span>
          <span className="finish-stat-label">series</span>
        </div>
        <div className="finish-stat">
          <span className="finish-stat-value">{session.exercises.length}</span>
          <span className="finish-stat-label">ejercicios</span>
        </div>
        <div className="finish-stat">
          <span className="finish-stat-value">{prs.length}</span>
          <span className="finish-stat-label">récords</span>
        </div>
      </div>

      {prs.length > 0 && (
        <Section title="Récords personales">
          {prs.map((p, i) => (
            <div key={i} className="pr-row">
              <span className="pr-name">{p.name}</span>
              <span className="pr-value">{p.value}</span>
              <span className="pr-before">{p.before}</span>
            </div>
          ))}
        </Section>
      )}

      {skipped > 0 && (
        <p className="section-foot">
          {skipped === 1
            ? '1 serie sin marcar no se guardará'
            : `${skipped} series sin marcar no se guardarán`}{' '}
          (eran el pre-relleno de la última vez).
        </p>
      )}
      {sets === 0 && (
        <p className="section-foot">Marca como hechas las series que hayas completado para poder guardar el entreno.</p>
      )}

      <div className="sheet-cta">
        <button type="button" className="btn btn-filled btn-lg btn-block" onClick={onFinish} disabled={sets === 0}>
          Guardar entreno
        </button>
        <button type="button" className="btn btn-plain btn-block" onClick={onClose}>
          Seguir entrenando
        </button>
      </div>
    </Sheet>
  )
}
