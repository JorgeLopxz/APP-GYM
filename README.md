# HIERRO 🏋️

Diario de gimnasio personal: registra pesos y series, mide tu progreso y ve los
músculos trabajados cada semana sobre una silueta del cuerpo. Estética negro /
gris / plata con transiciones suaves.

**App web instalable (PWA)** — funciona offline, se instala en el iPhone desde
Safari y guarda todos los datos en el propio móvil.

## Funcionalidades

- **Entreno**: rutinas (PUSH, PULL, LEG, PECHO·ESPALDA…) con ejercicios y
  variantes (Hammer, Technogym, Libre, Polea, Unilateral…). Series con peso ×
  reps, dropsets, fallo y negativas. Cada entreno arranca **pre-rellenado con
  las marcas de la última sesión**: solo corriges lo que cambie y marcas ✓.
- **Catálogo de ejercicios** (~60) agrupado por regiones, con buscador, y
  creador de ejercicios propios con sus músculos.
- **Vídeos de técnica**: cada ejercicio tiene un vídeo de YouTube verificado
  (o pon el tuyo favorito).
- **Temporizador de descanso** automático al marcar una serie como hecha.
- **Récords personales** detectados automáticamente al terminar cada entreno.
- **Progreso**: gráfica por ejercicio y variante — peso máximo, RM estimado
  (fórmula de Epley), volumen y fuerza relativa a tu peso corporal.
- **Mi cuerpo**: perfil (edad, sexo, altura), historial de peso corporal y
  estimador de calorías/proteína según objetivo (definición, recomposición,
  volumen) usando tu frecuencia real de entreno.
- **Músculos**: mapa corporal (frente y espalda) que se enciende en rojos según
  las series semanales por músculo, con detección de **puntos débiles** y
  ejercicios recomendados.
- **Creatina**: recordatorio diario con racha 🔥. Exporta un evento de
  calendario (.ics) con aviso diario — la forma fiable de tener notificación en
  iOS sin servidores.
- **Copia de seguridad**: exporta/importa todos tus datos en JSON.

La estructura del código está documentada en
[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
npm run icons    # regenera los iconos PNG desde assets/icon.svg
```

Stack: React 18 + TypeScript + Vite + vite-plugin-pwa. Sin backend: los datos
viven en `localStorage` del dispositivo.

## Instalar en el móvil

**iPhone (Safari):** abre la URL → botón **Compartir** → **«Añadir a pantalla
de inicio»** → abre HIERRO desde el icono.

**Android (Chrome):** abre la URL → menú **⋮** → **«Añadir a pantalla de
inicio»** (o el aviso «Instalar app»). Funciona igual: pantalla completa y
offline.

> Los datos se guardan en el móvil (no en GitHub ni en ningún servidor). Haz
> una copia de seguridad desde Ajustes de vez en cuando.

## Despliegue

Cada push a `main` despliega automáticamente a GitHub Pages mediante
`.github/workflows/deploy.yml`.
