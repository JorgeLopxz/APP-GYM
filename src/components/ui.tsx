import { ReactNode, useEffect, useState } from 'react'
import { fmtWeight } from '../lib/stats'

// ---------------------------------------------------------------------------
// NumberField: campo numérico con botones − / + (acepta coma decimal)
// ---------------------------------------------------------------------------

export function NumberField(props: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  label?: string
}) {
  const { value, onChange, step = 1, min = 0, label } = props
  const [text, setText] = useState<string | null>(null)

  const commit = (raw: string) => {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed >= min) onChange(Math.round(parsed * 100) / 100)
    setText(null)
  }

  return (
    <div className="numfield">
      {label && <span className="numfield-label">{label}</span>}
      <div className="numfield-row">
        <button
          type="button"
          className="numfield-btn"
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={text ?? fmtWeight(value)}
          onChange={(e) => setText(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
        />
        <button
          type="button"
          className="numfield-btn"
          onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sheet: hoja modal que sube desde abajo
// ---------------------------------------------------------------------------

export function Sheet(props: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  const { open, onClose, title, children } = props
  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && <h3 className="sheet-title">{title}</h3>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Segmented: control segmentado
// ---------------------------------------------------------------------------

export function Segmented<T extends string>(props: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented">
      {props.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`segmented-btn ${props.value === opt.value ? 'active' : ''}`}
          onClick={() => props.onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LineChart: gráfica de líneas SVG con estética plata
// ---------------------------------------------------------------------------

export function LineChart(props: {
  points: { label: string; value: number }[]
  unit?: string
}) {
  const { points, unit = '' } = props
  const [selected, setSelected] = useState<number | null>(
    points.length > 0 ? points.length - 1 : null
  )

  useEffect(() => {
    setSelected(points.length > 0 ? points.length - 1 : null)
  }, [points.length, points.map((p) => p.value).join(',')])

  if (points.length === 0) {
    return <div className="chart-empty">Sin datos todavía. Registra entrenos para ver tu progreso.</div>
  }

  const W = 340
  const H = 180
  const PAD = { top: 16, right: 16, bottom: 26, left: 38 }
  const values = points.map((p) => p.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || max || 1
  const yMax = max + span * 0.15
  const yMin = Math.max(0, min - span * 0.15)

  const x = (i: number) =>
    points.length === 1
      ? W / 2
      : PAD.left + (i * (W - PAD.left - PAD.right)) / (points.length - 1)
  const y = (v: number) =>
    PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.top - PAD.bottom)

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ')
  const area = `${path} L${x(points.length - 1).toFixed(1)},${H - PAD.bottom} L${x(0).toFixed(1)},${H - PAD.bottom} Z`

  const ticks = [yMin, (yMin + yMax) / 2, yMax]

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8e8e9a" />
            <stop offset="0.5" stopColor="#f0f0f6" />
            <stop offset="1" stopColor="#b9b9c6" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4d4de" stopOpacity="0.22" />
            <stop offset="1" stopColor="#d4d4de" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#26262c"
              strokeDasharray="3 4"
            />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" className="chart-tick">
              {fmtWeight(Math.round(t * 10) / 10)}
            </text>
          </g>
        ))}
        {points.length > 1 && <path d={area} fill="url(#areaGrad)" />}
        {points.length > 1 && (
          <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" className="chart-line" />
        )}
        {points.map((p, i) => (
          <g key={i} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
            <circle cx={x(i)} cy={y(p.value)} r="12" fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={selected === i ? 5 : 3.5}
              fill={selected === i ? '#f0f0f6' : '#0a0a0c'}
              stroke="#d4d4de"
              strokeWidth="2"
            />
          </g>
        ))}
        <text x={PAD.left} y={H - 8} className="chart-tick">
          {points[0].label}
        </text>
        <text x={W - PAD.right} y={H - 8} textAnchor="end" className="chart-tick">
          {points[points.length - 1].label}
        </text>
      </svg>
      {selected !== null && (
        <div className="chart-info">
          <span className="chart-info-date">{points[selected].label}</span>
          <span className="chart-info-value">
            {fmtWeight(Math.round(points[selected].value * 10) / 10)} {unit}
          </span>
        </div>
      )}
    </div>
  )
}

