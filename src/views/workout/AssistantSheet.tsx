import { useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import type { AppData, Program, Routine, TrainingGoal, Update } from '../../types'
import { GOAL_LABEL } from '../../types'
import { generateProgram, type Experience } from '../../lib/generator'
import { generateProgramAI } from '../../lib/ai'
import { Row, Section, Segmented, Sheet, Switch } from '../../components/ui'

const SPLIT_NAME: Record<number, string> = {
  2: 'Full Body',
  3: 'PPL',
  4: 'Upper/Lower',
  5: 'PPL + Torso',
  6: 'PPL ×2'
}

/** Asistente: tres preguntas y genera la semana (IA con respaldo integrado). */
export function AssistantSheet(props: {
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

  const builtIn = () => {
    const validIds = new Set(data.exercises.map((ex) => ex.id))
    const { program, routines } = generateProgram({ goal, days, experience }, validIds)
    apply(program, routines)
  }

  const generate = async () => {
    if (!useAI) {
      builtIn()
      return
    }
    setBusy(true)
    setStatus('Generando con IA… tarda unos segundos.')
    try {
      const { program, routines } = await generateProgramAI(data, { goal, days, experience, notes })
      apply(program, routines)
    } catch {
      // respaldo: el generador integrado nunca falla
      setStatus('La IA no respondió; uso el generador integrado.')
      builtIn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet onClose={onClose} title="Asistente" size="large" dismissable={!busy}>
      <p className="sheet-lead">
        Tres preguntas y te preparo la semana completa, con series objetivo en cada ejercicio.
      </p>

      <Section title="Objetivo" bare>
        <div className="chips">
          {(Object.keys(GOAL_LABEL) as TrainingGoal[]).map((g) => (
            <button
              key={g}
              type="button"
              className={`chip ${goal === g ? 'is-active' : ''}`}
              onClick={() => setGoal(g)}
              aria-pressed={goal === g}
            >
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Días por semana" bare>
        <Segmented
          ariaLabel="Días por semana"
          value={String(days)}
          onChange={(v) => setDays(Number(v))}
          options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
        />
      </Section>

      <Section title="Experiencia" bare>
        <Segmented
          ariaLabel="Experiencia"
          value={experience}
          onChange={setExperience}
          options={[
            { value: 'principiante', label: 'Empiezo' },
            { value: 'intermedio', label: 'Intermedio' },
            { value: 'avanzado', label: 'Avanzado' }
          ]}
        />
      </Section>

      <Section
        footer={
          useAI
            ? 'La IA reparte los grupos musculares y elige ejercicios de tu catálogo. Necesita conexión; si falla, uso el generador integrado.'
            : `Generador integrado: ${SPLIT_NAME[days]} de ${days} días, al instante y sin conexión.`
        }
      >
        <Row
          icon={<Sparkles />}
          tone="indigo"
          title="IA avanzada"
          subtitle="Gemini · más a medida"
          accessory={<Switch checked={useAI} onChange={setUseAI} label="Usar IA avanzada" />}
        />
        {useAI && (
          <div className="field-row">
            <textarea
              rows={3}
              placeholder="¿Algo a tener en cuenta? Molestia en el hombro, énfasis en glúteo, solo mancuernas…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Peticiones para la IA"
            />
          </div>
        )}
      </Section>

      {status && (
        <p className="section-foot" role="status">
          {status}
        </p>
      )}

      <div className="sheet-cta">
        <button
          type="button"
          className="btn btn-filled btn-lg btn-block"
          onClick={() => void generate()}
          disabled={busy}
        >
          {busy && <LoaderCircle className="spin" size={20} strokeWidth={2.6} />}
          {busy ? 'Generando…' : 'Generar rutina'}
        </button>
        <p className="section-foot">Los pesos los pones tú la primera vez; luego manda tu historial.</p>
      </div>
    </Sheet>
  )
}
