import type { AppData, Program, Routine, RoutineItem, SetEntry, TrainingGoal } from '../types'
import { MUSCLE_NAMES } from '../types'
import { PUSH_SERVER } from './push'
import { uid } from './storage'
import type { Experience, GenResult } from './generator'

interface AIDay {
  name: string
  exercises: { exerciseId: string; variant?: string; sets: number; reps: number }[]
}
interface AIProgram {
  name: string
  days: AIDay[]
}

export interface AIInput {
  goal: TrainingGoal
  days: number
  experience: Experience
  notes?: string
}

/**
 * Pide a Gemini (vía nuestro worker) una rutina y la convierte en Program +
 * Routines válidos, descartando ejercicios que no existan en el catálogo.
 * Lanza un error con mensaje legible si algo falla (para caer al generador
 * integrado).
 */
export async function generateProgramAI(
  data: AppData,
  input: AIInput
): Promise<GenResult> {
  const valid = new Map(data.exercises.map((e) => [e.id, e]))
  const catalog = data.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscles: e.primary.map((m) => MUSCLE_NAMES[m]).join(', ')
  }))

  const res = await fetch(`${PUSH_SERVER}/generate-routine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: input.goal,
      days: input.days,
      experience: input.experience,
      notes: input.notes?.trim() || undefined,
      catalog
    })
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || `El servidor respondió ${res.status}`)
  }
  const { program: ai } = (await res.json()) as { program: AIProgram }
  if (!ai?.days?.length) throw new Error('La IA no devolvió días')

  const routines: Routine[] = []
  for (const day of ai.days) {
    const items: RoutineItem[] = []
    for (const ex of day.exercises) {
      const def = valid.get(ex.exerciseId)
      if (!def) continue // la IA inventó un id: lo ignoramos
      const reps = Math.max(1, Math.round(ex.reps || 10))
      const sets = Math.max(1, Math.min(8, Math.round(ex.sets || 3)))
      const targetSets: SetEntry[] = Array.from({ length: sets }, () => ({
        weight: 0,
        reps
      }))
      const variant =
        ex.variant && def.variants.includes(ex.variant) ? ex.variant : def.variants[0]
      items.push({ exerciseId: ex.exerciseId, variant, targetSets })
    }
    if (items.length === 0) continue
    routines.push({
      id: uid(),
      name: day.name || `Día ${routines.length + 1}`,
      exerciseIds: items.map((i) => i.exerciseId),
      items
    })
  }
  if (routines.length === 0) throw new Error('La rutina generada quedó vacía')

  const program: Program = {
    id: uid(),
    name: ai.name || 'Rutina con IA',
    dayIds: routines.map((r) => r.id),
    goal: input.goal,
    daysPerWeek: routines.length,
    ai: true
  }
  return { program, routines }
}
