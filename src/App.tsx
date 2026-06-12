import { useEffect, useState } from 'react'
import type { AppData } from './types'
import { loadData, requestPersistence, saveData } from './lib/storage'
import { WorkoutView } from './views/WorkoutView'
import { ProgressView } from './views/ProgressView'
import { MusclesView } from './views/MusclesView'
import { HistoryView } from './views/HistoryView'
import { TimerView } from './views/TimerView'
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
  // primera vez: la app te pide tus métricas (edad, sexo, altura, peso)
  const [askProfile, setAskProfile] = useState(() => !loadData().profile.prompted)

  useEffect(() => {
    requestPersistence()
  }, [])

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = (fn: (d: AppData) => AppData) => setData(fn)

  return (
    <div className="app">
      <main className="content" key={tab}>
        {tab === 'entreno' && <WorkoutView data={data} update={update} />}
        {tab === 'timer' && <TimerView data={data} update={update} />}
        {tab === 'progreso' && <ProgressView data={data} update={update} />}
        {tab === 'musculos' && <MusclesView data={data} />}
        {tab === 'historial' && <HistoryView data={data} update={update} />}
        {tab === 'ajustes' && (
          <SettingsView data={data} update={update} replace={setData} />
        )}
      </main>

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
