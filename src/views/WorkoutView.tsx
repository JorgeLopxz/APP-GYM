import { useCallback, useMemo, useState } from 'react'
import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Pencil,
  Pill,
  Play,
  Plus,
  Sparkles
} from 'lucide-react'
import type { AppData, Program, Routine, Update } from '../types'
import { GOAL_LABEL } from '../types'
import { getRoutineItems, logLabel } from '../lib/exercise'
import { creatineStreak, fmtRelative, getExercise, nextUp, todayKey } from '../lib/stats'
import { EmptyState, PageHeader, Row, Section, Sheet } from '../components/ui'
import { AvatarButton, useBackGesture } from '../components/chrome'
import {
  ActiveSession,
  lastBrandFor,
  prefillFor,
  startSession
} from './workout/ActiveSession'
import { ProgramEditor, RoutineEditor } from './workout/Editors'
import { AssistantSheet } from './workout/AssistantSheet'

type NavAnim = 'push' | 'pop' | null

// ---------------------------------------------------------------------------
// Entreno: hoy → rutina semanal (días) → sesión activa
// ---------------------------------------------------------------------------

export function WorkoutView(props: { data: AppData; update: Update }) {
  const { data, update } = props
  const [programId, setProgramId] = useState<string | null>(null)
  const [anim, setAnim] = useState<NavAnim>(null)
  const back = useCallback(() => {
    setAnim('pop')
    setProgramId(null)
  }, [])

  const active = data.sessions.find((s) => !s.finished)
  if (active) return <ActiveSession data={data} session={active} update={update} />

  const program = data.programs.find((p) => p.id === programId)
  if (program) {
    return <ProgramDetail data={data} program={program} update={update} anim={anim} onBack={back} />
  }
  return (
    <TodayView
      data={data}
      update={update}
      anim={anim}
      onOpen={(id) => {
        setAnim('push')
        setProgramId(id)
      }}
    />
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------------------------------------------------------------------------
// Hoy: creatina, lo que toca y tus rutinas semanales
// ---------------------------------------------------------------------------

function TodayView(props: {
  data: AppData
  update: Update
  anim: NavAnim
  onOpen: (programId: string) => void
}) {
  const { data, update, anim, onOpen } = props
  const [creating, setCreating] = useState<false | 'choose' | 'manual' | 'ai'>(false)
  const [confirming, setConfirming] = useState<Routine | null>(null)
  const nombre = data.profile.nombre?.trim().split(/\s+/)[0]
  const next = useMemo(() => nextUp(data), [data])
  const today = capitalize(
    new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  )

  const nextItems = next ? getRoutineItems(data, next.routine) : []

  return (
    <div className={`view ${anim === 'pop' ? 'pop-in' : ''}`}>
      <PageHeader
        title={nombre ? `Hola, ${nombre}` : 'Entreno'}
        compactTitle="Entreno"
        subtitle={today}
        trailing={<AvatarButton />}
      />

      <CreatineRow data={data} update={update} />

      {next && nextItems.length > 0 && (
        <Section title="A continuación" bare>
          <div className="up-next">
            <span className="up-next-name">{next.routine.name}</span>
            <span className="up-next-meta">
              {next.program.name} · {nextItems.length} ejercicios ·{' '}
              {next.lastDone ? `última vez ${fmtRelative(next.lastDone)}` : 'sin estrenar'}
            </span>
            <p className="up-next-list">
              {nextItems
                .map((it) => getExercise(data, it.exerciseId)?.name)
                .filter(Boolean)
                .join(' · ')}
            </p>
            <button
              type="button"
              className="btn btn-filled btn-lg btn-block"
              onClick={() => setConfirming(next.routine)}
            >
              <Play size={18} strokeWidth={2.4} fill="currentColor" />
              Empezar
            </button>
          </div>
        </Section>
      )}

      <Section
        title="Rutinas semanales"
        action={
          data.programs.length > 0 ? (
            <button type="button" className="btn btn-plain" onClick={() => setCreating('choose')}>
              Nueva
            </button>
          ) : undefined
        }
      >
        {data.programs.map((p) => (
          <Row
            key={p.id}
            title={p.name}
            subtitle={[
              `${p.dayIds.length} ${p.dayIds.length === 1 ? 'día' : 'días'}`,
              p.goal ? GOAL_LABEL[p.goal] : '',
              p.ai ? 'Asistente' : ''
            ]
              .filter(Boolean)
              .join(' · ')}
            chevron
            onClick={() => onOpen(p.id)}
          />
        ))}
        {data.programs.length === 0 && (
          <EmptyState
            icon={<Dumbbell size={28} />}
            title="Sin rutinas todavía"
            action={
              <button type="button" className="btn btn-filled" onClick={() => setCreating('choose')}>
                <Plus size={18} strokeWidth={2.6} />
                Crear rutina
              </button>
            }
          >
            Monta tu semana a mano o deja que el asistente te la prepare.
          </EmptyState>
        )}
      </Section>

      {creating === 'choose' && (
        <Sheet onClose={() => setCreating(false)} title="Nueva rutina semanal">
          <Section>
            <Row
              icon={<Sparkles />}
              tone="indigo"
              title="Con el asistente"
              subtitle="Tres preguntas y te la genero a medida"
              chevron
              onClick={() => setCreating('ai')}
            />
            <Row
              icon={<Pencil />}
              tone="gray"
              title="A mano"
              subtitle="La montas tú, día a día"
              chevron
              onClick={() => setCreating('manual')}
            />
          </Section>
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
        <AssistantSheet data={data} update={update} onClose={() => setCreating(false)} onCreated={onOpen} />
      )}
      {confirming && (
        <ConfirmStartSheet
          data={data}
          routine={confirming}
          onClose={() => setConfirming(null)}
          onStart={() => {
            startSession(data, update, confirming)
            setConfirming(null)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rutina semanal: sus días
// ---------------------------------------------------------------------------

function ProgramDetail(props: {
  data: AppData
  program: Program
  update: Update
  anim: NavAnim
  onBack: () => void
}) {
  const { data, program, update, anim, onBack } = props
  const [editing, setEditing] = useState<Routine | null>(null)
  const [confirming, setConfirming] = useState<Routine | null>(null)
  const [editingProgram, setEditingProgram] = useState(false)
  useBackGesture(onBack)

  const days = program.dayIds
    .map((id) => data.routines.find((r) => r.id === id))
    .filter((r): r is Routine => !!r)
  const next = nextUp(data)
  const nextId = next?.program.id === program.id ? next.routine.id : null

  const lastDone = (routineId: string): string | null => {
    const done = data.sessions
      .filter((s) => s.finished && s.routineId === routineId)
      .sort((a, b) => b.date.localeCompare(a.date))
    return done.length > 0 ? done[0].date : null
  }

  return (
    <div className={`view ${anim === 'push' ? 'push-in' : ''}`}>
      <PageHeader
        title={program.name}
        subtitle={[
          `${days.length} ${days.length === 1 ? 'día' : 'días'} por semana`,
          program.goal ? GOAL_LABEL[program.goal] : ''
        ]
          .filter(Boolean)
          .join(' · ')}
        leading={
          <button type="button" className="glass-btn" onClick={onBack} aria-label="Volver a Entreno">
            <ChevronLeft size={24} strokeWidth={2.4} />
          </button>
        }
        trailing={
          <button type="button" className="glass-btn is-text" onClick={() => setEditingProgram(true)}>
            Editar
          </button>
        }
      />

      <Section
        title="Días"
        footer={days.length > 0 ? 'Toca un día para empezarlo. Con el lápiz cambias sus ejercicios.' : undefined}
      >
        {days.map((routine) => {
          const last = lastDone(routine.id)
          const n = getRoutineItems(data, routine).length
          return (
            <div key={routine.id} className="row pick-row">
              <button type="button" className="pick-main" onClick={() => setConfirming(routine)}>
                <span className="row-text">
                  <span className="row-title">
                    {routine.name}
                    {routine.id === nextId && <span className="badge">Toca hoy</span>}
                  </span>
                  <span className="row-sub">
                    {n} ejercicios · {last ? `última vez ${fmtRelative(last)}` : 'sin estrenar'}
                  </span>
                </span>
                <Play className="row-play" size={16} strokeWidth={2.4} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="row-action"
                onClick={() => setEditing(routine)}
                aria-label={`Editar ${routine.name}`}
              >
                <Pencil size={20} strokeWidth={2.2} />
              </button>
            </div>
          )
        })}
        {days.length === 0 && (
          <EmptyState
            icon={<CalendarPlus size={28} />}
            title="Sin días"
            action={
              <button type="button" className="btn btn-tinted" onClick={() => setEditingProgram(true)}>
                Añadir días
              </button>
            }
          >
            Esta rutina semanal aún no tiene días.
          </EmptyState>
        )}
      </Section>

      {editingProgram && (
        <ProgramEditor data={data} program={program} update={update} onClose={() => setEditingProgram(false)} />
      )}
      {editing && (
        <RoutineEditor data={data} routine={editing} update={update} onClose={() => setEditing(null)} />
      )}
      {confirming && (
        <ConfirmStartSheet
          data={data}
          routine={confirming}
          onClose={() => setConfirming(null)}
          onStart={() => {
            startSession(data, update, confirming)
            setConfirming(null)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confirmación antes de empezar
// ---------------------------------------------------------------------------

function ConfirmStartSheet(props: {
  data: AppData
  routine: Routine
  onClose: () => void
  onStart: () => void
}) {
  const { data, routine, onClose, onStart } = props
  const items = getRoutineItems(data, routine)
  return (
    <Sheet onClose={onClose} title={routine.name}>
      <p className="sheet-lead">
        Empiezas con tus marcas de la última vez para cada variante y marca: solo tienes que marcar cada serie como hecha o corregir lo que cambie.
      </p>
      <Section title={`${items.length} ejercicios`}>
        {items.map((item, i) => {
          const def = getExercise(data, item.exerciseId)
          if (!def) return null
          const brand = item.brand ?? lastBrandFor(data, item.exerciseId, item.variant)
          const sets = prefillFor(data, item.exerciseId, item.variant, brand, item.targetSets).length
          return (
            <Row
              key={i}
              title={def.name}
              subtitle={logLabel(item.variant, brand) || undefined}
              detail={sets > 0 ? `${sets} ${sets === 1 ? 'serie' : 'series'}` : undefined}
            />
          )
        })}
      </Section>
      <div className="sheet-cta">
        <button type="button" className="btn btn-filled btn-lg btn-block" onClick={onStart}>
          <Play size={18} strokeWidth={2.4} fill="currentColor" />
          Empezar entreno
        </button>
      </div>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Creatina de hoy
// ---------------------------------------------------------------------------

function CreatineRow({ data, update }: { data: AppData; update: Update }) {
  const { settings } = data
  if (!settings.creatineEnabled) return null
  const taken = settings.creatineTaken.includes(todayKey())
  const streak = creatineStreak(settings.creatineTaken)

  const toggle = () =>
    // todayKey se calcula AL PULSAR: si dejas la app abierta y tocas pasada
    // la medianoche, debe marcar el día correcto
    update((d) => {
      const t = todayKey()
      const has = d.settings.creatineTaken.includes(t)
      return {
        ...d,
        settings: {
          ...d.settings,
          creatineTaken: has
            ? d.settings.creatineTaken.filter((x) => x !== t)
            : [...d.settings.creatineTaken, t]
        }
      }
    })

  return (
    <div className="group">
      <Row
        icon={<Pill />}
        tone={taken ? 'green' : 'tint'}
        title="Creatina"
        subtitle={
          taken
            ? streak > 1
              ? `Tomada · ${streak} días seguidos`
              : 'Tomada hoy'
            : `Pendiente · aviso a las ${settings.creatineHour}`
        }
        accessory={
          <button
            type="button"
            className={`check-circle ${taken ? 'is-on' : ''}`}
            onClick={toggle}
            aria-pressed={taken}
            aria-label={taken ? 'Desmarcar la creatina de hoy' : 'Marcar la creatina como tomada'}
          >
            <Check size={18} strokeWidth={3} />
          </button>
        }
      />
    </div>
  )
}
