import type { MuscleId } from '../types'

interface Shape {
  muscle: MuscleId
  d: string
}

// Color base (sin entrenar) → plata brillante (muy entrenado)
const BASE: [number, number, number] = [38, 38, 44]
const HOT: [number, number, number] = [232, 232, 240]

export function heatColor(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity))
  // curva suave para que pocas series ya se noten
  const k = Math.pow(t, 0.65)
  const c = BASE.map((b, i) => Math.round(b + (HOT[i] - b) * k))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

// ---------------------------------------------------------------------------
// Figura FRONTAL (centro x = 95)
// ---------------------------------------------------------------------------

const FRONT: Shape[] = [
  // trapecio (vista frontal, cuello-hombros)
  { muscle: 'trapecio', d: 'M80,55 L91,61 L91,66 L72,64 Z' },
  { muscle: 'trapecio', d: 'M110,55 L99,61 L99,66 L118,64 Z' },
  // hombro anterior (interior) y lateral (exterior)
  { muscle: 'hombro_anterior', d: 'M62,67 Q70,64 73,70 Q74,80 68,84 Q61,80 62,67 Z' },
  { muscle: 'hombro_anterior', d: 'M128,67 Q120,64 117,70 Q116,80 122,84 Q129,80 128,67 Z' },
  { muscle: 'hombro_lateral', d: 'M61,67 Q52,70 50,80 Q52,90 58,90 Q63,84 61,67 Z' },
  { muscle: 'hombro_lateral', d: 'M129,67 Q138,70 140,80 Q138,90 132,90 Q127,84 129,67 Z' },
  // pecho
  { muscle: 'pecho', d: 'M70,67 Q92,70 91,92 Q80,101 69,95 Q62,82 70,67 Z' },
  { muscle: 'pecho', d: 'M120,67 Q98,70 99,92 Q110,101 121,95 Q128,82 120,67 Z' },
  // bíceps
  { muscle: 'biceps', d: 'M50,93 Q58,92 59,104 Q59,118 53,124 Q47,120 47,106 Q47,97 50,93 Z' },
  { muscle: 'biceps', d: 'M140,93 Q132,92 131,104 Q131,118 137,124 Q143,120 143,106 Q143,97 140,93 Z' },
  // antebrazo
  { muscle: 'antebrazo', d: 'M50,128 Q55,126 56,136 Q56,156 50,170 Q45,168 45,148 Q45,134 50,128 Z' },
  { muscle: 'antebrazo', d: 'M140,128 Q135,126 134,136 Q134,156 140,170 Q145,168 145,148 Q145,134 140,128 Z' },
  // abdominales
  { muscle: 'abs', d: 'M83,100 L107,100 Q109,128 105,152 Q95,160 85,152 Q81,128 83,100 Z' },
  // cuádriceps
  { muscle: 'cuadriceps', d: 'M71,170 Q66,212 73,250 Q81,258 88,250 Q92,212 87,172 Q79,166 71,170 Z' },
  { muscle: 'cuadriceps', d: 'M119,170 Q124,212 117,250 Q109,258 102,250 Q98,212 103,172 Q111,166 119,170 Z' },
  // abductor (cadera exterior)
  { muscle: 'abductor', d: 'M64,164 Q58,172 61,184 Q66,188 70,182 Q70,168 64,164 Z' },
  { muscle: 'abductor', d: 'M126,164 Q132,172 129,184 Q124,188 120,182 Q120,168 126,164 Z' }
]

// ---------------------------------------------------------------------------
// Figura TRASERA (centro x = 285)
// ---------------------------------------------------------------------------

