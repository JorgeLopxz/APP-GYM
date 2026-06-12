import type { MuscleId } from '../types'
import body from './bodymap.json'

/**
 * Mapa anatómico generado por scripts/gen-bodymap.mjs (lado izquierdo dibujado
 * a mano, derecho espejado matemáticamente). Para retocar formas, edita el
 * script y ejecuta `npm run bodymap`.
 */
interface BodyShape {
  muscle: string
  d: string
}

const SIL = body.sil as string[]
const FRONT = body.front as BodyShape[]
const BACK = body.back as BodyShape[]

// Escala de calor: gris (sin entrenar) → rojo oscuro → rojo vivo (muy entrenado)
const BASE: [number, number, number] = [40, 40, 46]
const MID: [number, number, number] = [122, 22, 28]
const HOT: [number, number, number] = [255, 45, 58]

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
  /** intensidad 0..1 por músculo */
  heat: Partial<Record<MuscleId, number>>
  selected: MuscleId | null
  onSelect: (m: MuscleId | null) => void
}) {
  const { heat, selected, onSelect } = props

  const renderShapes = (shapes: BodyShape[]) =>
    shapes.map((shape, i) => {
      const muscle = shape.muscle as MuscleId
      return (
        <path
          key={i}
          d={shape.d}
          fill={heatColor(heat[muscle] ?? 0)}
          className={`body-muscle ${selected === muscle ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(selected === muscle ? null : muscle)
          }}
        />
      )
    })

  const silhouette = SIL.map((d, i) => <path key={i} d={d} className="body-sil" />)

  return (
    <svg viewBox="0 0 400 470" className="bodymap" onClick={() => onSelect(null)}>
      <g>
        {silhouette}
        {renderShapes(FRONT)}
      </g>
      <g transform="translate(200,0)">
        {silhouette}
        {renderShapes(BACK)}
      </g>
      <text x={100} y={464} textAnchor="middle" className="bodymap-label">
        FRENTE
      </text>
      <text x={300} y={464} textAnchor="middle" className="bodymap-label">
        ESPALDA
      </text>
    </svg>
  )
}
