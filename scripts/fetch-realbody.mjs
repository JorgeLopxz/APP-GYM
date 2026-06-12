// Descarga los cuerpos anatómicos de react-native-body-highlighter (MIT,
// © 2022 ELABBASSI Hicham) y los convierte a src/components/realbody.json.
// Genera también realbody-preview.png para inspección visual.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const BASE =
  'https://raw.githubusercontent.com/HichamELBSI/react-native-body-highlighter/main'

async function fetchText(path) {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.text()
}

/** Convierte el módulo TS (array de BodyPart) a objeto JS. */
function parseParts(ts) {
  const start = ts.indexOf('= [')
  const end = ts.lastIndexOf('];')
  let body = ts.slice(start + 2, end + 1)
  body = body.replace(/\/\/[^\n]*/g, '') // comentarios
  body = body.replace(/(\w[\w-]*)\s*:/g, '"$1":') // claves sin comillas
  body = body.replace(/,(\s*[}\]])/g, '$1') // comas finales
  const parts = JSON.parse(body)
  return parts.map((p) => ({
    slug: p.slug,
    paths: [
      ...(p.path?.common ?? []),
      ...(p.path?.left ?? []),
      ...(p.path?.right ?? [])
    ]
  }))
}

/** Extrae los dos contornos (frente, espalda) del wrapper. */
function parseOutlines(tsx) {
  const ds = [...tsx.matchAll(/d="([^"]+)"/g)].map((m) => m[1])
  if (ds.length !== 2) throw new Error(`esperaba 2 contornos, hay ${ds.length}`)
  return { front: ds[0], back: ds[1] }
}

const [mf, mb, ff, fb, mw, fw] = await Promise.all([
  fetchText('assets/bodyFront.ts'),
  fetchText('assets/bodyBack.ts'),
  fetchText('assets/bodyFemaleFront.ts'),
  fetchText('assets/bodyFemaleBack.ts'),
  fetchText('components/SvgMaleWrapper.tsx'),
  fetchText('components/SvgFemaleWrapper.tsx')
])

const data = {
  // licencia MIT — atribución: react-native-body-highlighter (ELABBASSI Hicham)
  male: { front: parseParts(mf), back: parseParts(mb), outline: parseOutlines(mw) },
  female: { front: parseParts(ff), back: parseParts(fb), outline: parseOutlines(fw) }
}

writeFileSync('src/components/realbody.json', JSON.stringify(data))
for (const sex of ['male', 'female']) {
  console.log(
    `✓ ${sex}: front ${data[sex].front.length} partes, back ${data[sex].back.length} partes`
  )
}

// ---------------------------------------------------------------------------
// Preview: frente+espalda por fila, hombre arriba y mujer abajo
// ---------------------------------------------------------------------------

const MUSCLES = new Set([
  'chest', 'deltoids', 'trapezius', 'upper-back', 'lower-back', 'gluteal',
  'abs', 'obliques', 'biceps', 'triceps', 'forearm', 'quadriceps',
  'hamstring', 'adductors', 'calves'
])

const STOPS = [[242, 235, 235], [238, 158, 158], [165, 14, 22]]
const heat = (t) => {
  const k = Math.max(0, Math.min(1, t))
  const s = k < 0.5 ? [STOPS[0], STOPS[1], k * 2] : [STOPS[1], STOPS[2], (k - 0.5) * 2]
  const c = [0, 1, 2].map((i) => Math.round(s[0][i] + (s[1][i] - s[0][i]) * s[2]))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}
const demo = (slug) => {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 97
  return h / 96
}

const partsSvg = (parts) =>
  parts
    .map(({ slug, paths }) => {
      const fill = MUSCLES.has(slug) ? heat(demo(slug)) : '#cfcfd8'
      return paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join('')
    })
    .join('')

const bodySvg = (body, dy) => `
  <g transform="translate(0,${dy})">
    ${partsSvg(body.front)}${partsSvg(body.back)}
    <path d="${body.outline.front}" fill="none" stroke="#7d7d88" stroke-width="2"/>
    <path d="${body.outline.back}" fill="none" stroke="#7d7d88" stroke-width="2"/>
  </g>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 2896">
<rect width="1448" height="2896" fill="#0a0a0c"/>
${bodySvg(data.male, 0)}
${bodySvg(data.female, 1448)}
</svg>`

await sharp(Buffer.from(svg)).resize(720).png().toFile('realbody-preview.png')
console.log('✓ realbody-preview.png (hombre arriba, mujer abajo)')
