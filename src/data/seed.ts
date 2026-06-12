import type { AppData, ExerciseDef, Routine, Session, SetEntry } from '../types'
import { catalogExercisesWithVideos } from './catalog'

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

// ---------------------------------------------------------------------------
// Sesiones iniciales: tus apuntes del bloc de notas, tal cual, con fecha de
// la última semana. Sirven de referencia ("última vez") para tu próximo entreno.
// ---------------------------------------------------------------------------

const s = (weight: number, reps: number, extra?: Partial<SetEntry>): SetEntry => ({
  weight,
  reps,
  done: true,
  ...extra
})

function daysAgo(n: number, hour = 18): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 30, 0, 0)
  return d.toISOString()
}

export function buildSeedSessions(): Session[] {
  return [
    {
      id: 'seed-pecho-espalda',
      date: daysAgo(6),
      routineId: 'pecho-espalda',
      routineName: 'PECHO · ESPALDA',
      finished: true,
      durationMin: 70,
      exercises: [
        {
          exerciseId: 'press-inclinado-mancuernas',
          sets: [s(26, 12), s(30, 5), s(26, 9)]
        },
        { exerciseId: 'contractora', sets: [s(40, 12), s(40, 13)] },
        { exerciseId: 'cruce-poleas', sets: [s(12, 15), s(12, 11), s(12, 9)] },
        { exerciseId: 'jalon-abierto', sets: [s(70, 11), s(75, 8), s(65, 9)] },
        { exerciseId: 'remo-gironda', sets: [s(50, 9), s(50, 11), s(50, 8)] },
        { exerciseId: 'pull-over', sets: [s(21, 7)] }
      ]
    },
    {
      id: 'seed-push',
      date: daysAgo(3),
      routineId: 'push',
      routineName: 'PUSH',
      finished: true,
      durationMin: 75,
      exercises: [
        { exerciseId: 'press-inclinado', sets: [s(90, 12), s(100, 6), s(80, 9)] },
        {
          exerciseId: 'press-plano',
          variant: 'Hammer',
          sets: [s(60, 12), s(60, 8), s(60, 7)]
        },
        {
          exerciseId: 'press-plano',
          variant: 'Technogym',
          sets: [s(80, 7), s(80, 7, { tag: 'dropset', dropWeight: 60, dropReps: 5 })]
        },
        { exerciseId: 'cruce-poleas', sets: [s(12, 14), s(15, 8), s(15, 7)] },
        { exerciseId: 'contractora', sets: [s(45, 11), s(50, 10), s(50, 7)] },
        {
          exerciseId: 'elevaciones-laterales',
          variant: 'Libre',
          sets: [s(12, 11), s(12, 10), s(12, 9, { tag: 'dropset', dropWeight: 8, dropReps: 6 })]
        },
        {
          exerciseId: 'elevaciones-laterales',
          variant: 'Polea',
          sets: [s(10.5, 12), s(9, 11), s(9, 11)]
        },
        {
          exerciseId: 'face-pull',
          variant: 'Polea',
          sets: [s(30, 12), s(35, 11), s(35, 9)]
        },
        {
          exerciseId: 'face-pull',
          variant: 'Unilateral',
          sets: [s(12, 12), s(15, 10), s(15, 9)]
        },
        {
          exerciseId: 'extension-triceps',
          sets: [s(36, 12), s(39, 8), s(39, 7, { tag: 'dropset', dropWeight: 30, dropReps: 5 })]
        },
        {
          exerciseId: 'extension-triceps-cabeza',
          sets: [s(16.5, 10), s(16.5, 11), s(15, 9)]
        }
      ]
    },
    {
      id: 'seed-pull',
      date: daysAgo(2),
      routineId: 'pull',
      routineName: 'PULL',
      finished: true,
      durationMin: 70,
      exercises: [
        {
          exerciseId: 'pull-ups',
          sets: [s(0, 11), s(0, 7), s(0, 6, { tag: 'negativas', negReps: 3 })]
        },
        { exerciseId: 'remo-t', sets: [s(55, 11), s(60, 8), s(50, 9)] },
        { exerciseId: 'jalon', sets: [s(70, 10), s(70, 9)] },
        { exerciseId: 'contractora-invertida', sets: [s(80, 11), s(80, 8)] },
        { exerciseId: 'pull-over', sets: [s(24, 11), s(24, 9)] },
        { exerciseId: 'predicador', sets: [s(40, 8), s(40, 5), s(30, 6)] },
        {
          exerciseId: 'curl-martillo',
          variant: 'Máquina',
          sets: [s(24, 11), s(27, 7), s(24, 6, { tag: 'dropset', dropWeight: 18, dropReps: 5 })]
        },
        {
          exerciseId: 'curl-martillo',
          variant: 'Libre',
          sets: [s(17.5, 11), s(17.5, 9)]
        },
        {
          exerciseId: 'curl-martillo',
          variant: 'Unilateral',
          sets: [s(12, 8), s(12, 8)]
        }
      ]
    },
    {
      id: 'seed-leg',
      date: daysAgo(1),
      routineId: 'leg',
      routineName: 'LEG',
      finished: true,
      durationMin: 65,
      exercises: [
        {
          exerciseId: 'curl-femoral',
          variant: 'Sentado',
          sets: [s(55, 14), s(60, 9), s(50, 11)]
        },
        {
          exerciseId: 'curl-femoral',
          variant: 'Tumbado',
          sets: [s(50, 11), s(50, 9), s(45, 7)]
        },
        { exerciseId: 'hakka', sets: [s(60, 10), s(80, 5), s(60, 7)] },
        { exerciseId: 'peso-muerto-rumano', sets: [s(80, 11), s(100, 7), s(100, 5)] },
        {
          exerciseId: 'extension-cuadriceps',
          sets: [s(100, 14), s(110, 10), s(110, 6, { tag: 'dropset', dropWeight: 80, dropReps: 6 })]
        },
        { exerciseId: 'abduccion-gluteo', sets: [s(65, 18), s(70, 14), s(70, 10)] },
        { exerciseId: 'gemelo', sets: [s(120, 19), s(120, 10)] }
      ]
    }
  ]
}

export function seedExercisesWithVideos(): ExerciseDef[] {
  return SEED_EXERCISES.map((e) =>
    SEED_VIDEOS[e.id] ? { ...e, videoUrl: SEED_VIDEOS[e.id] } : e
  )
}

export function buildSeedData(): AppData {
  return {
    version: 4,
    exercises: [...seedExercisesWithVideos(), ...catalogExercisesWithVideos()],
    routines: SEED_ROUTINES,
    sessions: buildSeedSessions(),
    settings: {
      creatineEnabled: true,
      creatineHour: '09:00',
      creatineTaken: [],
      restSeconds: 120
    },
    profile: { pesoLog: [] }
  }
}
