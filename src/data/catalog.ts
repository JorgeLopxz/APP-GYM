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
  },

  // ===== AMPLIACIÓN v2 =====
  // ----- PECHO -----
  {
    id: 'press-inclinado-barra',
    name: 'Press inclinado con barra',
    variants: [],
    primary: ['pecho_superior', 'deltoide_anterior'],
    secondary: ['triceps']
  },
  {
    id: 'floor-press',
    name: 'Press en el suelo',
    variants: ['Barra', 'Mancuernas'],
    primary: ['pecho_inferior', 'triceps'],
    secondary: ['deltoide_anterior']
  },
  {
    id: 'svend-press',
    name: 'Svend press',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['pecho_superior']
  },
  // ----- ESPALDA -----
  {
    id: 'remo-pendlay',
    name: 'Remo Pendlay',
    variants: [],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps', 'lumbar']
  },
  {
    id: 'jalon-supino',
    name: 'Jalón supino',
    variants: [],
    primary: ['dorsal', 'biceps'],
    secondary: []
  },
  {
    id: 'remo-yates',
    name: 'Remo Yates',
    variants: [],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps']
  },
  {
    id: 'pullover-maquina',
    name: 'Pull-over en máquina',
    variants: [],
    primary: ['dorsal'],
    secondary: ['serrato']
  },
  {
    id: 'remo-invertido',
    name: 'Remo invertido (australiano)',
    variants: [],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps'],
    bodyweight: true
  },
  // ----- HOMBRO -----
  {
    id: 'press-arnold',
    name: 'Press Arnold',
    variants: [],
    primary: ['deltoide_anterior', 'deltoide_lateral'],
    secondary: ['triceps']
  },
  {
    id: 'elevacion-lateral-tumbado',
    name: 'Elevación lateral tumbado',
    variants: [],
    primary: ['deltoide_lateral'],
    secondary: []
  },
  {
    id: 'press-landmine',
    name: 'Press landmine',
    variants: [],
    primary: ['deltoide_anterior', 'pecho_superior'],
    secondary: ['triceps']
  },
  {
    id: 'y-raise',
    name: 'Y-raise',
    variants: [],
    primary: ['deltoide_posterior', 'espalda_alta'],
    secondary: ['trapecio']
  },
  // ----- BÍCEPS -----
  {
    id: 'curl-21',
    name: 'Curl 21s',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-polea-alta',
    name: 'Curl en polea alta',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-banco-scott-maquina',
    name: 'Curl en máquina (Scott)',
    variants: [],
    primary: ['biceps'],
    secondary: []
  },
  {
    id: 'curl-martillo-cuerda',
    name: 'Curl martillo en polea con cuerda',
    variants: [],
    primary: ['biceps', 'antebrazo'],
    secondary: []
  },
  // ----- TRÍCEPS -----
  {
    id: 'extension-triceps-unilateral',
    name: 'Extensión de tríceps unilateral en polea',
    variants: [],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'press-tate',
    name: 'Press Tate',
    variants: [],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'fondos-maquina',
    name: 'Fondos en máquina',
    variants: [],
    primary: ['triceps', 'pecho_inferior'],
    secondary: ['deltoide_anterior']
  },
  // ----- TRAPECIO -----
  {
    id: 'encogimiento-polea',
    name: 'Encogimiento en polea',
    variants: [],
    primary: ['trapecio'],
    secondary: ['antebrazo']
  },
  // ----- PIERNA -----
  {
    id: 'sentadilla-goblet',
    name: 'Sentadilla goblet',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['aductor']
  },
  {
    id: 'peso-muerto-rigido',
    name: 'Peso muerto a piernas rígidas',
    variants: [],
    primary: ['isquios', 'gluteo'],
    secondary: ['lumbar']
  },
  {
    id: 'step-up',
    name: 'Subida al cajón (step-up)',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'hip-thrust-unilateral',
    name: 'Hip thrust a una pierna',
    variants: [],
    primary: ['gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'prensa-unilateral',
    name: 'Prensa a una pierna',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios', 'aductor']
  },
  {
    id: 'sentadilla-sissy',
    name: 'Sentadilla sissy',
    variants: [],
    primary: ['cuadriceps'],
    secondary: [],
    bodyweight: true
  },
  {
    id: 'abductores-maquina',
    name: 'Abductores en máquina',
    variants: [],
    primary: ['abductor', 'gluteo'],
    secondary: []
  },
  {
    id: 'zancada-reversa',
    name: 'Zancada inversa',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'curl-femoral-unilateral',
    name: 'Curl femoral unilateral',
    variants: [],
    primary: ['isquios'],
    secondary: ['gemelo']
  },
  {
    id: 'extension-cuadriceps-unilateral',
    name: 'Extensión de cuádriceps unilateral',
    variants: [],
    primary: ['cuadriceps'],
    secondary: []
  },
  // ----- CORE -----
  {
    id: 'elevacion-piernas-tumbado',
    name: 'Elevación de piernas tumbado',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos'],
    bodyweight: true
  },
  {
    id: 'plancha-lateral',
    name: 'Plancha lateral (segundos)',
    variants: [],
    primary: ['oblicuos', 'abs'],
    secondary: [],
    bodyweight: true
  },
  {
    id: 'bicicleta-abdominal',
    name: 'Bicicleta abdominal',
    variants: [],
    primary: ['abs', 'oblicuos'],
    secondary: [],
    bodyweight: true
  },
  {
    id: 'mountain-climbers',
    name: 'Escaladores (mountain climbers)',
    variants: [],
    primary: ['abs', 'oblicuos'],
    secondary: ['cuadriceps'],
    bodyweight: true
  },
  {
    id: 'dragon-flag',
    name: 'Dragon flag',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos'],
    bodyweight: true
  },
  {
    id: 'press-pike',
    name: 'Flexión pike',
    variants: [],
    primary: ['deltoide_anterior'],
    secondary: ['triceps', 'pecho_superior'],
    bodyweight: true
  },

  // ===== AMPLIACIÓN v3: máquinas, clásicos que faltaban y funcional =====
  // ----- PECHO -----
  {
    id: 'press-convergente',
    name: 'Press convergente en máquina',
    variants: ['Plano', 'Inclinado', 'Declinado', 'Unilateral'],
    primary: ['pecho_inferior'],
    secondary: ['pecho_superior', 'triceps', 'deltoide_anterior']
  },
  {
    id: 'aperturas-polea-inclinado',
    name: 'Aperturas en polea sobre banco inclinado',
    variants: [],
    primary: ['pecho_superior'],
    secondary: ['deltoide_anterior']
  },
  {
    id: 'press-hex',
    name: 'Press hex con mancuernas',
    variants: [],
    primary: ['pecho_inferior'],
    secondary: ['triceps', 'pecho_superior']
  },
  // ----- ESPALDA -----
  {
    id: 'remo-pecho-apoyado',
    name: 'Remo con pecho apoyado',
    variants: ['Mancuernas en banco', 'Máquina', 'Barra T'],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps', 'deltoide_posterior']
  },
  {
    id: 'remo-seal',
    name: 'Remo Seal',
    variants: ['Barra', 'Mancuernas'],
    primary: ['espalda_alta', 'dorsal'],
    secondary: ['biceps', 'deltoide_posterior']
  },
  {
    id: 'remo-meadows',
    name: 'Remo Meadows',
    variants: [],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps', 'deltoide_posterior', 'antebrazo']
  },
  {
    id: 'remo-alto-maquina',
    name: 'Remo alto en máquina',
    variants: ['Bilateral', 'Unilateral'],
    primary: ['dorsal', 'espalda_alta'],
    secondary: ['biceps', 'deltoide_posterior']
  },
  {
    id: 'jalon-unilateral',
    name: 'Jalón unilateral en polea',
    variants: ['Sentado', 'De rodillas', 'De pie'],
    primary: ['dorsal'],
    secondary: ['biceps', 'espalda_alta']
  },
  {
    id: 'jalon-maquina',
    name: 'Jalón en máquina convergente',
    variants: ['Bilateral', 'Unilateral'],
    primary: ['dorsal'],
    secondary: ['biceps', 'espalda_alta']
  },
  {
    id: 'muscle-up',
    name: 'Muscle-up',
    variants: ['Barra', 'Anillas'],
    primary: ['dorsal', 'triceps'],
    secondary: ['pecho_inferior', 'biceps', 'espalda_alta', 'abs'],
    bodyweight: true
  },
  {
    id: 'peso-muerto-hexagonal',
    name: 'Peso muerto con barra hexagonal',
    variants: ['Asas altas', 'Asas bajas'],
    primary: ['cuadriceps', 'gluteo', 'isquios'],
    secondary: ['lumbar', 'trapecio', 'antebrazo', 'espalda_alta']
  },
  {
    id: 'extension-lumbar-maquina',
    name: 'Extensión lumbar en máquina',
    variants: [],
    primary: ['lumbar'],
    secondary: ['gluteo', 'isquios']
  },
  {
    id: 'superman',
    name: 'Superman',
    variants: [],
    primary: ['lumbar'],
    secondary: ['gluteo', 'espalda_alta'],
    bodyweight: true
  },
  {
    id: 'remo-renegado',
    name: 'Remo renegado',
    variants: [],
    primary: ['dorsal', 'abs'],
    secondary: ['espalda_alta', 'oblicuos', 'triceps', 'biceps']
  },
  // ----- HOMBROS -----
  {
    id: 'press-z',
    name: 'Press Z',
    variants: ['Barra', 'Mancuernas'],
    primary: ['deltoide_anterior'],
    secondary: ['triceps', 'deltoide_lateral', 'abs', 'espalda_alta']
  },
  {
    id: 'push-press',
    name: 'Push press',
    variants: [],
    primary: ['deltoide_anterior'],
    secondary: ['triceps', 'cuadriceps', 'gluteo', 'deltoide_lateral', 'trapecio']
  },
  {
    id: 'rotacion-externa-polea',
    name: 'Rotación externa de hombro en polea',
    variants: ['Polea', 'Banda'],
    primary: ['deltoide_posterior'],
    secondary: ['espalda_alta']
  },
  {
    id: 'press-cubano',
    name: 'Press cubano',
    variants: [],
    primary: ['deltoide_posterior', 'deltoide_lateral'],
    secondary: ['espalda_alta', 'trapecio']
  },
  {
    id: 'flexiones-pino',
    name: 'Flexiones en pino',
    variants: ['Contra la pared', 'Libres', 'Déficit'],
    primary: ['deltoide_anterior', 'triceps'],
    secondary: ['deltoide_lateral', 'trapecio', 'pecho_superior'],
    bodyweight: true
  },
  // ----- BRAZOS -----
  {
    id: 'curl-arrastrado',
    name: 'Curl arrastrado (drag curl)',
    variants: ['Barra', 'Barra Z'],
    primary: ['biceps'],
    secondary: ['antebrazo']
  },
  {
    id: 'curl-zottman',
    name: 'Curl Zottman',
    variants: [],
    primary: ['biceps', 'antebrazo'],
    secondary: []
  },
  {
    id: 'extension-triceps-maquina',
    name: 'Extensión de tríceps en máquina',
    variants: ['Bilateral', 'Unilateral'],
    primary: ['triceps'],
    secondary: []
  },
  {
    id: 'press-jm',
    name: 'Press JM',
    variants: ['Barra', 'Multipower'],
    primary: ['triceps'],
    secondary: ['pecho_inferior']
  },
  {
    id: 'curl-muneca-inverso',
    name: 'Curl de muñeca inverso',
    variants: ['Barra', 'Mancuernas'],
    primary: ['antebrazo'],
    secondary: []
  },
  {
    id: 'rodillo-muneca',
    name: 'Rodillo de muñeca',
    variants: [],
    primary: ['antebrazo'],
    secondary: ['deltoide_anterior']
  },
  {
    id: 'colgarse-barra',
    name: 'Colgarse de la barra (segundos)',
    variants: ['Dos manos', 'Una mano'],
    primary: ['antebrazo'],
    secondary: ['dorsal', 'trapecio'],
    bodyweight: true
  },
  // ----- PIERNA -----
  {
    id: 'sentadilla-pendulo',
    name: 'Sentadilla péndulo',
    variants: ['Normal', 'Talones elevados'],
    primary: ['cuadriceps'],
    secondary: ['gluteo', 'aductor']
  },
  {
    id: 'sentadilla-cinturon',
    name: 'Sentadilla con cinturón (belt squat)',
    variants: [],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['aductor', 'isquios']
  },
  {
    id: 'pistol',
    name: 'Sentadilla a una pierna (pistol)',
    variants: ['Libre', 'Asistida', 'Al cajón'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['abs', 'aductor'],
    bodyweight: true
  },
  {
    id: 'sentadilla-cosaca',
    name: 'Sentadilla cosaca',
    variants: ['Peso corporal', 'Kettlebell'],
    primary: ['aductor', 'cuadriceps'],
    secondary: ['gluteo', 'isquios']
  },
  {
    id: 'sentadilla-pared',
    name: 'Sentadilla isométrica en pared (segundos)',
    variants: [],
    primary: ['cuadriceps'],
    secondary: ['gluteo'],
    bodyweight: true
  },
  {
    id: 'zancada-lateral',
    name: 'Zancada lateral',
    variants: ['Peso corporal', 'Mancuernas', 'Kettlebell'],
    primary: ['cuadriceps', 'aductor'],
    secondary: ['gluteo']
  },
  {
    id: 'salto-cajon',
    name: 'Salto al cajón',
    variants: ['Bajo', 'Medio', 'Alto'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['gemelo', 'isquios'],
    bodyweight: true
  },
  {
    id: 'curl-nordico',
    name: 'Curl nórdico',
    variants: ['Libre', 'Asistido con banda'],
    primary: ['isquios'],
    secondary: ['gluteo', 'gemelo'],
    bodyweight: true
  },
  {
    id: 'glute-ham-raise',
    name: 'Glute-ham raise (GHR)',
    variants: [],
    primary: ['isquios'],
    secondary: ['gluteo', 'gemelo', 'lumbar'],
    bodyweight: true
  },
  {
    id: 'peso-muerto-unilateral',
    name: 'Peso muerto rumano a una pierna',
    variants: ['Mancuerna', 'Kettlebell', 'Barra'],
    primary: ['isquios', 'gluteo'],
    secondary: ['lumbar', 'abductor']
  },
  {
    id: 'puente-gluteo',
    name: 'Puente de glúteo',
    variants: ['Peso corporal', 'Barra', 'Mancuerna', 'Unilateral'],
    primary: ['gluteo'],
    secondary: ['isquios']
  },
  {
    id: 'pull-through',
    name: 'Pull-through en polea',
    variants: [],
    primary: ['gluteo', 'isquios'],
    secondary: ['lumbar']
  },
  {
    id: 'hiperextension-inversa',
    name: 'Hiperextensión inversa',
    variants: ['Máquina', 'En banco'],
    primary: ['gluteo', 'lumbar'],
    secondary: ['isquios']
  },
  {
    id: 'kettlebell-swing',
    name: 'Swing con kettlebell',
    variants: ['A dos manos', 'A una mano'],
    primary: ['gluteo', 'isquios'],
    secondary: ['lumbar', 'abs', 'deltoide_anterior', 'antebrazo']
  },
  // ----- CORE -----
  {
    id: 'crunch-inverso',
    name: 'Crunch inverso',
    variants: ['Suelo', 'Banco declinado'],
    primary: ['abs'],
    secondary: ['oblicuos'],
    bodyweight: true
  },
  {
    id: 'pies-a-la-barra',
    name: 'Pies a la barra (toes to bar)',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'dorsal', 'antebrazo'],
    bodyweight: true
  },
  {
    id: 'v-ups',
    name: 'V-ups (navajas)',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'cuadriceps'],
    bodyweight: true
  },
  {
    id: 'hollow-hold',
    name: 'Hollow hold (segundos)',
    variants: ['Completo', 'Rodillas flexionadas'],
    primary: ['abs'],
    secondary: ['oblicuos'],
    bodyweight: true
  },
  {
    id: 'l-sit',
    name: 'L-sit (segundos)',
    variants: ['Paralelas', 'Suelo'],
    primary: ['abs'],
    secondary: ['cuadriceps', 'triceps'],
    bodyweight: true
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    variants: [],
    primary: ['abs'],
    secondary: ['oblicuos', 'lumbar'],
    bodyweight: true
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    variants: [],
    primary: ['lumbar', 'abs'],
    secondary: ['gluteo', 'deltoide_posterior'],
    bodyweight: true
  },
  {
    id: 'plancha-copenhague',
    name: 'Plancha Copenhague (segundos)',
    variants: ['Rodilla apoyada', 'Pierna estirada'],
    primary: ['aductor', 'oblicuos'],
    secondary: ['abs'],
    bodyweight: true
  },
  {
    id: 'flexion-lateral',
    name: 'Flexión lateral con mancuerna',
    variants: ['Mancuerna', 'Polea'],
    primary: ['oblicuos'],
    secondary: ['lumbar']
  },
  {
    id: 'rotacion-tronco-maquina',
    name: 'Rotación de tronco en máquina',
    variants: [],
    primary: ['oblicuos'],
    secondary: ['abs']
  },
  {
    id: 'paseo-maleta',
    name: 'Paseo de maleta',
    variants: ['Mancuerna', 'Kettlebell'],
    primary: ['oblicuos'],
    secondary: ['antebrazo', 'trapecio', 'abs']
  },
  // ----- FUNCIONAL -----
  {
    id: 'cargada-potencia',
    name: 'Cargada de potencia (power clean)',
    variants: [],
    primary: ['gluteo', 'isquios', 'trapecio'],
    secondary: ['cuadriceps', 'lumbar', 'espalda_alta', 'deltoide_anterior']
  },
  {
    id: 'thruster',
    name: 'Thruster',
    variants: ['Barra', 'Mancuernas'],
    primary: ['cuadriceps', 'deltoide_anterior'],
    secondary: ['gluteo', 'triceps', 'abs']
  },
  {
    id: 'burpees',
    name: 'Burpees',
    variants: ['Con salto', 'Sin flexión'],
    primary: ['cuadriceps', 'pecho_inferior'],
    secondary: ['gluteo', 'triceps', 'abs', 'deltoide_anterior'],
    bodyweight: true
  },
  {
    id: 'empuje-trineo',
    name: 'Empuje de trineo',
    variants: ['Brazos altos', 'Brazos bajos'],
    primary: ['cuadriceps', 'gluteo'],
    secondary: ['gemelo', 'isquios', 'abs']
  },
  {
    id: 'levantamiento-turco',
    name: 'Levantamiento turco (get-up)',
    variants: ['Kettlebell', 'Mancuerna'],
    primary: ['abs', 'deltoide_anterior'],
    secondary: ['oblicuos', 'gluteo', 'triceps', 'cuadriceps']
  }
]

