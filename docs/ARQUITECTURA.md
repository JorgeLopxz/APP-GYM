# Arquitectura de HIERRO

Mapa del repositorio: qué hace cada archivo y dónde tocar para cambiar cada cosa.

## Visión general

HIERRO es una **PWA local-first**: todo corre en el navegador y los datos viven
en el `localStorage` del dispositivo. No hay base de datos externa ni cuentas.
El único servidor es un Worker de Cloudflare (`worker/`) para las notificaciones
push y el asistente de rutinas con IA. El flujo es:

```
   src/data/  ──seed──▶  localStorage  ◀──lee/escribe──  src/App.tsx (estado)
                                                              │ props
                                              ┌───────────────┼───────────────┐
                                         src/views/*     src/components/*  src/lib/*
                                         (pantallas)     (piezas UI)       (lógica pura)
```

## Carpetas

| Ruta | Qué contiene |
|---|---|
| `src/types.ts` | **Todos los tipos de datos**: músculos, material (`Equipment`), ejercicios, series, sesiones (con `variant` y `brand`), rutinas, programas, perfil, ajustes. Si añades un campo nuevo, empieza aquí. |
| `src/data/seed.ts` | Rutinas-plantilla y ejercicios iniciales (los del bloc de notas) + sus vídeos (`SEED_VIDEOS`). |
| `src/data/catalog.ts` | Catálogo general (174 ejercicios en total con los de `seed.ts`), vídeos cortos verificados (`CATALOG_VIDEOS`, `LEGACY_VIDEOS`), variantes por ejercicio (`VARIANTS_OVERRIDE`), variantes que cambian el músculo principal (`VARIANT_MUSCLES`, p. ej. aperturas inclinadas → pecho superior) y **regiones** (Pecho, Espalda…). |
| `src/data/specs.ts` | **Ficha técnica** de cada ejercicio del catálogo: material, compuesto/aislamiento, nivel, unilateral y tres claves de técnica. Se lee por id en tiempo real: corregir una ficha no necesita migración. |
| `src/data/brands.ts` | **Marcas de máquinas** (Technogym, Hammer Strength, Panatta, gym80…) solo como texto, con alias para reconocer texto libre antiguo. |
| `src/lib/storage.ts` | Carga/guardado en `localStorage`, **migraciones de versión**, export/import JSON, estado del temporizador. |
| `src/lib/stats.ts` | Toda la matemática: RM estimado (Epley), récords, «última vez» por variante **y marca**, qué toca hoy (`nextUp`), series por músculo y semana. |
| `src/lib/exercise.ts` | Helpers de ejercicio: ficha efectiva, material según la variante, si procede preguntar la marca, búsqueda sin acentos, agrupado por región. |
| `src/lib/nutrition.ts` | Estimador de calorías (Mifflin-St Jeor) y proteína según objetivo. |
| `src/lib/generator.ts` · `src/lib/ai.ts` | Generador de rutinas integrado (sin conexión) y cliente del asistente con Gemini. |
| `src/lib/push.ts` · `notify.ts` · `ics.ts` | Notificaciones push reales, pitido del descanso y evento de calendario. |
| `src/views/WorkoutView.tsx` | Pestaña **Entreno**: hoy (creatina, «A continuación», rutinas semanales) → días de la rutina → sesión activa. |
| `src/views/workout/` | Piezas de Entreno: `ActiveSession` (sesión, tarjeta de ejercicio, series, resumen y récords), `Editors` (día y rutina semanal, reordenar arrastrando), `ExercisePicker` (catálogo con filtros), `ExerciseInfoSheet` (vídeo, ficha y claves), `BrandPicker`, `ExerciseCreator`, `AssistantSheet`. |
| `src/views/TimerView.tsx` | Pestaña **Descanso** (estilo Reloj de iOS) y el accesorio flotante sobre la barra de pestañas. |
| `src/views/ProgressView.tsx` | Pestaña **Progreso**: gráficas por ejercicio filtrables por variante y marca, y «Mi cuerpo» (peso + calorías). |
| `src/views/MusclesView.tsx` | Pestaña **Músculos**: mapa corporal semanal + puntos débiles. |
| `src/views/HistoryView.tsx` | Pestaña **Historial**: calendario mensual y sesiones por meses. |
| `src/views/SettingsView.tsx` | **Ajustes** (hoja que se abre desde el avatar) y hoja de perfil. |
| `src/components/ui.tsx` | Kit de interfaz estilo iOS: `Sheet` (se cierra arrastrando), `PageHeader` (título grande que se pliega), `Section`/`Row` (listas agrupadas), `Segmented`, `Switch`, `Menu`, `PopupSelect`, `SearchField`, `NumberField`, `LineChart` (se lee arrastrando el dedo), `EmptyState`. |
| `src/components/chrome.tsx` | Contexto del armazón: avatar que abre Ajustes y gesto de «volver» desde el borde. |
| `src/components/BodyMap.tsx` | El cuerpo SVG (frente/espalda) y la escala de calor en rojos. |
| `src/App.tsx` | Estado global, 5 pestañas, deslizar entre secciones, persistencia automática, pitido del descanso. |
| `src/index.css` | Toda la estética: tokens claro/oscuro en `:root`, cromo de vidrio, listas agrupadas, hojas, y cada pantalla. |
| `PRODUCT.md` · `.impeccable/` | Contexto de producto y decisiones de diseño (se documentan en `DESIGN.md`). |
| `assets/icon.svg` + `scripts/icons.mjs` | Icono fuente y script que genera los PNG (`npm run icons`). |
| `.github/workflows/deploy.yml` | Despliegue automático a GitHub Pages en cada push a `main`. |
| `vite.config.ts` | Configuración de build, PWA (manifest, service worker) y CSP de seguridad. |

