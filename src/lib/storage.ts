import type { AppData, ExerciseDef, MuscleId } from '../types'
import { buildSeedData, seedExercisesWithVideos, SEED_VIDEOS } from '../data/seed'
import { CATALOG_EXERCISES, CATALOG_VIDEOS } from '../data/catalog'

const CURRENT_VERSION = 4

const KEY = 'hierro-data-v1'

/** v1 → v2: músculos detallados (pecho dividido, deltoides por cabeza, etc.) */
const V1_MUSCLE_MAP: Record<string, MuscleId[]> = {
  pecho: ['pecho_superior', 'pecho_inferior'],
  hombro_anterior: ['deltoide_anterior'],
  hombro_lateral: ['deltoide_lateral'],
  hombro_posterior: ['deltoide_posterior']
}

function mapV1Muscles(muscles: string[]): MuscleId[] {
  return muscles.flatMap((m) => V1_MUSCLE_MAP[m] ?? [m as MuscleId])
}

function migrate(parsed: AppData & { profile?: AppData['profile'] }): AppData {
  let data = parsed
  if (data.version === 1) {
    const seedCatalog = new Map(seedExercisesWithVideos().map((e) => [e.id, e]))
    data = {
      ...data,
      version: 2,
      // los ejercicios de serie se sustituyen por su definición v2 (músculos
      // detallados + vídeo); los creados por el usuario se remapean genérico
      exercises: data.exercises.map((e: ExerciseDef) => {
        const seed = seedCatalog.get(e.id)
        if (seed) return { ...seed, variants: e.variants }
        return {
          ...e,
          primary: mapV1Muscles(e.primary as unknown as string[]),
          secondary: mapV1Muscles(e.secondary as unknown as string[])
        }
      }),
      profile: data.profile ?? { pesoLog: [] }
    }
  }
  if (data.version === 2) {
    // v2 → v3: se añade el catálogo general de ejercicios (sin duplicar)
    const existing = new Set(data.exercises.map((e) => e.id))
    data = {
      ...data,
      version: 3,
      exercises: [
        ...data.exercises,
        ...CATALOG_EXERCISES.filter((e) => !existing.has(e.id))
      ]
    }
  }
  if (data.version === 3) {
    // v3 → v4: vídeo de técnica precargado en TODOS los ejercicios que no
    // tengan uno propio (los puestos por el usuario se respetan)
    const allVideos = { ...SEED_VIDEOS, ...CATALOG_VIDEOS }
    data = {
      ...data,
      version: 4,
      exercises: data.exercises.map((e) =>
        !e.videoUrl && allVideos[e.id] ? { ...e, videoUrl: allVideos[e.id] } : e
      )
    }
  }
  return data
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed && parsed.version >= 1 && parsed.version <= CURRENT_VERSION) {
        const migrated = migrate(parsed)
        if (migrated !== parsed) localStorage.setItem(KEY, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch {
    // datos corruptos: empezamos de cero con la semilla
  }
  const seed = buildSeedData()
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // almacenamiento lleno o no disponible: lo ignoramos, la app sigue en memoria
  }
}

export function exportJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `hierro-backup-${stamp}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function importJSON(file: File): Promise<AppData> {
  return file.text().then((text) => {
    const parsed = JSON.parse(text) as AppData
    if (
      !parsed ||
      typeof parsed.version !== 'number' ||
      parsed.version < 1 ||
      parsed.version > CURRENT_VERSION ||
      !Array.isArray(parsed.sessions) ||
      !Array.isArray(parsed.exercises) ||
      !Array.isArray(parsed.routines) ||
      typeof parsed.settings !== 'object' ||
      parsed.settings === null
    ) {
      throw new Error('Archivo no válido')
    }
    return migrate(parsed)
  })
}

export function resetData(): AppData {
  localStorage.removeItem(KEY)
  return loadData()
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ---------------------------------------------------------------------------
// Temporizador de descanso: persiste para sobrevivir a cambios de pestaña,
// cierres de la app y bloqueos de pantalla (endsAt es un timestamp absoluto).
// ---------------------------------------------------------------------------

export interface TimerState {
  /** segundos elegidos */
  duration: number
  /** timestamp de fin si está corriendo (o ya terminado) */
  endsAt: number | null
  /** segundos restantes si está en pausa */
  pausedRemaining: number | null
}

const TIMER_KEY = 'hierro-timer-v1'

export function loadTimer(defaultDuration: number): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_KEY)
    if (raw) {
      const t = JSON.parse(raw) as TimerState
      if (typeof t.duration === 'number' && t.duration >= 15) {
        // si terminó hace más de 10 minutos, vuelve al reposo
        if (t.endsAt !== null && Date.now() - t.endsAt > 10 * 60 * 1000) {
          return { duration: t.duration, endsAt: null, pausedRemaining: null }
        }
        return t
      }
    }
  } catch {
    // estado corrupto: reposo
  }
  return { duration: defaultDuration, endsAt: null, pausedRemaining: null }
}

export function saveTimer(t: TimerState): void {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(t))
  } catch {
    // sin almacenamiento: el timer vivirá solo en memoria
  }
}

/** Pide a iOS/Android que no borre el almacenamiento de la app instalada. */
export function requestPersistence(): void {
  try {
    void navigator.storage?.persist?.()
  } catch {
    // no soportado: no pasa nada
  }
}
