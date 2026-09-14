import { useRef, useState } from 'react'
import {
  Bell,
  BellOff,
  CalendarPlus,
  Check,
  Download,
  LoaderCircle,
  Pill,
  Trash2,
  Upload,
  User
} from 'lucide-react'
import type { AppData, Update } from '../types'
import { currentBodyweight } from '../types'
import { creatineStreak, fmtWeight, todayKey } from '../lib/stats'
import { exportJSON, importJSON, resetData } from '../lib/storage'
import { downloadCreatineICS } from '../lib/ics'
import { disablePush, enablePush, pushDiagnostics, syncPushHour, testServerPush } from '../lib/push'
import { NumberField, Row, Section, Segmented, Sheet, Switch } from '../components/ui'

/** Versión visible de la app. Súbela en cada release. */
export const APP_VERSION = 'v0.21'

// ---------------------------------------------------------------------------
// Perfil corporal: la app pide tus métricas para afinar los cálculos
// ---------------------------------------------------------------------------

export function ProfileSheet(props: { data: AppData; update: Update; onClose: () => void }) {
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
          pesoLog: [...log, { date: today, kg: peso }].sort((a, b) => a.date.localeCompare(b.date)),
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
    <Sheet
      onClose={skip}
      title="Tu perfil"
      size="large"
      leading={
        <button type="button" className="btn btn-plain" onClick={skip}>
          Ahora no
        </button>
      }
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={save}>
          Guardar
        </button>
      }
    >
      <p className="sheet-lead">
        Cada móvil guarda sus propios datos. Con tu peso, las dominadas cuentan los kilos reales y se
        estiman tus calorías; si eres mujer, el mapa muscular muestra un cuerpo femenino.
      </p>
      <Section>
        <div className="field-row">
          <input
            placeholder="¿Cómo te llamas?"
            value={nombre}
            autoComplete="given-name"
            onChange={(e) => setNombre(e.target.value)}
            aria-label="Nombre"
          />
        </div>
      </Section>
      <Section title="Datos corporales">
        <Row title="Edad" accessory={<NumberField value={edad} step={1} min={10} onChange={setEdad} ariaLabel="Edad en años" />} />
        <Row
          title="Sexo"
          accessory={
            <div className="row-segmented">
              <Segmented
                ariaLabel="Sexo"
                value={sexo}
                onChange={setSexo}
                options={[
                  { value: 'M', label: 'Hombre' },
                  { value: 'F', label: 'Mujer' }
                ]}
              />
            </div>
          }
        />
        <Row
          title="Altura"
          subtitle="cm"
          accessory={<NumberField value={altura} step={1} min={100} onChange={setAltura} ariaLabel="Altura en centímetros" />}
        />
        <Row
          title="Peso"
          subtitle="kg"
          accessory={<NumberField value={peso} step={0.5} min={30} onChange={setPeso} ariaLabel="Peso en kilos" />}
        />
      </Section>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Ajustes (desde el avatar)
// ---------------------------------------------------------------------------

