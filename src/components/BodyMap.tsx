import type { MuscleId } from '../types'
import body from './realbody.json'

/**
 * Cuerpos anatómicos de react-native-body-highlighter (MIT, © 2022 ELABBASSI
 * Hicham), convertidos por scripts/fetch-realbody.mjs (`npm run bodymap`).
 * Cada región visual agrupa nuestros músculos detallados; al tocarla se ve el
 * desglose por músculo.
 */

interface BodyPart {
  slug: string
  paths: string[]
}

interface BodyVariant {
  front: BodyPart[]
  back: BodyPart[]
  outline: { front: string; back: string }
}

const BODIES = body as { male: BodyVariant; female: BodyVariant }

/** Región visual (vista:slug) → músculos detallados de la app. */
export const REGION_MUSCLES: Record<string, MuscleId[]> = {
  'front:chest': ['pecho_superior', 'pecho_inferior'],
  'front:deltoids': ['deltoide_anterior', 'deltoide_lateral'],
  'front:trapezius': ['trapecio'],
  'front:abs': ['abs'],
  'front:obliques': ['oblicuos', 'serrato'],
  'front:biceps': ['biceps'],
  'front:triceps': ['triceps'],
  'front:forearm': ['antebrazo'],
  'front:quadriceps': ['cuadriceps'],
  'front:adductors': ['aductor'],
  'front:calves': ['gemelo'],
  'back:trapezius': ['trapecio'],
  'back:deltoids': ['deltoide_posterior', 'deltoide_lateral'],
  'back:upper-back': ['espalda_alta', 'dorsal'],
  'back:lower-back': ['lumbar'],
  'back:gluteal': ['gluteo', 'abductor'],
  'back:triceps': ['triceps'],
  'back:forearm': ['antebrazo'],
  'back:hamstring': ['isquios'],
  'back:adductors': ['aductor'],
  'back:calves': ['gemelo']
}

export const REGION_NAMES: Record<string, string> = {
  chest: 'Pecho',
  deltoids: 'Deltoides',
  trapezius: 'Trapecio',
  abs: 'Abdominales',
  obliques: 'Oblicuos y serrato',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearm: 'Antebrazo',
  quadriceps: 'Cuádriceps',
  adductors: 'Aductores',
  calves: 'Gemelos',
  'upper-back': 'Espalda alta y dorsal',
  'lower-back': 'Lumbar',
  gluteal: 'Glúteos'
}

/** Primera región que contiene un músculo (para seleccionarla desde la lista). */
export function regionForMuscle(muscle: MuscleId): string | null {
  for (const [key, muscles] of Object.entries(REGION_MUSCLES)) {
    if (muscles.includes(muscle)) return key
  }
  return null
}

// Escala de calor: casi blanco (sin trabajar) → rojo clarito (poco) → rojo
// intenso (mucho). Cuanto más se entrena un músculo, más fuerte el rojo.
const BASE: [number, number, number] = [242, 235, 235]
const MID: [number, number, number] = [238, 158, 158]
const HOT: [number, number, number] = [165, 14, 22]

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as [
    number,
    number,
    number
  ]
}

export function heatColor(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity))
  // curva suave para que pocas series ya se noten
  const k = Math.pow(t, 0.65)
  const c = k < 0.5 ? mix(BASE, MID, k * 2) : mix(MID, HOT, (k - 0.5) * 2)
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export function BodyMap(props: {
  /** intensidad 0..1 por músculo detallado */
  heat: Partial<Record<MuscleId, number>>
  /** región seleccionada ('front:chest', 'back:gluteal'…) */
  selected: string | null
  onSelect: (region: string | null) => void
  /** sexo del perfil: 'F' muestra el cuerpo femenino */
  sexo?: 'M' | 'F'
}) {
  const { heat, selected, onSelect, sexo } = props
  const variant = sexo === 'F' ? BODIES.female : BODIES.male

  const regionIntensity = (key: string): number => {
    const muscles = REGION_MUSCLES[key]
    if (!muscles) return 0
    return Math.max(...muscles.map((m) => heat[m] ?? 0))
  }

  const renderParts = (parts: BodyPart[], view: 'front' | 'back') =>
    parts.map((part) => {
      const key = `${view}:${part.slug}`
      const isMuscle = key in REGION_MUSCLES
      const fill = isMuscle ? heatColor(regionIntensity(key)) : '#cfcfd8'
      return part.paths.map((d, i) => (
        <path
          key={`${key}-${i}`}
          d={d}
          fill={fill}
          className={
            isMuscle
              ? `body-muscle ${selected === key ? 'selected' : ''}`
              : 'body-neutral'
          }
          onClick={
            isMuscle
              ? (e) => {
                  e.stopPropagation()
                  onSelect(selected === key ? null : key)
                }
              : undefined
          }
        />
      ))
    })

  return (
    <svg
      viewBox="0 0 1448 1520"
      className="bodymap"
      onClick={() => onSelect(null)}
    >
      {renderParts(variant.front, 'front')}
      {renderParts(variant.back, 'back')}
      <path d={variant.outline.front} className="body-outline" />
      <path d={variant.outline.back} className="body-outline" />
      <text x={362} y={1495} textAnchor="middle" className="bodymap-label" fontSize={46}>
        FRENTE
      </text>
      <text x={1086} y={1495} textAnchor="middle" className="bodymap-label" fontSize={46}>
        ESPALDA
      </text>
    </svg>
  )
}
