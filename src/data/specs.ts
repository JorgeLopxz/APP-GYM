import type { Equipment, Level, Mechanic } from '../types'

/**
 * Ficha técnica de cada ejercicio del catálogo: material principal, tipo
 * (compuesto / aislamiento), nivel, si es unilateral y tres claves de técnica.
 * Se lee en tiempo de ejecución por id, así que corregir una ficha no necesita
 * migrar datos. Los ejercicios creados por el usuario guardan solo su material.
 *
 * Formato compacto: [material, C=compuesto|A=aislamiento, P|I|A = nivel,
 * 'clave 1|clave 2|clave 3', 1 = unilateral]
 */
type Row = [Equipment, 'C' | 'A', 'P' | 'I' | 'A', string, 1?]

const SPECS: Record<string, Row> = {
  // ===== PECHO =====
  'press-inclinado': ['maquina', 'C', 'P', 'Respaldo a 30-45° con las escápulas atrás y abajo|Baja hasta la parte alta del pecho con los codos a unos 45°|Empuja hacia arriba sin bloquear los codos de golpe'],
  'press-plano': ['maquina', 'C', 'P', 'Escápulas retraídas y pecho alto toda la serie|Baja controlando hasta la línea media del pecho|Empuja sin despegar la espalda del respaldo'],
  'press-banca-barra': ['barra', 'C', 'I', 'Escápulas retraídas, pies firmes y ligero arco|Baja la barra a la parte baja del pecho con los codos a ~45°|Empuja hacia los hombros sin rebotar en el pecho'],
  'press-plano-mancuernas': ['mancuernas', 'C', 'P', 'Mancuernas a los lados del pecho y escápulas atrás|Baja hasta notar el estiramiento del pecho|Empuja arriba sin chocar las mancuernas'],
  'press-inclinado-mancuernas': ['mancuernas', 'C', 'P', 'Banco a unos 30° y escápulas juntas|Baja las mancuernas a los lados del pecho alto|Empuja arriba acercándolas sin chocarlas'],
  'press-inclinado-barra': ['barra', 'C', 'I', 'Banco a 30° y escápulas retraídas|Baja la barra a la parte alta del pecho|Empuja en línea recta sin rebotar'],
  'press-declinado': ['barra', 'C', 'I', 'Piernas bien sujetas y escápulas retraídas|Baja la barra a la parte baja del pecho|Empuja controlando sin bloquear de golpe'],
  'press-multipower': ['multipower', 'C', 'P', 'Coloca el banco para que la barra caiga sobre el pecho medio|Baja controlando con los codos a unos 45°|Empuja y engancha la barra solo al terminar la serie'],
  'press-convergente': ['maquina', 'C', 'P', 'Asiento a la altura que deje las asas a mitad del pecho|Escápulas pegadas al respaldo todo el recorrido|Empuja siguiendo el arco de la máquina sin bloquear'],
  'floor-press': ['barra', 'C', 'P', 'Tumbado en el suelo con las rodillas flexionadas|Baja hasta que los tríceps toquen el suelo|Pausa un instante y empuja'],
  'press-hex': ['mancuernas', 'C', 'P', 'Aprieta las mancuernas una contra otra toda la serie|Baja hasta rozar el pecho sin separarlas|Codos pegados al cuerpo'],
  'svend-press': ['otros', 'A', 'P', 'Aprieta un disco entre las palmas a la altura del pecho|Empuja al frente sin dejar de apretar|Vuelve lento hasta el pecho'],
  'aperturas-mancuernas': ['mancuernas', 'A', 'P', 'Codos ligeramente flexionados y fijos|Abre en arco hasta notar el estiramiento del pecho|Cierra como abrazando un árbol, sin chocar las mancuernas'],
  'aperturas-polea-inclinado': ['polea', 'A', 'I', 'Banco a 30° centrado entre las dos poleas bajas|Codos semiflexionados y fijos todo el movimiento|Junta las manos sobre el pecho y baja controlando'],
  'cruce-poleas': ['polea', 'A', 'P', 'Paso al frente con el torso algo inclinado|Junta las manos en un arco amplio apretando el pecho|Vuelve despacio hasta notar el estiramiento'],
  contractora: ['maquina', 'A', 'P', 'Asas a la altura del pecho y espalda pegada al respaldo|Cierra en arco con los codos ligeramente flexionados|Abre controlando sin pasar la línea de los hombros'],
  'fondos-paralelas': ['peso-corporal', 'C', 'I', 'Torso algo inclinado al frente para cargar el pecho|Baja hasta que los hombros queden a la altura de los codos|Empuja hasta bloquear sin encoger los hombros'],
  flexiones: ['peso-corporal', 'C', 'P', 'Manos algo más anchas que los hombros y cuerpo en bloque|Baja hasta casi tocar el suelo con los codos a 45°|Empuja sin hundir la cadera'],
  'pullover-mancuerna': ['mancuernas', 'A', 'I', 'Espalda alta apoyada en el banco y cadera baja|Lleva la mancuerna atrás con los brazos casi estirados|Vuelve sobre el pecho sin flexionar los codos'],

  // ===== ESPALDA =====
  'pull-ups': ['peso-corporal', 'C', 'I', 'Agarre algo más ancho que los hombros y hombros activos|Sube llevando el pecho a la barra y los codos hacia abajo|Baja hasta estirar los brazos sin balanceo'],
  'dominadas-supinas': ['peso-corporal', 'C', 'I', 'Agarre supino a la anchura de los hombros|Sube hasta pasar la barbilla por encima de la barra|Baja hasta estirar sin balancearte'],
  'dominadas-asistidas': ['maquina', 'C', 'P', 'Rodillas en la plataforma y agarre algo abierto|Sube llevando el pecho hacia la barra|Más peso de asistencia = más fácil: bájalo con el tiempo'],
  'muscle-up': ['peso-corporal', 'C', 'A', 'Dominada explosiva llevando la barra hacia la cadera|Pasa el pecho por encima con un giro rápido de muñecas|Termina con un fondo completo y baja controlando'],
  jalon: ['polea', 'C', 'P', 'Muslos fijos bajo los rodillos y pecho alto|Baja la barra a la parte alta del pecho con los codos hacia abajo|Sube controlando hasta estirar los dorsales'],
  'jalon-abierto': ['polea', 'C', 'P', 'Agarre ancho y ligera inclinación atrás|Lleva la barra al pecho apretando la espalda alta|Sube lento sin soltar la tensión'],
  'jalon-cerrado': ['polea', 'C', 'P', 'Agarre cerrado neutro y torso algo inclinado atrás|Lleva el agarre al pecho con los codos pegados|Sube estirando los dorsales'],
  'jalon-supino': ['polea', 'C', 'P', 'Agarre supino a la anchura de los hombros|Baja al pecho con los codos pegados al cuerpo|Sube estirando por completo'],
  'jalon-unilateral': ['polea', 'C', 'I', 'Agarre neutro con el brazo estirado arriba|Tira del codo hacia la cadera, no de la mano|Deja subir la escápula en el estiramiento sin girar el torso', 1],
  'jalon-maquina': ['maquina', 'C', 'P', 'Muslos firmes bajo los rodillos|Pecho alto y codos hacia abajo y atrás|Sube controlando hasta estirar los dorsales'],
  'remo-t': ['barra', 'C', 'I', 'Espalda neutra y torso inclinado unos 45°|Tira hacia el abdomen llevando los codos atrás|Estira abajo sin redondear la lumbar'],
  'remo-gironda': ['polea', 'C', 'P', 'Sentado con las rodillas algo flexionadas y espalda neutra|Tira hacia el abdomen sacando pecho|Estira los brazos sin redondear la espalda'],
  'remo-barra': ['barra', 'C', 'I', 'Torso inclinado unos 45° y espalda neutra|Tira de la barra hacia el ombligo llevando los codos atrás|Baja estirando sin redondear la lumbar'],
  'remo-pendlay': ['barra', 'C', 'A', 'Torso paralelo al suelo y barra apoyada en cada repetición|Tira explosivo hacia el pecho bajo|Devuelve la barra al suelo sin cambiar la postura'],
  'remo-yates': ['barra', 'C', 'I', 'Agarre supino y torso inclinado unos 30°|Tira hacia el ombligo con los codos pegados|Baja controlando sin redondear'],
  'remo-mancuerna': ['mancuernas', 'C', 'P', 'Rodilla y mano apoyadas en el banco, espalda plana|Lleva el codo hacia la cadera|Estira abajo dejando que la escápula baje', 1],
  'remo-maquina': ['maquina', 'C', 'P', 'Pecho contra el apoyo y asiento a la altura correcta|Tira de los codos atrás apretando las escápulas|Estira sin perder la postura'],
  'remo-alto-maquina': ['maquina', 'C', 'P', 'Pecho contra el apoyo y muslos bajo el rodillo|Tira hacia abajo y atrás en diagonal|Estira arriba hasta notar el dorsal alargado'],
  'remo-pecho-apoyado': ['mancuernas', 'C', 'P', 'Pecho pegado al apoyo: sin impulso con la lumbar|Codos hacia atrás y escápulas juntas arriba|Estira los brazos por completo abajo'],
  'remo-seal': ['barra', 'C', 'I', 'Tumbado boca abajo en un banco alto con la barra colgando|Tira hacia el banco sin despegar el pecho|Baja con control hasta estirar del todo'],
  'remo-meadows': ['barra', 'C', 'A', 'De lado al extremo de una barra landmine|Cadera atrás y antebrazo libre apoyado en la rodilla|Lleva el codo alto y atrás, estirando bien abajo', 1],
  'remo-invertido': ['peso-corporal', 'C', 'P', 'Cuerpo recto bajo la barra con los talones apoyados|Lleva el pecho a la barra|Baja hasta estirar sin hundir la cadera'],
  'remo-renegado': ['mancuernas', 'C', 'I', 'Plancha alta sobre las mancuernas con los pies algo abiertos|Rema una mancuerna sin girar la cadera|Alterna lados con el abdomen firme'],
  'pull-over': ['polea', 'A', 'P', 'Brazos casi estirados y torso algo inclinado|Lleva la barra o cuerda hacia los muslos con los dorsales|Sube controlando hasta sentir el estiramiento'],
  'pullover-maquina': ['maquina', 'A', 'P', 'Codos contra las almohadillas|Lleva los brazos abajo con los dorsales|Sube controlando hasta estirar'],
  'peso-muerto': ['barra', 'C', 'I', 'Barra sobre el medio del pie y espalda neutra|Empuja el suelo y extiende cadera y rodillas a la vez|Barra pegada al cuerpo al subir y al bajar'],
  'peso-muerto-hexagonal': ['barra', 'C', 'P', 'En el centro de la barra con los pies bajo las caderas|Empuja el suelo con las piernas y la espalda neutra|Termina de pie con glúteos apretados'],
  'rack-pull': ['barra', 'C', 'I', 'Barra en los soportes a la altura de las rodillas|Espalda neutra y hombros sobre la barra|Extiende la cadera y termina con glúteos apretados'],
  encogimientos: ['mancuernas', 'A', 'P', 'Brazos estirados y peso a los costados|Sube los hombros hacia las orejas en vertical|Pausa arriba y baja lento, sin girar'],
  'encogimiento-polea': ['polea', 'A', 'P', 'Poleas bajas con los brazos estirados|Eleva los hombros en vertical|Pausa arriba y baja lento'],
  hiperextensiones: ['peso-corporal', 'A', 'P', 'Cadera en el borde del apoyo|Baja con la espalda neutra|Sube hasta alinear el cuerpo sin hiperextender'],
  'extension-lumbar-maquina': ['maquina', 'A', 'P', 'Rodillo a la altura de la parte alta de la espalda|Extiende despacio hasta la posición neutra|Vuelve controlando, sin rebotes'],
  superman: ['peso-corporal', 'A', 'P', 'Boca abajo con los brazos estirados al frente|Eleva brazos, pecho y piernas a la vez sin forzar el cuello|Aguanta 1-2 segundos arriba y baja lento'],

  // ===== HOMBROS =====
  'press-militar': ['barra', 'C', 'I', 'Glúteos y abdomen apretados, barra a la altura de la clavícula|Empuja en vertical apartando la cara|Termina con la barra sobre la cabeza y los brazos bloqueados'],
  'press-arnold': ['mancuernas', 'C', 'I', 'Empieza con las palmas hacia ti a la altura de la barbilla|Gira las palmas al frente mientras empujas arriba|Deshaz el giro al bajar'],
  'press-landmine': ['barra', 'C', 'P', 'Extremo de la barra a la altura del hombro|Empuja arriba y al frente|Abdomen firme, sin girar el tronco', 1],
  'press-z': ['barra', 'C', 'I', 'Sentado en el suelo con las piernas estiradas y el torso vertical|Empuja sobre la cabeza sin echarte atrás|Sin respaldo: el abdomen estabiliza'],
  'push-press': ['barra', 'C', 'A', 'Barra en los hombros con los codos algo adelantados|Pequeña flexión de rodillas y extensión explosiva|Bloquea arriba con la cabeza entre los brazos'],
  'press-pike': ['peso-corporal', 'C', 'I', 'Cadera alta en V invertida|Baja la cabeza entre las manos|Empuja hasta estirar los brazos'],
  'flexiones-pino': ['peso-corporal', 'C', 'A', 'Manos a la anchura de los hombros y cuerpo alineado|Baja la cabeza formando un triángulo con las manos|Empuja hasta bloquear sin arquear la lumbar'],
  'elevaciones-laterales': ['mancuernas', 'A', 'P', 'Ligera inclinación al frente y codos algo flexionados|Eleva hasta la altura de los hombros guiando con los codos|Baja lento sin encoger los trapecios'],
  'elevacion-lateral-tumbado': ['mancuernas', 'A', 'P', 'Tumbado de lado en un banco inclinado|Eleva la mancuerna hasta la vertical|Baja lento sin perder tensión', 1],
  'elevaciones-frontales': ['mancuernas', 'A', 'P', 'Codos algo flexionados y agarre prono|Eleva hasta la altura de los ojos|Baja controlando sin balancear el tronco'],
  pajaros: ['mancuernas', 'A', 'P', 'Torso inclinado casi paralelo al suelo|Abre los brazos en arco con los codos semiflexionados|Aprieta atrás sin subir los trapecios'],
  'contractora-invertida': ['maquina', 'A', 'P', 'Pecho contra el respaldo y asas a la altura de los hombros|Abre los brazos atrás con los codos semiflexionados|Aprieta el deltoide posterior sin encoger trapecios'],
  'face-pull': ['polea', 'A', 'P', 'Polea a la altura de la cara con cuerda y agarre neutro|Tira hacia la frente separando las manos|Aprieta la parte posterior del hombro y vuelve controlando'],
  'y-raise': ['mancuernas', 'A', 'P', 'Pecho apoyado en un banco inclinado|Eleva los brazos en Y con los pulgares arriba|Baja sin encoger los hombros'],
  'remo-menton': ['barra', 'C', 'I', 'Agarre a la anchura de los hombros|Sube la barra pegada al cuerpo con los codos por delante|No pases de la altura de los hombros'],
  'rotacion-externa-polea': ['polea', 'A', 'P', 'Codo pegado al costado a 90° (una toalla ayuda)|Gira el antebrazo hacia fuera sin mover el codo|Carga ligera y lenta: es trabajo de manguito rotador', 1],
  'press-cubano': ['mancuernas', 'C', 'I', 'Remo al mentón hasta codos a la altura de los hombros|Rota los antebrazos arriba con los codos altos|Termina con un press sobre la cabeza y deshaz el camino'],

  // ===== BÍCEPS =====
  predicador: ['barra', 'A', 'P', 'Axilas pegadas al borde del banco|Sube sin despegar los brazos del apoyo|Baja casi hasta estirar, sin rebotar'],
  'curl-banco-scott-maquina': ['maquina', 'A', 'P', 'Brazos apoyados y codo alineado con el eje|Sube sin despegar los brazos|Baja casi hasta estirar'],
  'curl-martillo': ['mancuernas', 'A', 'P', 'Agarre neutro con los pulgares hacia arriba|Codos pegados al costado durante todo el curl|Baja lento sin balancear el cuerpo'],
  'curl-martillo-cuerda': ['polea', 'A', 'P', 'Cuerda en la polea baja con agarre neutro|Sube con los codos pegados|Baja controlando'],
  'curl-barra': ['barra', 'A', 'P', 'Codos pegados al costado|Sube sin balancear la espalda|Baja controlando hasta estirar'],
  'curl-alterno': ['mancuernas', 'A', 'P', 'Empieza en neutro y gira a supino al subir|Codo fijo junto al costado|Alterna lados sin balanceo'],
  'curl-inclinado': ['mancuernas', 'A', 'I', 'Banco a 45-60° con los brazos colgando atrás|Sube sin adelantar los codos|Baja hasta el estiramiento completo'],
  'curl-polea': ['polea', 'A', 'P', 'De pie cerca de la polea baja|Codos fijos junto al cuerpo|Tensión constante arriba y abajo'],
  'curl-polea-alta': ['polea', 'A', 'I', 'Brazos en cruz con las poleas altas|Flexiona llevando las manos hacia la cabeza|Codos fijos a la altura de los hombros'],
  'curl-bayesian': ['polea', 'A', 'I', 'De espaldas a la polea con el brazo por detrás del cuerpo|Sube manteniendo el codo detrás del torso|Baja hasta estirar el bíceps', 1],
  'curl-concentrado': ['mancuernas', 'A', 'P', 'Codo apoyado en la cara interna del muslo|Sube girando la muñeca hacia fuera|Baja lento hasta estirar', 1],
  'curl-arana': ['mancuernas', 'A', 'I', 'Pecho apoyado en un banco inclinado y brazos colgando|Sube sin mover los codos|Aprieta arriba y baja controlando'],
  'curl-21': ['barra', 'A', 'I', '7 repeticiones de la mitad inferior|7 repeticiones de la mitad superior|7 repeticiones completas sin descanso'],
  'curl-arrastrado': ['barra', 'A', 'I', 'Sube la barra rozando el torso|Lleva los codos hacia atrás mientras subes|Sin balanceo: baja por el mismo camino'],
  'curl-zottman': ['mancuernas', 'A', 'I', 'Sube con agarre supino como un curl normal|Arriba gira las muñecas a prono|Baja lento en prono y vuelve a girar abajo'],

  // ===== TRÍCEPS =====
  'extension-triceps': ['polea', 'A', 'P', 'Codos pegados al cuerpo y fijos|Extiende hasta bloquear apretando el tríceps|Sube hasta unos 90° sin mover los hombros'],
  'extension-cuerda': ['polea', 'A', 'P', 'Codos pegados y agarre neutro en la cuerda|Extiende y separa la cuerda al final|Sube hasta 90° sin mover los hombros'],
  'extension-triceps-unilateral': ['polea', 'A', 'P', 'Agarre en la polea alta con el codo pegado|Extiende hasta bloquear|Sube sin mover el hombro', 1],
  'extension-triceps-cabeza': ['mancuernas', 'A', 'P', 'Codo apuntando al techo y cerca de la cabeza|Baja la mano detrás de la nuca hasta estirar|Extiende sin abrir el codo ni arquear la espalda', 1],
  'extension-triceps-maquina': ['maquina', 'A', 'P', 'Asiento a la altura que alinee el codo con el eje|Codos fijos: solo se mueve el antebrazo|Bloquea abajo apretando y sube controlando'],
  'press-frances': ['barra', 'A', 'I', 'Tumbado con la barra sobre la frente y codos al techo|Baja flexionando solo los codos|Extiende sin abrir los codos'],
  'press-tate': ['mancuernas', 'A', 'A', 'Tumbado con las mancuernas sobre el pecho|Bájalas hacia el pecho abriendo los codos|Extiende volviendo arriba'],
  'press-jm': ['barra', 'C', 'A', 'Agarre cerrado con la barra sobre el pecho alto|Baja hacia el mentón con los codos adelantados|Empuja de vuelta extendiendo los codos'],
  'press-cerrado': ['barra', 'C', 'I', 'Agarre a la anchura de los hombros|Baja al pecho bajo con los codos pegados|Empuja con los tríceps sin abrir los codos'],
  'fondos-banco': ['peso-corporal', 'C', 'P', 'Manos en el borde del banco y cadera cerca|Baja hasta que los codos formen 90°|Empuja sin encoger los hombros'],
  'fondos-maquina': ['maquina', 'C', 'P', 'Asiento a la altura que deje las asas junto a las costillas|Empuja abajo hasta bloquear|Sube controlando'],
  'patada-triceps': ['mancuernas', 'A', 'P', 'Torso inclinado y brazo pegado al cuerpo, paralelo al suelo|Extiende el codo hasta bloquear|Vuelve sin mover el brazo'],

  // ===== ANTEBRAZO =====
  'curl-inverso': ['barra', 'A', 'P', 'Agarre prono a la anchura de los hombros|Sube sin mover los codos|Baja lento para cargar el antebrazo'],
  'curl-muneca': ['barra', 'A', 'P', 'Antebrazos apoyados y agarre supino|Flexiona solo la muñeca|Baja hasta estirar sin soltar la barra'],
  'curl-muneca-inverso': ['barra', 'A', 'P', 'Antebrazos apoyados en el banco con agarre prono|Eleva solo los nudillos|Recorrido completo y lento'],
  'rodillo-muneca': ['otros', 'A', 'P', 'Brazos estirados al frente a la altura de los hombros|Enrolla la cuerda girando las muñecas|Desenrolla con la misma lentitud'],
  'colgarse-barra': ['peso-corporal', 'A', 'P', 'Agarre completo con el pulgar rodeando la barra|Hombros activos, sin colgar de los ligamentos|Apunta los segundos en el campo de repeticiones'],
  'paseo-granjero': ['mancuernas', 'C', 'P', 'Peso pesado en cada mano y hombros atrás|Pasos cortos y firmes con el torso erguido|Apunta metros o segundos en repeticiones'],

  // ===== PIERNA =====
  sentadilla: ['barra', 'C', 'I', 'Barra en los trapecios y pies a la anchura de los hombros|Baja entre las piernas con el pecho alto|Sube empujando con todo el pie y rodillas hacia fuera'],
  'sentadilla-frontal': ['barra', 'C', 'A', 'Barra sobre los deltoides con los codos altos|Baja con el torso vertical|Sube sin dejar caer los codos'],
  'sentadilla-goblet': ['mancuernas', 'C', 'P', 'Mancuerna o kettlebell pegada al pecho|Baja con los codos por dentro de las rodillas|Sube empujando con todo el pie'],
  hakka: ['maquina', 'C', 'P', 'Espalda y hombros bien apoyados, pies a la anchura de la cadera|Baja profundo con las rodillas siguiendo las puntas|Empuja con toda la planta sin bloquear arriba'],
  'sentadilla-pendulo': ['maquina', 'C', 'P', 'Espalda pegada al respaldo y pies en el centro|Baja lo más profundo posible con las rodillas al frente|Empuja con toda la planta sin despegar la espalda'],
  'sentadilla-cinturon': ['maquina', 'C', 'P', 'Cinturón ajustado a la cadera, sin carga en la espalda|Torso erguido y baja entre las piernas|Empuja con los talones y aprieta glúteos arriba'],
  'sentadilla-bulgara': ['mancuernas', 'C', 'I', 'Empeine trasero en el banco y pie delantero adelantado|Baja en vertical con el torso algo inclinado|Sube empujando con la pierna delantera', 1],
  'sentadilla-sissy': ['peso-corporal', 'A', 'A', 'Sujétate y ponte de puntillas|Lleva las rodillas al frente inclinando el cuerpo atrás en bloque|Sube con el cuádriceps'],
  pistol: ['peso-corporal', 'C', 'A', 'Pierna libre estirada al frente y brazos adelante|Baja controlando con la rodilla alineada con el pie|Sube empujando con todo el pie', 1],
  'sentadilla-cosaca': ['peso-corporal', 'C', 'I', 'Pies muy abiertos y puntas algo hacia fuera|Baja sobre una pierna con la otra estirada|Talón apoyado y pecho alto'],
  'sentadilla-pared': ['peso-corporal', 'A', 'P', 'Espalda plana contra la pared|Muslos paralelos al suelo y rodillas sobre los tobillos|Apunta los segundos en el campo de repeticiones'],
  prensa: ['maquina', 'C', 'P', 'Espalda y cadera pegadas al respaldo|Baja hasta 90° o más sin despegar la cadera|Empuja con los talones sin bloquear las rodillas'],
  'prensa-unilateral': ['maquina', 'C', 'I', 'Un pie en el centro de la plataforma|Baja sin despegar la cadera|Empuja sin bloquear la rodilla', 1],
  zancadas: ['mancuernas', 'C', 'P', 'Paso largo con el torso erguido|Baja hasta que la rodilla trasera casi toque el suelo|Empuja con el talón delantero', 1],
  'zancada-reversa': ['mancuernas', 'C', 'P', 'Paso atrás largo con el torso erguido|Baja hasta casi tocar el suelo con la rodilla|Vuelve empujando con el pie delantero', 1],
  'zancada-lateral': ['mancuernas', 'C', 'P', 'Paso amplio a un lado con los pies al frente|Baja sobre la pierna que avanza con la otra estirada|Empuja con el talón para volver al centro', 1],
  'step-up': ['mancuernas', 'C', 'P', 'Pie entero sobre el cajón|Sube empujando con la pierna de arriba|Baja controlando', 1],
  'salto-cajon': ['peso-corporal', 'C', 'I', 'Contramovimiento rápido con los brazos atrás|Aterriza suave con las rodillas flexionadas en el centro del cajón|Baja andando, no saltando'],
  'extension-cuadriceps': ['maquina', 'A', 'P', 'Rodilla alineada con el eje y espalda apoyada|Extiende hasta bloquear apretando el cuádriceps|Baja controlando 2-3 segundos'],
  'extension-cuadriceps-unilateral': ['maquina', 'A', 'P', 'Rodilla alineada con el eje|Extiende una pierna hasta bloquear|Baja controlando', 1],
  'curl-femoral': ['maquina', 'A', 'P', 'Rodilla alineada con el eje de la máquina|Flexiona llevando los talones hacia los glúteos|Vuelve despacio sin dejar caer el peso'],
  'curl-femoral-unilateral': ['maquina', 'A', 'P', 'Rodilla alineada con el eje|Flexiona con una pierna sin girar la cadera|Baja lento', 1],
  'curl-nordico': ['peso-corporal', 'A', 'A', 'Tobillos bien sujetos y cuerpo recto de rodillas a cabeza|Déjate caer lo más lento posible frenando con los isquios|Amortigua con las manos y vuelve'],
  'glute-ham-raise': ['maquina', 'C', 'A', 'Rodillas justo detrás de la almohadilla y pies firmes|Baja con el cuerpo recto hasta la horizontal|Sube flexionando las rodillas con isquios y glúteo'],
  'peso-muerto-rumano': ['barra', 'C', 'I', 'Rodillas ligeramente flexionadas y fijas|Cadera atrás con la barra pegada a las piernas|Sube apretando glúteos al notar los isquios'],
  'peso-muerto-rigido': ['barra', 'C', 'I', 'Piernas casi rectas|Baja la barra pegada con la espalda neutra|Sube apretando glúteos'],
  'peso-muerto-unilateral': ['mancuernas', 'C', 'I', 'Rodilla de apoyo ligeramente flexionada|Inclina el torso llevando la pierna libre atrás en línea|Cadera cuadrada y sube apretando el glúteo', 1],
  'peso-muerto-sumo': ['barra', 'C', 'I', 'Pies muy abiertos y agarre por dentro de las piernas|Rodillas hacia fuera y pecho alto|Extiende la cadera con la barra pegada'],
  'buenos-dias': ['barra', 'C', 'A', 'Barra en los trapecios y rodillas algo flexionadas|Cadera atrás con la espalda neutra|Sube apretando glúteos'],
  'hip-thrust': ['barra', 'C', 'P', 'Espalda alta en el banco y barra sobre la cadera|Eleva hasta alinear el tronco con las rodillas|Mentón recogido y aprieta glúteos arriba'],
  'hip-thrust-unilateral': ['peso-corporal', 'A', 'I', 'Espalda en el banco y un solo pie apoyado|Eleva la cadera sin rotarla|Aprieta arriba y baja lento', 1],
  'puente-gluteo': ['peso-corporal', 'A', 'P', 'Pies a la anchura de la cadera y cerca de los glúteos|Eleva la cadera apretando glúteos sin arquear la lumbar|Pausa arriba 1 segundo y baja controlando'],
  'patada-gluteo': ['polea', 'A', 'P', 'Tobillera en la polea baja y torso algo inclinado|Lleva la pierna atrás con el glúteo sin arquear|Vuelve controlando', 1],
  'pull-through': ['polea', 'C', 'P', 'De espaldas a la polea baja con la cuerda entre las piernas|Cadera atrás con la espalda neutra|Extiende la cadera apretando glúteos, sin tirar con los brazos'],
  'hiperextension-inversa': ['maquina', 'A', 'I', 'Torso apoyado y cadera en el borde|Eleva las piernas hasta la línea del cuerpo|Baja controlando sin balancearte'],
  'kettlebell-swing': ['kettlebell', 'C', 'I', 'Bisagra de cadera: la pesa pasa entre las piernas|Extiende la cadera explosivo, los brazos solo guían|Arriba cuerpo recto y glúteos apretados'],
  'abduccion-gluteo': ['maquina', 'A', 'P', 'Espalda apoyada o torso algo inclinado al frente|Abre las piernas empujando con el glúteo medio|Cierra lento sin que choquen las placas'],
  'abductores-maquina': ['maquina', 'A', 'P', 'Espalda apoyada y almohadillas por fuera de las rodillas|Abre las piernas con el glúteo medio|Cierra controlando'],
  'aduccion-maquina': ['maquina', 'A', 'P', 'Espalda apoyada y almohadillas en la cara interna|Cierra las piernas apretando los aductores|Abre lento hasta el estiramiento'],
  gemelo: ['maquina', 'A', 'P', 'Metatarsos en el borde y rodillas casi estiradas|Sube lo más alto posible y aguanta un segundo|Baja hasta el estiramiento completo del talón'],
  'gemelo-sentado': ['maquina', 'A', 'P', 'Almohadilla sobre las rodillas y metatarsos en el borde|Sube lo más alto posible|Baja hasta el estiramiento completo'],
  'gemelo-prensa': ['maquina', 'A', 'P', 'Metatarsos en el borde bajo de la plataforma|Empuja con los tobillos sin flexionar las rodillas|Recorrido completo y lento'],

  // ===== CORE =====
  'crunch-polea': ['polea', 'A', 'P', 'De rodillas con la cuerda junto a la cabeza|Flexiona el tronco llevando los codos a los muslos|Sin tirar con los brazos ni mover la cadera'],
  'crunch-maquina': ['maquina', 'A', 'P', 'Pecho contra las almohadillas|Enrolla el tronco con el abdomen|Vuelve lento sin soltar la tensión'],
  crunch: ['peso-corporal', 'A', 'P', 'Rodillas flexionadas y lumbar en el suelo|Eleva los hombros enrollando el abdomen|Sin tirar del cuello'],
  'crunch-inverso': ['peso-corporal', 'A', 'P', 'Rodillas a 90° y lumbar pegada al suelo|Enrolla la pelvis llevando las rodillas al pecho|Baja lento sin dejar caer las piernas'],
  'bicicleta-abdominal': ['peso-corporal', 'A', 'P', 'Manos junto a la cabeza sin tirar del cuello|Lleva el codo a la rodilla contraria|Alterna con ritmo controlado'],
  'elevaciones-piernas': ['peso-corporal', 'A', 'I', 'Colgado con los hombros activos|Sube las piernas enrollando la pelvis|Baja sin balanceo'],
  'elevacion-piernas-tumbado': ['peso-corporal', 'A', 'P', 'Lumbar pegada al suelo|Sube las piernas estiradas hasta la vertical|Baja sin tocar el suelo'],
  'pies-a-la-barra': ['peso-corporal', 'C', 'A', 'Colgado con los hombros activos|Empuja la barra hacia abajo mientras subes las piernas|Toca la barra con los pies y baja sin balanceo'],
  'v-ups': ['peso-corporal', 'A', 'I', 'Tumbado con brazos y piernas estirados|Sube tronco y piernas a la vez hasta tocar los pies|Baja controlando sin golpear el suelo'],
  'dragon-flag': ['peso-corporal', 'A', 'A', 'Sujeta el banco detrás de la cabeza|Eleva el cuerpo recto apoyado en los hombros|Baja en bloque lo más lento posible'],
  plancha: ['peso-corporal', 'A', 'P', 'Antebrazos bajo los hombros y cuerpo recto|Aprieta glúteos y abdomen sin hundir la cadera|Apunta los segundos en el campo de repeticiones'],
  'plancha-lateral': ['peso-corporal', 'A', 'P', 'Antebrazo bajo el hombro y cuerpo recto|Cadera alta sin hundirla|Apunta los segundos y cambia de lado', 1],
  'plancha-copenhague': ['peso-corporal', 'A', 'I', 'Pierna de arriba apoyada en el banco y antebrazo en el suelo|Eleva la cadera hasta alinear el cuerpo|Apunta los segundos y cambia de lado', 1],
  'hollow-hold': ['peso-corporal', 'A', 'I', 'Lumbar pegada al suelo en todo momento|Brazos y piernas estirados, despegados unos centímetros|Apunta los segundos en el campo de repeticiones'],
  'l-sit': ['peso-corporal', 'C', 'A', 'Brazos bloqueados y hombros hacia abajo|Piernas estiradas y juntas en paralelo al suelo|Apunta los segundos en el campo de repeticiones'],
  'dead-bug': ['peso-corporal', 'A', 'P', 'Boca arriba con los brazos al techo y rodillas a 90°|Estira brazo y pierna contrarios sin despegar la lumbar|Espira al estirar y alterna despacio'],
  'bird-dog': ['peso-corporal', 'A', 'P', 'A cuatro patas con la espalda neutra|Estira brazo y pierna contrarios hasta la línea del cuerpo|Sin rotar la cadera: pausa y alterna'],
  'rueda-abdominal': ['otros', 'A', 'I', 'De rodillas con la cadera extendida|Rueda al frente sin hundir la lumbar|Vuelve tirando con el abdomen'],
  'mountain-climbers': ['peso-corporal', 'C', 'P', 'Plancha alta con los hombros sobre las manos|Lleva las rodillas al pecho alternando|Cadera baja y estable'],
  'giro-ruso': ['peso-corporal', 'A', 'P', 'Sentado con el torso inclinado y pies elevados|Gira el tronco de lado a lado|El giro sale del tronco, no de los brazos'],
  'flexion-lateral': ['mancuernas', 'A', 'P', 'De pie con la mancuerna en una mano|Inclínate de lado sin girar el tronco|Sube con el oblicuo contrario', 1],
  'press-pallof': ['polea', 'A', 'P', 'De lado a la polea con el agarre en el pecho|Empuja al frente resistiendo el giro|Aguanta un segundo y vuelve'],
  'lenador-polea': ['polea', 'A', 'P', 'De lado a la polea con los brazos estirados|Gira el tronco en diagonal pivotando el pie|Vuelve controlando'],
  'rotacion-tronco-maquina': ['maquina', 'A', 'P', 'Cadera fija en el asiento|Gira con el tronco, no con los brazos|Recorrido controlado a ambos lados'],
  'paseo-maleta': ['mancuernas', 'C', 'P', 'Peso pesado en una sola mano|Camina con el torso vertical, sin inclinarte|Apunta metros o segundos y cambia de mano', 1],

  // ===== FUNCIONAL =====
  'cargada-potencia': ['barra', 'C', 'A', 'Primer tirón lento con la barra pegada|Extensión explosiva de cadera, rodillas y tobillos|Recibe la barra en los hombros con los codos altos'],
  thruster: ['barra', 'C', 'I', 'Sentadilla frontal profunda con los codos altos|Sube explosivo y usa el impulso para empujar arriba|Encadena la bajada con la siguiente sentadilla'],
  burpees: ['peso-corporal', 'C', 'P', 'Manos al suelo y salta atrás a plancha|Flexión con el cuerpo alineado|Recoge los pies y salta con las manos arriba'],
  'empuje-trineo': ['otros', 'C', 'P', 'Cuerpo inclinado unos 45° con los brazos firmes|Pasos cortos y potentes con toda la planta|Apunta los kg del trineo y los metros en repeticiones'],
  'levantamiento-turco': ['kettlebell', 'C', 'A', 'Brazo con la pesa siempre vertical y la mirada en ella|Sube por fases: codo, mano, puente, rodilla y de pie|Deshaz el camino fase a fase', 1]
}

export interface ExerciseSpecs {
  equipment: Equipment
  mechanic?: Mechanic
  level?: Level
  unilateral: boolean
  cues: string[]
}

const LEVEL: Record<'P' | 'I' | 'A', Level> = {
  P: 'principiante',
  I: 'intermedio',
  A: 'avanzado'
}

/** Ficha técnica de un ejercicio del catálogo (undefined si no es de catálogo). */
export function catalogSpecs(id: string): ExerciseSpecs | undefined {
  const row = SPECS[id]
  if (!row) return undefined
  return {
    equipment: row[0],
    mechanic: row[1] === 'C' ? 'compuesto' : 'aislamiento',
    level: LEVEL[row[2]],
    unilateral: row[4] === 1,
    cues: row[3].split('|')
  }
}