// ---------------------------------------------------------------------------
// Vídeos de técnica verificados contra YouTube (oEmbed) para el catálogo
// ---------------------------------------------------------------------------

const CATALOG_VIDEOS_V7: Record<string, string> = {
  'press-banca-barra': 'https://www.youtube.com/watch?v=GeLq8cMODLc',
  'press-plano-mancuernas': 'https://www.youtube.com/watch?v=W-qU8CF-WeU',
  'press-declinado': 'https://www.youtube.com/watch?v=V6jmxAiA1zQ',
  'press-multipower': 'https://www.youtube.com/watch?v=C8mAB81wZLw',
  'aperturas-mancuernas': 'https://www.youtube.com/watch?v=kgt1Ik1yXpk',
  'fondos-paralelas': 'https://www.youtube.com/watch?v=OgjaUueRiII',
  flexiones: 'https://www.youtube.com/watch?v=5HL5WY0WVJQ',
  'pullover-mancuerna': 'https://www.youtube.com/watch?v=5XO5KyDUAbE',
  'remo-barra': 'https://www.youtube.com/watch?v=3uiWjik2yEQ',
  'remo-mancuerna': 'https://www.youtube.com/watch?v=IKoEsubNp9E',
  'remo-maquina': 'https://www.youtube.com/watch?v=VWyhefUKTp4',
  'dominadas-supinas': 'https://www.youtube.com/watch?v=SG_gvhrRokw',
  'dominadas-asistidas': 'https://www.youtube.com/watch?v=lgE47t3dr2Q',
  'jalon-cerrado': 'https://www.youtube.com/watch?v=kFviCHFLlrk',
  'peso-muerto': 'https://www.youtube.com/watch?v=7KL8SgCP4KQ',
  'rack-pull': 'https://www.youtube.com/watch?v=hVySiRANg-g',
  encogimientos: 'https://www.youtube.com/watch?v=lsWCVukYaPA',
  hiperextensiones: 'https://www.youtube.com/watch?v=ye-dpRzXaOg',
  'press-militar': 'https://www.youtube.com/watch?v=WREUHExSxDc',
  'elevaciones-frontales': 'https://www.youtube.com/watch?v=g58tMyz5Pro',
  pajaros: 'https://www.youtube.com/watch?v=RG_41P2hP0s',
  'remo-menton': 'https://www.youtube.com/watch?v=bB-U7g5vrAQ',
  'curl-inverso': 'https://www.youtube.com/watch?v=OO6UEVoZ7EM',
  'curl-muneca': 'https://www.youtube.com/watch?v=H194guwZGTo',
  'paseo-granjero': 'https://www.youtube.com/watch?v=fG6rLchLpuU',
  'curl-barra': 'https://www.youtube.com/watch?v=uDLZNOqv3EA',
  'curl-alterno': 'https://www.youtube.com/watch?v=wG7xgzNIjHI',
  'curl-inclinado': 'https://www.youtube.com/watch?v=ZY19YNmm7tQ',
  'curl-polea': 'https://www.youtube.com/watch?v=vpIQHsHU82Q',
  'curl-bayesian': 'https://www.youtube.com/watch?v=6zrTd3FCgDk',
  'curl-concentrado': 'https://www.youtube.com/watch?v=WdbkH_k5DWs',
  'curl-arana': 'https://www.youtube.com/watch?v=XitoKCUTqVg',
  'press-frances': 'https://www.youtube.com/watch?v=uHFj6nD8_84',
  'extension-cuerda': 'https://www.youtube.com/watch?v=8Y5OdjN0Ac0',
  'press-cerrado': 'https://www.youtube.com/watch?v=lTZkcejjFl0',
  'fondos-banco': 'https://www.youtube.com/watch?v=V1K9BFx9OeM',
  'patada-triceps': 'https://www.youtube.com/watch?v=BhXYRgN3kg8',
  sentadilla: 'https://www.youtube.com/watch?v=OySgsMhs2pk',
  'sentadilla-frontal': 'https://www.youtube.com/watch?v=v_nvYjpX-iY',
  prensa: 'https://www.youtube.com/watch?v=hl-EJUQ2yuc',
  zancadas: 'https://www.youtube.com/watch?v=FtNBlVNKrs0',
  'sentadilla-bulgara': 'https://www.youtube.com/watch?v=IdilLr9nyuQ',
  'hip-thrust': 'https://www.youtube.com/watch?v=8RcEpMQ93Y8',
  'patada-gluteo': 'https://www.youtube.com/watch?v=cZ_PxaP6MKY',
  'aduccion-maquina': 'https://www.youtube.com/watch?v=wyPbVJS7oYw',
  'peso-muerto-sumo': 'https://www.youtube.com/watch?v=6ktoPBJasHA',
  'buenos-dias': 'https://www.youtube.com/watch?v=3QTVbkT30E0',
  'gemelo-sentado': 'https://www.youtube.com/watch?v=6KKDFgOKZY0',
  'gemelo-prensa': 'https://www.youtube.com/watch?v=MHOOxYDnlis',
  'crunch-polea': 'https://www.youtube.com/watch?v=nKdVI-LXKzs',
  'crunch-maquina': 'https://www.youtube.com/watch?v=dJqB4oA4sdA',
  crunch: 'https://www.youtube.com/watch?v=hl9Yu7UZqHU',
  'elevaciones-piernas': 'https://www.youtube.com/watch?v=yJW8Gsovjfo',
  plancha: 'https://www.youtube.com/watch?v=d0atctiI7Vw',
  'rueda-abdominal': 'https://www.youtube.com/watch?v=b01FmYynI2o',
  'giro-ruso': 'https://www.youtube.com/watch?v=hdSyLWfRJHc',
  'press-pallof': 'https://www.youtube.com/watch?v=c-byXbLkWzY',
  'lenador-polea': 'https://www.youtube.com/watch?v=JeUcK5zsPQI',

  // ===== AMPLIACIÓN v2 (verificados vía oEmbed) =====
  'press-inclinado-barra': 'https://www.youtube.com/watch?v=JR2Ct-AuQwc',
  'floor-press': 'https://www.youtube.com/watch?v=EVAsE0sX5f0',
  'svend-press': 'https://www.youtube.com/watch?v=o8XHhCGgr6U',
  'remo-pendlay': 'https://www.youtube.com/watch?v=E_DbV5sblwk',
  'jalon-supino': 'https://www.youtube.com/watch?v=Pnq0YrmShsA',
  'remo-yates': 'https://www.youtube.com/watch?v=khYnACeVeUM',
  'pullover-maquina': 'https://www.youtube.com/watch?v=1TzycULDGik',
  'remo-invertido': 'https://www.youtube.com/watch?v=tE22yTUcRHA',
  'press-arnold': 'https://www.youtube.com/watch?v=l5tNUbpusCA',
  'elevacion-lateral-tumbado': 'https://www.youtube.com/watch?v=ltiJ8MN-tfo',
  'press-landmine': 'https://www.youtube.com/watch?v=mVF9ZGbt9rQ',
  'y-raise': 'https://www.youtube.com/watch?v=B-55t_OcHKA',
  'curl-21': 'https://www.youtube.com/watch?v=0AzOIeoJaRw',
  'curl-polea-alta': 'https://www.youtube.com/watch?v=nQNNT6tYcPw',
  'curl-banco-scott-maquina': 'https://www.youtube.com/watch?v=GgM96o7piKQ',
  'extension-triceps-unilateral': 'https://www.youtube.com/watch?v=pP82JKzveME',
  'press-tate': 'https://www.youtube.com/watch?v=e_3pU2cKZrA',
  'fondos-maquina': 'https://www.youtube.com/watch?v=8V25cDaBtJk',
  'encogimiento-polea': 'https://www.youtube.com/watch?v=mqTvt5xLFIY',
  'curl-martillo-cuerda': 'https://www.youtube.com/watch?v=jSwKckhYAOA',
  'press-pike': 'https://www.youtube.com/watch?v=xMvv9gFxCBM',
  'sentadilla-goblet': 'https://www.youtube.com/watch?v=5HHITKuLxUs',
  'peso-muerto-rigido': 'https://www.youtube.com/watch?v=ZdB9kzyz-Lc',
  'step-up': 'https://www.youtube.com/watch?v=DbEqoeGwFfE',
  'hip-thrust-unilateral': 'https://www.youtube.com/watch?v=ip6oZWQDkOU',
  'prensa-unilateral': 'https://www.youtube.com/watch?v=YbW1c1FWY_g',
  'sentadilla-sissy': 'https://www.youtube.com/watch?v=kgVPBt4d3ok',
  'abductores-maquina': 'https://www.youtube.com/watch?v=2vCRMi-lgJ4',
  'zancada-reversa': 'https://www.youtube.com/watch?v=kC1-fxLUt0g',
  'curl-femoral-unilateral': 'https://www.youtube.com/watch?v=tQZkJ9GZZRI',
  'extension-cuadriceps-unilateral': 'https://www.youtube.com/watch?v=r7ZMTzfiICA',
  'elevacion-piernas-tumbado': 'https://www.youtube.com/watch?v=oxJj5FoBycQ',
  'plancha-lateral': 'https://www.youtube.com/watch?v=kyOeSuh7LLo',
  'bicicleta-abdominal': 'https://www.youtube.com/watch?v=dYxamPVcKvk',
  'mountain-climbers': 'https://www.youtube.com/watch?v=mHg0OEUnLhw',
  'dragon-flag': 'https://www.youtube.com/watch?v=8d0sQcw9xik'
}

