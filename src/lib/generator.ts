import type { Program, Routine, RoutineItem, SetEntry, TrainingGoal } from '../types'
import { uid } from './storage'

export type Experience = 'principiante' | 'intermedio' | 'avanzado'

export interface GenInput {
  goal: TrainingGoal
  days: number // 2..6
  experience: Experience
}

interface DayTemplate {
  name: string
  exercises: string[] // ids del catálogo, de compuesto a aislamiento
}

// ---------------------------------------------------------------------------
// Splits por días de entreno. Cada día lista ejercicios de mayor a menor
// prioridad; se recorta según experiencia.
// ---------------------------------------------------------------------------

const SPLITS: Record<number, DayTemplate[]> = {
  2: [
    {
      name: 'Full Body A',
      exercises: ['sentadilla', 'press-banca-barra', 'jalon', 'press-militar', 'curl-barra', 'plancha']
    },
    {
      name: 'Full Body B',
      exercises: ['peso-muerto-rumano', 'press-inclinado', 'remo-barra', 'elevaciones-laterales', 'extension-triceps', 'gemelo']
    }
  ],
  3: [
    {
      name: 'PUSH',
      exercises: ['press-inclinado', 'press-banca-barra', 'elevaciones-laterales', 'contractora', 'extension-triceps', 'extension-triceps-cabeza']
    },
    {
      name: 'PULL',
      exercises: ['jalon', 'remo-barra', 'pull-over', 'face-pull', 'curl-barra', 'curl-martillo']
    },
    {
      name: 'LEG',
      exercises: ['sentadilla', 'peso-muerto-rumano', 'prensa', 'extension-cuadriceps', 'curl-femoral', 'gemelo']
    }
  ],
  4: [
    {
      name: 'UPPER A',
      exercises: ['press-banca-barra', 'jalon', 'press-militar', 'remo-maquina', 'curl-barra', 'extension-triceps']
    },
    {
      name: 'LOWER A',
      exercises: ['sentadilla', 'curl-femoral', 'prensa', 'abductores-maquina', 'gemelo', 'crunch']
    },
    {
      name: 'UPPER B',
      exercises: ['press-inclinado', 'remo-barra', 'elevaciones-laterales', 'jalon-abierto', 'curl-martillo', 'press-frances']
    },
    {
      name: 'LOWER B',
      exercises: ['peso-muerto-rumano', 'hakka', 'extension-cuadriceps', 'hip-thrust', 'gemelo-sentado', 'elevaciones-piernas']
    }
  ],
  5: [
    {
      name: 'PUSH',
      exercises: ['press-inclinado', 'press-banca-barra', 'elevaciones-laterales', 'contractora', 'extension-triceps', 'extension-triceps-cabeza']
    },
    {
      name: 'PULL',
      exercises: ['jalon', 'remo-barra', 'pull-over', 'face-pull', 'curl-barra', 'curl-martillo']
    },
    {
      name: 'LEG',
      exercises: ['sentadilla', 'peso-muerto-rumano', 'prensa', 'extension-cuadriceps', 'curl-femoral', 'gemelo']
    },
    {
      name: 'PECHO · ESPALDA',
      exercises: ['press-inclinado-mancuernas', 'contractora', 'cruce-poleas', 'jalon-abierto', 'remo-gironda', 'pull-over']
    },
    {
      name: 'HOMBRO · BRAZO',
      exercises: ['press-militar', 'elevaciones-laterales', 'pajaros', 'curl-barra', 'curl-martillo', 'extension-triceps', 'press-frances']
    }
  ],
  6: [
    {
      name: 'PUSH A',
      exercises: ['press-inclinado', 'press-militar', 'elevaciones-laterales', 'contractora', 'extension-triceps', 'extension-triceps-cabeza']
    },
    {
      name: 'PULL A',
      exercises: ['jalon', 'remo-barra', 'pull-over', 'face-pull', 'curl-barra', 'curl-martillo']
    },
    {
      name: 'LEG A',
      exercises: ['sentadilla', 'curl-femoral', 'prensa', 'extension-cuadriceps', 'abductores-maquina', 'gemelo']
    },
    {
      name: 'PUSH B',
      exercises: ['press-banca-barra', 'press-inclinado-mancuernas', 'elevaciones-laterales', 'cruce-poleas', 'press-frances', 'patada-triceps']
    },
    {
      name: 'PULL B',
      exercises: ['jalon-abierto', 'remo-gironda', 'remo-maquina', 'pajaros', 'predicador', 'curl-inclinado']
    },
    {
      name: 'LEG B',
      exercises: ['hakka', 'peso-muerto-rumano', 'hip-thrust', 'extension-cuadriceps', 'gemelo-sentado', 'elevaciones-piernas']
    }
  ]
}

const EX_PER_DAY: Record<Experience, number> = {
  principiante: 4,
  intermedio: 5,
  avanzado: 6
}

/** Series y repeticiones objetivo según el objetivo de entreno. */
function setsFor(goal: TrainingGoal, isCompound: boolean): SetEntry[] {
  const plan: Record<TrainingGoal, { sets: number; reps: number }> = {
    hipertrofia: { sets: isCompound ? 4 : 3, reps: isCompound ? 8 : 12 },
    fuerza: { sets: isCompound ? 5 : 3, reps: isCompound ? 5 : 8 },
    perdida: { sets: 3, reps: 15 },
    mantenimiento: { sets: 3, reps: 10 }
  }
  const { sets, reps } = plan[goal]
  // peso 0 = a rellenar la primera vez; luego manda tu historial
  return Array.from({ length: sets }, () => ({ weight: 0, reps }))
}

export interface GenResult {
  program: Program
  routines: Routine[]
}

/**
 * Genera un programa semanal completo (con sus rutinas-día y series objetivo)
 * de forma determinista a partir de las respuestas del usuario. Sin servidores.
 */
export function generateProgram(input: GenInput, validIds: Set<string>): GenResult {
  const days = Math.max(2, Math.min(6, input.days))
  const templates = SPLITS[days] ?? SPLITS[3]
  const perDay = EX_PER_DAY[input.experience]

  const routines: Routine[] = templates.map((tpl) => {
    const chosen = tpl.exercises.filter((id) => validIds.has(id)).slice(0, perDay)
    const items: RoutineItem[] = chosen.map((id, idx) => ({
      exerciseId: id,
      // los 2 primeros de cada día se tratan como compuestos
      targetSets: setsFor(input.goal, idx < 2)
    }))
    return {
      id: uid(),
      name: tpl.name,
      exerciseIds: items.map((i) => i.exerciseId),
      items
    }
  })

  const goalName = GOAL_SHORT[input.goal]
  const program: Program = {
    id: uid(),
    name: `${splitName(days)} · ${goalName} (${days} días)`,
    dayIds: routines.map((r) => r.id),
    goal: input.goal,
    daysPerWeek: days,
    ai: true
  }
  return { program, routines }
}

const GOAL_SHORT: Record<TrainingGoal, string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  perdida: 'Definición',
  mantenimiento: 'Mantenimiento'
}

function splitName(days: number): string {
  if (days <= 2) return 'Full Body'
  if (days === 3) return 'PPL'
  if (days === 4) return 'Upper/Lower'
  if (days === 5) return 'PPL + Torso'
  return 'PPL ×2'
}
