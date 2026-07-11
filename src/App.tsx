import { useEffect, useRef, useState, type TouchEvent as RTouchEvent } from 'react'
import type { AppData } from './types'
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
import { WorkoutView } from './views/WorkoutView'
import { ProgressView } from './views/ProgressView'
import { MusclesView } from './views/MusclesView'
import { HistoryView } from './views/HistoryView'
import { TimerView, TimerChip } from './views/TimerView'
import { SettingsView, ProfileSheet } from './views/SettingsView'

type Tab = 'entreno' | 'timer' | 'progreso' | 'musculos' | 'historial' | 'ajustes'

// iconos de línea de la tab bar (24×24, stroke redondeado)
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'entreno', label: 'Entreno', icon: 'M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11' },
  { id: 'timer', label: 'Descanso', icon: 'M12 21a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM12 9.5V13l2.3 2.3M9.5 3h5' },
  { id: 'progreso', label: 'Progreso', icon: 'M4 20h16M6.5 16.5l3.5-4.5 3 2.5 4.5-6' },
  { id: 'musculos', label: 'Músculos', icon: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 21c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5' },
  { id: 'historial', label: 'Historial', icon: 'M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1ZM4 9.5h16M8.5 3v4M15.5 3v4' },
  { id: 'ajustes', label: 'Ajustes', icon: 'M4 8h9M17 8h3M14 5v6M4 16h3M11 16h9M7 13v6' }
]

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [tab, setTab] = useState<Tab>('entreno')
  const [timer, setTimer] = useState<TimerState>(() =>
    loadTimer(loadData().settings.restSeconds)
  )
  // primera vez: la app te pide tus métricas (edad, sexo, altura, peso)
  const [askProfile, setAskProfile] = useState(() => !loadData().profile.prompted)

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

  const update = (fn: (d: AppData) => AppData) => setData(fn)

  const timerActive = timer.endsAt !== null || timer.pausedRemaining !== null

  // ---- deslizar horizontal para cambiar de pestaña (estilo iOS) ----
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null)

  const shiftTab = (delta: 1 | -1) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const j = i + delta
    if (j < 0 || j >= TABS.length) return
    setTab(TABS[j].id)
  }

  const onTouchStart = (e: RTouchEvent) => {
    const t = e.target as HTMLElement
    // no interceptar gestos sobre controles que ya usan el dedo
    if (t.closest('input, textarea, select, iframe, .sheet, .timer-ring')) {
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
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - s.t < 700) {
      shiftTab(dx < 0 ? 1 : -1)
    }
  }

  return (
    <div className="app">
      <main className="content" key={tab} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {tab === 'entreno' && <WorkoutView data={data} update={update} />}
        {tab === 'timer' && (
          <TimerView data={data} update={update} timer={timer} setTimer={setTimer} />
        )}
        {tab === 'progreso' && <ProgressView data={data} update={update} />}
        {tab === 'musculos' && <MusclesView data={data} />}
        {tab === 'historial' && <HistoryView data={data} update={update} />}
        {tab === 'ajustes' && (
          <SettingsView data={data} update={update} replace={setData} />
        )}
      </main>

      {timerActive && tab !== 'timer' && (
        <TimerChip
          timer={timer}
          onClick={() => setTab('timer')}
          onReset={() =>
            setTimer({ duration: timer.duration, endsAt: null, pausedRemaining: null })
          }
        />
      )}

      {askProfile && (
        <ProfileSheet data={data} update={update} onClose={() => setAskProfile(false)} />
      )}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <svg
              viewBox="0 0 24 24"
              className="tab-svg"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={t.icon} />
            </svg>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