/**
 * v8: vídeos CORTOS (casi todos < 2,5 min) para los ejercicios nuevos y para
 * sustituir los que duraban más de 5 minutos. Verificados vía oEmbed.
 */
const VIDEOS_V8: Record<string, string> = {
  // sustitutos cortos de vídeos largos
  'aperturas-mancuernas': 'https://www.youtube.com/watch?v=LHkxanQKCZI',
  'press-cerrado': 'https://www.youtube.com/watch?v=EIlRudvdlIY',
  'jalon-supino': 'https://www.youtube.com/watch?v=SnLxcN1x3LU',
  'sentadilla-sissy': 'https://www.youtube.com/watch?v=IU6w5NDjNxE',
  'fondos-banco': 'https://www.youtube.com/watch?v=H6r0fh2-YNU',
  'pullover-mancuerna': 'https://www.youtube.com/watch?v=NfCTdUmWYx0',
  'peso-muerto': 'https://www.youtube.com/watch?v=0XL4cZR2Ink',
  hiperextensiones: 'https://www.youtube.com/watch?v=KNBNgfdVbSQ',
  'floor-press': 'https://www.youtube.com/watch?v=Bx4QPVH-J1g',
  'press-plano-mancuernas': 'https://www.youtube.com/watch?v=jrDDz7x1Dpo',
  'remo-pendlay': 'https://www.youtube.com/watch?v=IClD2aEUrDE',
  'remo-invertido': 'https://www.youtube.com/watch?v=GUJ8lC8aA7w',
  'paseo-granjero': 'https://www.youtube.com/watch?v=X5ZRWP_AHPw',
  'elevacion-lateral-tumbado': 'https://www.youtube.com/watch?v=ygmHC4hdk-4',
  'curl-bayesian': 'https://www.youtube.com/watch?v=de_Xc1AKulo',
  'jalon-cerrado': 'https://www.youtube.com/watch?v=VUJYixXx5I8',
  'extension-cuerda': 'https://www.youtube.com/watch?v=uZg6VtRhwQY',
  'rueda-abdominal': 'https://www.youtube.com/watch?v=NjOYrPXoLfY',
  'encogimiento-polea': 'https://www.youtube.com/watch?v=v7QczJNuWIg',
  'mountain-climbers': 'https://www.youtube.com/watch?v=FPLXxBxYcmE',
  // ejercicios nuevos
  'press-convergente': 'https://www.youtube.com/watch?v=d-gwsl5BlMQ',
  'aperturas-polea-inclinado': 'https://www.youtube.com/watch?v=ssgvLSaLwr8',
  'press-hex': 'https://www.youtube.com/watch?v=FIfOHr46_LE',
  'remo-pecho-apoyado': 'https://www.youtube.com/watch?v=LDxVARwqzy4',
  'remo-seal': 'https://www.youtube.com/watch?v=_6AjZgvBW1k',
  'remo-meadows': 'https://www.youtube.com/watch?v=PyMKL-Abibk',
  'remo-alto-maquina': 'https://www.youtube.com/watch?v=wFBIQWWfwTk',
  'jalon-unilateral': 'https://www.youtube.com/watch?v=7XtBa6ttSn8',
  'jalon-maquina': 'https://www.youtube.com/watch?v=mOvxOLhc7W4',
  'muscle-up': 'https://www.youtube.com/watch?v=v777lkqWNTA',
  'peso-muerto-hexagonal': 'https://www.youtube.com/watch?v=ngwEa50dG00',
  'extension-lumbar-maquina': 'https://www.youtube.com/watch?v=I81wmiBQUwk',
  superman: 'https://www.youtube.com/watch?v=FWaMfMSJy3I',
  'remo-renegado': 'https://www.youtube.com/watch?v=n0tj05JtSRs',
  'press-z': 'https://www.youtube.com/watch?v=0fHdnBH9Gdo',
  'push-press': 'https://www.youtube.com/watch?v=JbSiXKYepIY',
  'rotacion-externa-polea': 'https://www.youtube.com/watch?v=DplyMccjRrE',
  'press-cubano': 'https://www.youtube.com/watch?v=m9ipa4nKnOE',
  'flexiones-pino': 'https://www.youtube.com/watch?v=iycrRR9UNx0',
  'curl-arrastrado': 'https://www.youtube.com/watch?v=1V-o8pDiutU',
  'curl-zottman': 'https://www.youtube.com/watch?v=zWfOJT156qk',
  'extension-triceps-maquina': 'https://www.youtube.com/watch?v=w8SgkepYfME',
  'press-jm': 'https://www.youtube.com/watch?v=b-nyTZBLpWo',
  'rodillo-muneca': 'https://www.youtube.com/watch?v=qb0A0pHGhyA',
  'colgarse-barra': 'https://www.youtube.com/watch?v=F7bhhjpsdOs',
  'sentadilla-pendulo': 'https://www.youtube.com/watch?v=VRnsSEkd1v0',
  'sentadilla-cinturon': 'https://www.youtube.com/watch?v=jdRfKAnssDY',
  pistol: 'https://www.youtube.com/watch?v=OIly2WkgPRw',
  'sentadilla-cosaca': 'https://www.youtube.com/watch?v=lcCGSCVMULQ',
  'sentadilla-pared': 'https://www.youtube.com/watch?v=xLpqXW2We-A',
  'zancada-lateral': 'https://www.youtube.com/watch?v=jwliy-PV6a0',
  'salto-cajon': 'https://www.youtube.com/watch?v=YSLyLK9OrZs',
  'curl-nordico': 'https://www.youtube.com/watch?v=KcgBti4Ozn0',
  'glute-ham-raise': 'https://www.youtube.com/watch?v=sqhGQSjL9r0',
  'peso-muerto-unilateral': 'https://www.youtube.com/watch?v=EERrhuuOtnE',
  'puente-gluteo': 'https://www.youtube.com/watch?v=NUFvi-gPojg',
  'pull-through': 'https://www.youtube.com/watch?v=OmhY5_tVzt0',
  'hiperextension-inversa': 'https://www.youtube.com/watch?v=MT0U96RqkhM',
  'kettlebell-swing': 'https://www.youtube.com/watch?v=pijvfvEqnmg',
  'crunch-inverso': 'https://www.youtube.com/watch?v=Rh2XQ9TOuH8',
  'pies-a-la-barra': 'https://www.youtube.com/watch?v=_4j8Qp60KLI',
  'v-ups': 'https://www.youtube.com/watch?v=oirraQEz-74',
  'hollow-hold': 'https://www.youtube.com/watch?v=E58napCEGEw',
  'l-sit': 'https://www.youtube.com/watch?v=epC9Pe2WMs4',
  'dead-bug': 'https://www.youtube.com/watch?v=6VQZ2JokRtc',
  'bird-dog': 'https://www.youtube.com/watch?v=cqe97lhKVP4',
  'plancha-copenhague': 'https://www.youtube.com/watch?v=gkGM-hjTTZ8',
  'flexion-lateral': 'https://www.youtube.com/watch?v=h-twYr8H4Z4',
  'paseo-maleta': 'https://www.youtube.com/watch?v=58zoUXlwDRM',
  'cargada-potencia': 'https://www.youtube.com/watch?v=I31BobyRSWc',
  thruster: 'https://www.youtube.com/watch?v=8XAs-mfpxfg',
  burpees: 'https://www.youtube.com/watch?v=Uy2nUNX38xE',
  'empuje-trineo': 'https://www.youtube.com/watch?v=4Ob-49lAg_k',
  'levantamiento-turco': 'https://www.youtube.com/watch?v=YX6-DfhIx1o'
}