## Diseño

Lenguaje de interfaz de iOS: títulos grandes que se pliegan en la barra, listas
agrupadas, barra de pestañas de vidrio flotante, hojas modales que se arrastran
y menús contextuales. Tipografía del sistema (SF Pro en iPhone/Mac, Inter en el
resto). Apariencia clara u oscura automática según el dispositivo; un único tinte grafito acero sobrio para lo accionable, verde para lo hecho y rojo para lo
destructivo. En iPad y escritorio la barra de pestañas sube arriba y Progreso y
Músculos pasan a dos columnas. Respeta «reducir movimiento» y «reducir transparencia».

## Datos y migraciones

El estado completo es un único objeto `AppData` (ver `src/types.ts`) guardado
bajo la clave `hierro-data-v1`. Lleva un campo `version`; al subirla, añade un
bloque en `migrate()` (`src/lib/storage.ts`) para que nadie pierda datos:

- v1 → v2: músculos detallados, perfil corporal, vídeos.
- v2 → v3: catálogo general de ejercicios.
- v3 → v4: vídeo de técnica en todos los ejercicios.
- v4 → v5: catálogo ampliado a 118 ejercicios.
- v5 → v6: variantes completas por ejercicio.
- v6 → v7: rutinas-día agrupadas en programas semanales.
- v7 → v8: **marcas de máquina** (las variantes «Hammer»/«Technogym» pasan al campo
  `brand` sin perder historial), catálogo de 174 ejercicios y vídeos cortos (solo se
  sustituyen los que el usuario no cambió).

Para añadir ejercicios: defínelos en `CATALOG_EXERCISES`, su ficha en `specs.ts`, su
vídeo en `VIDEOS_V8` (o un mapa nuevo) y sube la versión con una migración que añada
los que falten.

## Seguridad

- Los datos de entreno no salen del dispositivo; el Worker solo guarda la
  suscripción push y la hora del recordatorio.
- CSP (Content-Security-Policy) inyectada en producción: solo se ejecuta código
  del propio dominio y solo se permite el iframe de `youtube-nocookie.com`.
- Lo único sensible es el dispositivo en sí: haz copias desde Ajustes.

## Comandos

```bash
npm run dev      # desarrollo local
npm run build    # typecheck + build a dist/
npm run icons    # regenerar iconos PNG
git push         # ⇒ despliega solo a GitHub Pages
```
