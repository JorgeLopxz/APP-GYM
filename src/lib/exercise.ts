import type { AppData, Equipment, ExerciseDef, Routine, RoutineItem } from '../types'
import { EQUIPMENT_LABEL, MUSCLE_NAMES } from '../types'
import { catalogSpecs, type ExerciseSpecs } from '../data/specs'
import {
  exerciseRegion,
  REGION_ORDER,
  SEARCH_ALIASES,
  VARIANT_MUSCLES,
  type Region
} from '../data/catalog'
import { normalizeText } from '../data/brands'

/** Ficha técnica: la del catálogo o, en ejercicios propios, la mínima que se sabe. */
export function exerciseSpecs(def: ExerciseDef): ExerciseSpecs {
  return (
    catalogSpecs(def.id) ?? {
      equipment: def.equipment ?? (def.bodyweight ? 'peso-corporal' : 'otros'),
      unilateral: false,
      cues: []
    }
  )
}

/**
 * Material real con el que se hace el ejercicio en una variante concreta:
 * «Press militar · Máquina» es de máquina aunque el press militar sea de barra.
 */
export function effectiveEquipment(def: ExerciseDef, variant?: string): Equipment {
  const base = exerciseSpecs(def).equipment
  if (!variant) return base
  const v = normalizeText(variant)
  if (/multipower|smith/.test(v)) return 'multipower'
  if (/maquina|machine/.test(v)) return 'maquina'
  if (/polea|cable/.test(v)) return 'polea'
  if (/kettlebell/.test(v)) return 'kettlebell'
  if (/mancuerna/.test(v)) return 'mancuernas'
  if (/peso corporal/.test(v)) return 'peso-corporal'
  // «Barra» en un ejercicio de polea es el accesorio, no una barra libre
  if (base !== 'polea' && base !== 'maquina' && /\bbarra\b/.test(v)) return 'barra'
  return base
}

const BRANDED: Equipment[] = ['maquina', 'polea', 'multipower']

/** ¿Tiene sentido preguntar la marca? Máquinas, poleas y multipower. */
export function brandRelevant(def: ExerciseDef, variant?: string): boolean {
  return BRANDED.includes(effectiveEquipment(def, variant))
}

/** El ejercicio se puede hacer con ese material (por defecto o en alguna variante). */
export function matchesEquipment(def: ExerciseDef, eq: Equipment): boolean {
  if (exerciseSpecs(def).equipment === eq) return true
  return def.variants.some((v) => effectiveEquipment(def, v) === eq)
}

/** Músculos que trabaja el ejercicio en esa variante (p. ej. aperturas inclinadas → pecho superior). */
export function musclesFor(
  def: ExerciseDef,
  variant?: string
): { primary: ExerciseDef['primary']; secondary: ExerciseDef['secondary'] } {
  const override = variant ? VARIANT_MUSCLES[def.id]?.[variant] : undefined
  return override ?? { primary: def.primary, secondary: def.secondary }
}

/** Etiqueta corta "Variante · Marca" (vacía si no hay ninguna). */
export function logLabel(variant?: string, brand?: string): string {
  return [variant, brand].filter(Boolean).join(' · ')
}

/** Búsqueda sin acentos por nombre, variantes y músculos. */
export function matchesQuery(def: ExerciseDef, query: string): boolean {
  const q = normalizeText(query)
  if (!q) return true
  const hay = normalizeText(
    [
      def.name,
      ...(SEARCH_ALIASES[def.id] ?? []),
      ...def.variants,
      ...def.primary.map((m) => MUSCLE_NAMES[m]),
      EQUIPMENT_LABEL[exerciseSpecs(def).equipment]
    ].join(' ')
  )
  return q.split(' ').every((word) => hay.includes(word))
}

export function groupByRegion(exercises: ExerciseDef[]): [Region, ExerciseDef[]][] {
  return REGION_ORDER.map(
    (region) =>
      [
        region,
        exercises
          .filter((e) => exerciseRegion(e) === region)
          .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      ] as [Region, ExerciseDef[]]
  ).filter(([, list]) => list.length > 0)
}

/** Items de una rutina (deriva de exerciseIds las rutinas antiguas sin items). */
export function getRoutineItems(data: AppData, routine: Routine): RoutineItem[] {
  if (routine.items && routine.items.length > 0) return routine.items
  return routine.exerciseIds.map((id) => {
    const def = data.exercises.find((e) => e.id === id)
    return {
      exerciseId: id,
      variant: def && def.variants.length > 0 ? def.variants[0] : undefined
    }
  })
}
