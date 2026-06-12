import { useEffect, useMemo, useState } from 'react'
import type {
  AppData,
  ExerciseDef,
  ExerciseLog,
  MuscleId,
  Routine,
  Session,
  SetEntry,
  SetTag
} from '../types'
import { MUSCLE_NAMES } from '../types'
import { uid } from '../lib/storage'
import {
  e1rm,
  fmtDate,
  fmtSet,
  fmtWeight,
  getExercise,
  lastLog,
  lastLogAny,
  prefillSets,
  prsBefore,
  sessionSetCount,
  todayKey
} from '../lib/stats'
import { youtubeId, youtubeSearchUrl } from '../lib/youtube'
import { exerciseRegion, REGION_ORDER } from '../data/catalog'
import { NumberField, Sheet } from '../components/ui'

type Update = (fn: (d: AppData) => AppData) => void

function groupByRegion(exercises: ExerciseDef[]): [string, ExerciseDef[]][] {
  return REGION_ORDER.map(
    (region) =>
      [region, exercises.filter((e) => exerciseRegion(e) === region)] as [
        string,
        ExerciseDef[]
      ]
  ).filter(([, list]) => list.length > 0)
}

// ---------------------------------------------------------------------------
// Vista principal: selector de rutina o sesión activa
// ---------------------------------------------------------------------------

export function WorkoutView(props: { data: AppData; update: Update }) {
  const { data, update } = props
  const active = data.sessions.find((s) => !s.finished)

  if (active) {
    return <ActiveSession data={data} session={active} update={update} />
  }
  return <RoutinePicker data={data} update={update} />
}

// ---------------------------------------------------------------------------
// Selector de rutinas + editor
// ---------------------------------------------------------------------------

