import type { AppData, ExerciseDef, MuscleId } from '../types'
import { buildSeedData, seedExercisesWithVideos } from '../data/seed'
import { CATALOG_EXERCISES } from '../data/catalog'

const CURRENT_VERSION = 3

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
      !Array.isArray(parsed.sessions)
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

/** Pide a iOS/Android que no borre el almacenamiento de la app instalada. */
export function requestPersistence(): void {
  try {
    void navigator.storage?.persist?.()
  } catch {
    // no soportado: no pasa nada
  }
}
