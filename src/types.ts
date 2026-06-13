export type MuscleId =
  | 'trapecio'
  | 'deltoide_anterior'
  | 'deltoide_lateral'
  | 'deltoide_posterior'
  | 'pecho_superior'
  | 'pecho_inferior'
  | 'biceps'
  | 'triceps'
  | 'antebrazo'
  | 'abs'
  | 'oblicuos'
  | 'serrato'
  | 'dorsal'
  | 'espalda_alta'
  | 'lumbar'
  | 'gluteo'
  | 'abductor'
  | 'aductor'
  | 'cuadriceps'
  | 'isquios'
  | 'gemelo'

export const MUSCLE_NAMES: Record<MuscleId, string> = {
  trapecio: 'Trapecio',
  deltoide_anterior: 'Deltoide anterior',
  deltoide_lateral: 'Deltoide lateral',
  deltoide_posterior: 'Deltoide posterior',
  pecho_superior: 'Pecho superior',
  pecho_inferior: 'Pecho inferior',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazo: 'Antebrazo',
  abs: 'Abdominales',
  oblicuos: 'Oblicuos',
  serrato: 'Serrato',
  dorsal: 'Dorsal',
  espalda_alta: 'Espalda alta',
  lumbar: 'Lumbar',
  gluteo: 'Glúteo',
  abductor: 'Glúteo medio',
  aductor: 'Aductor',
  cuadriceps: 'Cuádriceps',
  isquios: 'Isquios',
  gemelo: 'Gemelos'
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
  /** Vídeo de técnica (URL de YouTube) */
  videoUrl?: string
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

export interface RoutineItem {
  exerciseId: string
  /** Variante elegida para esta rutina (texto libre: "Polea", "Tras nuca"…) */
  variant?: string
  /** Series objetivo predefinidas (peso × reps) para pre-rellenar el entreno */
  targetSets?: SetEntry[]
}

export interface Routine {
  id: string
  name: string
  /** Lista plana de ids (compatibilidad). Se mantiene en sync con items. */
  exerciseIds: string[]
  /** Fuente de verdad nueva: ejercicios con variante y series objetivo. */
  items?: RoutineItem[]
}

export interface Settings {
  creatineEnabled: boolean
  creatineHour: string
  /** Días (YYYY-MM-DD) en los que se marcó la creatina como tomada */
  creatineTaken: string[]
  restSeconds: number
  /** Push diario de creatina activado en este dispositivo */
  pushEnabled?: boolean
}

export interface WeightEntry {
  date: string // YYYY-MM-DD
  kg: number
}

export type Objetivo = 'definicion' | 'recomp' | 'volumen'

export interface Profile {
  /** Nombre de quien usa la app (cada móvil tiene su copia con sus datos) */
  nombre?: string
  edad?: number
  sexo?: 'M' | 'F'
  alturaCm?: number
  /** Historial de peso corporal (el último es el actual) */
  pesoLog: WeightEntry[]
  /** Objetivo nutricional actual */
  objetivo?: Objetivo
  /** Ya se le pidieron las métricas al usuario (no volver a preguntar) */
  prompted?: boolean
}

export interface AppData {
  version: number
  exercises: ExerciseDef[]
  routines: Routine[]
  sessions: Session[]
  settings: Settings
  profile: Profile
}

/** Peso corporal actual (kg) o null si no se ha registrado. */
export function currentBodyweight(profile: Profile): number | null {
  if (profile.pesoLog.length === 0) return null
  return profile.pesoLog[profile.pesoLog.length - 1].kg
}
