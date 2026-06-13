import { useEffect, useMemo, useState } from 'react'
import type {
  AppData,
  ExerciseDef,
  ExerciseLog,
  MuscleId,
  Program,
  Routine,
  RoutineItem,
  Session,
  SetEntry,
  SetTag,
  TrainingGoal
} from '../types'
import { GOAL_LABEL, MUSCLE_NAMES } from '../types'
import { uid } from '../lib/storage'
import { generateProgram, type Experience, type GenInput } from '../lib/generator'
import { generateProgramAI } from '../lib/ai'
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

/** Items de una rutina (deriva de exerciseIds las rutinas antiguas sin items). */
function getRoutineItems(data: AppData, routine: Routine): RoutineItem[] {
  if (routine.items && routine.items.length > 0) return routine.items
  return routine.exerciseIds.map((id) => {
    const def = getExercise(data, id)
    return {
      exerciseId: id,
      variant: def && def.variants.length > 0 ? def.variants[0] : undefined
    }
  })
}

// ---------------------------------------------------------------------------
// Vista principal: programas semanales → días → sesión activa
// ---------------------------------------------------------------------------

export function WorkoutView(props: { data: AppData; update: Update }) {
  const { data, update } = props
  const [programId, setProgramId] = useState<string | null>(null)
  const active = data.sessions.find((s) => !s.finished)

  if (active) {
    return <ActiveSession data={data} session={active} update={update} />
  }
  const program = data.programs.find((p) => p.id === programId)
  if (program) {
    return (
      <ProgramDetail
        data={data}
        program={program}
        update={update}
        onBack={() => setProgramId(null)}
      />
    )
  }
  return <ProgramPicker data={data} update={update} onOpen={setProgramId} />
}

// ---------------------------------------------------------------------------
// Nivel 1: selector de programas semanales
// ---------------------------------------------------------------------------

