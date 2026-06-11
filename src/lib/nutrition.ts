import type { AppData, Objetivo } from '../types'
import { currentBodyweight } from '../types'

export interface CalorieEstimate {
  bmr: number
  tdee: number
  target: number
  proteinMin: number
  proteinMax: number
  sessionsPerWeek: number
}

export const OBJETIVO_LABEL: Record<Objetivo, string> = {
  definicion: 'Definición',
  recomp: 'Recomposición',
  volumen: 'Volumen'
}

/** Ajuste calórico sobre el mantenimiento según el objetivo. */
const OBJETIVO_FACTOR: Record<Objetivo, number> = {
  definicion: 0.8, // déficit ~20 %
  recomp: 0.95, // déficit suave
  volumen: 1.1 // superávit ~10 %
}

/** Entrenos por semana (media de las últimas 4 semanas). */
export function sessionsPerWeek(data: AppData): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 28)
  const count = data.sessions.filter(
    (s) => s.finished && new Date(s.date) >= cutoff
  ).length
  return Math.round((count / 4) * 10) / 10
}

/**
 * Estimación de calorías: BMR por Mifflin-St Jeor + factor de actividad
 * derivado de tus entrenos reales. Es una ESTIMACIÓN orientativa, no consejo
 * médico; ajusta ±100-200 kcal según evolucione tu peso en la báscula.
 */
export function estimateCalories(data: AppData): CalorieEstimate | null {
  const { profile } = data
  const kg = currentBodyweight(profile)
  if (!kg || !profile.edad || !profile.alturaCm || !profile.sexo) return null

  const bmr =
    10 * kg +
    6.25 * profile.alturaCm -
    5 * profile.edad +
    (profile.sexo === 'M' ? 5 : -161)

  const spw = sessionsPerWeek(data)
  // 1.3 (poco activo fuera del gym) escalando con la frecuencia real de entreno
  const activity = spw <= 1 ? 1.3 : spw <= 3 ? 1.45 : spw <= 5 ? 1.55 : 1.65

  const tdee = bmr * activity
  const objetivo = profile.objetivo ?? 'recomp'

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(tdee * OBJETIVO_FACTOR[objetivo]),
    proteinMin: Math.round(kg * 1.6),
    proteinMax: Math.round(kg * 2.2),
    sessionsPerWeek: spw
  }
}
