import { useMemo, useState } from 'react'
import { CirclePlus, Info, Plus, Search } from 'lucide-react'
import type { AppData, Equipment, ExerciseDef, Update } from '../../types'
import { EQUIPMENT_LABEL, MUSCLE_NAMES } from '../../types'
import { exerciseRegion, REGION_ORDER, type Region } from '../../data/catalog'
import {
  exerciseSpecs,
  groupByRegion,
  matchesEquipment,
  matchesQuery
} from '../../lib/exercise'
import { EmptyState, Row, SearchField, Section, Sheet } from '../../components/ui'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { ExerciseCreator } from './ExerciseCreator'

const EQUIPMENT_FILTERS: Equipment[] = [
  'maquina',
  'polea',
  'barra',
  'mancuernas',
  'multipower',
  'peso-corporal',
  'kettlebell'
]

/**
 * Catálogo buscable por nombre, músculo o material, con filtros por zona y
 * material. En modo múltiple se queda abierto y marca cuántas veces añadiste
 * cada ejercicio.
 */
export function ExercisePickerSheet(props: {
  data: AppData
  update: Update
  title?: string
  multi?: boolean
  counts?: Record<string, number>
  onPick: (def: ExerciseDef) => void
  onClose: () => void
}) {
  const { data, update, title = 'Añadir ejercicio', multi, counts, onPick, onClose } = props
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region | 'all'>('all')
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all')
  const [infoFor, setInfoFor] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const groups = useMemo(
    () =>
      groupByRegion(
        data.exercises.filter(
          (e) =>
            matchesQuery(e, query) &&
            (region === 'all' || exerciseRegion(e) === region) &&
            (equipment === 'all' || matchesEquipment(e, equipment))
        )
      ),
    [data.exercises, query, region, equipment]
  )
  const infoDef = infoFor ? data.exercises.find((e) => e.id === infoFor) : undefined

  return (
    <Sheet
      onClose={onClose}
      title={title}
      size="large"
      trailing={
        multi ? (
          <button type="button" className="glass-btn is-text is-tint" onClick={onClose}>
            Listo
          </button>
        ) : undefined
      }
    >
      <div className="picker-top">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={`Buscar en ${data.exercises.length} ejercicios`}
        />
        <div className="chip-scroll" data-no-drag>
          {(['all', ...REGION_ORDER] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`chip ${region === r ? 'is-active' : ''}`}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
            >
              {r === 'all' ? 'Todo' : r}
            </button>
          ))}
        </div>
        <div className="chip-scroll" data-no-drag>
          {(['all', ...EQUIPMENT_FILTERS] as const).map((eq) => (
            <button
              key={eq}
              type="button"
              className={`chip ${equipment === eq ? 'is-active' : ''}`}
              onClick={() => setEquipment(eq)}
              aria-pressed={equipment === eq}
            >
              {eq === 'all' ? 'Cualquier material' : EQUIPMENT_LABEL[eq]}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <EmptyState
          icon={<Search size={26} />}
          title="Sin resultados"
          action={
            <button type="button" className="btn btn-tinted" onClick={() => setCreating(true)}>
              <Plus size={18} strokeWidth={2.6} />
              {query.trim() ? `Crear «${query.trim()}»` : 'Crear ejercicio'}
            </button>
          }
        >
          Prueba con otro nombre, músculo o material, o créalo tú.
        </EmptyState>
      )}

      {groups.map(([reg, list]) => (
        <Section key={reg} title={`${reg} · ${list.length}`}>
          {list.map((ex) => {
            const n = counts?.[ex.id] ?? 0
            const muscles = ex.primary
              .slice(0, 2)
              .map((m) => MUSCLE_NAMES[m])
              .join(', ')
            return (
              <div key={ex.id} className="row pick-row">
                <button type="button" className="pick-main" onClick={() => onPick(ex)}>
                  <span className="row-text">
                    <span className="row-title">{ex.name}</span>
                    <span className="row-sub">
                      {muscles} · {EQUIPMENT_LABEL[exerciseSpecs(ex).equipment]}
                    </span>
                  </span>
                  {n > 0 ? (
                    <span className="pick-count" aria-label={`Añadido ${n} veces`}>
                      {n}
                    </span>
                  ) : multi ? (
                    <CirclePlus className="pick-add" size={24} strokeWidth={2} aria-hidden="true" />
                  ) : null}
                </button>
                <button
                  type="button"
                  className="row-action"
                  onClick={() => setInfoFor(ex.id)}
                  aria-label={`Ficha de ${ex.name}`}
                >
                  <Info size={22} strokeWidth={2} />
                </button>
              </div>
            )
          })}
        </Section>
      ))}

      {groups.length > 0 && (
        <Section>
          <Row icon={<Plus />} title="Crear un ejercicio nuevo" tint onClick={() => setCreating(true)} />
        </Section>
      )}

      {creating && (
        <ExerciseCreator
          update={update}
          initialName={query.trim()}
          onCreated={(def) => {
            setCreating(false)
            onPick(def)
          }}
          onClose={() => setCreating(false)}
        />
      )}
      {infoDef && (
        <ExerciseInfoSheet data={data} def={infoDef} update={update} onClose={() => setInfoFor(null)} />
      )}
    </Sheet>
  )
}
