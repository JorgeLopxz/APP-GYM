---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/index.css"]
---

# HIERRO — app completa (todas las pestañas y hojas)

Scope: toda la PWA (Entreno, Descanso, Progreso, Músculos, Historial, Ajustes y hojas). Visitor mode: Operate.
Audience/job: Jorge y amigos entrenando fuerza con el iPhone entre series; apuntar series pre-rellenadas, elegir variante y marca de máquina, revisar progreso.
Constraints: SF Pro (Inter fuera de Apple), tema automático claro/oscuro, 5 pestañas + avatar para Ajustes, marca por ejercicio con historial separado por marca. Preferencias fijadas en PRODUCT.md.
Memorable moment: la hoja que se arrastra con el dedo como en iOS y el scrub de la gráfica de progreso.
Unresolved: ninguno bloqueante.

## Direction contract

THESIS: HIERRO se usa como una app nativa de Apple: el lenguaje iOS 26 (títulos grandes, listas agrupadas inset, cromo de vidrio flotante sobre el contenido, hojas que se arrastran) aplicado al registro de fuerza. Rechaza el tablero de gimnasio oscuro con acento neón y la retícula de tarjetas iguales.

OWN-WORLD: fondos agrupados del sistema (claro #F2F2F7 / oscuro #000000) con celdas elevadas (#FFFFFF / #1C1C1E), separadores finos y rellenos translúcidos del sistema. Un único tinte «grafito acero» (#1C1C1E claro / #ECECF0 oscuro) solo para lo accionable y lo actual; verde del sistema = serie hecha; rojo del sistema = destructivo; la escala roja de calor vive solo en el mapa muscular. SF Pro con la escala Dynamic Type (34/28/22/20/17/15/13/12), numerales tabulares en toda cifra. Vidrio solo en el cromo (barra de pestañas en cápsula flotante, botones circulares de navegación, accesorio del descanso, menús); el contenido es opaco. Iconos Lucide de trazo uniforme.

STORY: el usuario abre y ve su saludo, la creatina pendiente y «A continuación» con el siguiente día de su rutina; confirma y entrena marcando ✓ sobre series pre-rellenadas por variante y marca; al terminar los récords aterrizan grandes; en Progreso arrastra el dedo por la gráfica para leer cada sesión filtrando por variante y marca.

FIRST VIEWPORT (Entreno, 390×844): barra de navegación transparente con botón de avatar circular arriba a la derecha; título grande «Hola, Jorge» con la fecha como subtítulo; celda de creatina con acción circular; bloque «A continuación» (día, nº de ejercicios, última vez) con botón cápsula tintado «Empezar» a ancho completo; sección «Rutinas semanales» como lista agrupada con chevrons; barra de pestañas de vidrio flotante con 5 pestañas abajo.

FORM: lenguaje de interfaz iOS 26 de Apple, fijado por el usuario (una dirección fijada por el brief supera la tirada; seed key c934ddca, índice asignado 5 no aplicado). Interacción firma: hojas con arrastre para cerrar que heredan la velocidad del dedo y proyectan el impulso, más scrub táctil en las gráficas. Gramática de movimiento: curva iOS cubic-bezier(0.32, 0.72, 0, 1), 200–450 ms, sin coreografías de carga, con equivalentes de «reducir movimiento» y «reducir transparencia».
Raise (one-bit desktop, declined): una única gramática de estados — pulsado, seleccionado, deshabilitado, hecho — idéntica en cada control de la app.
Raise (teletext, declined): toda cifra viva (kg, reps, series, tiempo) en numerales tabulares alineados en la misma rejilla de columnas.
Raise (iridescent cloud edge, declined): el color queda confinado al significado; el campo es acromático.
Raise (sneaker box stacks, declined): cada ejercicio lleva la misma etiqueta — nombre, chip de variante, chip de marca — siempre visible y editable en su sitio.
Raise (console atmosphere, declined): la siguiente serie pendiente se eleva y lo ya hecho se retira visualmente.
Raise (variety telop, declined): los récords personales aterrizan a gran escala; la escala marca la intensidad del momento.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
