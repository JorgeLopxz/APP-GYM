// Genera el mapa anatómico: src/components/bodymap.json + un PNG de preview.
// Las formas se definen para el lado IZQUIERDO (o centro) en coordenadas
// locales (figura centrada en x=100) y el lado derecho se espeja
// automáticamente, garantizando simetría perfecta.
// Referencia visual: lámina anatómica clásica (frente/espalda, brazos caídos
// con manos abiertas junto a los muslos).
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const CX = 100

/** Espeja un path SVG (solo comandos absolutos M/L/Q/C/S/T/Z) alrededor de x=CX. */
function mirror(d) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g)
  const out = []
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (/^[A-Za-z]$/.test(t)) {
      if (!/[MLQCSTZ]/i.test(t)) throw new Error(`Comando no soportado: ${t}`)
      out.push(t)
      i++
      continue
    }
    const x = parseFloat(tokens[i])
    const y = parseFloat(tokens[i + 1])
    out.push(`${Math.round((2 * CX - x) * 10) / 10},${y}`)
    i += 2
  }
  return out.join(' ').replace(/([MLQCSTZ]) /g, '$1')
}

/**
 * Morfología femenina: escala cada coordenada x hacia/desde el eje central
 * según la altura y — hombros y torso más estrechos, cadera más ancha,
 * piernas que afinan. Los brazos usan un factor constante para no despegarse.
 */
const F_CURVE = [
  [0, 0.93],
  [60, 0.91],
  [90, 0.88],
  [130, 0.92],
  [165, 0.96],
  [195, 1.06],
  [240, 1.07],
  [300, 1.0],
  [350, 0.97],
  [470, 0.96]
]

function fFactor(y) {
  for (let i = 1; i < F_CURVE.length; i++) {
    const [y0, f0] = F_CURVE[i - 1]
    const [y1, f1] = F_CURVE[i]
    if (y <= y1) return f0 + ((f1 - f0) * (y - y0)) / (y1 - y0)
  }
  return F_CURVE[F_CURVE.length - 1][1]
}

/** Aplica la morfología femenina a un path (factor constante opcional). */
function feminize(d, constant = null) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g)
  const out = []
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (/^[A-Za-z]$/.test(t)) {
      out.push(t)
      i++
      continue
    }
    const x = parseFloat(tokens[i])
    const y = parseFloat(tokens[i + 1])
    const f = constant ?? fFactor(y)
    out.push(`${Math.round((CX + (x - CX) * f) * 10) / 10},${y}`)
    i += 2
  }
  return out.join(' ').replace(/([MLQCSTZ]) /g, '$1')
}

/** L = forma solo izquierda (se añade su espejo), C = forma central (única). */
const L = (muscle, d) => ({ side: 'L', muscle, d })
const C = (muscle, d) => ({ side: 'C', muscle, d })

/** Músculos de brazo: factor constante al feminizar (van pegados al brazo). */
const ARM_MUSCLES = new Set(['biceps', 'triceps', 'antebrazo'])

const expand = (shapes) =>
  shapes.flatMap((s) =>
    s.side === 'C'
      ? [{ muscle: s.muscle, d: s.d }]
      : [
          { muscle: s.muscle, d: s.d },
          { muscle: s.muscle, d: mirror(s.d) }
        ]
  )

// ---------------------------------------------------------------------------
// SILUETA (mitad izquierda + centro; el lado derecho se espeja)
// ---------------------------------------------------------------------------

const SIL_LEFT = [
  // cabeza (mitad izquierda, ovalada con mandíbula)
  'M100,12 Q88,12 87,27 Q86,40 92,47 Q96,52 100,52 Z',
  // cuello
  'M93,45 L100,45 L100,68 L91,68 Q93,56 93,45 Z',
  // torso (mitad izquierda): hombros anchos, cintura estrecha, cadera
  'M100,60 Q82,61 67,69 Q56,75 54,88 L56,101 Q57,109 63,113 L65,143 Q67,157 78,169 Q74,182 73,196 Q73,215 86,225 Q94,230 100,231 Z',
  // brazo izquierdo: hombro→codo→muñeca
  'M57,74 Q45,81 43,99 L39,158 Q38,167 36,177 L32,212 Q30,218 33,222 L42,220 Q44,214 44,210 L46,170 L50,128 L55,108 Q49,94 57,74 Z',
  // mano izquierda abierta junto al muslo
  'M32,214 Q26,226 27,240 Q29,251 34,250 Q33,240 36,230 Q39,222 41,218 Q37,212 32,214 Z',
  // pierna izquierda + pie
  'M73,196 L71,258 Q69,300 75,324 Q71,340 71,354 Q67,384 72,410 L74,430 Q70,444 80,448 L92,448 Q97,442 94,430 L96,398 Q99,366 93,342 L95,324 Q101,292 100,256 L100,232 Q85,226 73,196 Z'
]

