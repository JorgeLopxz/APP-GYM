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
  // porción esternal: la que trabajan el press plano, las aperturas o los fondos
  pecho_inferior: 'Pecho medio-bajo',
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

/** Material con el que se hace el ejercicio (el principal; las variantes pueden cambiarlo). */
export type Equipment =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'multipower'
  | 'kettlebell'
  | 'peso-corporal'
  | 'otros'

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barra: 'Barra',
  mancuernas: 'Mancuernas',
  maquina: 'Máquina',
  polea: 'Polea',
  multipower: 'Multipower',
  kettlebell: 'Kettlebell',
  'peso-corporal': 'Peso corporal',
  otros: 'Otros'
}

export type Mechanic = 'compuesto' | 'aislamiento'
export type Level = 'principiante' | 'intermedio' | 'avanzado'

export interface ExerciseDef {
  id: string
  name: string
  /** Variantes del ejercicio (equipo, agarre, ángulo…). Vacío = sin variantes. */
  variants: string[]
  primary: MuscleId[]
  secondary: MuscleId[]
  /** true = ejercicio a peso corporal (dominadas): el peso es lastre opcional. */
  bodyweight?: boolean
  /** Vídeo de técnica (URL de YouTube) */
  videoUrl?: string
  /** Solo en ejercicios creados por el usuario: los del catálogo lo leen de specs.ts */
  equipment?: Equipment
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
  /** Marca de la máquina (Technogym, Hammer Strength…). Separa el historial. */
  brand?: string
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
  /** Marca de máquina habitual para este ejercicio en la rutina */
  brand?: string
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

export type TrainingGoal = 'hipertrofia' | 'fuerza' | 'perdida' | 'mantenimiento'

export const GOAL_LABEL: Record<TrainingGoal, string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  perdida: 'Pérdida de grasa',
  mantenimiento: 'Mantenimiento'
}

/** Programa semanal: agrupa varias rutinas de día (PUSH, PULL…). */
export interface Program {
  id: string
  name: string
  /** ids de las rutinas-día (en data.routines) que componen la semana */
  dayIds: string[]
  goal?: TrainingGoal
  daysPerWeek?: number
  /** generado por el asistente */
  ai?: boolean
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
  /** Foto de perfil: JPEG cuadrado de 256 px como data URL (solo en este móvil) */
  foto?: string
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
  /** Programas semanales que agrupan rutinas-día */
  programs: Program[]
  sessions: Session[]
  settings: Settings
  profile: Profile
}

/** Modifica los datos de la app de forma inmutable. */
export type Update = (fn: (d: AppData) => AppData) => void

export const LEVEL_LABEL: Record<Level, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado'
}

/** Peso corporal actual (kg) o null si no se ha registrado. */
export function currentBodyweight(profile: Profile): number | null {
  if (profile.pesoLog.length === 0) return null
  return profile.pesoLog[profile.pesoLog.length - 1].kg
}