function RoutinePicker({ data, update }: { data: AppData; update: Update }) {
  const [editing, setEditing] = useState<Routine | 'new' | null>(null)
  const [confirming, setConfirming] = useState<Routine | null>(null)

  const lastDone = (routineId: string): string | null => {
    const done = data.sessions
      .filter((s) => s.finished && s.routineId === routineId)
      .sort((a, b) => b.date.localeCompare(a.date))
    return done.length > 0 ? done[0].date : null
  }

  const start = (routine: Routine) => {
    const session: Session = {
      id: uid(),
      date: new Date().toISOString(),
      routineId: routine.id,
      routineName: routine.name,
      finished: false,
      // cada ejercicio arranca pre-rellenado con las series de la última vez:
      // solo tienes que ir marcando ✓ o corregir el campo que cambie
      exercises: routine.exerciseIds
        .map((exId) => {
          const def = getExercise(data, exId)
          if (!def) return null
          const last = lastLogAny(data, exId)
          const variant =
            last?.variant ??
            (def.variants.length > 0 ? def.variants[0] : undefined)
          return {
            exerciseId: exId,
            variant,
            sets: last ? prefillSets(last.sets) : []
          } as ExerciseLog
        })
        .filter((l): l is ExerciseLog => l !== null)
    }
    update((d) => ({ ...d, sessions: [...d.sessions, session] }))
  }

  return (
    <div className="view">
      <CreatineBanner data={data} update={update} />
      <h1 className="view-title">Entreno</h1>
      <p className="view-subtitle">Elige tu rutina de hoy</p>
      <div className="routine-list">
        {data.routines.map((routine) => {
          const last = lastDone(routine.id)
          return (
            <div key={routine.id} className="routine-card">
              <button type="button" className="routine-main" onClick={() => setConfirming(routine)}>
                <span className="routine-name">{routine.name}</span>
                <span className="routine-meta">
                  {routine.exerciseIds.length} ejercicios
                  {last ? ` · última vez ${fmtDate(last)}` : ' · nunca registrada'}
                </span>
              </button>
              <button
                type="button"
                className="routine-edit"
                onClick={() => setEditing(routine)}
                aria-label={`Editar ${routine.name}`}
              >
                ✎
              </button>
            </div>
          )
        })}
      </div>
      <button type="button" className="btn-ghost" onClick={() => setEditing('new')}>
        + Nueva rutina
      </button>
      {editing && (
        <RoutineEditor
          data={data}
          routine={editing === 'new' ? null : editing}
          update={update}
          onClose={() => setEditing(null)}
        />
      )}
      {confirming && (
        <Sheet open onClose={() => setConfirming(null)} title={`¿Empezar ${confirming.name}?`}>
          <p className="sheet-hint">
            Arranca pre-rellenado con tus marcas de la última vez:
          </p>
          <div className="confirm-list">
            {confirming.exerciseIds.map((id) => {
              const def = getExercise(data, id)
              return def ? <p key={id} className="confirm-line">• {def.name}</p> : null
            })}
          </div>
          <div className="sheet-actions">
            <button type="button" className="btn-ghost" onClick={() => setConfirming(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                start(confirming)
                setConfirming(null)
              }}
            >
              Empezar 🏋️
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor de rutinas (+ creación de ejercicios nuevos)
// ---------------------------------------------------------------------------

function RoutineEditor(props: {
  data: AppData
  routine: Routine | null
  update: Update
  onClose: () => void
}) {
  const { data, routine, update, onClose } = props
  const [name, setName] = useState(routine?.name ?? '')
  const [exerciseIds, setExerciseIds] = useState<string[]>(routine?.exerciseIds ?? [])
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')

  const toggle = (id: string) => {
    setExerciseIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    )
  }

  const visible = data.exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )

  const save = () => {
    const trimmed = name.trim() || 'Rutina'
    if (routine) {
      update((d) => ({
        ...d,
        routines: d.routines.map((r) =>
          r.id === routine.id ? { ...r, name: trimmed, exerciseIds } : r
        )
      }))
    } else {
      update((d) => ({
        ...d,
        routines: [...d.routines, { id: uid(), name: trimmed, exerciseIds }]
      }))
    }
    onClose()
  }

  const discard = () => {
    const dirty =
      name !== (routine?.name ?? '') ||
      JSON.stringify(exerciseIds) !== JSON.stringify(routine?.exerciseIds ?? [])
    if (dirty && !confirm('¿Descartar los cambios sin guardar?')) return
    onClose()
  }

  const remove = () => {
    if (!routine) return
    if (!confirm(`¿Borrar la rutina ${routine.name}? Tus entrenos pasados no se borran.`)) return
    update((d) => ({ ...d, routines: d.routines.filter((r) => r.id !== routine.id) }))
    onClose()
  }

  return (
    <Sheet open onClose={discard} title={routine ? 'Editar rutina' : 'Nueva rutina'}>
      <input
        className="text-input"
        placeholder="Nombre (p. ej. PUSH)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p className="sheet-hint">
        Toca para añadir o quitar ejercicios. El orden es el orden en que los toques.
      </p>
      <input
        className="text-input"
        placeholder="Buscar ejercicio…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="exercise-pick-list">
        {groupByRegion(visible).map(([region, list]) => (
          <div key={region}>
            <div className="pick-region">{region}</div>
            {list.map((ex) => {
              const idx = exerciseIds.indexOf(ex.id)
              return (
                <button
                  key={ex.id}
                  type="button"
                  className={`pick-row ${idx >= 0 ? 'picked' : ''}`}
                  onClick={() => toggle(ex.id)}
                >
                  <span>{ex.name}</span>
                  {idx >= 0 && <span className="pick-order">{idx + 1}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost" onClick={() => setCreating(true)}>
        + Crear ejercicio nuevo
      </button>
      <div className="sheet-actions">
        {routine && (
          <button type="button" className="btn-danger" onClick={remove}>
            Borrar
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={discard}>
          Descartar
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          Guardar
        </button>
      </div>
      {creating && (
        <ExerciseCreator
          update={update}
          onCreated={(id) => {
            setExerciseIds((ids) => [...ids, id])
            setCreating(false)
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </Sheet>
  )
}

function ExerciseCreator(props: {
  update: Update
  onCreated: (id: string) => void
  onClose: () => void
}) {
  const { update, onCreated, onClose } = props
  const [name, setName] = useState('')
  const [variants, setVariants] = useState('')
  const [primary, setPrimary] = useState<MuscleId[]>([])
  const [secondary, setSecondary] = useState<MuscleId[]>([])
  const [bodyweight, setBodyweight] = useState(false)

  const toggleIn = (
    list: MuscleId[],
    set: (v: MuscleId[]) => void,
    m: MuscleId
  ) => set(list.includes(m) ? list.filter((x) => x !== m) : [...list, m])

  const save = () => {
    if (!name.trim()) return
    const def: ExerciseDef = {
      id: uid(),
      name: name.trim(),
      variants: variants
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      primary,
      secondary,
      bodyweight: bodyweight || undefined
    }
    update((d) => ({ ...d, exercises: [...d.exercises, def] }))
    onCreated(def.id)
  }

  const muscles = Object.keys(MUSCLE_NAMES) as MuscleId[]

  return (
    <Sheet open onClose={onClose} title="Nuevo ejercicio">
      <input
        className="text-input"
        placeholder="Nombre del ejercicio"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="text-input"
        placeholder="Variantes separadas por coma (opcional)"
        value={variants}
        onChange={(e) => setVariants(e.target.value)}
      />
      <label className="check-row">
        <input
          type="checkbox"
          checked={bodyweight}
          onChange={(e) => setBodyweight(e.target.checked)}
        />
        Peso corporal (como dominadas)
      </label>
      <p className="sheet-hint">Músculos principales</p>
      <div className="chip-grid">
        {muscles.map((m) => (
          <button
            key={m}
            type="button"
            className={`chip ${primary.includes(m) ? 'active' : ''}`}
            onClick={() => toggleIn(primary, setPrimary, m)}
          >
            {MUSCLE_NAMES[m]}
          </button>
        ))}
      </div>
      <p className="sheet-hint">Músculos secundarios</p>
      <div className="chip-grid">
        {muscles.map((m) => (
          <button
            key={m}
            type="button"
            className={`chip ${secondary.includes(m) ? 'active' : ''}`}
            onClick={() => toggleIn(secondary, setSecondary, m)}
          >
            {MUSCLE_NAMES[m]}
          </button>
        ))}
      </div>
      <div className="sheet-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          Crear
        </button>
      </div>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Sesión activa
// ---------------------------------------------------------------------------

function ActiveSession(props: {
  data: AppData
  session: Session
  update: Update
}) {
  const { data, session, update } = props
  const [adding, setAdding] = useState(false)
  const [finishing, setFinishing] = useState(false)

  // pantalla siempre encendida mientras entrenas (Wake Lock API)
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const acquire = () => {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<never> } }).wakeLock
      wl?.request('screen').then(
        (l) => {
          lock = l as unknown as { release: () => Promise<void> }
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

  const patchSession = (fn: (s: Session) => Session) => {
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === session.id ? fn(s) : s))
    }))
  }

  const cancel = () => {
    if (!confirm('¿Descartar este entreno? Se perderán las series apuntadas.')) return
    update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== session.id) }))
  }

  return (
    <div className="view">
      <div className="session-header">
        <div>
          <h1 className="view-title">{session.routineName}</h1>
          <p className="view-subtitle">
            {sessionSetCount(session)} series ·{' '}
            {session.exercises.filter((l) => l.sets.length > 0).length} ejercicios
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setFinishing(true)}>
          Terminar
        </button>
      </div>

      {session.exercises.map((log, i) => (
        <ExerciseCard
          key={`${log.exerciseId}-${i}`}
          data={data}
          session={session}
          log={log}
          index={i}
          patchSession={patchSession}
          update={update}
        />
      ))}

      <button type="button" className="btn-ghost" onClick={() => setAdding(true)}>
        + Añadir ejercicio
      </button>
      <button type="button" className="btn-danger-ghost" onClick={cancel}>
        Descartar entreno
      </button>

      <AddExerciseSheet
        open={adding}
        data={data}
        update={update}
        onClose={() => setAdding(false)}
        onAdd={(exId) => {
          const def = getExercise(data, exId)
          patchSession((s) => ({
            ...s,
            exercises: [
              ...s.exercises,
              {
                exerciseId: exId,
                variant: def && def.variants.length > 0 ? def.variants[0] : undefined,
                sets: []
              }
            ]
          }))
          setAdding(false)
        }}
      />

      {finishing && (
        <FinishSheet
          data={data}
          session={session}
          onClose={() => setFinishing(false)}
          onFinish={() => {
            patchSession((s) => ({
              ...s,
              finished: true,
              exercises: s.exercises.filter((l) => l.sets.length > 0)
            }))
            setFinishing(false)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tarjeta de ejercicio dentro de la sesión
// ---------------------------------------------------------------------------

function ExerciseCard(props: {
  data: AppData
  session: Session
  log: ExerciseLog
  index: number
  patchSession: (fn: (s: Session) => Session) => void
  update: Update
}) {
  const { data, session, log, index, patchSession, update } = props
  const [showInfo, setShowInfo] = useState(false)
  const def = getExercise(data, log.exerciseId)
  const last = useMemo(
    () => lastLog(data, log.exerciseId, log.variant, session.id),
    [data, log.exerciseId, log.variant, session.id]
  )

  if (!def) return null

  const patchLog = (fn: (l: ExerciseLog) => ExerciseLog) => {
    patchSession((s) => ({
      ...s,
      exercises: s.exercises.map((l, i) => (i === index ? fn(l) : l))
    }))
  }

  const changeVariant = (variant: string) => {
    patchLog((l) => {
      // si aún no se ha marcado ninguna serie, re-rellenamos con la última
      // sesión de ESA variante (cada variante guarda sus propias marcas)
      const touched = l.sets.some((s) => s.done)
      if (touched) return { ...l, variant }
      const ref = lastLog(data, l.exerciseId, variant, session.id)
      return { ...l, variant, sets: ref ? prefillSets(ref.sets) : l.sets }
    })
  }

  const addSet = () => {
    const prev = log.sets[log.sets.length - 1]
    const ref = prev ?? last?.sets[0]
    const newSet: SetEntry = {
      weight: ref?.weight ?? (def.bodyweight ? 0 : 20),
      reps: ref?.reps ?? 10,
      done: false
    }
    patchLog((l) => ({ ...l, sets: [...l.sets, newSet] }))
  }

  const removeExercise = () => {
    if (log.sets.length > 0 && !confirm(`¿Quitar ${def.name} de este entreno?`)) return
    patchSession((s) => ({
      ...s,
      exercises: s.exercises.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="exercise-card">
      <div className="exercise-head">
        <div className="exercise-titlebox">
          <button type="button" className="exercise-name" onClick={() => setShowInfo(true)}>
            {def.name} <span className="info-hint">ⓘ</span>
          </button>
          {def.variants.length > 0 && (
            <select
              className="variant-select"
              value={log.variant ?? def.variants[0]}
              onChange={(e) => changeVariant(e.target.value)}
            >
              {def.variants.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={removeExercise} aria-label="Quitar">
          ✕
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

      {last && (
        <p className="last-time">
          Última vez ({fmtDate(last.date)}):{' '}
          {last.sets.map((s) => fmtSet(s, def.bodyweight)).join(' · ')}
        </p>
      )}

      {log.sets.map((set, si) => (
        <SetRow
          key={si}
          set={set}
          index={si}
          bodyweight={def.bodyweight}
          onChange={(updated) =>
            patchLog((l) => ({
              ...l,
              sets: l.sets.map((x, i) => (i === si ? updated : x))
            }))
          }
          onRemove={() =>
            patchLog((l) => ({ ...l, sets: l.sets.filter((_, i) => i !== si) }))
          }
        />
      ))}

      <button type="button" className="btn-add-set" onClick={addSet}>
        + Añadir serie
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fila de serie
// ---------------------------------------------------------------------------

function SetRow(props: {
  set: SetEntry
  index: number
  bodyweight?: boolean
  onChange: (s: SetEntry) => void
  onRemove: () => void
}) {
  const { set, index, bodyweight, onChange, onRemove } = props

  const tagValue = set.tag ?? ''

  return (
    <div className={`set-row ${set.done ? 'done' : ''}`}>
      <div className="set-main">
        <span className="set-num">{index + 1}</span>
        <NumberField
          label={bodyweight ? 'lastre' : 'kg'}
          value={set.weight}
          step={2.5}
          onChange={(weight) => onChange({ ...set, weight })}
        />
        <span className="set-x">×</span>
        <NumberField
          label="reps"
          value={set.reps}
          step={1}
          onChange={(reps) => onChange({ ...set, reps })}
        />
        <select
          className="tag-select"
          value={tagValue}
          onChange={(e) => {
            const tag = (e.target.value || undefined) as SetTag | undefined
            onChange({
              ...set,
              tag,
              dropWeight: tag === 'dropset' ? set.dropWeight ?? Math.max(0, set.weight - 10) : undefined,
              dropReps: tag === 'dropset' ? set.dropReps ?? 5 : undefined,
              negReps: tag === 'negativas' ? set.negReps ?? 3 : undefined
            })
          }}
        >
          <option value="">—</option>
          <option value="dropset">Drop</option>
          <option value="fallo">Fallo</option>
          <option value="negativas">Neg</option>
        </select>
        <button
          type="button"
          className={`set-check ${set.done ? 'checked' : ''}`}
          onClick={() => onChange({ ...set, done: !set.done })}
          aria-label="Serie hecha"
        >
          ✓
        </button>
        <button type="button" className="icon-btn subtle" onClick={onRemove} aria-label="Borrar serie">
          ✕
        </button>
      </div>
      {set.tag === 'dropset' && (
        <div className="set-extra">
          <span>↳ dropset</span>
          <NumberField
            label="kg"
            value={set.dropWeight ?? 0}
            step={2.5}
            onChange={(dropWeight) => onChange({ ...set, dropWeight })}
          />
          <span className="set-x">×</span>
          <NumberField
            label="reps"
            value={set.dropReps ?? 0}
            step={1}
            onChange={(dropReps) => onChange({ ...set, dropReps })}
          />
        </div>
      )}
      {set.tag === 'negativas' && (
        <div className="set-extra">
          <span>↳ negativas</span>
          <NumberField
            label="nº"
            value={set.negReps ?? 0}
            step={1}
            onChange={(negReps) => onChange({ ...set, negReps })}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ficha de ejercicio: vídeo de técnica, músculos e historial
// ---------------------------------------------------------------------------

function ExerciseInfoSheet(props: {
  data: AppData
  def: ExerciseDef
  variant?: string
  update: Update
  onClose: () => void
}) {
  const { data, def, variant, update, onClose } = props
  const [editingVideo, setEditingVideo] = useState(false)
  const [videoInput, setVideoInput] = useState(def.videoUrl ?? '')

  const videoId = def.videoUrl ? youtubeId(def.videoUrl) : null

  const history = useMemo(() => {
    const out: { date: string; variant?: string; sets: string }[] = []
    const sessions = [...data.sessions]
      .filter((s) => s.finished)
      .sort((a, b) => b.date.localeCompare(a.date))
    for (const session of sessions) {
      for (const log of session.exercises) {
        if (log.exerciseId !== def.id || log.sets.length === 0) continue
        if (variant && (log.variant ?? '') !== variant) continue
        out.push({
          date: session.date,
          variant: log.variant,
          sets: log.sets.map((s) => fmtSet(s, def.bodyweight)).join(' · ')
        })
      }
      if (out.length >= 4) break
    }
    return out.slice(0, 4)
  }, [data, def, variant])

  const saveVideo = () => {
    const url = videoInput.trim()
    if (url && !youtubeId(url)) {
      alert('Eso no parece un enlace de YouTube válido.')
      return
    }
    update((d) => ({
      ...d,
      exercises: d.exercises.map((e) =>
        e.id === def.id ? { ...e, videoUrl: url || undefined } : e
      )
    }))
    setEditingVideo(false)
  }

  return (
    <Sheet open onClose={onClose} title={def.name + (variant ? ` · ${variant}` : '')}>
      {videoId ? (
        <div className="video-box">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={`Técnica: ${def.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          className="btn-ghost video-search"
          href={youtubeSearchUrl(def.name)}
          target="_blank"
          rel="noreferrer"
        >
          🎬 Buscar técnica en YouTube
        </a>
      )}

      {editingVideo ? (
        <div className="video-edit">
          <input
            className="text-input"
            placeholder="Pega un enlace de YouTube…"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
          />
          <button type="button" className="btn-primary" onClick={saveVideo}>
            Guardar
          </button>
        </div>
      ) : (
        <button type="button" className="btn-ghost small" onClick={() => setEditingVideo(true)}>
          {def.videoUrl ? '✏️ Cambiar vídeo' : '➕ Poner mi vídeo favorito'}
        </button>
      )}

      <p className="sheet-hint">Músculos principales</p>
      <div className="chip-grid">
        {def.primary.map((m) => (
          <span key={m} className="chip active">
            {MUSCLE_NAMES[m]}
          </span>
        ))}
      </div>
      {def.secondary.length > 0 && (
        <>
          <p className="sheet-hint">Secundarios</p>
          <div className="chip-grid">
            {def.secondary.map((m) => (
              <span key={m} className="chip">
                {MUSCLE_NAMES[m]}
              </span>
            ))}
          </div>
        </>
      )}

      {history.length > 0 && (
        <>
          <p className="sheet-hint">Últimas sesiones</p>
          {history.map((h, i) => (
            <p key={i} className="history-mini">
              <span className="history-mini-date">
                {fmtDate(h.date)}
                {!variant && h.variant ? ` · ${h.variant}` : ''}
              </span>
              {h.sets}
            </p>
          ))}
        </>
      )}
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Añadir ejercicio a la sesión
// ---------------------------------------------------------------------------

function AddExerciseSheet(props: {
  open: boolean
  data: AppData
  update: Update
  onClose: () => void
  onAdd: (exerciseId: string) => void
}) {
  const { open, data, update, onClose, onAdd } = props
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = data.exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Sheet open={open} onClose={onClose} title="Añadir ejercicio">
      <input
        className="text-input"
        placeholder="Buscar…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="exercise-pick-list">
        {groupByRegion(filtered).map(([region, list]) => (
          <div key={region}>
            <div className="pick-region">{region}</div>
            {list.map((ex) => (
              <button key={ex.id} type="button" className="pick-row" onClick={() => onAdd(ex.id)}>
                <span>{ex.name}</span>
                <span className="pick-muscles">
                  {ex.primary.map((m) => MUSCLE_NAMES[m]).join(', ')}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost" onClick={() => setCreating(true)}>
        + Crear ejercicio nuevo
      </button>
      {creating && (
        <ExerciseCreator
          update={update}
          onCreated={(id) => {
            setCreating(false)
            onAdd(id)
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Resumen al terminar + detección de récords
// ---------------------------------------------------------------------------

function FinishSheet(props: {
  data: AppData
  session: Session
  onClose: () => void
  onFinish: () => void
}) {
  const { data, session, onClose, onFinish } = props

  const prs = useMemo(() => {
    const found: string[] = []
    for (const log of session.exercises) {
      const def = getExercise(data, log.exerciseId)
      if (!def || log.sets.length === 0) continue
      const before = prsBefore(data, log.exerciseId, log.variant, session.id)
      const label = def.name + (log.variant ? ` (${log.variant})` : '')
      const maxW = Math.max(...log.sets.map((s) => s.weight))
      const maxE = Math.max(...log.sets.map((s) => e1rm(s.weight, s.reps)))
      const maxR = Math.max(...log.sets.map((s) => s.reps))
      if (def.bodyweight) {
        if (before.maxReps > 0 && maxR > before.maxReps) {
          found.push(`${label}: ${maxR} reps (antes ${before.maxReps})`)
        }
      } else if (before.maxWeight > 0 && maxW > before.maxWeight) {
        found.push(`${label}: ${fmtWeight(maxW)} kg (antes ${fmtWeight(before.maxWeight)})`)
      } else if (before.maxE1rm > 0 && maxE > before.maxE1rm + 0.01) {
        found.push(`${label}: RM estimado ${fmtWeight(Math.round(maxE * 10) / 10)} kg ↑`)
      }
    }
    return found
  }, [data, session])

  const sets = sessionSetCount(session)

  return (
    <Sheet open onClose={onClose} title="Resumen del entreno">
      <div className="finish-stats">
        <div className="stat">
          <span className="stat-value">{sets}</span>
          <span className="stat-label">series</span>
        </div>
        <div className="stat">
          <span className="stat-value">{session.exercises.filter((l) => l.sets.length > 0).length}</span>
          <span className="stat-label">ejercicios</span>
        </div>
        <div className="stat">
          <span className="stat-value">{prs.length > 0 ? `🏆 ${prs.length}` : '—'}</span>
          <span className="stat-label">récords</span>
        </div>
      </div>
      {prs.length > 0 && (
        <div className="pr-box">
          <p className="pr-title">🏆 ¡Récords personales!</p>
          {prs.map((p, i) => (
            <p key={i} className="pr-line">
              {p}
            </p>
          ))}
        </div>
      )}
      {sets === 0 && <p className="sheet-hint">No has apuntado ninguna serie todavía.</p>}
      <div className="sheet-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Seguir entrenando
        </button>
        <button type="button" className="btn-primary" onClick={onFinish} disabled={sets === 0}>
          Terminar ✓
        </button>
      </div>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Banner de creatina
// ---------------------------------------------------------------------------

export function CreatineBanner({ data, update }: { data: AppData; update: Update }) {
  const { settings } = data
  if (!settings.creatineEnabled) return null
  const today = todayKey()
  if (settings.creatineTaken.includes(today)) return null

  return (
    <button
      type="button"
      className="creatine-banner"
      onClick={() =>
        update((d) => ({
          ...d,
          settings: {
            ...d.settings,
            creatineTaken: [...d.settings.creatineTaken, today]
          }
        }))
      }
    >
      💊 Creatina pendiente hoy — toca para marcarla
    </button>
  )
}
