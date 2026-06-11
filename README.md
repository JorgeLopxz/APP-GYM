# HIERRO 🏋️

Diario de gimnasio personal: registra pesos y series, mide tu progreso y ve los
músculos trabajados cada semana sobre una silueta del cuerpo. Estética negro /
gris / plata con transiciones suaves.

**App web instalable (PWA)** — funciona offline, se instala en el iPhone desde
Safari y guarda todos los datos en el propio móvil.

## Funcionalidades

- **Entreno**: rutinas (PUSH, PULL, LEG, PECHO·ESPALDA…) con ejercicios y
  variantes (Hammer, Technogym, Libre, Polea, Unilateral…). Series con peso ×
  reps, dropsets, fallo y negativas. Muestra lo que hiciste la última vez en
  cada ejercicio para que solo tengas que superarlo.
- **Temporizador de descanso** automático al marcar una serie como hecha.
- **Récords personales** detectados automáticamente al terminar cada entreno.
- **Progreso**: gráfica por ejercicio y variante — peso máximo, RM estimado
  (fórmula de Epley) y volumen.
- **Músculos**: mapa corporal (frente y espalda) que se ilumina en plata según
  las series semanales por músculo, con navegación por semanas.
- **Creatina**: recordatorio diario con racha 🔥. Exporta un evento de
  calendario (.ics) con aviso diario — la forma fiable de tener notificación en
  iOS sin servidores.
- **Copia de seguridad**: exporta/importa todos tus datos en JSON.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
npm run icons    # regenera los iconos PNG desde assets/icon.svg
```

Stack: React 18 + TypeScript + Vite + vite-plugin-pwa. Sin backend: los datos
viven en `localStorage` del dispositivo.

## Instalar en el iPhone

1. Abre la web de la app en **Safari** (la URL de GitHub Pages de este repo).
2. Toca **Compartir** (el cuadrado con la flecha hacia arriba).
3. Toca **«Añadir a pantalla de inicio»**.
4. Abre **HIERRO** desde el icono: pantalla completa, funciona sin conexión.

> Los datos se guardan en el móvil (no en GitHub ni en ningún servidor). Haz
> una copia de seguridad desde Ajustes de vez en cuando.

## Despliegue

Cada push a `main` despliega automáticamente a GitHub Pages mediante
`.github/workflows/deploy.yml`.
