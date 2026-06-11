export type MuscleId =
  | 'pecho'
  | 'hombro_anterior'
  | 'hombro_lateral'
  | 'hombro_posterior'
  | 'biceps'
  | 'triceps'
  | 'antebrazo'
  | 'abs'
  | 'dorsal'
  | 'espalda_alta'
  | 'trapecio'
  | 'lumbar'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteo'
  | 'gemelo'
  | 'abductor'

export const MUSCLE_NAMES: Record<MuscleId, string> = {
  pecho: 'Pecho',
  hombro_anterior: 'Hombro anterior',
  hombro_lateral: 'Hombro lateral',
  hombro_posterior: 'Hombro posterior',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazo: 'Antebrazo',
  abs: 'Abdominales',
  dorsal: 'Dorsal',
  espalda_alta: 'Espalda alta',
  trapecio: 'Trapecio',
  lumbar: 'Lumbar',
  cuadriceps: 'Cuádriceps',
  isquios: 'Isquios',
  gluteo: 'Glúteo',
  gemelo: 'Gemelo',
  abductor: 'Abductor'
}

export interface ExerciseDef {
  id: string
  name: string
  /** Variantes del ejercicio, p. ej. ['Hammer', 'Technogym']. Vacío = sin variantes. */
  variants: string[]
  primary: MuscleId[]
  secondary: MuscleId[]
  /** true = ejercicio a peso corporal (dominadas): el peso es lastre opcional. */
  bodyweight?: boolean
}

export type SetTag = 'dropset' | 'fallo' | 'negativas'

export interface SetEntry {
  weight: number
  reps: number
  tag?: SetTag
  /** Peso y reps del tramo de dropset (tag === 'dropset') */
  dropWeight?: number
  dropReps?: number
  /** Nº de negativas extra (tag === 'negativas') */
  negReps?: number
  done?: boolean
}

export interface ExerciseLog {
  exerciseId: string
  variant?: string
  sets: SetEntry[]
}

export interface Session {
  id: string
  /** ISO date-time de inicio */
  date: string
  routineId: string
  routineName: string
  exercises: ExerciseLog[]
  finished: boolean
  durationMin?: number
}

export interface Routine {
  id: string
  name: string
  exerciseIds: string[]
}

export interface Settings {
  creatineEnabled: boolean
  creatineHour: string
  /** Días (YYYY-MM-DD) en los que se marcó la creatina como tomada */
  creatineTaken: string[]
  restSeconds: number
}

export interface AppData {
  version: number
  exercises: ExerciseDef[]
  routines: Routine[]
  sessions: Session[]
  settings: Settings
}
