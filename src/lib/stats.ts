import type {
  AppData,
  ExerciseDef,
  ExerciseLog,
  MuscleId,
  Session,
  SetEntry
} from '../types'
import { currentBodyweight } from '../types'

/** 1RM estimado (fórmula de Epley). Para comparar series con distintas reps. */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}

/** Kilos "base" de una serie: el peso corporal en ejercicios como dominadas. */
export function exerciseBase(data: AppData, def: ExerciseDef | undefined): number {
  if (!def?.bodyweight) return 0
  return currentBodyweight(data.profile) ?? 0
}

export function setVolume(set: SetEntry, base = 0): number {
  let v = (set.weight + base) * set.reps
  if (set.tag === 'dropset' && set.dropWeight != null && set.dropReps) {
    v += (set.dropWeight + base) * set.dropReps
  }
  return v
}

export function logVolume(log: ExerciseLog, base = 0): number {
  return log.sets.reduce((acc, set) => acc + setVolume(set, base), 0)
}

export function sessionVolume(data: AppData, session: Session): number {
  const defs = new Map(data.exercises.map((e) => [e.id, e]))
  return session.exercises.reduce(
    (acc, log) => acc + logVolume(log, exerciseBase(data, defs.get(log.exerciseId))),
    0
  )
}

export function sessionSetCount(session: Session): number {
  return session.exercises.reduce((acc, log) => acc + log.sets.length, 0)
}

export function finishedSessions(data: AppData): Session[] {
  return data.sessions
    .filter((s) => s.finished)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Última vez que se hizo un ejercicio (+variante), para mostrar de referencia. */
export function lastLog(
  data: AppData,
  exerciseId: string,
  variant: string | undefined,
  excludeSessionId?: string
): { date: string; sets: SetEntry[] } | null {
  const sessions = finishedSessions(data)
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i]
    if (session.id === excludeSessionId) continue
    const log = session.exercises.find(
      (l) => l.exerciseId === exerciseId && (l.variant ?? '') === (variant ?? '')
    )
    if (log && log.sets.length > 0) return { date: session.date, sets: log.sets }
  }
  return null
}

/** Último registro del ejercicio con cualquier variante (para pre-rellenar). */
export function lastLogAny(
  data: AppData,
  exerciseId: string,
  excludeSessionId?: string
): { date: string; variant?: string; sets: SetEntry[] } | null {
  const sessions = finishedSessions(data)
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i]
    if (session.id === excludeSessionId) continue
    const log = session.exercises.find(
      (l) => l.exerciseId === exerciseId && l.sets.length > 0
    )
    if (log) return { date: session.date, variant: log.variant, sets: log.sets }
  }
  return null
}

/** Copia las series de una sesión anterior como plantilla (sin marcar hechas). */
export function prefillSets(sets: SetEntry[]): SetEntry[] {
  return sets.map((s) => ({ ...s, done: false }))
}

export interface ExercisePoint {
  date: string
  sessionId: string
  maxWeight: number
  maxE1rm: number
  maxReps: number
  volume: number
}

/**
 * Serie temporal de un ejercicio (+variante) a lo largo de las sesiones.
 * En ejercicios a peso corporal, si hay peso registrado en el perfil, los kilos
 * incluyen el cuerpo (dominadas de un usuario de 75 kg con 5 kg de lastre = 80 kg).
 */
export function exerciseSeries(
  data: AppData,
  exerciseId: string,
  variant: string | undefined
): ExercisePoint[] {
  const base = exerciseBase(data, getExercise(data, exerciseId))
  const points: ExercisePoint[] = []
  for (const session of finishedSessions(data)) {
    const logs = session.exercises.filter(
      (l) =>
        l.exerciseId === exerciseId &&
        (variant === undefined || (l.variant ?? '') === variant)
    )
    const sets = logs.flatMap((l) => l.sets)
    if (sets.length === 0) continue
    points.push({
      date: session.date,
      sessionId: session.id,
      maxWeight: Math.max(...sets.map((s) => s.weight + base)),
      maxE1rm: Math.max(...sets.map((s) => e1rm(s.weight + base, s.reps))),
      maxReps: Math.max(...sets.map((s) => s.reps)),
      volume: logs.reduce((acc, l) => acc + logVolume(l, base), 0)
    })
  }
  return points
}

export interface BestSet {
  weight: number
  reps: number
  value: number
}

/**
 * Mejores series de un ejercicio (+variante) CON contexto: el mejor peso con
 * sus reps ("100×6"), las más reps con su peso ("80×12") y el mejor RM con la
 * serie que lo produjo. Incluye el peso corporal en ejercicios bodyweight.
 */
export function bestSets(
  data: AppData,
  exerciseId: string,
  variant: string | undefined
): { byWeight: BestSet | null; byReps: BestSet | null; byE1rm: BestSet | null } {
  const base = exerciseBase(data, getExercise(data, exerciseId))
  let byWeight: BestSet | null = null
  let byReps: BestSet | null = null
  let byE1rm: BestSet | null = null
  for (const session of finishedSessions(data)) {
    for (const log of session.exercises) {
      if (log.exerciseId !== exerciseId) continue
      if (variant !== undefined && (log.variant ?? '') !== variant) continue
      for (const set of log.sets) {
        const w = set.weight + base
        const rm = e1rm(w, set.reps)
        if (!byWeight || w > byWeight.weight || (w === byWeight.weight && set.reps > byWeight.reps)) {
          byWeight = { weight: w, reps: set.reps, value: w }
        }
        if (!byReps || set.reps > byReps.reps || (set.reps === byReps.reps && w > byReps.weight)) {
          byReps = { weight: w, reps: set.reps, value: set.reps }
        }
        if (!byE1rm || rm > byE1rm.value) {
          byE1rm = { weight: w, reps: set.reps, value: rm }
        }
      }
    }
  }
  return { byWeight, byReps, byE1rm }
}

