import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent as RTouchEvent
} from 'react'
import {
  BicepsFlexed,
  CalendarDays,
  Dumbbell,
  Timer,
  TrendingUp,
  type LucideIcon
} from 'lucide-react'
import type { AppData, Update } from './types'
import {
  loadData,
  loadTimer,
  requestPersistence,
  saveData,
  saveTimer,
  type TimerState
} from './lib/storage'
import { todayKey } from './lib/stats'
import { notifyTimerDone, timerBeep, updateCreatineBadge } from './lib/notify'
import { markCreatineTakenOnServer } from './lib/push'
import { ChromeContext } from './components/chrome'
import { WorkoutView } from './views/WorkoutView'
import { ProgressView } from './views/ProgressView'
import { MusclesView } from './views/MusclesView'
import { HistoryView } from './views/HistoryView'
import { TimerAccessory, TimerView } from './views/TimerView'
import { ProfileSheet, SettingsSheet } from './views/SettingsView'

type Tab = 'entreno' | 'timer' | 'progreso' | 'musculos' | 'historial'

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'entreno', label: 'Entreno', Icon: Dumbbell },
  { id: 'timer', label: 'Descanso', Icon: Timer },
  { id: 'progreso', label: 'Progreso', Icon: TrendingUp },
  { id: 'musculos', label: 'Músculos', Icon: BicepsFlexed },
  { id: 'historial', label: 'Historial', Icon: CalendarDays }
]

/** Gestos que no deben cambiar de pestaña: controles que ya usan el dedo. */
const NO_SWIPE =
  'input, textarea, select, iframe, .sheet-root, .menu-layer, .chart-svg, .chip-scroll, .edit-grip, .timer-dial, [data-no-drag]'

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [tab, setTab] = useState<Tab>('entreno')
  const [dir, setDir] = useState<0 | 1 | -1>(0)
  const [rootKey, setRootKey] = useState(0)
  const [timer, setTimer] = useState<TimerState>(() =>
    loadTimer(loadData().settings.restSeconds)
  )
  // primera vez: la app te pide tus métricas (edad, sexo, altura, peso)
  const [askProfile, setAskProfile] = useState(() => !loadData().profile.prompted)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const backRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    requestPersistence()
  }, [])

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    saveTimer(timer)
  }, [timer])

  // pitido + notificación al llegar a cero, estés en la pestaña que estés
  const beepedAt = useRef<number | null>(null)
  useEffect(() => {
    if (timer.endsAt === null || timer.pausedRemaining !== null) return
    if (Date.now() >= timer.endsAt) return // ya estaba terminado al montar
    const endsAt = timer.endsAt
    const id = setInterval(() => {
      if (Date.now() >= endsAt && beepedAt.current !== endsAt) {
        beepedAt.current = endsAt
        timerBeep()
        // si hay push activo, el aviso llega del servidor: no dupliques
        if (!data.settings.pushEnabled) void notifyTimerDone()
        clearInterval(id)
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.endsAt, timer.pausedRemaining])

  // puntito en el icono mientras la creatina del día esté pendiente
  useEffect(() => {
    const refresh = () =>
      updateCreatineBadge(
        data.settings.creatineEnabled &&
          !data.settings.creatineTaken.includes(todayKey())
      )
    refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [data.settings.creatineEnabled, data.settings.creatineTaken])

  // al marcar la creatina de hoy, dile al servidor que pare de insistir
  const lastTakenSync = useRef<string>('')
  useEffect(() => {
    if (!data.settings.pushEnabled) return
    const today = todayKey()
    if (data.settings.creatineTaken.includes(today) && lastTakenSync.current !== today) {
      lastTakenSync.current = today
      void markCreatineTakenOnServer(today)
    }
  }, [data.settings.pushEnabled, data.settings.creatineTaken])

  const update: Update = useCallback((fn) => setData(fn), [])

  const goTab = (next: Tab) => {
    if (next === tab) {
      // como en iOS: tocar la pestaña activa sube arriba y, si ya lo estás,
      // vuelve a la pantalla raíz de la sección
      if (window.scrollY > 4) window.scrollTo({ top: 0, behavior: 'smooth' })
      else setRootKey((k) => k + 1)
      return
    }
    const i = TABS.findIndex((t) => t.id === tab)
    const j = TABS.findIndex((t) => t.id === next)
    setDir(j > i ? 1 : -1)
    setTab(next)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  // ---- deslizar horizontal para cambiar de pestaña; desde el borde, volver ----
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null)
  const onTouchStart = (e: RTouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(NO_SWIPE)) {
      swipe.current = null
      return
    }
    const touch = e.touches[0]
    swipe.current = { x: touch.clientX, y: touch.clientY, t: Date.now() }
  }
  const onTouchEnd = (e: RTouchEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - s.x
    const dy = touch.clientY - s.y
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8 || Date.now() - s.t > 700) return
    if (s.x < 32 && dx > 0 && backRef.current) {
      backRef.current()
      return
    }
    const i = TABS.findIndex((t) => t.id === tab)
    const j = i + (dx < 0 ? 1 : -1)
    if (j >= 0 && j < TABS.length) goTab(TABS[j].id)
  }

  const chrome = useMemo(
    () => ({
      openSettings: () => setSettingsOpen(true),
      name: data.profile.nombre,
      setBack: (fn: (() => void) | null) => {
        backRef.current = fn
      }
    }),
    [data.profile.nombre]
  )

  const timerActive = timer.endsAt !== null || timer.pausedRemaining !== null
  const showAccessory = timerActive && tab !== 'timer'
  const tabIndex = TABS.findIndex((t) => t.id === tab)

  return (
    <ChromeContext.Provider value={chrome}>
      <div className={`app ${showAccessory ? 'has-accessory' : ''}`}>
        <main
          className={`content ${dir === 1 ? 'slide-next' : dir === -1 ? 'slide-prev' : ''}`}
          key={`${tab}-${rootKey}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {tab === 'entreno' && <WorkoutView data={data} update={update} />}
          {tab === 'timer' && (
            <TimerView update={update} timer={timer} setTimer={setTimer} />
          )}
          {tab === 'progreso' && <ProgressView data={data} update={update} />}
          {tab === 'musculos' && <MusclesView data={data} />}
          {tab === 'historial' && <HistoryView data={data} update={update} />}
        </main>

        {showAccessory && (
          <TimerAccessory
            timer={timer}
            setTimer={setTimer}
            update={update}
            onOpen={() => goTab('timer')}
          />
        )}

        <nav className="tabbar" aria-label="Secciones">
          <div className="tabbar-inner" style={{ '--i': tabIndex } as CSSProperties}>
            <span className="tab-indicator" aria-hidden="true" />
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={`tab ${tab === id ? 'is-active' : ''}`}
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => goTab(id)}
              >
                <Icon strokeWidth={tab === id ? 2.3 : 1.9} aria-hidden="true" />
                <span className="tab-label">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {settingsOpen && (
          <SettingsSheet
            data={data}
            update={update}
            replace={setData}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {askProfile && (
          <ProfileSheet data={data} update={update} onClose={() => setAskProfile(false)} />
        )}
      </div>
    </ChromeContext.Provider>
  )
}
