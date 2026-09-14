import { useState } from 'react'
import type { Equipment, ExerciseDef, MuscleId, Update } from '../../types'
import { EQUIPMENT_LABEL, MUSCLE_NAMES } from '../../types'
import { uid } from '../../lib/storage'
import { Row, Section, Sheet, Switch } from '../../components/ui'

const EQUIPMENTS = Object.keys(EQUIPMENT_LABEL) as Equipment[]
const MUSCLES = Object.keys(MUSCLE_NAMES) as MuscleId[]

/** Crea un ejercicio propio con su material y músculos. */
export function ExerciseCreator(props: {
  update: Update
  initialName?: string
  onCreated: (def: ExerciseDef) => void
  onClose: () => void
}) {
  const { update, initialName = '', onCreated, onClose } = props
  const [name, setName] = useState(initialName)
  const [variants, setVariants] = useState('')
  const [equipment, setEquipment] = useState<Equipment>('maquina')
  const [bodyweight, setBodyweight] = useState(false)
  const [primary, setPrimary] = useState<MuscleId[]>([])
  const [secondary, setSecondary] = useState<MuscleId[]>([])

  const toggle = (list: MuscleId[], set: (v: MuscleId[]) => void, m: MuscleId) =>
    set(list.includes(m) ? list.filter((x) => x !== m) : [...list, m])

  const canSave = name.trim().length > 0 && primary.length > 0

  const save = () => {
    if (!canSave) return
    const def: ExerciseDef = {
      id: uid(),
      name: name.trim(),
      variants: variants
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      primary,
      secondary: secondary.filter((m) => !primary.includes(m)),
      bodyweight: bodyweight || undefined,
      equipment
    }
    update((d) => ({ ...d, exercises: [...d.exercises, def] }))
    onCreated(def)
  }

  return (
    <Sheet
      onClose={onClose}
      title="Nuevo ejercicio"
      size="large"
      leading={
        <button type="button" className="btn btn-plain" onClick={onClose}>
          Cancelar
        </button>
      }
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={save} disabled={!canSave}>
          Crear
        </button>
      }
    >
      <Section footer="Variantes separadas por comas: agarre, ángulo, material…">
        <div className="field-row">
          <input
            placeholder="Nombre del ejercicio"
            value={name}
            autoFocus={!initialName}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nombre del ejercicio"
          />
        </div>
        <div className="field-row">
          <input
            placeholder="Variantes (opcional)"
            value={variants}
            onChange={(e) => setVariants(e.target.value)}
            aria-label="Variantes"
          />
        </div>
      </Section>

      <Section title="Material" bare>
        <div className="chips">
          {EQUIPMENTS.map((eq) => (
            <button
              key={eq}
              type="button"
              className={`chip ${equipment === eq ? 'is-active' : ''}`}
              onClick={() => setEquipment(eq)}
            >
              {EQUIPMENT_LABEL[eq]}
            </button>
          ))}
        </div>
      </Section>

      <Section footer="Actívalo en dominadas, fondos y similares: el peso que apuntes será el lastre.">
        <Row
          title="A peso corporal"
          accessory={<Switch checked={bodyweight} onChange={setBodyweight} label="A peso corporal" />}
        />
      </Section>

      <Section title="Músculos principales" bare footer={primary.length === 0 ? 'Elige al menos uno.' : undefined}>
        <div className="chips">
          {MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${primary.includes(m) ? 'is-active' : ''}`}
              onClick={() => toggle(primary, setPrimary, m)}
              aria-pressed={primary.includes(m)}
            >
              {MUSCLE_NAMES[m]}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Músculos secundarios" bare>
        <div className="chips">
          {MUSCLES.filter((m) => !primary.includes(m)).map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${secondary.includes(m) ? 'is-active' : ''}`}
              onClick={() => toggle(secondary, setSecondary, m)}
              aria-pressed={secondary.includes(m)}
            >
              {MUSCLE_NAMES[m]}
            </button>
          ))}
        </div>
      </Section>
    </Sheet>
  )
}
