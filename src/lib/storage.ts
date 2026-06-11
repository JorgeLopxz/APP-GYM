import type { AppData } from '../types'
import { buildSeedData } from '../data/seed'

const KEY = 'hierro-data-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed && parsed.version === 1) return parsed
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
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.sessions)) {
      throw new Error('Archivo no válido')
    }
    return parsed
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