export const CATALOG_VIDEOS: Record<string, string> = { ...CATALOG_VIDEOS_V7, ...VIDEOS_V8 }

/**
 * Vídeos que HIERRO puso en versiones anteriores y ya se sustituyeron. La
 * migración solo cambia el vídeo si el guardado es uno de estos (si el usuario
 * puso el suyo, se respeta).
 */
export const LEGACY_VIDEOS: Record<string, string[]> = {
  ...Object.fromEntries(
    Object.keys(VIDEOS_V8)
      .filter((id) => CATALOG_VIDEOS_V7[id] && CATALOG_VIDEOS_V7[id] !== VIDEOS_V8[id])
      .map((id) => [id, [CATALOG_VIDEOS_V7[id]]])
  ),
  hakka: ['https://www.youtube.com/watch?v=VNpkYdex6Yc']
}

// ---------------------------------------------------------------------------
// Variantes por ejercicio (equipo, agarre, postura, unilateral…). Mapa único
// que se aplica a TODOS los ejercicios de serie y de catálogo, y a los datos
// ya guardados vía migración. Editable: solo añade ids con sus variantes.
// ---------------------------------------------------------------------------

export const VARIANTS_OVERRIDE: Record<string, string[]> = {
  // ----- PECHO -----
  'press-inclinado': ['Máquina', 'Multipower', 'Mancuernas', 'Barra'],
  // Hammer y Technogym dejaron de ser variantes: ahora son marcas (v8)
  'press-plano': ['Máquina', 'Barra', 'Mancuernas', 'Multipower'],
  flexiones: ['Normales', 'Diamante', 'Inclinadas', 'Declinadas', 'Lastradas'],
  'press-inclinado-mancuernas': ['Inclinado bajo', 'Inclinado alto'],
  'press-inclinado-barra': ['Libre', 'Multipower'],
  'press-banca-barra': ['Libre', 'Multipower'],
  'press-plano-mancuernas': ['Banco plano', 'Banco neutro'],
  'press-declinado': ['Barra', 'Mancuernas', 'Máquina', 'Multipower'],
  'press-multipower': ['Plano', 'Inclinado', 'Declinado'],
  'aperturas-mancuernas': ['Plano', 'Inclinado', 'Declinado'],
  'cruce-poleas': ['Polea alta', 'Polea media', 'Polea baja'],
  contractora: ['Máquina', 'Polea'],
  'fondos-paralelas': ['Paralelas', 'Máquina asistida', 'Lastrado'],
  'pullover-mancuerna': ['Mancuerna', 'Barra'],
  // ----- ESPALDA -----
  jalon: ['Agarre ancho', 'Agarre cerrado', 'Supino', 'Neutro'],
  'jalon-abierto': ['Prono', 'Tras nuca'],
  'jalon-supino': ['Cerrado', 'Ancho'],
  'remo-t': ['Agarre neutro', 'Agarre ancho', 'Máquina'],
  'remo-gironda': ['Agarre estrecho', 'Agarre ancho', 'Barra V'],
  'remo-barra': ['Prono', 'Supino', 'Multipower'],
  'remo-maquina': ['Neutro', 'Prono', 'Unilateral'],
  'remo-mancuerna': ['En banco', 'En punta', 'Kroc'],
  'pull-over': ['Cuerda', 'Barra'],
  'pull-ups': ['Pronas', 'Supinas', 'Neutras', 'Lastradas', 'Asistidas con banda'],
  encogimientos: ['Mancuernas', 'Barra', 'Máquina', 'Multipower', 'Polea'],
  'peso-muerto': ['Convencional', 'Sumo', 'Multipower'],
  hiperextensiones: ['Peso corporal', 'Con disco'],
  // ----- HOMBRO -----
  'elevaciones-laterales': ['Máquina', 'Mancuernas', 'Polea', 'Polea unilateral'],
  'press-militar': ['Barra', 'Mancuernas', 'Máquina', 'Multipower', 'Sentado'],
  'elevaciones-frontales': ['Mancuernas', 'Polea', 'Disco', 'Barra'],
  pajaros: ['Mancuernas', 'Polea', 'Máquina'],
  'remo-menton': ['Barra', 'Polea', 'Mancuernas', 'Multipower'],
  'press-arnold': ['Sentado', 'De pie'],
  'contractora-invertida': ['Máquina', 'Polea'],
  'face-pull': ['Polea', 'Unilateral'],
  // ----- BÍCEPS -----
  predicador: ['Barra Z', 'Máquina', 'Unilateral', 'Mancuerna'],
  'curl-martillo': ['Mancuernas', 'Polea', 'Cuerda', 'Unilateral'],
  'curl-barra': ['Recta', 'Barra Z', 'Ancho', 'Cerrado'],
  'curl-alterno': ['De pie', 'Sentado', 'Inclinado'],
  'curl-inclinado': ['Simultáneo', 'Alterno'],
  'curl-polea': ['Barra', 'Cuerda', 'Unilateral'],
  // ----- TRÍCEPS -----
  'extension-triceps': ['Barra', 'Cuerda', 'Unilateral', 'Tras nuca', 'Agarre supino'],
  'extension-triceps-cabeza': ['Unilateral', 'A dos manos', 'Polea'],
  'press-frances': ['Barra Z', 'Mancuernas', 'Polea'],
  'patada-triceps': ['Mancuerna', 'Polea'],
  // ----- ANTEBRAZO -----
  'curl-inverso': ['Barra', 'Mancuernas', 'Polea'],
  'curl-muneca': ['Barra', 'Mancuernas'],
  // ----- PIERNA -----
  prensa: ['45º', 'Horizontal', 'Vertical', 'Unilateral'],
  zancadas: ['Mancuernas', 'Barra', 'Caminando', 'Multipower'],
  'hip-thrust': ['Barra', 'Máquina', 'Multipower', 'Unilateral'],
  'patada-gluteo': ['Polea', 'Máquina'],
  'curl-femoral': ['Sentado', 'Tumbado', 'De pie', 'Unilateral'],
  'extension-cuadriceps': ['Bilateral', 'Unilateral'],
  'abduccion-gluteo': ['Máquina', 'Polea', 'Multipower'],
  gemelo: ['De pie', 'Sentado', 'En prensa', 'Multipower'],
  'peso-muerto-rumano': ['Barra', 'Mancuernas', 'Multipower'],
  sentadilla: ['Libre', 'Multipower'],
  'sentadilla-bulgara': ['Mancuernas', 'Barra', 'Multipower'],
  'step-up': ['Mancuernas', 'Barra'],
  'abductores-maquina': ['Máquina', 'Polea'],
  'aduccion-maquina': ['Máquina', 'Polea'],
  // ----- CORE -----
  'elevaciones-piernas': ['En barra', 'En paralelas', 'Tumbado'],
  'giro-ruso': ['Con disco', 'Con balón', 'Peso corporal'],
  'crunch-polea': ['De rodillas', 'De pie']
}

