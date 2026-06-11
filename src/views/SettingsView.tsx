import { useRef, useState } from 'react'
import type { AppData } from '../types'
import { creatineStreak, todayKey } from '../lib/stats'
import { exportJSON, importJSON, resetData } from '../lib/storage'
import { downloadCreatineICS, testNotification } from '../lib/ics'
import { NumberField } from '../components/ui'

type Update = (fn: (d: AppData) => AppData) => void

export function SettingsView(props: {
  data: AppData
  update: Update
  replace: (d: AppData) => void
}) {
  const { data, update, replace } = props
  const { settings } = data
  const fileRef = useRef<HTMLInputElement>(null)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)

  const today = todayKey()
  const takenToday = settings.creatineTaken.includes(today)
  const streak = creatineStreak(settings.creatineTaken)

  return (
    <div className="view">
      <h1 className="view-title">Ajustes</h1>

      <section className="settings-section">
        <h2 className="settings-title">💊 Creatina</h2>
        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.creatineEnabled}
            onChange={(e) =>
              update((d) => ({
                ...d,
                settings: { ...d.settings, creatineEnabled: e.target.checked }
              }))
            }
          />
          Recordatorio diario activado
        </label>
        {settings.creatineEnabled && (
          <>
            <div className="settings-row">
              <span>Hora del recordatorio</span>
              <input
                type="time"
                className="time-input"
                value={settings.creatineHour}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    settings: { ...d.settings, creatineHour: e.target.value }
                  }))
                }
              />
            </div>
            <div className="creatine-status">
              <button
                type="button"
                className={`btn-primary ${takenToday ? 'taken' : ''}`}
                onClick={() =>
                  update((d) => ({
                    ...d,
                    settings: {
                      ...d.settings,
                      creatineTaken: takenToday
                        ? d.settings.creatineTaken.filter((x) => x !== today)
                        : [...d.settings.creatineTaken, today]
                    }
                  }))
                }
              >
                {takenToday ? 'Tomada hoy ✓' : 'Marcar tomada hoy'}
              </button>
              <span className="streak">🔥 {streak} días seguidos</span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => downloadCreatineICS(settings.creatineHour)}
            >
              📅 Añadir aviso diario al Calendario de iOS
            </button>
            <p className="hint-block">
              iOS no permite a las apps web programar notificaciones locales con la app
              cerrada. El truco fiable: este botón descarga un evento de calendario que
              se repite a diario a las {settings.creatineHour} con aviso — ábrelo y pulsa
              «Añadir todos». Funciona siempre, sin permisos raros.
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                void testNotification().then(setNotifMsg)
              }}
            >
              🔔 Probar notificaciones de la app
            </button>
            {notifMsg && <p className="hint-block">{notifMsg}</p>}
          </>
        )}
      </section>

      <section className="settings-section">
        <h2 className="settings-title">⏱ Descanso entre series</h2>
        <div className="settings-row">
          <span>Segundos</span>
          <NumberField
            value={settings.restSeconds}
            step={15}
            min={15}
            onChange={(restSeconds) =>
              update((d) => ({ ...d, settings: { ...d.settings, restSeconds } }))
            }
          />
        </div>
        <p className="hint-block">
          Al marcar una serie como hecha (✓) arranca el temporizador automáticamente.
        </p>
      </section>

      <section className="settings-section">
        <h2 className="settings-title">💾 Tus datos</h2>
        <p className="hint-block">
          Todo se guarda en tu móvil, no en internet. Haz una copia de vez en cuando por
          si cambias de dispositivo.
        </p>
        <button type="button" className="btn-ghost" onClick={() => exportJSON(data)}>
          ⬇️ Exportar copia de seguridad
        </button>
        <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
          ⬆️ Importar copia
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            importJSON(file)
              .then((imported) => {
                if (confirm('¿Sustituir todos los datos actuales por la copia?')) {
                  replace(imported)
                }
              })
              .catch(() => alert('Ese archivo no parece una copia de HIERRO.'))
            e.target.value = ''
          }}
        />
        <button
          type="button"
          className="btn-danger-ghost"
          onClick={() => {
            if (confirm('¿Borrar TODOS los datos y volver al estado inicial?')) {
              replace(resetData())
            }
          }}
        >
          🗑 Restablecer la app
        </button>
      </section>

      <section className="settings-section">
        <h2 className="settings-title">📲 Instalar en el iPhone</h2>
        <ol className="install-steps">
          <li>Abre esta web en <strong>Safari</strong>.</li>
          <li>Toca el botón <strong>Compartir</strong> (cuadrado con flecha).</li>
          <li>Elige <strong>«Añadir a pantalla de inicio»</strong>.</li>
          <li>Abre HIERRO desde su icono: pantalla completa, funciona sin conexión.</li>
        </ol>
      </section>

      <p className="version-line">HIERRO v0.1 — hecho a medida para Jorge 🏋️</p>
    </div>
  )
}
