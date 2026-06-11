# Arquitectura de HIERRO

Mapa del repositorio: qué hace cada archivo y dónde tocar para cambiar cada cosa.

## Visión general

HIERRO es una **PWA sin backend**: todo corre en el navegador y los datos viven
en el `localStorage` del dispositivo. No hay servidor, ni base de datos externa,
ni cuentas. El flujo es:

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
| `src/types.ts` | **Todos los tipos de datos**: músculos (`MuscleId`), ejercicios, series, sesiones, rutinas, perfil, ajustes. Si añades un campo nuevo, empieza aquí. |
| `src/data/seed.ts` | Tus rutinas y ejercicios iniciales (los del bloc de notas) + vídeos verificados (`SEED_VIDEOS`) + sesiones de ejemplo. |
| `src/data/catalog.ts` | Catálogo general de ejercicios (~50) y las **regiones** (Pecho, Espalda…) que agrupan los selectores. |
| `src/lib/storage.ts` | Carga/guardado en `localStorage`, **migraciones de versión** de datos, export/import JSON. |
| `src/lib/stats.ts` | Toda la matemática: RM estimado (Epley), volumen, récords, "última vez", series por músculo y semana, media de 4 semanas. |
| `src/lib/nutrition.ts` | Estimador de calorías (Mifflin-St Jeor) y proteína según objetivo. |
| `src/lib/ics.ts` | Generador del evento de calendario para la creatina + prueba de notificaciones. |
| `src/lib/youtube.ts` | Parseo de enlaces de YouTube para los vídeos de técnica. |
| `src/views/WorkoutView.tsx` | Pantalla **Entreno**: selector de rutinas, sesión activa, series pre-rellenadas, editor de rutinas, creador de ejercicios, ficha de ejercicio con vídeo. |
| `src/views/ProgressView.tsx` | Pantalla **Progreso**: gráficas por ejercicio y pestaña «Mi cuerpo» (peso corporal + calorías). |
| `src/views/MusclesView.tsx` | Pantalla **Músculos**: mapa corporal semanal + puntos débiles con recomendaciones. |
| `src/views/HistoryView.tsx` | Pantalla **Historial**: sesiones pasadas, reabrir/borrar. |
| `src/views/SettingsView.tsx` | Pantalla **Ajustes**: perfil, creatina, descanso, copias de seguridad, guía de instalación. |
| `src/components/ui.tsx` | Piezas reutilizables: stepper numérico, hoja modal, control segmentado, gráfica SVG, temporizador de descanso. |
| `src/components/BodyMap.tsx` | El cuerpo SVG (frente/espalda) y la escala de calor en rojos. |
| `src/App.tsx` | Estado global, pestañas, persistencia automática. |
| `src/index.css` | Toda la estética (negro/gris/plata, transiciones). Variables en `:root`. |
| `assets/icon.svg` + `scripts/icons.mjs` | Icono fuente y script que genera los PNG (`npm run icons`). |
| `.github/workflows/deploy.yml` | Despliegue automático a GitHub Pages en cada push a `main`. |
| `vite.config.ts` | Configuración de build, PWA (manifest, service worker) y CSP de seguridad. |

## Datos y migraciones

El estado completo es un único objeto `AppData` (ver `src/types.ts`) guardado
bajo la clave `hierro-data-v1`. Lleva un campo `version`; al subirla, añade un
bloque de migración en `migrate()` (`src/lib/storage.ts`) para que los usuarios
existentes no pierdan nada:

- v1 → v2: músculos detallados (pecho dividido, 3 deltoides…), perfil corporal, vídeos.
- v2 → v3: catálogo general de ejercicios.

## Seguridad

- Sin backend ⇒ sin superficie de ataque de servidor: nadie puede "hackear tu
  cuenta" porque no existe; los datos no salen del dispositivo.
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
