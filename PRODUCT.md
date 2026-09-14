# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Jorge (usuario principal) y los amigos con los que comparte la app. Gente que entrena
fuerza en un gimnasio comercial varias veces por semana, con el iPhone en la mano entre
series: mira qué hizo la última vez, ajusta peso y repeticiones y marca la serie como hecha.
Cada móvil guarda sus propios datos; no hay cuentas.

## Product Purpose

HIERRO es un diario de gimnasio: organiza rutinas semanales por días, registra cada serie
con el pre-relleno de la sesión anterior, mide el progreso por ejercicio (peso, RM estimado,
reps), muestra el volumen semanal por músculo sobre un mapa corporal y lleva el descanso y
la creatina. Éxito = apuntar un entreno completo sin escribir casi nada y ver que los kilos suben.

## Positioning

El entreno arranca con tus marcas exactas de la última vez para esa variante y esa marca de
máquina: solo marcas ✓ o corriges. El historial distingue variante (agarre, equipo, ángulo) y
marca de máquina, porque 80 kg en una Hammer Strength no son 80 kg en una Technogym.

## Operating Context

- Uso en el gimnasio, de pie, con una mano, entre series de 1–3 minutos, a menudo con luz
  fluorescente o baja; también en casa para planificar rutinas o revisar progreso.
- PWA instalada desde Safari en iPhone (iOS 16.4+); también se abre en navegador de escritorio.
- Pantalla siempre encendida durante la sesión (Wake Lock). Funciona sin conexión.

## Capabilities and Constraints

- React 18 + TypeScript + Vite + vite-plugin-pwa, sin backend de datos: todo en localStorage,
  con migraciones de versión en `src/lib/storage.ts`. Exportar/importar copia JSON.
- Worker de Cloudflare `hierro-push` para notificaciones push reales (creatina cada hora hasta
  marcarla, fin de descanso) y para generar rutinas con Gemini.
- Catálogo de ejercicios con vídeo de técnica de YouTube verificado, variantes por ejercicio
  y marca de máquina opcional por ejercicio; el historial, el pre-relleno, los récords y las
  gráficas se separan por variante y por marca.
- Preferencias fijadas por Jorge: temporizador de descanso como pestaña propia (sin auto-timer
  por serie), sin cronómetro de duración del entreno, sin «kg movidos» ni métricas de volumen
  en Progreso, confirmación antes de empezar un entreno, récords con contexto (100×6), mapa
  muscular con escala de calor en rojos (casi blanco → rojo intenso), deslizar entre secciones.
- Límites de iOS: sin Apple Salud, sin sonido propio ni alarma persistente con la app cerrada.

## Brand Commitments

- Nombre: HIERRO. Logo definitivo: disco de peso de acero pulido con «HIERRO» serigrafiado
  (`assets/icon.svg`); no proponer la pesa genérica ni la «H» de viga.
- Idioma: español de España, tono cercano y directo.
- Dirección visual pedida por Jorge (2026-09): diseño al estilo Apple/iOS, tipografía SF Pro
  (Inter como alternativa fuera de Apple), apariencia automática clara/oscura según el iPhone,
  navegación de 5 pestañas con Ajustes en el avatar.

## Evidence on Hand

- Datos reales solo en el dispositivo de cada usuario; el contenido de fábrica son rutinas
  plantilla y el catálogo (`src/data/seed.ts`, `src/data/catalog.ts`).
- No hay testimonios, métricas de uso ni logotipos de marcas de máquinas: las marcas se
  muestran solo como texto, nunca con sus logotipos.

## Product Principles

1. Apuntar debe costar menos que no apuntar: pre-rellenar siempre, escribir casi nunca.
2. Comparar solo lo comparable: variante y marca separan historial y récords.
3. El entreno manda: nada interrumpe una sesión activa salvo lo que el usuario pide.
4. Local y privado por defecto; nada se sube salvo las notificaciones que el usuario activa.
5. Honestidad en los números: estimaciones etiquetadas como tales, sin inventar datos.

## Accessibility & Inclusion

Uso con una mano y de un vistazo: objetivos táctiles de 44 px, texto legible con luz de
gimnasio, contraste AA en ambos temas, respeto a «reducir movimiento» y «reducir transparencia».