function ProgramPicker(props: {
  data: AppData
  update: Update
  onOpen: (id: string) => void
}) {
  const { data, update, onOpen } = props
  const [creating, setCreating] = useState<false | 'choose' | 'manual' | 'ai'>(false)
  const nombre = data.profile.nombre?.trim().split(/\s+/)[0]

  return (
    <div className="view">
      <CreatineBanner data={data} update={update} />
      <h1 className="view-title">{nombre ? `Hola, ${nombre}` : 'Entreno'}</h1>
      <p className="view-subtitle">Tus rutinas semanales</p>
      <div className="routine-list">
        {data.programs.map((p) => (
          <button
            key={p.id}
            type="button"
            className="program-card"
            onClick={() => onOpen(p.id)}
          >
            <div className="program-text">
              <span className="program-name">{p.name}</span>
              <span className="program-meta">
                {p.dayIds.length} {p.dayIds.length === 1 ? 'día' : 'días'}
                {p.ai ? ' · ✨ IA' : ''}
              </span>
            </div>
            <span className="program-arrow">›</span>
          </button>
        ))}
        {data.programs.length === 0 && (
          <p className="view-subtitle">Aún no tienes rutinas. Crea una abajo 👇</p>
        )}
      </div>
      <button type="button" className="btn-primary big" onClick={() => setCreating('choose')}>
        + Crear rutina semanal
      </button>

      {creating === 'choose' && (
        <Sheet open onClose={() => setCreating(false)} title="Nueva rutina semanal">
          <p className="sheet-hint">¿Cómo quieres crearla?</p>
          <button type="button" className="big-choice" onClick={() => setCreating('ai')}>
            <span className="big-choice-emoji">✨</span>
            <span>
              <strong>Con el asistente</strong>
              <small>Responde unas preguntas y te la genero a medida</small>
            </span>
          </button>
          <button type="button" className="big-choice" onClick={() => setCreating('manual')}>
            <span className="big-choice-emoji">✏️</span>
            <span>
              <strong>A mano</strong>
              <small>La montas tú, día a día</small>
            </span>
          </button>
        </Sheet>
      )}
      {creating === 'manual' && (
        <ProgramEditor
          data={data}
          program={null}
          update={update}
          onClose={() => setCreating(false)}
          onCreated={onOpen}
        />
      )}
      {creating === 'ai' && (
        <AssistantSheet
          data={data}
          update={update}
          onClose={() => setCreating(false)}
          onCreated={onOpen}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Nivel 2: días de un programa (elegir el entreno de hoy)
// ---------------------------------------------------------------------------

function ProgramDetail(props: {
  data: AppData
  program: Program
  update: Update
  onBack: () => void
}) {
  const { data, program, update, onBack } = props
  const [editing, setEditing] = useState<Routine | 'new' | null>(null)
  const [confirming, setConfirming] = useState<Routine | null>(null)
  const [editingProgram, setEditingProgram] = useState(false)

  const days = program.dayIds
    .map((id) => data.routines.find((r) => r.id === id))
    .filter((r): r is Routine => !!r)

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
      // pre-relleno: 1) tu última vez con esa variante, 2) series objetivo de
      // la rutina, 3) tu última vez con cualquier variante. Solo marcas ✓.
      exercises: getRoutineItems(data, routine)
        .map((item) => {
          const def = getExercise(data, item.exerciseId)
          if (!def) return null
          const lastSame = lastLog(data, item.exerciseId, item.variant)
          let sets: SetEntry[] = []
          if (lastSame) sets = prefillSets(lastSame.sets)
          else if (item.targetSets && item.targetSets.length > 0)
            sets = prefillSets(item.targetSets)
          else {
            const lastAny = lastLogAny(data, item.exerciseId)
            if (lastAny) sets = prefillSets(lastAny.sets)
          }
          return { exerciseId: item.exerciseId, variant: item.variant, sets } as ExerciseLog
        })
        .filter((l): l is ExerciseLog => l !== null)
    }
    update((d) => ({ ...d, sessions: [...d.sessions, session] }))
  }

  return (
    <div className="view">
      <button type="button" className="back-link" onClick={onBack}>
        ‹ Rutinas
      </button>
      <div className="session-header">
        <div>
          <h1 className="view-title">{program.name}</h1>
          <p className="view-subtitle">Elige el día de hoy</p>
        </div>
        <button
          type="button"
          className="routine-edit standalone"
          onClick={() => setEditingProgram(true)}
          aria-label="Editar programa"
        >
          ✎
        </button>
      </div>
      <div className="routine-list">
        {days.map((routine) => {
          const last = lastDone(routine.id)
          return (
            <div key={routine.id} className="routine-card">
              <button type="button" className="routine-main" onClick={() => setConfirming(routine)}>
                <span className="routine-name">{routine.name}</span>
                <span className="routine-meta">
                  {getRoutineItems(data, routine).length} ejercicios
                  {last ? ` · última vez ${fmtDate(last)}` : ' · aún sin estrenar'}
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
        {days.length === 0 && (
          <p className="view-subtitle">Este programa no tiene días. Edítalo para añadir.</p>
        )}
      </div>

      {editingProgram && (
        <ProgramEditor
          data={data}
          program={program}
          update={update}
          onClose={() => setEditingProgram(false)}
        />
      )}
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
            Arranca con tus marcas de la última vez. Solo tienes que ir marcando ✓ o
            corregir lo que cambie:
          </p>
          <div className="confirm-list">
            {getRoutineItems(data, confirming).map((item, i) => {
              const def = getExercise(data, item.exerciseId)
              return def ? (
                <p key={i} className="confirm-line">
                  • {def.name}
                  {item.variant ? ` · ${item.variant}` : ''}
                </p>
              ) : null
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
  /** Devuelve el id de la rutina creada/editada (para encadenar en programas). */
  onSaved?: (routineId: string) => void
}) {
  const { data, routine, update, onClose, onSaved } = props
  const initialItems = routine ? getRoutineItems(data, routine) : []
  const [name, setName] = useState(routine?.name ?? '')
  const [items, setItems] = useState<RoutineItem[]>(initialItems)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [infoFor, setInfoFor] = useState<ExerciseDef | null>(null)
  const [adding, setAdding] = useState(initialItems.length === 0)
  const [expanded, setExpanded] = useState<number | null>(null)

  const visible = data.exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )
  const countOf = (id: string) => items.filter((i) => i.exerciseId === id).length

  const addExercise = (ex: ExerciseDef) => {
    setItems((prev) => [
      ...prev,
      { exerciseId: ex.id, variant: ex.variants[0] }
    ])
  }
  const patchItem = (idx: number, patch: Partial<RoutineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const moveItem = (idx: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[j]] = [copy[j], copy[idx]]
      return copy
    })
  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx))

  const save = () => {
    const trimmed = name.trim() || 'Rutina'
    // limpia series objetivo vacías
    const cleanItems = items.map((it) => ({
      ...it,
      variant: it.variant?.trim() || undefined,
      targetSets:
        it.targetSets && it.targetSets.length > 0 ? it.targetSets : undefined
    }))
    const exerciseIds = cleanItems.map((i) => i.exerciseId)
    if (routine) {
      update((d) => ({
        ...d,
        routines: d.routines.map((r) =>
          r.id === routine.id
            ? { ...r, name: trimmed, items: cleanItems, exerciseIds }
            : r
        )
      }))
      onSaved?.(routine.id)
    } else {
      const newId = uid()
      update((d) => ({
        ...d,
        routines: [
          ...d.routines,
          { id: newId, name: trimmed, items: cleanItems, exerciseIds }
        ]
      }))
      onSaved?.(newId)
    }
    onClose()
  }

  const discard = () => {
    const dirty =
      name !== (routine?.name ?? '') ||
      JSON.stringify(items) !== JSON.stringify(initialItems)
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

      {/* ---- Ejercicios seleccionados ---- */}
      <div className="routine-section-head">
        <span>Ejercicios de la rutina ({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="sheet-hint">Aún no has añadido ninguno. Pulsa «Añadir ejercicios».</p>
      ) : (
        <div className="selected-list">
          {items.map((item, idx) => {
            const def = getExercise(data, item.exerciseId)
            if (!def) return null
            const open = expanded === idx
            return (
              <div key={idx} className="selected-item">
                <div className="selected-row">
                  <div className="reorder">
                    <button
                      type="button"
                      className="reorder-btn"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label="Subir"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="reorder-btn"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label="Bajar"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="selected-name">{def.name}</span>
                  <button
                    type="button"
                    className="icon-btn subtle"
                    onClick={() => setInfoFor(def)}
                    aria-label="Ver técnica"
                  >
                    🎬
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeItem(idx)}
                    aria-label="Quitar"
                  >
                    ✕
                  </button>
                </div>

                {/* variante: chips rápidas + texto libre */}
                <div className="variant-edit">
                  {def.variants.length > 0 && (
                    <div className="variant-chips">
                      {def.variants.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`chip ${item.variant === v ? 'active' : ''}`}
                          onClick={() => patchItem(idx, { variant: v })}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    className="text-input small"
                    placeholder="Variante o nota (p. ej. Tras nuca) — opcional"
                    value={item.variant ?? ''}
                    onChange={(e) => patchItem(idx, { variant: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="target-toggle"
                  onClick={() => setExpanded(open ? null : idx)}
                >
                  {open ? '▾' : '▸'} Series objetivo
                  {item.targetSets && item.targetSets.length > 0
                    ? ` (${item.targetSets.length})`
                    : ''}
                </button>
                {open && (
                  <TargetSetsEditor
                    bodyweight={def.bodyweight}
                    sets={item.targetSets ?? []}
                    onChange={(targetSets) => patchItem(idx, { targetSets })}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <button type="button" className="btn-ghost" onClick={() => setAdding((a) => !a)}>
        {adding ? '✓ Listo de añadir' : '+ Añadir ejercicios'}
      </button>

      {/* ---- Lista para añadir ---- */}
      {adding && (
        <>
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
                  const n = countOf(ex.id)
                  return (
                    <div key={ex.id} className={`pick-row ${n > 0 ? 'picked' : ''}`}>
                      <button type="button" className="pick-main" onClick={() => addExercise(ex)}>
                        <span>{ex.name}</span>
                        {n > 0 && <span className="pick-order">{n}</span>}
                      </button>
                      <button
                        type="button"
                        className="pick-video"
                        onClick={() => setInfoFor(ex)}
                        aria-label={`Ver técnica de ${ex.name}`}
                      >
                        🎬
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <button type="button" className="btn-ghost" onClick={() => setCreating(true)}>
            + Crear ejercicio nuevo
          </button>
        </>
      )}

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
            const def = data.exercises.find((e) => e.id === id)
            setItems((prev) => [
              ...prev,
              { exerciseId: id, variant: def?.variants[0] }
            ])
            setCreating(false)
          }}
          onClose={() => setCreating(false)}
        />
      )}
      {infoFor && (
        <ExerciseInfoSheet
          data={data}
          def={data.exercises.find((e) => e.id === infoFor.id) ?? infoFor}
          update={update}
          onClose={() => setInfoFor(null)}
        />
      )}
    </Sheet>
  )
}

/** Editor de series objetivo (peso × reps) de un ejercicio dentro de la rutina. */
function TargetSetsEditor(props: {
  bodyweight?: boolean
  sets: SetEntry[]
  onChange: (sets: SetEntry[]) => void
}) {
  const { bodyweight, sets, onChange } = props
  const addSet = () => {
    const prev = sets[sets.length - 1]
    onChange([
      ...sets,
      { weight: prev?.weight ?? (bodyweight ? 0 : 20), reps: prev?.reps ?? 10 }
    ])
  }
  return (
    <div className="target-sets">
      <p className="sheet-hint">
        Lo que sueles hacer (de tu libreta u otra app). Aparecerá pre-rellenado al
        empezar, hasta que tengas historial propio.
      </p>
      {sets.map((set, si) => (
        <div key={si} className="target-row">
          <span className="set-num">{si + 1}</span>
          <NumberField
            label={bodyweight ? 'lastre' : 'kg'}
            value={set.weight}
            step={2.5}
            onChange={(weight) =>
              onChange(sets.map((s, i) => (i === si ? { ...s, weight } : s)))
            }
          />
          <span className="set-x">×</span>
          <NumberField
            label="reps"
            value={set.reps}
            step={1}
            onChange={(reps) =>
              onChange(sets.map((s, i) => (i === si ? { ...s, reps } : s)))
            }
          />
          <button
            type="button"
            className="icon-btn subtle"
            onClick={() => onChange(sets.filter((_, i) => i !== si))}
            aria-label="Quitar serie"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn-add-set" onClick={addSet}>
        + Añadir serie objetivo
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor de programa semanal (a mano): nombre + días (rutinas)
// ---------------------------------------------------------------------------

function ProgramEditor(props: {
  data: AppData
  program: Program | null
  update: Update
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const { data, program, update, onClose, onCreated } = props
  const [name, setName] = useState(program?.name ?? '')
  const [dayIds, setDayIds] = useState<string[]>(program?.dayIds ?? [])
  const [editingDay, setEditingDay] = useState<Routine | 'new' | null>(null)
  const [picking, setPicking] = useState(false)

  const days = dayIds
    .map((id) => data.routines.find((r) => r.id === id))
    .filter((r): r is Routine => !!r)
  const otras = data.routines.filter((r) => !dayIds.includes(r.id))

  const move = (idx: number, dir: -1 | 1) =>
    setDayIds((prev) => {
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const c = [...prev]
      ;[c[idx], c[j]] = [c[j], c[idx]]
      return c
    })

  const save = () => {
    const trimmed = name.trim() || 'Rutina semanal'
    if (program) {
      update((d) => ({
        ...d,
        programs: d.programs.map((p) =>
          p.id === program.id ? { ...p, name: trimmed, dayIds } : p
        )
      }))
    } else {
      const id = uid()
      update((d) => ({
        ...d,
        programs: [
          ...d.programs,
          { id, name: trimmed, dayIds, daysPerWeek: dayIds.length }
        ]
      }))
      onCreated?.(id)
    }
    onClose()
  }

  const removeProgram = () => {
    if (!program) return
    if (!confirm(`¿Borrar la rutina semanal "${program.name}"? Los días y entrenos no se borran.`)) return
    update((d) => ({ ...d, programs: d.programs.filter((p) => p.id !== program.id) }))
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={program ? 'Editar rutina semanal' : 'Nueva rutina semanal'}
    >
      <input
        className="text-input"
        placeholder="Nombre (p. ej. PPL + Torso)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="routine-section-head">Días ({days.length})</div>
      {days.length === 0 ? (
        <p className="sheet-hint">Añade los días de tu semana (PUSH, PULL…).</p>
      ) : (
        <div className="selected-list">
          {days.map((r, idx) => (
            <div key={r.id} className="selected-item">
              <div className="selected-row">
                <div className="reorder">
                  <button type="button" className="reorder-btn" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    ▲
                  </button>
                  <button type="button" className="reorder-btn" disabled={idx === days.length - 1} onClick={() => move(idx, 1)}>
                    ▼
                  </button>
                </div>
                <span className="selected-name">
                  {r.name}
                  <small className="day-meta"> · {getRoutineItems(data, r).length} ej.</small>
                </span>
                <button type="button" className="icon-btn subtle" onClick={() => setEditingDay(r)} aria-label="Editar día">
                  ✎
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setDayIds((prev) => prev.filter((x) => x !== r.id))}
                  aria-label="Quitar día"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn-ghost" onClick={() => setEditingDay('new')}>
        + Crear día nuevo
      </button>
      {otras.length > 0 && (
        <button type="button" className="btn-ghost" onClick={() => setPicking((v) => !v)}>
          {picking ? '✓ Listo' : '+ Añadir un día que ya tengo'}
        </button>
      )}
      {picking && (
        <div className="exercise-pick-list">
          {otras.map((r) => (
            <button
              key={r.id}
              type="button"
              className="pick-row"
              onClick={() => setDayIds((prev) => [...prev, r.id])}
            >
              <span className="pick-main">{r.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sheet-actions">
        {program && (
          <button type="button" className="btn-danger" onClick={removeProgram}>
            Borrar
          </button>
        )}
        <button type="button" className="btn-primary" onClick={save}>
          Guardar
        </button>
      </div>

      {editingDay && (
        <RoutineEditor
          data={data}
          routine={editingDay === 'new' ? null : editingDay}
          update={update}
          onClose={() => setEditingDay(null)}
          onSaved={(id) => setDayIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
        />
      )}
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Asistente: cuestionario → genera el programa
// ---------------------------------------------------------------------------

function AssistantSheet(props: {
  data: AppData
  update: Update
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const { data, update, onClose, onCreated } = props
  const [goal, setGoal] = useState<TrainingGoal>('hipertrofia')
  const [days, setDays] = useState(4)
  const [experience, setExperience] = useState<Experience>('intermedio')
  const [useAI, setUseAI] = useState(true)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const apply = (program: Program, routines: Routine[]) => {
    update((d) => ({
      ...d,
      routines: [...d.routines, ...routines],
      programs: [...d.programs, program]
    }))
    onClose()
    onCreated(program.id)
  }

  const generate = async () => {
    if (useAI) {
      setBusy(true)
      setStatus('Generando con IA… (unos segundos)')
      try {
        const { program, routines } = await generateProgramAI(data, {
          goal,
          days,
          experience,
          notes
        })
        apply(program, routines)
        return
      } catch (e) {
        // respaldo: el generador integrado nunca falla
        setStatus('La IA no respondió, uso el generador integrado…')
        const validIds = new Set(data.exercises.map((ex) => ex.id))
        const { program, routines } = generateProgram({ goal, days, experience }, validIds)
        apply(program, routines)
        return
      } finally {
        setBusy(false)
      }
    }
    const validIds = new Set(data.exercises.map((ex) => ex.id))
    const input: GenInput = { goal, days, experience }
    const { program, routines } = generateProgram(input, validIds)
    apply(program, routines)
  }

  return (
    <Sheet open onClose={busy ? () => {} : onClose} title="✨ Asistente de rutinas">
      <p className="sheet-hint">Responde y te genero el programa completo.</p>

      <div className="routine-section-head">Tu objetivo</div>
      <div className="chip-grid">
        {(Object.keys(GOAL_LABEL) as TrainingGoal[]).map((g) => (
          <button
            key={g}
            type="button"
            className={`chip ${goal === g ? 'active' : ''}`}
            onClick={() => setGoal(g)}
          >
            {GOAL_LABEL[g]}
          </button>
        ))}
      </div>

      <div className="routine-section-head">Días por semana</div>
      <div className="chip-grid">
        {[2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            className={`chip ${days === n ? 'active' : ''}`}
            onClick={() => setDays(n)}
          >
            {n} días
          </button>
        ))}
      </div>

      <div className="routine-section-head">Experiencia</div>
      <div className="chip-grid">
        {(['principiante', 'intermedio', 'avanzado'] as Experience[]).map((e) => (
          <button
            key={e}
            type="button"
            className={`chip ${experience === e ? 'active' : ''}`}
            onClick={() => setExperience(e)}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <label className="check-row">
        <input type="checkbox" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} />
        Usar IA avanzada (Gemini) — más personalizada
      </label>
      {useAI && (
        <textarea
          className="text-input"
          rows={2}
          placeholder="¿Algo que tener en cuenta? P. ej. molestia en hombro, énfasis en glúteo, solo mancuernas… (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      )}

      {status ? (
        <p className="hint-block">{status}</p>
      ) : (
        <p className="hint-block">
          {useAI
            ? 'La IA reparte los grupos musculares y elige los ejercicios según tu objetivo. Necesita conexión; si falla, uso el generador integrado.'
            : `Generador integrado: un ${days <= 2 ? 'Full Body' : days === 3 ? 'PPL' : days === 4 ? 'Upper/Lower' : days === 5 ? 'PPL + Torso' : 'PPL ×2'} de ${days} días, al instante y sin conexión.`}{' '}
          Los pesos los pones tú la primera vez; luego manda tu historial.
        </p>
      )}

      <div className="sheet-actions">
        <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
          Cancelar
        </button>
        <button type="button" className="btn-primary" onClick={() => void generate()} disabled={busy}>
          {busy ? 'Generando…' : 'Generar rutina ✨'}
        </button>
      </div>
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
        placeholder="Variantes, p. ej. inclinado, plano (opcional)"
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
            patchSession((s) => {
              // si has usado los ✓, las series sin marcar eran pre-relleno
              // que no llegaste a hacer: no deben guardarse como hechas
              const usedTicks = s.exercises.some((l) => l.sets.some((x) => x.done))
              return {
                ...s,
                finished: true,
                exercises: s.exercises
                  .map((l) => ({
                    ...l,
                    sets: usedTicks ? l.sets.filter((x) => x.done) : l.sets
                  }))
                  .filter((l) => l.sets.length > 0)
              }
            })
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
  const [infoFor, setInfoFor] = useState<ExerciseDef | null>(null)

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
              <div key={ex.id} className="pick-row">
                <button type="button" className="pick-main" onClick={() => onAdd(ex.id)}>
                  <span>{ex.name}</span>
                  <span className="pick-muscles">
                    {ex.primary.map((m) => MUSCLE_NAMES[m]).join(', ')}
                  </span>
                </button>
                <button
                  type="button"
                  className="pick-video"
                  onClick={() => setInfoFor(ex)}
                  aria-label={`Ver técnica de ${ex.name}`}
                >
                  🎬
                </button>
              </div>
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
      {infoFor && (
        <ExerciseInfoSheet
          data={data}
          def={data.exercises.find((e) => e.id === infoFor.id) ?? infoFor}
          update={update}
          onClose={() => setInfoFor(null)}
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
  const { data, session: rawSession, onClose, onFinish } = props

  // lo que de verdad se guardará: si usaste los ✓, solo las series marcadas
  const usedTicks = rawSession.exercises.some((l) => l.sets.some((x) => x.done))
  const session = useMemo<Session>(
    () => ({
      ...rawSession,
      exercises: rawSession.exercises
        .map((l) => ({
          ...l,
          sets: usedTicks ? l.sets.filter((x) => x.done) : l.sets
        }))
        .filter((l) => l.sets.length > 0)
    }),
    [rawSession, usedTicks]
  )
  const skipped = sessionSetCount(rawSession) - sessionSetCount(session)

  const prs = useMemo(() => {
    const found: string[] = []
    for (const log of session.exercises) {
      const def = getExercise(data, log.exerciseId)
      if (!def || log.sets.length === 0) continue
      const before = prsBefore(data, log.exerciseId, log.variant, session.id, session.date)
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
      {skipped > 0 && (
        <p className="sheet-hint">
          ⚠️ {skipped} {skipped === 1 ? 'serie sin marcar ✓ no se guardará' : 'series sin marcar ✓ no se guardarán'}{' '}
          (eran el pre-relleno de la última vez).
        </p>
      )}
      {sets === 0 && (
        <p className="sheet-hint">
          No has marcado ninguna serie como hecha (✓) todavía.
        </p>
      )}
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
  if (settings.creatineTaken.includes(todayKey())) return null

  return (
    <button
      type="button"
      className="creatine-banner"
      onClick={() =>
        // todayKey se calcula AL PULSAR: si dejas la app abierta y tocas
        // pasada la medianoche, debe marcar el día correcto
        update((d) => {
          const today = todayKey()
          if (d.settings.creatineTaken.includes(today)) return d
          return {
            ...d,
            settings: {
              ...d.settings,
              creatineTaken: [...d.settings.creatineTaken, today]
            }
          }
        })
      }
    >
      💊 Creatina pendiente hoy — toca para marcarla
    </button>
  )
}