const BACK: Shape[] = [
  // trapecio (rombo)
  { muscle: 'trapecio', d: 'M285,54 L306,67 L285,96 L264,67 Z' },
  // hombro posterior
  { muscle: 'hombro_posterior', d: 'M252,67 Q243,71 241,81 Q243,91 250,91 Q256,84 252,67 Z' },
  { muscle: 'hombro_posterior', d: 'M318,67 Q327,71 329,81 Q327,91 320,91 Q314,84 318,67 Z' },
  // espalda alta (romboides / redondos)
  { muscle: 'espalda_alta', d: 'M254,68 L266,73 L264,92 L252,86 Z' },
  { muscle: 'espalda_alta', d: 'M316,68 L304,73 L306,92 L318,86 Z' },
  // dorsales (alas)
  { muscle: 'dorsal', d: 'M252,90 Q250,118 272,140 Q281,130 281,104 L264,94 Z' },
  { muscle: 'dorsal', d: 'M318,90 Q320,118 298,140 Q289,130 289,104 L306,94 Z' },
  // lumbar
  { muscle: 'lumbar', d: 'M277,134 L293,134 Q295,150 290,160 L280,160 Q275,150 277,134 Z' },
  // tríceps
  { muscle: 'triceps', d: 'M240,93 Q248,92 249,104 Q249,120 243,126 Q237,122 237,106 Q237,97 240,93 Z' },
  { muscle: 'triceps', d: 'M330,93 Q322,92 321,104 Q321,120 327,126 Q333,122 333,106 Q333,97 330,93 Z' },
  // antebrazo
  { muscle: 'antebrazo', d: 'M240,130 Q245,128 246,138 Q246,158 240,172 Q235,170 235,150 Q235,136 240,130 Z' },
  { muscle: 'antebrazo', d: 'M330,130 Q325,128 324,138 Q324,158 330,172 Q335,170 335,150 Q335,136 330,130 Z' },
  // abductor / glúteo medio
  { muscle: 'abductor', d: 'M256,160 Q250,168 253,180 Q258,184 262,178 Q262,164 256,160 Z' },
  { muscle: 'abductor', d: 'M314,160 Q320,168 317,180 Q312,184 308,178 Q308,164 314,160 Z' },
  // glúteos
  { muscle: 'gluteo', d: 'M266,164 Q258,180 266,194 Q276,200 283,192 L283,168 Q274,160 266,164 Z' },
  { muscle: 'gluteo', d: 'M304,164 Q312,180 304,194 Q294,200 287,192 L287,168 Q296,160 304,164 Z' },
  // isquios
  { muscle: 'isquios', d: 'M266,200 Q262,226 268,250 Q276,257 283,250 Q285,224 282,200 Q273,196 266,200 Z' },
  { muscle: 'isquios', d: 'M304,200 Q308,226 302,250 Q294,257 287,250 Q285,224 288,200 Q297,196 304,200 Z' },
  // gemelos
  { muscle: 'gemelo', d: 'M268,266 Q260,288 268,316 Q274,322 280,316 Q284,288 278,266 Q272,262 268,266 Z' },
  { muscle: 'gemelo', d: 'M302,266 Q310,288 302,316 Q296,322 290,316 Q286,288 292,266 Q298,262 302,266 Z' }
]

// Silueta base (cabeza, cuello, torso, brazos y piernas) por figura
function Skeleton({ cx }: { cx: number }) {
  const m = (x: number) => cx + (x - 95) // coordenadas definidas sobre la figura frontal
  return (
    <g className="body-skeleton">
      <circle cx={cx} cy={32} r={15} />
      <rect x={cx - 7} y={45} width={14} height={12} rx={4} />
      <path
        d={`M${m(64)},58 L${m(126)},58 Q${m(130)},60 ${m(128)},96 L${m(122)},150 Q${m(95)},162 ${m(68)},150 L${m(62)},96 Q${m(60)},60 ${m(64)},58 Z`}
      />
      {/* brazos */}
      <line x1={m(57)} y1={70} x2={m(50)} y2={125} strokeWidth={17} strokeLinecap="round" />
      <line x1={m(133)} y1={70} x2={m(140)} y2={125} strokeWidth={17} strokeLinecap="round" />
      <line x1={m(50)} y1={128} x2={m(45)} y2={172} strokeWidth={13} strokeLinecap="round" />
      <line x1={m(140)} y1={128} x2={m(145)} y2={172} strokeWidth={13} strokeLinecap="round" />
      {/* piernas */}
      <line x1={m(80)} y1={165} x2={m(78)} y2={252} strokeWidth={27} strokeLinecap="round" />
      <line x1={m(110)} y1={165} x2={m(112)} y2={252} strokeWidth={27} strokeLinecap="round" />
      <line x1={m(76)} y1={260} x2={m(74)} y2={330} strokeWidth={16} strokeLinecap="round" />
      <line x1={m(114)} y1={260} x2={m(116)} y2={330} strokeWidth={16} strokeLinecap="round" />
    </g>
  )
}

export function BodyMap(props: {
  /** intensidad 0..1 por músculo */
  heat: Partial<Record<MuscleId, number>>
  selected: MuscleId | null
  onSelect: (m: MuscleId | null) => void
}) {
  const { heat, selected, onSelect } = props

  const renderShapes = (shapes: Shape[]) =>
    shapes.map((shape, i) => (
      <path
        key={i}
        d={shape.d}
        fill={heatColor(heat[shape.muscle] ?? 0)}
        className={`body-muscle ${selected === shape.muscle ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(selected === shape.muscle ? null : shape.muscle)
        }}
      />
    ))

  return (
    <svg
      viewBox="0 0 380 360"
      className="bodymap"
      onClick={() => onSelect(null)}
    >
      <Skeleton cx={95} />
      <Skeleton cx={285} />
      {renderShapes(FRONT)}
      {renderShapes(BACK)}
      <text x={95} y={352} textAnchor="middle" className="bodymap-label">
        FRENTE
      </text>
      <text x={285} y={352} textAnchor="middle" className="bodymap-label">
        ESPALDA
      </text>
    </svg>
  )
}
