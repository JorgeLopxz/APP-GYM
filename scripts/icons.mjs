// Genera los iconos PNG de la PWA a partir de assets/icon.svg
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SRC = fileURLToPath(new URL('../assets/icon.svg', import.meta.url))
mkdirSync('public', { recursive: true })

const jobs = [
  { out: 'public/icon-192.png', size: 192, pad: 0 },
  { out: 'public/icon-512.png', size: 512, pad: 0 },
  // maskable: el contenido al 80% centrado sobre fondo, para el recorte de Android
  { out: 'public/icon-maskable-512.png', size: 512, pad: 52 },
  { out: 'public/apple-touch-icon.png', size: 180, pad: 0 }
]

for (const { out, size, pad } of jobs) {
  const inner = size - pad * 2
  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 10, b: 12, alpha: 1 }
    }
  })
  const icon = await sharp(SRC).resize(inner, inner).png().toBuffer()
  await base
    .composite([{ input: icon, left: pad, top: pad }])
    .png()
    .toFile(out)
  console.log('✓', out)
}
