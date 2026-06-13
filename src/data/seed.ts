import type { AppData, ExerciseDef, Routine } from '../types'
import { catalogExercisesWithVideos, withVariants } from './catalog'

// ---------------------------------------------------------------------------
// Catálogo de ejercicios (con variantes y músculos implicados)
// ---------------------------------------------------------------------------

export const SEED_EXERCISES: ExerciseDef[] = [
  // PUSH
  {
    id: 'press-inclinado',
    name: 'Press inclinado',
    variants: [],
    primary: ['pecho_superior', 'deltoide_anterior'],
    secondary: ['triceps']
  },
  {
    id: 'press-plano',
    name: 'Press plano',
    variants: ['Hammer', 'Technogym'],
    primary: ['pecho_inferior'],
    secondary: ['triceps', 'deltoide_anterior']
  },
  {
    id: 'cruce-poleas',
    name: 'Cruce de poleas',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['pecho_superior']
  },
  {
    id: 'contractora',
    name: 'Contractora',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['pecho_superior']
  },
  {
    id: 'elevaciones-laterales',
    name: 'Elevaciones laterales',
    variants: ['Máquina', 'Libre', 'Polea'],
    primary: ['deltoide_lateral'],
    secondary: []
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    variants: ['Polea', 'Unilateral'],
    primary: ['deltoide_posterior'],
    secondary: ['espalda_alta', 'trapecio']
  },
  {
    id: 'extension-triceps',
    name: 'Extensión de tríceps',
    variants: [],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'extension-triceps-cabeza',
    name: 'Extensión unilateral sobre cabeza',
    variants: [],
    primary: ['triceps'],
    secondary: []
  },
  // PULL
  {
    id: 'pull-ups',
    name: 'Dominadas',
    variants: [],
    primary: ['dorsal'],
    secondary: ['biceps', 'espalda_alta', 'antebrazo'],
    bodyweight: true
  },
  {
    id: 'remo-t',
    name: 'Remo en T',
    variants: [],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps', 'lumbar']
  },
  {
    id: 'jalon',
    name: 'Jalón al pecho',
    variants: [],
    primary: ['dorsal'],
    secondary: ['biceps']
  },
  {
    id: 'jalon-abierto',
    name: 'Jalón abierto',
    variants: [],
    primary: ['dorsal'],
    secondary: ['espalda_alta', 'biceps']
  },
  {
    id: 'contractora-invertida',
    name: 'Contractora invertida',
    variants: [],
    primary: ['deltoide_posterior'],
    secondary: ['espalda_alta']
  },
  {
    id: 'pull-over',
    name: 'Pull over en polea',
    variants: [],
    primary: ['dorsal'],
    secondary: ['triceps', 'serrato']
  },
  {
    id: 'remo-gironda',
    name: 'Remo gironda',
    variants: [],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps']
  },
  {
    id: 'predicador',
    name: 'Curl predicador',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-martillo',
    name: 'Curl martillo',
    variants: ['Máquina', 'Libre', 'Unilateral'],
    primary: ['biceps', 'antebrazo'],
    secondary: []
  },
  // LEG
  {
    id: 'curl-femoral',
    name: 'Curl femoral',
    variants: ['Sentado', 'Tumbado'],
    primary: ['isquios'],
    secondary: ['gemelo']
  },
  {
    id: 'hakka',
    name: 'Sentadilla hack',
    variants: [],
    primary: ['cuadriceps'],
    secondary: ['gluteo', 'aductor']
  },
  {
    id: 'peso-muerto-rumano',
    name: 'Peso muerto rumano',
    variants: [],
    primary: ['isquios', 'gluteo'],
    secondary: ['lumbar']
  },
  {
    id: 'extension-cuadriceps',
    name: 'Extensión de cuádriceps',
    variants: [],
    primary: ['cuadriceps'],
    secondary: []
  },
  {
    id: 'abduccion-gluteo',
    name: 'Abducción de glúteo',
    variants: [],
    primary: ['abductor', 'gluteo'],
    secondary: []
  },
  {
    id: 'gemelo',
    name: 'Elevación de gemelo',
    variants: [],
    primary: ['gemelo'],
    secondary: []
  },
  // PECHO + ESPALDA
  {
    id: 'press-inclinado-mancuernas',
    name: 'Press inclinado mancuernas',
    variants: [],
    primary: ['pecho_superior', 'deltoide_anterior'],
    secondary: ['triceps']
  }
]

