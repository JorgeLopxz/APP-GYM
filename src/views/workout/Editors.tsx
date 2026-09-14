import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent
} from 'react'
import {
  ChevronRight,
  CircleMinus,
  CirclePlus,
  CopyPlus,
  Dumbbell,
  GripVertical,
  Info,
  Plus,
  X
} from 'lucide-react'
import type { AppData, ExerciseDef, Program, Routine, RoutineItem, SetEntry, Update } from '../../types'
import { brandRelevant, getRoutineItems, logLabel } from '../../lib/exercise'
import { getExercise, lastLogAny } from '../../lib/stats'
import { uid } from '../../lib/storage'
import { EmptyState, NumberField, Row, Section, Sheet } from '../../components/ui'
import { BrandPickerSheet } from './BrandPicker'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { ExercisePickerSheet } from './ExercisePicker'

// ---------------------------------------------------------------------------
// Reordenar arrastrando el asa (y con flechas del teclado)
// ---------------------------------------------------------------------------

function useReorder<T>(setItems: (fn: (prev: T[]) => T[]) => void, onStart?: () => void) {
  const listRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const pendingClear = useRef(false)
  const drag = useRef<{
    index: number
    target: number
    startY: number
    pointerId: number
    rects: DOMRect[]
  } | null>(null)

  const elements = () =>
    [...(listRef.current?.children ?? [])].filter((el): el is HTMLElement =>
      el.classList.contains('edit-item')
    )

  const clear = () => elements().forEach((el) => (el.style.transform = ''))

  useLayoutEffect(() => {
    if (!pendingClear.current) return
    pendingClear.current = false
    clear()
  })

  const moveItem = (from: number, to: number) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev
      const copy = [...prev]
      const [it] = copy.splice(from, 1)
      copy.splice(to, 0, it)
      return copy
    })

  const onPointerDown = (index: number) => (e: RPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    onStart?.()
    drag.current = {
      index,
      target: index,
      startY: e.clientY,
      pointerId: e.pointerId,
      rects: elements().map((el) => el.getBoundingClientRect())
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(index)
    navigator.vibrate?.(6)
  }

  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    const els = elements()
    const dy = e.clientY - d.startY
    const self = d.rects[d.index]
    const center = self.top + self.height / 2 + dy
    let target = d.index
    d.rects.forEach((r, i) => {
      const mid = r.top + r.height / 2
      if (i < d.index && center < mid) target = Math.min(target, i)
      if (i > d.index && center > mid) target = Math.max(target, i)
    })
    d.target = target
    els.forEach((el, i) => {
      if (i === d.index) {
        el.style.transform = `translate3d(0, ${dy}px, 0)`
        return
      }
      let shift = 0
      if (d.index < target && i > d.index && i <= target) shift = -self.height
      if (d.index > target && i >= target && i < d.index) shift = self.height
      el.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : ''
    })
  }

  const onPointerUp = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    drag.current = null
    setDragging(null)
    if (d.target === d.index) {
      clear()
      return
    }
    pendingClear.current = true
    moveItem(d.index, d.target)
  }

  const onKeyDown = (index: number) => (e: RKeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveItem(index, index - 1)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveItem(index, index + 1)
    }
  }

  const gripProps = (index: number) => ({
    onPointerDown: onPointerDown(index),
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onKeyDown: onKeyDown(index)
  })

  return { listRef, dragging, gripProps }
}

// ---------------------------------------------------------------------------
// Editor de un día (rutina): ejercicios con variante, marca y series objetivo
// ---------------------------------------------------------------------------