export interface PRs {
  maxWeight: number
  maxE1rm: number
  maxReps: number
}

export function prsBefore(
  data: AppData,
  exerciseId: string,
  variant: string | undefined,
  beforeSessionId: string,
  beforeDate?: string
): PRs {
  const prs: PRs = { maxWeight: 0, maxE1rm: 0, maxReps: 0 }
  for (const session of finishedSessions(data)) {
    if (session.id === beforeSessionId) continue
    // un récord solo puede compararse contra sesiones ANTERIORES
    if (beforeDate && session.date >= beforeDate) continue
    for (const log of session.exercises) {
      if (log.exerciseId !== exerciseId) continue
      if ((log.variant ?? '') !== (variant ?? '')) continue
      for (const set of log.sets) {
        prs.maxWeight = Math.max(prs.maxWeight, set.weight)
        prs.maxE1rm = Math.max(prs.maxE1rm, e1rm(set.weight, set.reps))
        prs.maxReps = Math.max(prs.maxReps, set.reps)
      }
    }
  }
  return prs
}

// ---------------------------------------------------------------------------
// Semana y mapa muscular
// ---------------------------------------------------------------------------

/** Lunes 00:00 de la semana actual + offset (0 = esta semana, -1 = pasada...). */
export function weekStart(offset: number): Date {
  const now = new Date()
  const day = (now.getDay() + 6) % 7 // 0 = lunes
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  monday.setDate(monday.getDate() + offset * 7)
  return monday
}

export function weekLabel(offset: number): string {
  if (offset === 0) return 'Esta semana'
  if (offset === -1) return 'Semana pasada'
  const start = weekStart(offset)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export interface MuscleWeek {
  /** Series efectivas por músculo (directas 1.0 + secundarias 0.5) */
  sets: Partial<Record<MuscleId, number>>
  /** Ejercicios que contribuyeron a cada músculo */
  sources: Partial<Record<MuscleId, Map<string, number>>>
  sessionCount: number
}

export function muscleWeek(data: AppData, offset: number): MuscleWeek {
  const start = weekStart(offset)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const result: MuscleWeek = { sets: {}, sources: {}, sessionCount: 0 }
  const defs = new Map(data.exercises.map((e) => [e.id, e]))

  for (const session of finishedSessions(data)) {
    const d = new Date(session.date)
    if (d < start || d >= end) continue
    result.sessionCount++
    for (const log of session.exercises) {
      const def = defs.get(log.exerciseId)
      if (!def || log.sets.length === 0) continue
      const add = (muscle: MuscleId, amount: number) => {
        result.sets[muscle] = (result.sets[muscle] ?? 0) + amount
        const map = result.sources[muscle] ?? new Map<string, number>()
        map.set(def.name, (map.get(def.name) ?? 0) + amount)
        result.sources[muscle] = map
      }
      for (const m of def.primary) add(m, log.sets.length)
      for (const m of def.secondary) add(m, log.sets.length * 0.5)
    }
  }
  return result
}

/**
 * Media de series semanales por músculo en las últimas 4 semanas (solo cuenta
 * semanas con algún entreno, para no diluir la media con vacaciones).
 */
export function muscleWeeklyAverage(data: AppData): {
  avg: Partial<Record<MuscleId, number>>
  weeks: number
} {
  let weeks = 0
  const total: Partial<Record<MuscleId, number>> = {}
  // solo semanas COMPLETAS (-1..-4): la semana en curso a medias diluiría la
  // media y marcaría puntos débiles falsos un lunes
  for (let o = -1; o >= -4; o--) {
    const w = muscleWeek(data, o)
    if (w.sessionCount === 0) continue
    weeks++
    for (const [m, s] of Object.entries(w.sets)) {
      total[m as MuscleId] = (total[m as MuscleId] ?? 0) + (s ?? 0)
    }
  }
  // sin histórico todavía: usa la semana actual como mejor aproximación
  if (weeks === 0) {
    const w = muscleWeek(data, 0)
    if (w.sessionCount > 0) {
      weeks = 1
      for (const [m, s] of Object.entries(w.sets)) {
        total[m as MuscleId] = s ?? 0
      }
    }
  }
  const avg: Partial<Record<MuscleId, number>> = {}
  if (weeks > 0) {
    for (const [m, s] of Object.entries(total)) {
      avg[m as MuscleId] = (s ?? 0) / weeks
    }
  }
  return { avg, weeks }
}

// ---------------------------------------------------------------------------
// Formato
// ---------------------------------------------------------------------------

export function fmtWeight(w: number): string {
  return w.toLocaleString('es-ES', { maximumFractionDigits: 2 })
}

export function fmtSet(set: SetEntry, bodyweight?: boolean): string {
  const base = bodyweight && set.weight === 0
    ? `${set.reps}`
    : `${fmtWeight(set.weight)}×${set.reps}`
  if (set.tag === 'dropset' && set.dropWeight != null) {
    return `${base} +drop ${fmtWeight(set.dropWeight)}×${set.dropReps ?? '?'}`
  }
  if (set.tag === 'negativas' && set.negReps) return `${base} +${set.negReps} neg`
  if (set.tag === 'fallo') return `${base} (fallo)`
  return base
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Racha de días seguidos tomando la creatina (contando hoy si está marcada). */
export function creatineStreak(taken: string[]): number {
  const set = new Set(taken)
  let streak = 0
  const cursor = new Date()
  if (!set.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(todayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getExercise(data: AppData, id: string): ExerciseDef | undefined {
  return data.exercises.find((e) => e.id === id)
}