/** Vídeos de técnica verificados contra YouTube (oEmbed). Editables por el usuario. */
export const SEED_VIDEOS: Record<string, string> = {
  'press-inclinado': 'https://www.youtube.com/watch?v=pdW4JmCDT7w',
  'press-plano': 'https://www.youtube.com/watch?v=4J5Ww3gXSkI',
  'cruce-poleas': 'https://www.youtube.com/watch?v=XnaMi2Gb_9Q',
  contractora: 'https://www.youtube.com/watch?v=hmZrepX1DqU',
  'elevaciones-laterales': 'https://www.youtube.com/watch?v=aVa9ce3SlSA',
  'face-pull': 'https://www.youtube.com/watch?v=X-xCQ1gh-kA',
  'extension-triceps': 'https://www.youtube.com/watch?v=KQL18Jw9-r4',
  'extension-triceps-cabeza': 'https://www.youtube.com/watch?v=AjH0cP7Lh4k',
  'press-inclinado-mancuernas': 'https://www.youtube.com/watch?v=oTD5g77GgSA',
  'pull-ups': 'https://www.youtube.com/watch?v=vXjICxvES0U',
  'remo-t': 'https://www.youtube.com/watch?v=1WdZRc7m6Tc',
  jalon: 'https://www.youtube.com/watch?v=TIZbG7Tjbf8',
  'jalon-abierto': 'https://www.youtube.com/watch?v=EA42wwLwDgs',
  'contractora-invertida': 'https://www.youtube.com/watch?v=E2uXi3W6ouU',
  'pull-over': 'https://www.youtube.com/watch?v=9YQ1YXKko8s',
  'remo-gironda': 'https://www.youtube.com/watch?v=BADq8JYkehw',
  predicador: 'https://www.youtube.com/watch?v=lXbs6as_TvA',
  'curl-martillo': 'https://www.youtube.com/watch?v=mPvlpDWIoDA',
  'curl-femoral': 'https://www.youtube.com/watch?v=CBCPBnMzsMI',
  hakka: 'https://www.youtube.com/watch?v=VNpkYdex6Yc',
  'peso-muerto-rumano': 'https://www.youtube.com/watch?v=UgqrPwoTick',
  'extension-cuadriceps': 'https://www.youtube.com/watch?v=ndnA6yvGoqQ',
  'abduccion-gluteo': 'https://www.youtube.com/watch?v=2vCRMi-lgJ4',
  gemelo: 'https://www.youtube.com/watch?v=_R3TOH-vnF8'
}

// ---------------------------------------------------------------------------
// Rutinas
// ---------------------------------------------------------------------------

export const SEED_ROUTINES: Routine[] = [
  {
    id: 'push',
    name: 'PUSH',
    exerciseIds: [
      'press-inclinado',
      'press-plano',
      'cruce-poleas',
      'contractora',
      'elevaciones-laterales',
      'face-pull',
      'extension-triceps',
      'extension-triceps-cabeza'
    ]
  },
  {
    id: 'pull',
    name: 'PULL',
    exerciseIds: [
      'pull-ups',
      'remo-t',
      'jalon',
      'contractora-invertida',
      'pull-over',
      'predicador',
      'curl-martillo'
    ]
  },
  {
    id: 'leg',
    name: 'LEG',
    exerciseIds: [
      'curl-femoral',
      'hakka',
      'peso-muerto-rumano',
      'extension-cuadriceps',
      'abduccion-gluteo',
      'gemelo'
    ]
  },
  {
    id: 'pecho-espalda',
    name: 'PECHO · ESPALDA',
    exerciseIds: [
      'press-inclinado-mancuernas',
      'contractora',
      'cruce-poleas',
      'jalon-abierto',
      'remo-gironda',
      'pull-over'
    ]
  }
]

export function seedExercisesWithVideos(): ExerciseDef[] {
  return SEED_EXERCISES.map((e) => {
    const withVid = SEED_VIDEOS[e.id] ? { ...e, videoUrl: SEED_VIDEOS[e.id] } : e
    return withVariants(withVid)
  })
}

export function buildSeedData(): AppData {
  // Contenido de fábrica para CUALQUIER usuario: rutinas-plantilla y el
  // catálogo completo, con historial y perfil vacíos. Así, al instalar la app
  // (o tras borrar los datos), cada persona empieza de cero y la personaliza.
  return {
    version: 7,
    exercises: [...seedExercisesWithVideos(), ...catalogExercisesWithVideos()],
    routines: SEED_ROUTINES,
    programs: [
      {
        id: 'prog-default',
        name: 'PPL + Pecho/Espalda',
        dayIds: SEED_ROUTINES.map((r) => r.id),
        daysPerWeek: SEED_ROUTINES.length
      }
    ],
    sessions: [],
    settings: {
      creatineEnabled: true,
      creatineHour: '09:00',
      creatineTaken: [],
      restSeconds: 120
    },
    profile: { pesoLog: [] }
  }
}