export function RoutineEditor(props: {
  data: AppData
  routine: Routine | null
  update: Update
  onClose: () => void
  /** Devuelve el id del día creado/editado (para encadenar en programas). */
  onSaved?: (routineId: string) => void
}) {
  const { data, routine, update, onClose, onSaved } = props
  const initialItems = useMemo(() => (routine ? getRoutineItems(data, routine) : []), [])
  const [name, setName] = useState(routine?.name ?? '')
  const [items, setItems] = useState<RoutineItem[]>(initialItems)
  const [picking, setPicking] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [brandFor, setBrandFor] = useState<number | null>(null)
  const [infoFor, setInfoFor] = useState<string | null>(null)
  const reorder = useReorder<RoutineItem>(setItems, () => setExpanded(null))

  const counts = useMemo(() => {
    const out: Record<string, number> = {}
    for (const it of items) out[it.exerciseId] = (out[it.exerciseId] ?? 0) + 1
    return out
  }, [items])

  const patchItem = (idx: number, patch: Partial<RoutineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const addExercise = (def: ExerciseDef) => {
    const any = lastLogAny(data, def.id)
    setItems((prev) => [
      ...prev,
      { exerciseId: def.id, variant: any?.variant ?? def.variants[0], brand: any?.brand }
    ])
  }

  const save = () => {
    const trimmed = name.trim() || 'Día'
    const cleanItems = items.map((it) => ({
      ...it,
      variant: it.variant?.trim() || undefined,
      brand: it.brand?.trim() || undefined,
      targetSets: it.targetSets && it.targetSets.length > 0 ? it.targetSets : undefined
    }))
    const exerciseIds = cleanItems.map((i) => i.exerciseId)
    if (routine) {
      update((d) => ({
        ...d,
        routines: d.routines.map((r) =>
          r.id === routine.id ? { ...r, name: trimmed, items: cleanItems, exerciseIds } : r
        )
      }))
      onSaved?.(routine.id)
    } else {
      const newId = uid()
      update((d) => ({
        ...d,
        routines: [...d.routines, { id: newId, name: trimmed, items: cleanItems, exerciseIds }]
      }))
      onSaved?.(newId)
    }
    onClose()
  }

  const discard = () => {
    const dirty =
      name !== (routine?.name ?? '') || JSON.stringify(items) !== JSON.stringify(initialItems)
    if (dirty && !confirm('¿Descartar los cambios sin guardar?')) return
    onClose()
  }

  const remove = () => {
    if (!routine) return
    if (!confirm(`¿Eliminar el día ${routine.name}? Tus entrenos pasados no se borran.`)) return
    update((d) => ({ ...d, routines: d.routines.filter((r) => r.id !== routine.id) }))
    onClose()
  }

  const brandItem = brandFor !== null ? items[brandFor] : undefined
  const brandDef = brandItem ? getExercise(data, brandItem.exerciseId) : undefined
  const infoDef = infoFor ? getExercise(data, infoFor) : undefined

  return (
    <Sheet
      onClose={discard}
      title={routine ? 'Editar día' : 'Nuevo día'}
      size="large"
      leading={
        <button type="button" className="btn btn-plain" onClick={discard}>
          Cancelar
        </button>
      }
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={save}>
          Guardar
        </button>
      }
    >
      <Section>
        <div className="field-row">
          <input
            placeholder="Nombre del día (p. ej. PUSH)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre del día"
          />
        </div>
      </Section>

      <Section
        title={`Ejercicios · ${items.length}`}
        bare
        footer={
          items.length > 0
            ? 'Toca un ejercicio para elegir variante, marca y series objetivo. Arrastra el asa para cambiar el orden.'
            : undefined
        }
      >
        {items.length === 0 ? (
          <div className="group">
            <EmptyState icon={<Dumbbell size={28} />} title="Día vacío">
              Añade los ejercicios que haces este día.
            </EmptyState>
          </div>
        ) : (
          <div ref={reorder.listRef} className={`group ${reorder.dragging !== null ? 'is-reordering' : ''}`}>
            {items.map((item, idx) => {
              const def = getExercise(data, item.exerciseId)
              if (!def) return null
              const open = expanded === idx
              const sets = item.targetSets?.length ?? 0
              const summary = [
                logLabel(item.variant, item.brand),
                sets > 0 ? `${sets} ${sets === 1 ? 'serie' : 'series'}` : ''
              ]
                .filter(Boolean)
                .join(' · ')
              return (
                <div key={idx} className={`edit-item ${reorder.dragging === idx ? 'is-dragging' : ''}`}>
                  <div className="edit-row">
                    <button
                      type="button"
                      className="edit-remove"
                      onClick={() => {
                        setExpanded(null)
                        setItems((prev) => prev.filter((_, i) => i !== idx))
                      }}
                      aria-label={`Quitar ${def.name}`}
                    >
                      <CircleMinus size={24} fill="currentColor" color="var(--cell)" strokeWidth={2.4} />
                    </button>
                    <button
                      type="button"
                      className="edit-main"
                      onClick={() => setExpanded(open ? null : idx)}
                      aria-expanded={open}
                    >
                      <span className="row-title">{def.name}</span>
                      <span className="row-sub">{summary || 'Toca para configurar'}</span>
                    </button>
                    <button
                      type="button"
                      className="edit-grip"
                      aria-label={`Reordenar ${def.name} (flechas arriba y abajo)`}
                      {...reorder.gripProps(idx)}
                    >
                      <GripVertical size={20} strokeWidth={2.2} />
                    </button>
                  </div>

                  {open && (
                    <div className="edit-panel">
                      {def.variants.length > 0 && (
                        <div className="edit-field">
                          <span className="edit-label">Variante</span>
                          <div className="chips">
                            {def.variants.map((v) => (
                              <button
                                key={v}
                                type="button"
                                className={`chip ${item.variant === v ? 'is-active' : ''}`}
                                onClick={() => patchItem(idx, { variant: v })}
                                aria-pressed={item.variant === v}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <label className="edit-field">
                        <span className="edit-label">
                          {def.variants.length > 0 ? 'O escribe otra variante o nota' : 'Variante o nota'}
                        </span>
                        <input
                          className="field"
                          placeholder="p. ej. Tras nuca"
                          value={item.variant ?? ''}
                          onChange={(e) => patchItem(idx, { variant: e.target.value })}
                        />
                      </label>
                      {(brandRelevant(def, item.variant) || item.brand) && (
                        <div className="edit-field">
                          <span className="edit-label">Marca de la máquina</span>
                          <button
                            type="button"
                            className={`inline-btn ${item.brand ? '' : 'is-tint'}`}
                            onClick={() => setBrandFor(idx)}
                          >
                            {item.brand ? (
                              <>
                                <span>{item.brand}</span>
                                <ChevronRight size={16} strokeWidth={2.4} />
                              </>
                            ) : (
                              <>
                                <Plus size={16} strokeWidth={2.6} />
                                <span>Elegir marca</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      <div className="edit-field">
                        <span className="edit-label">Series objetivo</span>
                        <TargetSetsEditor
                          bodyweight={def.bodyweight}
                          sets={item.targetSets ?? []}
                          onChange={(targetSets) => patchItem(idx, { targetSets })}
                        />
                      </div>
                      <button type="button" className="inline-btn" onClick={() => setInfoFor(def.id)}>
                        <Info size={16} strokeWidth={2.4} />
                        <span>Ficha y técnica</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section>
        <Row icon={<Plus />} title="Añadir ejercicios" tint onClick={() => setPicking(true)} />
      </Section>

      {routine && (
        <Section>
          <Row title="Eliminar día" destructive className="is-center" onClick={remove} />
        </Section>
      )}

      {picking && (
        <ExercisePickerSheet
          data={data}
          update={update}
          title="Añadir al día"
          multi
          counts={counts}
          onPick={addExercise}
          onClose={() => setPicking(false)}
        />
      )}
      {brandItem && brandDef && brandFor !== null && (
        <BrandPickerSheet
          data={data}
          exerciseId={brandDef.id}
          exerciseName={brandDef.name}
          value={brandItem.brand}
          onChange={(brand) => patchItem(brandFor, { brand })}
          onClose={() => setBrandFor(null)}
        />
      )}
      {infoDef && (
        <ExerciseInfoSheet data={data} def={infoDef} update={update} onClose={() => setInfoFor(null)} />
      )}
    </Sheet>
  )
}

/** Series objetivo (peso × reps) de un ejercicio dentro del día. */
function TargetSetsEditor(props: {
  bodyweight?: boolean
  sets: SetEntry[]
  onChange: (sets: SetEntry[]) => void
}) {
  const { bodyweight, sets, onChange } = props
  const addSet = () => {
    const prev = sets[sets.length - 1]
    onChange([...sets, { weight: prev?.weight ?? (bodyweight ? 0 : 20), reps: prev?.reps ?? 10 }])
  }
  return (
    <div className="stack">
      {sets.length > 0 && (
        <div className="target-row set-head" aria-hidden="true">
          <span />
          <span>{bodyweight ? 'Lastre' : 'kg'}</span>
          <span>Reps</span>
          <span />
        </div>
      )}
      {sets.map((set, si) => (
        <div key={si} className="target-row">
          <span className="target-num">{si + 1}</span>
          <NumberField
            value={set.weight}
            step={2.5}
            ariaLabel={`Serie objetivo ${si + 1}, kilos`}
            onChange={(weight) => onChange(sets.map((s, i) => (i === si ? { ...s, weight } : s)))}
          />
          <NumberField
            value={set.reps}
            step={1}
            ariaLabel={`Serie objetivo ${si + 1}, repeticiones`}
            onChange={(reps) => onChange(sets.map((s, i) => (i === si ? { ...s, reps } : s)))}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => onChange(sets.filter((_, i) => i !== si))}
            aria-label={`Quitar serie objetivo ${si + 1}`}
          >
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>
      ))}
      <button type="button" className="inline-btn" onClick={addSet}>
        <Plus size={16} strokeWidth={2.6} />
        <span>Añadir serie objetivo</span>
      </button>
      {sets.length === 0 && (
        <p className="ex-note">
          Lo que sueles hacer. Saldrá pre-rellenado al empezar, hasta que tengas historial propio.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor de rutina semanal: nombre y días
// ---------------------------------------------------------------------------

export function ProgramEditor(props: {
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
  const reorder = useReorder<string>(setDayIds)

  const days = dayIds
    .map((id) => data.routines.find((r) => r.id === id))
    .filter((r): r is Routine => !!r)
  const otras = data.routines.filter((r) => !dayIds.includes(r.id))

  const save = () => {
    const trimmed = name.trim() || 'Rutina semanal'
    const ids = days.map((d) => d.id)
    if (program) {
      update((d) => ({
        ...d,
        programs: d.programs.map((p) =>
          p.id === program.id ? { ...p, name: trimmed, dayIds: ids, daysPerWeek: ids.length } : p
        )
      }))
    } else {
      const id = uid()
      update((d) => ({
        ...d,
        programs: [...d.programs, { id, name: trimmed, dayIds: ids, daysPerWeek: ids.length }]
      }))
      onCreated?.(id)
    }
    onClose()
  }

  const removeProgram = () => {
    if (!program) return
    if (!confirm(`¿Eliminar la rutina semanal «${program.name}»? Sus días y tus entrenos no se borran.`)) return
    update((d) => ({ ...d, programs: d.programs.filter((p) => p.id !== program.id) }))
    onClose()
  }

  return (
    <Sheet
      onClose={onClose}
      title={program ? 'Editar rutina' : 'Nueva rutina'}
      size="large"
      leading={
        <button type="button" className="btn btn-plain" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={save}>
          Guardar
        </button>
      }
    >
      <Section>
        <div className="field-row">
          <input
            placeholder="Nombre (p. ej. PPL + Torso)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre de la rutina semanal"
          />
        </div>
      </Section>

      <Section
        title={`Días · ${days.length}`}
        bare
        footer={
          days.length > 0
            ? 'Toca un día para editar sus ejercicios. Arrastra el asa para cambiar el orden de la semana.'
            : undefined
        }
      >
        {days.length === 0 ? (
          <div className="group">
            <EmptyState icon={<Dumbbell size={28} />} title="Sin días todavía">
              Crea los días de tu semana: PUSH, PULL, LEG…
            </EmptyState>
          </div>
        ) : (
          <div ref={reorder.listRef} className={`group ${reorder.dragging !== null ? 'is-reordering' : ''}`}>
            {days.map((r, idx) => {
              const n = getRoutineItems(data, r).length
              return (
                <div key={r.id} className={`edit-item ${reorder.dragging === idx ? 'is-dragging' : ''}`}>
                  <div className="edit-row">
                    <button
                      type="button"
                      className="edit-remove"
                      onClick={() => setDayIds((prev) => prev.filter((x) => x !== r.id))}
                      aria-label={`Quitar ${r.name} de la semana`}
                    >
                      <CircleMinus size={24} fill="currentColor" color="var(--cell)" strokeWidth={2.4} />
                    </button>
                    <button type="button" className="edit-main" onClick={() => setEditingDay(r)}>
                      <span className="row-title">{r.name}</span>
                      <span className="row-sub">
                        {n} {n === 1 ? 'ejercicio' : 'ejercicios'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="edit-grip"
                      aria-label={`Reordenar ${r.name} (flechas arriba y abajo)`}
                      {...reorder.gripProps(idx)}
                    >
                      <GripVertical size={20} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section>
        <Row icon={<Plus />} title="Crear día nuevo" tint onClick={() => setEditingDay('new')} />
        {otras.length > 0 && (
          <Row
            icon={<CopyPlus />}
            title="Añadir un día que ya tengo"
            tint
            onClick={() => setPicking((v) => !v)}
            ariaLabel={picking ? 'Ocultar tus otros días' : 'Añadir un día que ya tengo'}
          />
        )}
      </Section>

      {picking && otras.length > 0 && (
        <Section title="Tus otros días">
          {otras.map((r) => (
            <Row
              key={r.id}
              title={r.name}
              subtitle={`${getRoutineItems(data, r).length} ejercicios`}
              accessory={<CirclePlus className="pick-add" size={24} strokeWidth={2} aria-hidden="true" />}
              onClick={() => setDayIds((prev) => [...prev, r.id])}
            />
          ))}
        </Section>
      )}

      {program && (
        <Section>
          <Row title="Eliminar rutina semanal" destructive className="is-center" onClick={removeProgram} />
        </Section>
      )}

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