// ---------------------------------------------------------------------------
// MÚSCULOS — FRONTAL
// ---------------------------------------------------------------------------

const FRONT = [
  // trapecio superior (cuello → hombro)
  L('trapecio', 'M94,56 Q83,59 70,68 L76,75 Q87,66 95,64 Z'),
  // deltoides
  L('deltoide_anterior', 'M64,72 Q73,70 76,80 Q77,93 70,100 Q63,93 61,82 Q61,75 64,72 Z'),
  L('deltoide_lateral', 'M61,73 Q50,79 48,95 Q49,107 56,110 Q61,101 60,88 Q59,78 61,73 Z'),
  // pectoral: franja clavicular + masa esternal cuadrada-redondeada
  L('pecho_superior', 'M76,79 L99,77 L99,87 Q86,89 78,94 Q76,86 76,79 Z'),
  L('pecho_inferior', 'M78,96 Q88,91 99,89 L99,120 Q89,131 80,124 Q70,112 75,100 Z'),
  // serrato: tres digitaciones bajo la axila
  L('serrato', 'M68,116 L76,121 L74,128 L66,122 Z'),
  L('serrato', 'M66,126 L74,132 L72,139 L65,131 Z'),
  L('serrato', 'M65,136 L72,142 L70,149 L64,141 Z'),
  // brazo
  L('biceps', 'M57,106 Q66,110 64,132 Q62,150 53,158 Q46,150 48,130 Q50,112 57,106 Z'),
  L('antebrazo', 'M52,162 Q61,166 56,186 Q50,204 43,216 Q37,210 40,190 Q43,170 52,162 Z'),
  // abdominales: 3 filas + zona baja (8-pack)
  L('abs', 'M89,124 L99,122 L99,138 L89,139 Q87,131 89,124 Z'),
  L('abs', 'M89,142 L99,141 L99,156 L89,157 Q88,149 89,142 Z'),
  L('abs', 'M90,160 L99,159 L99,174 L90,175 Q89,167 90,160 Z'),
  C('abs', 'M90,178 L110,178 Q111,199 100,209 Q89,199 90,178 Z'),
  L('oblicuos', 'M80,124 Q75,147 80,171 Q83,181 88,185 L88,126 Q84,122 80,124 Z'),
  // cadera y muslo
  L('abductor', 'M74,184 Q67,192 69,206 Q73,214 80,210 Q82,196 80,189 Q77,182 74,184 Z'),
  L('aductor', 'M98,234 Q91,246 92,266 L98,274 Q102,250 101,235 Z'),
  L('cuadriceps', 'M73,204 Q67,252 73,306 Q77,317 82,307 Q78,254 80,210 Q76,201 73,204 Z'),
  L('cuadriceps', 'M84,209 Q79,256 84,308 Q89,319 94,308 Q96,254 91,211 Q87,202 84,209 Z'),
  L('cuadriceps', 'M94,268 Q99,290 96,315 Q92,326 88,316 Q89,290 91,270 Q93,264 94,268 Z'),
  // gemelo interno visible de frente
  L('gemelo', 'M89,342 Q96,364 93,392 Q89,401 85,390 Q84,364 87,344 Z')
]

// ---------------------------------------------------------------------------
// MÚSCULOS — ESPALDA
// ---------------------------------------------------------------------------

const BACK = [
  // trapecio: cometa desde el cuello hasta media espalda
  C(
    'trapecio',
    'M100,54 Q84,58 66,70 Q78,79 88,85 L98,142 Q99,150 100,152 Q101,150 102,142 L112,85 Q122,79 134,70 Q116,58 100,54 Z'
  ),
  L('deltoide_posterior', 'M62,73 Q51,79 49,95 Q50,106 57,109 Q62,100 61,87 Q60,77 62,73 Z'),
  // zona escapular (infraespinoso/romboides/redondos)
  L('espalda_alta', 'M67,86 Q62,98 67,112 L80,118 Q82,102 80,92 Q73,86 67,86 Z'),
  // dorsal ancho: ala en V que afila hacia la cintura
  L('dorsal', 'M63,112 Q57,136 66,156 Q78,174 95,182 L97,158 Q95,130 82,117 Q71,109 63,112 Z'),
  L('lumbar', 'M95,156 L99,158 L99,200 Q96,205 93,200 Q92,176 95,156 Z'),
  L('triceps', 'M57,106 Q49,112 48,132 Q48,152 55,158 Q61,150 62,130 Q62,113 57,106 Z'),
  L('antebrazo', 'M52,162 Q61,166 56,186 Q50,204 43,216 Q37,210 40,190 Q43,170 52,162 Z'),
  // glúteo medio y mayor
  L('abductor', 'M74,178 Q67,184 69,198 Q73,205 80,201 Q82,189 79,181 Q76,175 74,178 Z'),
  L('gluteo', 'M78,194 Q66,204 68,228 Q74,245 91,243 L98,231 Q99,208 93,198 Q85,189 78,194 Z'),
  L('aductor', 'M99,236 Q93,248 94,268 L99,274 Q102,252 101,237 Z'),
  // isquios: dos columnas
  L('isquios', 'M72,249 Q67,283 72,316 Q77,326 82,316 Q82,283 81,251 Z'),
  L('isquios', 'M85,251 Q82,285 86,318 Q91,328 96,316 Q95,283 92,251 Z'),
  // gemelos: dos cabezas
  L('gemelo', 'M72,340 Q65,364 70,392 Q75,402 80,391 Q81,364 78,342 Z'),
  L('gemelo', 'M84,342 Q80,366 84,394 Q89,404 94,392 Q95,364 91,342 Z')
]

