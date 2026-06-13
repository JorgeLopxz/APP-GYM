import { useRef, useState } from 'react'
import type { AppData } from '../types'
import { currentBodyweight } from '../types'
import { creatineStreak, fmtWeight, todayKey } from '../lib/stats'
import { exportJSON, importJSON, resetData } from '../lib/storage'
import { downloadCreatineICS } from '../lib/ics'
import {
  disablePush,
  enablePush,
  pushDiagnostics,
  syncPushHour,
  testServerPush
} from '../lib/push'
import { NumberField, Segmented, Sheet } from '../components/ui'

type Update = (fn: (d: AppData) => AppData) => void

/** Versión visible de la app. Súbela en cada release. */
export const APP_VERSION = 'v0.11'

// ---------------------------------------------------------------------------
// Perfil corporal: la app pide tus métricas para afinar los cálculos
// ---------------------------------------------------------------------------

export function ProfileSheet(props: {
  data: AppData
  update: Update
  onClose: () => void
}) {
  const { data, update, onClose } = props
  const p = data.profile
  const [nombre, setNombre] = useState(p.nombre ?? '')
  const [edad, setEdad] = useState(p.edad ?? 20)
  const [sexo, setSexo] = useState<'M' | 'F'>(p.sexo ?? 'M')
  const [altura, setAltura] = useState(p.alturaCm ?? 175)
  const [peso, setPeso] = useState(currentBodyweight(p) ?? 70)

  const save = () => {
    update((d) => {
      const today = todayKey()
      const log = d.profile.pesoLog.filter((e) => e.date !== today)
      return {
        ...d,
        profile: {
          ...d.profile,
          nombre: nombre.trim() || undefined,
          edad,
          sexo,
          alturaCm: altura,
          pesoLog: [...log, { date: today, kg: peso }].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
          prompted: true
        }
      }
    })
    onClose()
  }

  const skip = () => {
    update((d) => ({ ...d, profile: { ...d.profile, prompted: true } }))
    onClose()
  }

  return (
    <Sheet open onClose={skip} title="Cuéntame sobre ti 💪">
      <p className="sheet-hint">
        Tu nombre identifica esta copia de la app (cada móvil guarda sus propios
        datos). Con tu peso corporal las dominadas cuentan los kilos de verdad y el
        progreso se mide también en relación a lo que pesas. Si eres mujer, el mapa
        muscular muestra un cuerpo femenino.
      </p>
      <div className="profile-grid">
        <input
          className="text-input"
          placeholder="¿Cómo te llamas?"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="settings-row">
          <span>Edad</span>
          <NumberField value={edad} step={1} min={10} onChange={setEdad} />
        </div>
        <div className="settings-row">
          <span>Sexo</span>
          <Segmented
            value={sexo}
            onChange={setSexo}
            options={[
              { value: 'M', label: 'Hombre' },
              { value: 'F', label: 'Mujer' }
            ]}
          />
        </div>
        <div className="settings-row">
          <span>Altura (cm)</span>
          <NumberField value={altura} step={1} min={100} onChange={setAltura} />
        </div>
        <div className="settings-row">
          <span>Peso (kg)</span>
          <NumberField value={peso} step={0.5} min={30} onChange={setPeso} />
        </div>
      </div>
      <div className="sheet-actions">
        <button type="button" className="btn-ghost" onClick={skip}>
          Ahora no
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          Guardar
        </button>
      </div>
    </Sheet>
  )
}

