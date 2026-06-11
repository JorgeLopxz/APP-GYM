import type { ExerciseDef, MuscleId } from '../types'

/**
 * Catálogo general de ejercicios (además de los tuyos). Disponibles en
 * "Añadir ejercicio" y en el editor de rutinas, agrupados por región.
 */
export const CATALOG_EXERCISES: ExerciseDef[] = [
  // ----- PECHO -----
  {
    id: 'press-banca-barra',
    name: 'Press de banca con barra',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['triceps', 'deltoide_anterior']
  },
  {
    id: 'press-plano-mancuernas',
    name: 'Press plano con mancuernas',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['triceps', 'deltoide_anterior']
  },
  {
    id: 'press-declinado',
    name: 'Press declinado',
    variants: ['Barra', 'Máquina'],
    primary: ['pecho_inferior'],
    secondary: ['triceps']
  },
  {
    id: 'press-multipower',
    name: 'Press en multipower',
    variants: ['Plano', 'Inclinado'],
    primary: ['pecho_inferior', 'pecho_superior'],
    secondary: ['triceps', 'deltoide_anterior']
  },
  {
    id: 'aperturas-mancuernas',
    name: 'Aperturas con mancuernas',
    variants: ['Plano', 'Inclinado'],
    primary: ['pecho_inferior'],
    secondary: ['pecho_superior']
  },
  {
    id: 'fondos-paralelas',
    name: 'Fondos en paralelas',
    variants: [],
    primary: ['pecho_inferior', 'triceps'],
    secondary: ['deltoide_anterior'],
    bodyweight: true
  },
  {
    id: 'flexiones',
    name: 'Flexiones',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['triceps', 'deltoide_anterior', 'abs'],
    bodyweight: true
  },
  {
    id: 'pullover-mancuerna',
    name: 'Pull-over con mancuerna',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['dorsal', 'serrato', 'triceps']
  },
  // ----- ESPALDA -----
  {
    id: 'remo-barra',
    name: 'Remo con barra',
    variants: ['Prono', 'Supino'],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps', 'lumbar']
  },
  {
    id: 'remo-mancuerna',
    name: 'Remo con mancuerna unilateral',
    variants: [],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps']
  },
  {
    id: 'remo-maquina',
    name: 'Remo en máquina',
    variants: ['Neutro', 'Prono'],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps']
  },
  {
    id: 'dominadas-supinas',
    name: 'Dominadas supinas (chin-up)',
    variants: [],
    primary: ['dorsal', 'biceps'],
    secondary: ['espalda_alta', 'antebrazo'],
    bodyweight: true
  },
  {
    id: 'dominadas-asistidas',
    name: 'Dominadas asistidas en máquina',
    variants: [],
    primary: ['dorsal'],
    secondary: ['biceps', 'espalda_alta']
  },
  {
    id: 'jalon-cerrado',
    name: 'Jalón agarre cerrado',
    variants: [],
    primary: ['dorsal'],
    secondary: ['biceps']
  },
  {
    id: 'peso-muerto',
    name: 'Peso muerto convencional',
    variants: [],
    primary: ['isquios', 'gluteo', 'lumbar'],
    secondary: ['espalda_alta', 'cuadriceps', 'antebrazo', 'trapecio']
  },
  {
    id: 'rack-pull',
    name: 'Rack pull',
    variants: [],
    primary: ['espalda_alta', 'lumbar'],
    secondary: ['gluteo', 'isquios', 'trapecio', 'antebrazo']
  },
  {
    id: 'encogimientos',
    name: 'Encogimientos de hombros',
    variants: ['Mancuernas', 'Barra', 'Máquina'],
    primary: ['trapecio'],
    secondary: ['antebrazo']
  },
  {
    id: 'hiperextensiones',
    name: 'Hiperextensiones lumbares',
    variants: [],
    primary: ['lumbar'],
    secondary: ['gluteo', 'isquios'],
    bodyweight: true
  },
  // ----- HOMBRO -----
  {
    id: 'press-militar',
    name: 'Press militar',
    variants: ['Barra', 'Mancuernas', 'Máquina'],
    primary: ['deltoide_anterior'],
    secondary: ['triceps', 'deltoide_lateral', 'pecho_superior']
  },
  {
    id: 'elevaciones-frontales',
    name: 'Elevaciones frontales',
    variants: ['Mancuernas', 'Polea', 'Disco'],
    primary: ['deltoide_anterior'],
    secondary: []
  },
  {
    id: 'pajaros',
    name: 'Pájaros (aperturas invertidas)',
    variants: ['Mancuernas', 'Polea'],
    primary: ['deltoide_posterior'],
    secondary: ['espalda_alta', 'trapecio']
  },
  {
    id: 'remo-menton',
    name: 'Remo al mentón',
    variants: ['Barra', 'Polea'],
    primary: ['deltoide_lateral'],
    secondary: ['trapecio', 'biceps']
  },
  // ----- BÍCEPS -----
  {
    id: 'curl-barra',
    name: 'Curl con barra',
    variants: ['Recta', 'Barra Z'],
    primary: ['biceps'],
    secondary: ['antebrazo']
  },
  {
    id: 'curl-alterno',
    name: 'Curl alterno con mancuernas',
    variants: ['De pie', 'Sentado'],
    primary: ['biceps'],
    secondary: ['antebrazo']
  },
  {
    id: 'curl-inclinado',
    name: 'Curl inclinado con mancuernas',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-polea',
    name: 'Curl en polea baja',
    variants: ['Barra', 'Cuerda'],
    primary: ['biceps'],
    secondary: ['antebrazo']
  },
  {
    id: 'curl-bayesian',
    name: 'Curl bayesian en polea',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-concentrado',
    name: 'Curl concentrado',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-arana',
    name: 'Curl araña',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  // ----- TRÍCEPS -----
  {
    id: 'press-frances',
    name: 'Press francés',
    variants: ['Barra Z', 'Mancuernas'],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'extension-cuerda',
    name: 'Extensión con cuerda en polea',
    variants: [],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'press-cerrado',
    name: 'Press de banca agarre cerrado',
    variants: [],
    primary: ['triceps'],
    secondary: ['pecho_inferior', 'deltoide_anterior']
  },
  {
    id: 'fondos-banco',
    name: 'Fondos entre bancos',
    variants: [],
    primary: ['triceps'],
    secondary: ['pecho_inferior', 'deltoide_anterior'],
    bodyweight: true
  },
  {
    id: 'patada-triceps',
    name: 'Patada de tríceps',
    variants: ['Mancuerna', 'Polea'],
    primary: ['triceps'],
    secondary: []
  },
  // ----- ANTEBRAZO -----
  {
    id: 'curl-inverso',
    name: 'Curl inverso',
    variants: ['Barra', 'Polea'],
    primary: ['antebrazo'],
    secondary: ['biceps']
  },
  {
    id: 'curl-muneca',
    name: 'Curl de muñeca',
    variants: [],
    primary: ['antebrazo'],
    secondary: []
  },
  {
    id: 'paseo-granjero',
    name: 'Paseo del granjero',
    variants: [],
    primary: ['antebrazo', 'trapecio'],
    secondary: ['abs']
  },
  // ----- PIERNA -----
  {
    id: 'sentadilla',
    name: 'Sentadilla con barra',
    variants: ['Libre', 'Multipower'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios', 'lumbar', 'abs', 'aductor']
  },
  {
    id: 'sentadilla-frontal',
    name: 'Sentadilla frontal',
    variants: [],
    primary: ['cuadriceps'],
    secondary: ['gluteo', 'abs']
  },
  {
    id: 'prensa',
    name: 'Prensa de piernas',
    variants: ['45º', 'Horizontal'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios', 'aductor']
  },
  {
    id: 'zancadas',
    name: 'Zancadas',
    variants: ['Mancuernas', 'Barra', 'Caminando'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'sentadilla-bulgara',
    name: 'Sentadilla búlgara',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios', 'aductor']
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust',
    variants: ['Barra', 'Máquina'],
    primary: ['gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'patada-gluteo',
    name: 'Patada de glúteo en polea',
    variants: [],
    primary: ['gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'aduccion-maquina',
    name: 'Aducción de cadera en máquina',
    variants: [],
    primary: ['aductor'],
    secondary: []
  },
  {
    id: 'peso-muerto-sumo',
    name: 'Peso muerto sumo',
    variants: [],
    primary: ['gluteo', 'aductor'],
    secondary: ['isquios', 'cuadriceps', 'lumbar']
  },
  {
    id: 'buenos-dias',
    name: 'Buenos días',
    variants: [],
    primary: ['isquios', 'lumbar'],
    secondary: ['gluteo']
  },
  {
    id: 'gemelo-sentado',
    name: 'Gemelo sentado en máquina',
    variants: [],
    primary: ['gemelo'],
    secondary: []
  },
  {
    id: 'gemelo-prensa',
    name: 'Gemelo en prensa',
    variants: [],
    primary: ['gemelo'],
    secondary: []
  },
  // ----- CORE -----
  {
    id: 'crunch-polea',
    name: 'Crunch en polea alta',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos']
  },
  {
    id: 'crunch-maquina',
    name: 'Crunch en máquina',
    variants: [],
    primary: ['abs'],
    secondary: []
  },
  {
    id: 'crunch',
    name: 'Crunch en suelo',
    variants: [],
    primary: ['abs'],
    secondary: [],
    bodyweight: true
  },
  {
    id: 'elevaciones-piernas',
    name: 'Elevaciones de piernas colgado',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'antebrazo'],
    bodyweight: true
  },
  {
    id: 'plancha',
    name: 'Plancha (segundos)',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'lumbar'],
    bodyweight: true
  },
  {
    id: 'rueda-abdominal',
    name: 'Rueda abdominal',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'dorsal', 'lumbar'],
    bodyweight: true
  },
  {
    id: 'giro-ruso',
    name: 'Giro ruso',
    variants: [],
    primary: ['oblicuos'],
    secondary: ['abs']
  },
  {
    id: 'press-pallof',
    name: 'Press Pallof',
    variants: [],
    primary: ['oblicuos'],
    secondary: ['abs']
  },
  {
    id: 'lenador-polea',
    name: 'Leñador en polea',
    variants: [],
    primary: ['oblicuos'],
    secondary: ['abs']
  }
]

// ---------------------------------------------------------------------------
// Regiones para agrupar los selectores de ejercicios
// ---------------------------------------------------------------------------

export type Region =
  | 'Pecho'
  | 'Espalda'
  | 'Hombros'
  | 'Brazos'
  | 'Pierna'
  | 'Core'

const MUSCLE_REGION: Record<MuscleId, Region> = {
  pecho_superior: 'Pecho',
  pecho_inferior: 'Pecho',
  serrato: 'Pecho',
  dorsal: 'Espalda',
  espalda_alta: 'Espalda',
  trapecio: 'Espalda',
  lumbar: 'Espalda',
  deltoide_anterior: 'Hombros',
  deltoide_lateral: 'Hombros',
  deltoide_posterior: 'Hombros',
  biceps: 'Brazos',
  triceps: 'Brazos',
  antebrazo: 'Brazos',
  abs: 'Core',
  oblicuos: 'Core',
  cuadriceps: 'Pierna',
  isquios: 'Pierna',
  gluteo: 'Pierna',
  abductor: 'Pierna',
  aductor: 'Pierna',
  gemelo: 'Pierna'
}

export const REGION_ORDER: Region[] = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Brazos',
  'Pierna',
  'Core'
]

export function exerciseRegion(def: ExerciseDef): Region {
  return def.primary.length > 0 ? MUSCLE_REGION[def.primary[0]] : 'Core'
}
