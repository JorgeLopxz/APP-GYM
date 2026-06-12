// Genera el mapa anatómico: src/components/bodymap.json + un PNG de preview.
// Las formas se definen para el lado IZQUIERDO (o centro) en coordenadas
// locales (figura centrada en x=100) y el lado derecho se espeja
// automáticamente, garantizando simetría perfecta.
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

/** L = forma solo izquierda (se añade su espejo), C = forma central (única). */
const L = (muscle, d) => ({ side: 'L', muscle, d })
const C = (muscle, d) => ({ side: 'C', muscle, d })

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
// SILUETA (compartida por ambas figuras; el derecho se espeja)
// ---------------------------------------------------------------------------

const SIL_LEFT = [
  // cabeza + cuello
  'M86,34 Q86,16 100,16 L100,52 Q92,52 90,46 Z',
  'M92,46 L100,46 L100,66 L90,66 Z',
  // torso (mitad izquierda)
  'M100,58 Q80,59 64,69 Q56,74 55,86 L57,98 Q58,106 63,110 L66,140 Q68,152 76,164 Q73,176 72,192 Q72,210 84,221 Q92,227 100,228 Z',
  // brazo izquierdo
  'M56,75 Q45,82 43,98 L37,160 L31,206 Q28,222 36,231 Q46,235 50,222 L52,206 L51,162 L56,118 L61,106 Q52,94 56,75 Z',
  // pierna izquierda + pie
  'M72,194 L70,252 Q68,292 73,320 Q70,334 70,348 Q67,376 71,402 L73,425 Q70,438 78,443 L93,443 Q98,437 95,424 L96,394 Q99,362 93,338 L95,320 Q100,290 99,252 L100,226 Q84,222 72,194 Z'
]

// ---------------------------------------------------------------------------
// MÚSCULOS — FRONTAL
// ---------------------------------------------------------------------------

const FRONT = [
  L('trapecio', 'M94,58 Q82,60 68,69 L74,76 Q86,68 94,65 Z'),
  L('deltoide_anterior', 'M63,73 Q71,71 74,80 Q75,92 69,99 Q63,92 61,82 Q61,76 63,73 Z'),
  L('deltoide_lateral', 'M60,74 Q50,80 48,94 Q49,105 55,108 Q60,100 59,88 Q58,79 60,74 Z'),
  L('pecho_superior', 'M75,80 L98,78 L98,88 Q85,90 77,94 Q75,86 75,80 Z'),
  L('pecho_inferior', 'M77,96 Q87,92 98,90 L98,122 Q88,131 79,124 Q70,112 75,100 Z'),
  L('serrato', 'M70,118 L78,123 L76,131 L68,125 Z'),
  L('serrato', 'M67,129 L75,134 L73,141 L66,134 Z'),
  L('biceps', 'M56,108 Q64,112 62,132 Q60,148 52,154 Q46,146 48,128 Q50,112 56,108 Z'),
  L('antebrazo', 'M50,158 Q58,162 54,182 Q49,202 42,212 Q36,205 39,186 Q42,166 50,158 Z'),
  // abdominales: 3 filas de 2 + zona baja
  L('abs', 'M88,124 L99,122 L99,139 L88,140 Q86,131 88,124 Z'),
  L('abs', 'M88,143 L99,142 L99,158 L88,159 Q87,150 88,143 Z'),
  L('abs', 'M89,162 L99,161 L99,177 L89,178 Q88,169 89,162 Z'),
  C('abs', 'M89,181 L111,181 Q112,198 100,206 Q88,198 89,181 Z'),
  L('oblicuos', 'M79,126 Q75,146 79,166 Q82,176 86,181 L86,128 Q82,125 79,126 Z'),
  L('abductor', 'M73,186 Q67,194 69,207 Q73,215 79,211 Q81,198 79,190 Q76,184 73,186 Z'),
  L('aductor', 'M97,230 Q91,242 93,260 L98,268 Q101,246 100,231 Z'),
  // cuádriceps: vasto lateral, recto femoral, vasto medial
  L('cuadriceps', 'M72,206 Q67,252 72,298 Q76,309 81,300 Q78,252 80,212 Q76,203 72,206 Z'),
  L('cuadriceps', 'M83,211 Q78,254 83,301 Q88,312 93,301 Q95,252 90,213 Q86,204 83,211 Z'),
  L('cuadriceps', 'M93,262 Q98,284 95,309 Q91,320 87,310 Q88,284 90,264 Q92,258 93,262 Z'),
  L('gemelo', 'M88,336 Q95,358 92,386 Q88,395 84,384 Q83,358 86,338 Z')
]