// ---------------------------------------------------------------------------
// Cuerpo femenino: morfología aplicada al masculino + pecho redondeado
// ---------------------------------------------------------------------------

// índices de SIL_LEFT que son brazo/mano (factor constante)
const SIL_ARM_IDX = new Set([3, 4])

const feminizeShapes = (shapes) =>
  shapes.map((s) => ({
    ...s,
    d: feminize(s.d, ARM_MUSCLES.has(s.muscle) ? 0.92 : null)
  }))

const FRONT_F = feminizeShapes(
  FRONT.map((s) =>
    // pecho esternal redondeado (forma de seno) en vez del pectoral cuadrado
    s.muscle === 'pecho_inferior'
      ? { ...s, d: 'M78,95 Q88,90 99,89 L99,121 Q93,134 83,129 Q69,114 74,100 Z' }
      : s
  )
)
const BACK_F = feminizeShapes(BACK)
const SIL_LEFT_F = SIL_LEFT.map((d, i) => feminize(d, SIL_ARM_IDX.has(i) ? 0.92 : null))

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

const buildBody = (sil, front, back) => ({
  sil: [...sil, ...sil.map(mirror)],
  front: expand(front),
  back: expand(back)
})

const data = {
  male: buildBody(SIL_LEFT, FRONT, BACK),
  female: buildBody(SIL_LEFT_F, FRONT_F, BACK_F)
}

writeFileSync('src/components/bodymap.json', JSON.stringify(data, null, 1))
console.log(
  `✓ bodymap.json — male: ${data.male.front.length}+${data.male.back.length}, female: ${data.female.front.length}+${data.female.back.length}`
)

// ---------------------------------------------------------------------------
// Preview PNG con la escala de calor real (clarito = poco, intenso = mucho)
// para inspección visual: cada forma recibe una intensidad distinta.
// ---------------------------------------------------------------------------

const STOPS = [
  [242, 235, 235], // 0: sin trabajar, casi blanco
  [238, 158, 158], // medio: rojo clarito
  [165, 14, 22] // 1: rojo intenso
]
function heat(t) {
  const k = Math.max(0, Math.min(1, t))
  const seg = k < 0.5 ? [STOPS[0], STOPS[1], k * 2] : [STOPS[1], STOPS[2], (k - 0.5) * 2]
  const c = [0, 1, 2].map((i) => Math.round(seg[0][i] + (seg[1][i] - seg[0][i]) * seg[2]))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

// intensidad por MÚSCULO (no por forma) para poder juzgar la simetría
const demoHeat = (muscle) => {
  let h = 0
  for (const ch of muscle) h = (h * 31 + ch.charCodeAt(0)) % 97
  return h / 96
}
const muscles = (shapes) =>
  shapes
    .map(
      (s) =>
        `<path d="${s.d}" fill="${heat(demoHeat(s.muscle))}" stroke="#1a1a1f" stroke-width="0.8"/>`
    )
    .join('\n')
const silPaths = (body) => body.sil.map((d) => `<path d="${d}" fill="#cfcfd8"/>`).join('\n')

const bodyRow = (body, dy) =>
  `<g transform="translate(0,${dy})">${silPaths(body)}${muscles(body.front)}</g>
   <g transform="translate(200,${dy})">${silPaths(body)}${muscles(body.back)}</g>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 940">
<rect width="400" height="940" fill="#0a0a0c"/>
${bodyRow(data.male, 0)}
${bodyRow(data.female, 470)}
</svg>`

await sharp(Buffer.from(svg)).resize(760).png().toFile('bodymap-preview.png')
console.log('✓ bodymap-preview.png (hombre arriba, mujer abajo)')