export function SettingsView(props: {
  data: AppData
  update: Update
  replace: (d: AppData) => void
}) {
  const { data, update, replace } = props
  const { settings, profile } = data
  const fileRef = useRef<HTMLInputElement>(null)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [busy, setBusy] = useState(false)

  const today = todayKey()
  const takenToday = settings.creatineTaken.includes(today)
  const streak = creatineStreak(settings.creatineTaken)
  const bw = currentBodyweight(profile)

  return (
    <div className="view">
      <h1 className="view-title">Ajustes</h1>

      <section className="settings-section">
        <h2 className="settings-title">👤 Perfil</h2>
        <p className="hint-block">
          {profile.edad
            ? `${profile.nombre ? profile.nombre + ' · ' : ''}${profile.edad} años · ${profile.alturaCm ?? '—'} cm · ${
                bw ? `${fmtWeight(bw)} kg` : 'sin peso registrado'
              }`
            : 'Aún sin datos. Con tu nombre te saludamos al entrar; con edad, altura y peso afinamos las dominadas con peso real y la estimación de calorías.'}
        </p>
        <button type="button" className="btn-ghost" onClick={() => setEditingProfile(true)}>
          ✏️ {profile.edad ? 'Editar perfil' : 'Completar perfil'}
        </button>
        {editingProfile && (
          <ProfileSheet data={data} update={update} onClose={() => setEditingProfile(false)} />
        )}
      </section>

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
                onChange={(e) => {
                  const hour = e.target.value
                  update((d) => ({
                    ...d,
                    settings: { ...d.settings, creatineHour: hour }
                  }))
                  if (settings.pushEnabled) void syncPushHour(hour)
                }}
              />
            </div>
            <div className="creatine-status">
              <button
                type="button"
                className={`btn-primary ${takenToday ? 'taken' : ''}`}
                onClick={() =>
                  update((d) => {
                    const t = todayKey() // fresco: a prueba de medianoche
                    const has = d.settings.creatineTaken.includes(t)
                    return {
                      ...d,
                      settings: {
                        ...d.settings,
                        creatineTaken: has
                          ? d.settings.creatineTaken.filter((x) => x !== t)
                          : [...d.settings.creatineTaken, t]
                      }
                    }
                  })
                }
              >
                {takenToday ? 'Tomada hoy ✓' : 'Marcar tomada hoy'}
              </button>
              <span className="streak">🔥 {streak} días seguidos</span>
            </div>
            <button
              type="button"
              className={settings.pushEnabled ? 'btn-ghost' : 'btn-primary'}
              disabled={busy}
              onClick={() => {
                if (settings.pushEnabled) {
                  setBusy(true)
                  void disablePush().then(() => {
                    update((d) => ({
                      ...d,
                      settings: { ...d.settings, pushEnabled: false }
                    }))
                    setNotifMsg('Avisos desactivados en este móvil.')
                    setBusy(false)
                  })
                } else {
                  setBusy(true)
                  setNotifMsg('Activando…')
                  void enablePush(settings.creatineHour).then((result) => {
                    if (result === 'ok') {
                      update((d) => ({
                        ...d,
                        settings: { ...d.settings, pushEnabled: true }
                      }))
                      // confirmación automática: te llega un push ahora mismo
                      void testServerPush().then((r) =>
                        setNotifMsg(
                          r.includes('201') || r.includes('AHORA')
                            ? '¡Activado! Te acabamos de enviar un aviso de prueba — debería sonarte ya. ✓'
                            : 'Activado, pero el aviso de prueba no salió: ' + r
                        )
                      )
                    } else {
                      setNotifMsg(result)
                    }
                    setBusy(false)
                  })
                }
              }}
            >
              {settings.pushEnabled
                ? '🔕 Desactivar avisos'
                : '🔔 Activar avisos en el móvil'}
            </button>
            <p className="hint-block">
              Lo envía nuestro servidor aunque tengas la app cerrada o el móvil
              bloqueado. Empieza a las {settings.creatineHour} y{' '}
              <strong>repite cada hora hasta que marques «tomada»</strong>. El icono
              lleva un <strong>puntito rojo</strong> mientras quede pendiente.
            </p>
            <p className="hint-block">
              Necesita HIERRO instalada en la pantalla de inicio (iOS 16.4+) y aceptar
              el permiso. ¿Prefieres no usar avisos del servidor? Puedes añadir el
              recordatorio a tu calendario:
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => downloadCreatineICS(settings.creatineHour)}
            >
              📅 Añadir al calendario del móvil
            </button>
            {notifMsg && <p className="hint-block">{notifMsg}</p>}
            {!settings.pushEnabled && <PushDiagnostics />}
          </>
        )}
      </section>

      <section className="settings-section">
        <h2 className="settings-title">💾 Tus datos</h2>
        <p className="hint-block">
          Todo se guarda solo en este móvil, nada se sube a la nube. Haz una copia de
          vez en cuando por si cambias de dispositivo.
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
            if (
              confirm(
                '¿Borrar TODOS tus datos y empezar de cero? Esto vacía tu historial, rutinas y perfil en este móvil.'
              )
            ) {
              void disablePush().finally(() => replace(resetData()))
            }
          }}
        >
          🗑 Borrar todo y empezar de cero
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

      <p className="version-line">
        HIERRO {APP_VERSION} — hecho a medida para Jorge 🏋️
      </p>
    </div>
  )
}

/** Estado del push, visible solo si aún no está activado (ayuda a configurarlo). */
function PushDiagnostics() {
  const d = pushDiagnostics()
  return (
    <p className="hint-block">
      Estado: {d.standalone ? 'app instalada ✓' : 'ábrela desde su icono, no desde Safari'}
      {' · '}
      {d.permission === 'denied'
        ? 'permiso bloqueado (Ajustes de iOS → Notificaciones → HIERRO)'
        : d.permission === 'granted'
          ? 'permiso concedido ✓'
          : 'permiso sin pedir'}
    </p>
  )
}