// ---------------------------------------------------------------------------
// MÚSCULOS — ESPALDA
// ---------------------------------------------------------------------------

const BACK = [
  C('trapecio', 'M100,56 Q284,60 266,71 Q278,80 288,86 L297,140 L100,150 L100,56 Z'), // se sustituye abajo
  L('deltoide_posterior', 'M62,74 Q52,80 50,94 Q51,104 57,107 Q62,99 61,86 Q60,78 62,74 Z'),
  L('espalda_alta', 'M66,88 Q62,100 66,113 L78,119 Q80,104 78,94 Q72,88 66,88 Z'),
  L('dorsal', 'M62,114 Q58,136 68,156 Q80,170 92,174 L94,148 Q90,126 78,117 Q69,112 62,114 Z'),
  L('lumbar', 'M94,154 L98,156 L98,198 Q95,202 92,198 Q91,174 94,154 Z'),
  L('triceps', 'M56,108 Q49,114 48,132 Q48,150 54,156 Q60,149 61,130 Q61,114 56,108 Z'),
  L('antebrazo', 'M50,160 Q57,164 53,184 Q48,202 42,212 Q37,205 39,187 Q42,168 50,160 Z'),
  L('abductor', 'M73,180 Q67,186 69,199 Q73,205 79,201 Q81,189 78,182 Q75,177 73,180 Z'),
  L('gluteo', 'M77,196 Q66,206 68,228 Q74,243 90,241 L97,230 Q98,209 92,199 Q84,191 77,196 Z'),
  L('isquios', 'M71,247 Q67,279 71,312 Q76,321 81,312 Q81,279 80,249 Z'),
  L('isquios', 'M84,249 Q81,281 85,314 Q90,323 95,312 Q94,281 91,249 Z'),
  L('gemelo', 'M71,334 Q65,357 70,384 Q75,393 80,383 Q81,357 77,336 Z'),
  L('gemelo', 'M83,336 Q79,359 83,386 Q88,395 93,384 Q94,357 90,336 Z')
]

// el trapecio trasero es central (cometa): se define entero a mano
BACK[0] = C(
  'trapecio',
  'M100,56 Q84,60 66,71 Q78,80 88,86 L97,140 Q99,148 100,150 Q101,148 103,140 L112,86 Q122,80 134,71 Q116,60 100,56 Z'
)

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

const data = {
  sil: [...SIL_LEFT, ...SIL_LEFT.slice(2).map(mirror), mirror(SIL_LEFT[0]), mirror(SIL_LEFT[1])],
  front: expand(FRONT),
  back: expand(BACK)
}

writeFileSync('src/components/bodymap.json', JSON.stringify(data, null, 1))
console.log(
  `✓ bodymap.json — sil: ${data.sil.length}, front: ${data.front.length}, back: ${data.back.length}`
)

// preview PNG: silueta + músculos en rojo medio para inspección visual
const REDS = ['#8c1a22', '#a01820', '#c41e28', '#7a161c', '#b01c24']
const muscles = (shapes) =>
  shapes
    .map(
      (s, i) =>
        `<path d="${s.d}" fill="${REDS[i % REDS.length]}" stroke="#0a0a0c" stroke-width="0.8"/>`
    )
    .join('\n')
const sil = data.sil.map((d) => `<path d="${d}" fill="#23232a"/>`).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470">
<rect width="400" height="470" fill="#0a0a0c"/>
<g>${sil}${muscles(data.front)}</g>
<g transform="translate(200,0)">${sil}${muscles(data.back)}</g>
</svg>`

await sharp(Buffer.from(svg)).resize(900).png().toFile('bodymap-preview.png')
console.log('✓ bodymap-preview.png')