export function SettingsSheet(props: {
  data: AppData
  update: Update
  replace: (d: AppData) => void
  onClose: () => void
}) {
  const { data, update, replace, onClose } = props
  const { settings, profile } = data
  const fileRef = useRef<HTMLInputElement>(null)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [busy, setBusy] = useState(false)

  const takenToday = settings.creatineTaken.includes(todayKey())
  const streak = creatineStreak(settings.creatineTaken)
  const bw = currentBodyweight(profile)
  const initial = profile.nombre?.trim().charAt(0).toUpperCase()

  const meta = [
    profile.edad ? `${profile.edad} años` : '',
    profile.alturaCm ? `${profile.alturaCm} cm` : '',
    bw ? `${fmtWeight(bw)} kg` : ''
  ]
    .filter(Boolean)
    .join(' · ')

  const setSettings = (patch: Partial<AppData['settings']>) =>
    update((d) => ({ ...d, settings: { ...d.settings, ...patch } }))

  const toggleTaken = () =>
    update((d) => {
      const t = todayKey() // fresco: a prueba de medianoche
      const has = d.settings.creatineTaken.includes(t)
      return {
        ...d,
        settings: {
          ...d.settings,
          creatineTaken: has ? d.settings.creatineTaken.filter((x) => x !== t) : [...d.settings.creatineTaken, t]
        }
      }
    })

  const togglePush = () => {
    setBusy(true)
    if (settings.pushEnabled) {
      void disablePush().then(() => {
        setSettings({ pushEnabled: false })
        setNotifMsg('Avisos desactivados en este móvil.')
        setBusy(false)
      })
      return
    }
    setNotifMsg('Activando…')
    void enablePush(settings.creatineHour).then((result) => {
      if (result === 'ok') {
        setSettings({ pushEnabled: true })
        // confirmación automática: te llega un push ahora mismo
        void testServerPush().then((r) =>
          setNotifMsg(
            r.includes('201') || r.includes('AHORA')
              ? '¡Activados! Te acabamos de enviar un aviso de prueba.'
              : 'Activados, pero el aviso de prueba no salió: ' + r
          )
        )
      } else {
        setNotifMsg(result)
      }
      setBusy(false)
    })
  }

  const diag = pushDiagnostics()

  return (
    <Sheet
      onClose={onClose}
      title="Ajustes"
      size="large"
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={onClose}>
          OK
        </button>
      }
    >
      <div className="profile-card">
        <span className="avatar-lg" aria-hidden="true">
          {initial ?? <User size={40} strokeWidth={2} />}
        </span>
        <span className="profile-name">{profile.nombre ?? 'Tu perfil'}</span>
        <span className="profile-meta">{meta || 'Añade tus datos para afinar calorías y dominadas'}</span>
        <button type="button" className="btn btn-tinted btn-sm" onClick={() => setEditingProfile(true)}>
          {profile.edad ? 'Editar perfil' : 'Completar perfil'}
        </button>
      </div>

      <Section
        title="Creatina"
        footer={
          settings.creatineEnabled
            ? 'Aparece en Entreno cada día hasta que la marques.'
            : 'Actívalo para llevar la cuenta de tus días seguidos.'
        }
      >
        <Row
          icon={<Pill />}
          title="Recordatorio diario"
          accessory={
            <Switch
              checked={settings.creatineEnabled}
              onChange={(v) => setSettings({ creatineEnabled: v })}
              label="Recordatorio diario de creatina"
            />
          }
        />
        {settings.creatineEnabled && (
          <>
            <Row
              title="Hora del aviso"
              accessory={
                <input
                  type="time"
                  className="time-input"
                  value={settings.creatineHour}
                  aria-label="Hora del recordatorio"
                  onChange={(e) => {
                    const hour = e.target.value
                    setSettings({ creatineHour: hour })
                    if (settings.pushEnabled) void syncPushHour(hour)
                  }}
                />
              }
            />
            <Row
              title="Tomada hoy"
              subtitle={streak > 0 ? `${streak} ${streak === 1 ? 'día seguido' : 'días seguidos'}` : undefined}
              accessory={
                <button
                  type="button"
                  className={`check-circle ${takenToday ? 'is-on' : ''}`}
                  onClick={toggleTaken}
                  aria-pressed={takenToday}
                  aria-label={takenToday ? 'Desmarcar la creatina de hoy' : 'Marcar la creatina como tomada'}
                >
                  <Check size={18} strokeWidth={3} />
                </button>
              }
            />
          </>
        )}
      </Section>

      {settings.creatineEnabled && (
        <Section
          title="Avisos en el móvil"
          footer={`Llegan aunque tengas la app cerrada: la creatina a las ${settings.creatineHour} y cada hora hasta que la marques, y el fin de cada descanso. Necesita HIERRO instalada en la pantalla de inicio (iOS 16.4+).`}
        >
          <Row
            icon={settings.pushEnabled ? <BellOff /> : <Bell />}
            tone="red"
            title={settings.pushEnabled ? 'Desactivar avisos' : 'Activar avisos'}
            tint={!settings.pushEnabled}
            onClick={togglePush}
            disabled={busy}
            accessory={busy ? <LoaderCircle className="spin muted" size={20} aria-label="Cargando" /> : undefined}
          />
          {notifMsg && (
            <div className="row">
              <span className="row-sub" role="status">
                {notifMsg}
              </span>
            </div>
          )}
          {!settings.pushEnabled && (
            <div className="row">
              <span className="row-sub">
                {diag.standalone ? 'App instalada' : 'Ábrela desde su icono, no desde Safari'} ·{' '}
                {diag.permission === 'denied'
                  ? 'permiso bloqueado (Ajustes de iOS → Notificaciones → HIERRO)'
                  : diag.permission === 'granted'
                    ? 'permiso concedido'
                    : 'permiso sin pedir'}
              </span>
            </div>
          )}
          <Row
            icon={<CalendarPlus />}
            tone="gray"
            title="Añadir al calendario"
            subtitle="Alternativa sin avisos del servidor"
            onClick={() => downloadCreatineICS(settings.creatineHour)}
          />
        </Section>
      )}

      <Section
        title="Tus datos"
        footer="Todo se guarda solo en este móvil; nada se sube a la nube. Haz una copia de vez en cuando por si cambias de dispositivo."
      >
        <Row icon={<Download />} tone="gray" title="Exportar copia de seguridad" onClick={() => exportJSON(data)} />
        <Row icon={<Upload />} tone="gray" title="Importar copia" onClick={() => fileRef.current?.click()} />
        <Row
          icon={<Trash2 />}
          tone="red"
          title="Borrar todo y empezar de cero"
          destructive
          onClick={() => {
            if (
              confirm('¿Borrar TODOS tus datos y empezar de cero? Esto vacía tu historial, rutinas y perfil en este móvil.')
            ) {
              void disablePush().finally(() => replace(resetData()))
            }
          }}
        />
      </Section>
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
              if (confirm('¿Sustituir todos los datos actuales por la copia?')) replace(imported)
            })
            .catch(() => alert('Ese archivo no parece una copia de HIERRO.'))
          e.target.value = ''
        }}
      />

      <Section title="Instalar en el iPhone">
        {[
          'Abre esta web en Safari.',
          'Toca Compartir: el cuadrado con la flecha.',
          'Elige «Añadir a pantalla de inicio».',
          'Abre HIERRO desde su icono: pantalla completa y sin conexión.'
        ].map((step, i) => (
          <div key={i} className="cue">
            <span className="cue-num">{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </Section>

      <p className="version-line">
        HIERRO {APP_VERSION} · {data.exercises.length} ejercicios en tu catálogo
        <br />
        Hecho a medida para Jorge
      </p>

      {editingProfile && (
        <ProfileSheet data={data} update={update} onClose={() => setEditingProfile(false)} />
      )}
    </Sheet>
  )
}
