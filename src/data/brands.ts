/**
 * Marcas de maquinaria de gimnasio. Solo se muestran como texto (nunca con sus
 * logotipos). La marca separa historial, pre-relleno, récords y gráficas:
 * 80 kg en una Hammer Strength no son 80 kg en una Technogym.
 */

export interface GymBrand {
  name: string
  country?: string
  /** Formas alternativas de escribirla (para reconocer texto libre antiguo) */
  aliases?: string[]
}

/** Las más habituales en gimnasios de España, en orden de frecuencia. */
export const POPULAR_BRANDS: GymBrand[] = [
  { name: 'Technogym', country: 'Italia', aliases: ['techno gym'] },
  { name: 'Hammer Strength', country: 'EE. UU.', aliases: ['hammer'] },
  { name: 'Life Fitness', country: 'EE. UU.', aliases: ['lifefitness'] },
  { name: 'Panatta', country: 'Italia' },
  { name: 'gym80', country: 'Alemania', aliases: ['gym 80', 'gym80s', 'gym 80s'] },
  { name: 'Matrix', country: 'EE. UU.', aliases: ['matrix fitness'] },
  { name: 'Cybex', country: 'EE. UU.' },
  { name: 'Precor', country: 'EE. UU.' },
  { name: 'Nautilus', country: 'EE. UU.' },
  { name: 'Salter', country: 'España' }
]

export const OTHER_BRANDS: GymBrand[] = [
  { name: 'Arsenal Strength', country: 'EE. UU.' },
  { name: 'Atlantis', country: 'Canadá' },
  { name: 'BH Fitness', country: 'España', aliases: ['bh'] },
  { name: 'Body-Solid', country: 'EE. UU.', aliases: ['body solid'] },
  { name: 'Bodytone', country: 'España' },
  { name: 'Booty Builder', country: 'Países Bajos' },
  { name: 'DHZ Fitness', country: 'China', aliases: ['dhz'] },
  { name: 'Eleiko', country: 'Suecia' },
  { name: 'Exxentric', country: 'Suecia' },
  { name: 'Freemotion', country: 'EE. UU.' },
  { name: 'Gymleco', country: 'Suecia' },
  { name: 'Hoist', country: 'EE. UU.' },
  { name: 'Impulse', country: 'China', aliases: ['impulse fitness'] },
  { name: 'Jordan Fitness', country: 'Reino Unido' },
  { name: 'Keiser', country: 'EE. UU.' },
  { name: 'Legend Fitness', country: 'EE. UU.' },
  { name: 'Newtech', country: 'Italia' },
  { name: 'Primal Strength', country: 'Reino Unido' },
  { name: 'Prime Fitness', country: 'EE. UU.' },
  { name: 'Rogue', country: 'EE. UU.', aliases: ['rogue fitness'] },
  { name: 'Star Trac', country: 'EE. UU.', aliases: ['startrac'] },
  { name: 'Watson', country: 'Reino Unido' }
]

export const ALL_BRANDS: GymBrand[] = [...POPULAR_BRANDS, ...OTHER_BRANDS]

/** Minúsculas sin acentos ni espacios repetidos, para comparar texto libre. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Marca conocida que corresponde a un texto (nombre o alias), si la hay. */
export function knownBrand(text: string | undefined): GymBrand | undefined {
  if (!text) return undefined
  const n = normalizeText(text)
  if (!n) return undefined
  return ALL_BRANDS.find(
    (b) => normalizeText(b.name) === n || b.aliases?.some((a) => normalizeText(a) === n)
  )
}

/** Nombre canónico: el de la marca conocida o el texto tal cual, recortado. */
export function canonicalBrand(text: string | undefined): string | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  return knownBrand(trimmed)?.name ?? trimmed
}
