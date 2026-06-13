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

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'entreno', label: 'Entreno', icon: '🏋️' },
  { id: 'timer', label: 'Descanso', icon: '⏱' },
  { id: 'progreso', label: 'Progreso', icon: '📈' },
  { id: 'musculos', label: 'Músculos', icon: '🫀' },
  { id: 'historial', label: 'Historial', icon: '📒' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' }
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
  const [dir, setDir] = useState<1 | -1>(1)
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null)

  const goTab = (next: Tab, direction: 1 | -1) => {
    if (next === tab) return
    setDir(direction)
    setTab(next)
  }
  const shiftTab = (delta: 1 | -1) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const j = i + delta
    if (j < 0 || j >= TABS.length) return
    goTab(TABS[j].id, delta)
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
      <main
        className={`content ${dir === 1 ? 'slide-next' : 'slide-prev'}`}
        key={tab}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