/**
 * Variantes que cambian el músculo principal (el ángulo manda). Solo para
 * ejercicios del catálogo; lo no listado usa los músculos del ejercicio.
 */
export const VARIANT_MUSCLES: Record<
  string,
  Record<string, { primary: MuscleId[]; secondary: MuscleId[] }>
> = {
  'aperturas-mancuernas': {
    Inclinado: { primary: ['pecho_superior'], secondary: ['pecho_inferior', 'deltoide_anterior'] }
  },
  'press-multipower': {
    Plano: { primary: ['pecho_inferior'], secondary: ['triceps', 'deltoide_anterior', 'pecho_superior'] },
    Inclinado: { primary: ['pecho_superior', 'deltoide_anterior'], secondary: ['triceps', 'pecho_inferior'] },
    Declinado: { primary: ['pecho_inferior'], secondary: ['triceps'] }
  },
  'press-convergente': {
    Inclinado: { primary: ['pecho_superior', 'deltoide_anterior'], secondary: ['triceps', 'pecho_inferior'] }
  },
  'cruce-poleas': {
    'Polea baja': { primary: ['pecho_superior'], secondary: ['deltoide_anterior', 'pecho_inferior'] }
  }
}

/** Aplica el override de variantes a un ejercicio (si lo tiene definido). */
export function withVariants(def: ExerciseDef): ExerciseDef {
  const v = VARIANTS_OVERRIDE[def.id]
  return v ? { ...def, variants: v } : def
}

export function catalogExercisesWithVideos(): ExerciseDef[] {
  return CATALOG_EXERCISES.map((e) => {
    const withVid = CATALOG_VIDEOS[e.id] ? { ...e, videoUrl: CATALOG_VIDEOS[e.id] } : e
    return withVariants(withVid)
  })
}

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
