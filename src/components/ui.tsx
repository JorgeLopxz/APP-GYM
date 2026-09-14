import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronRight, ChevronsUpDown, Minus, Plus, Search, X } from 'lucide-react'
import { fmtWeight } from '../lib/stats'

const IOS_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// ---------------------------------------------------------------------------
// NumberField: stepper − valor + (acepta coma decimal)
// ---------------------------------------------------------------------------

export function NumberField(props: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  label?: string
  /** Texto accesible si no hay etiqueta visible */
  ariaLabel?: string
  className?: string
}) {
  const { value, onChange, step = 1, min = 0, label, ariaLabel, className = '' } = props
  const [text, setText] = useState<string | null>(null)

  const commit = (raw: string) => {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed >= min) onChange(Math.round(parsed * 100) / 100)
    setText(null)
  }

  return (
    <div className={`stepper ${className}`}>
      {label && <span className="stepper-label">{label}</span>}
      <div className="stepper-row">
        <button
          type="button"
          className="stepper-btn"
          aria-label={`Restar ${fmtWeight(step)}`}
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        >
          <Minus size={15} strokeWidth={2.6} />
        </button>
        <input
          className="stepper-input"
          type="text"
          inputMode="decimal"
          aria-label={ariaLabel ?? label}
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
          className="stepper-btn"
          aria-label={`Sumar ${fmtWeight(step)}`}
          onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        >
          <Plus size={15} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sheet: hoja modal estilo iOS. Se cierra arrastrando hacia abajo (hereda la
// velocidad del dedo y proyecta el impulso), tocando el fondo, con Escape o
// con la X. Si el padre la desmonta de golpe, un "fantasma" anima la salida.
// ---------------------------------------------------------------------------

let openSheets = 0
function lockScroll() {
  if (openSheets++ === 0) document.documentElement.classList.add('has-sheet')
}
function unlockScroll() {
  openSheets = Math.max(0, openSheets - 1)
  if (openSheets === 0) document.documentElement.classList.remove('has-sheet')
}

/** Resistencia tipo goma al pasar un límite (Apple, Designing Fluid Interfaces). */
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * overshoot)
}

interface SheetProps {
  open?: boolean
  onClose: () => void
  title?: ReactNode
  /** Acción a la izquierda de la cabecera (p. ej. Cancelar) */
  leading?: ReactNode
  /** Acción a la derecha (p. ej. Guardar). Sin ella aparece la X de cerrar. */
  trailing?: ReactNode
  children: ReactNode
  /** 'large' ocupa casi toda la pantalla; 'auto' se ajusta al contenido */
  size?: 'large' | 'auto'
  /** false = no se cierra con arrastre, fondo ni Escape (p. ej. generando) */
  dismissable?: boolean
  className?: string
}

export function Sheet(props: SheetProps) {
  if (props.open === false) return null
  return <SheetImpl {...props} />
}

function SheetImpl(props: SheetProps) {
  const {
    onClose,
    title,
    leading,
    trailing,
    children,
    size = 'auto',
    dismissable = true,
    className = ''
  } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const offset = useRef(0)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const dismissRef = useRef(dismissable)
  dismissRef.current = dismissable
  const drag = useRef<{ id: number; y0: number; samples: { y: number; t: number }[] } | null>(null)
  const titleId = useId()

  const apply = useCallback((y: number, duration = 0) => {
    offset.current = y
    const sheet = sheetRef.current
    const scrim = scrimRef.current
    if (!sheet) return
    sheet.style.transition = duration ? `transform ${duration}ms ${IOS_EASE}` : 'none'
    sheet.style.transform = y ? `translate3d(0, ${y}px, 0)` : ''
    if (scrim) {
      scrim.style.transition = duration ? `opacity ${duration}ms ${IOS_EASE}` : 'none'
      scrim.style.opacity = String(clamp(1 - y / Math.max(1, sheet.offsetHeight), 0, 1))
    }
  }, [])

  const close = useCallback(
    (velocity = 0) => {
      if (closing.current) return
      closing.current = true
      const sheet = sheetRef.current
      if (!sheet || reducedMotion()) {
        onCloseRef.current()
        return
      }
      const top = sheet.getBoundingClientRect().top - offset.current
      const target = window.innerHeight - top + 12
      const duration = Math.round(
        clamp(((target - offset.current) / Math.max(velocity, 1300)) * 1000, 200, 360)
      )
      apply(target, duration)
      window.setTimeout(() => onCloseRef.current(), duration)
    },
    [apply]
  )

  const track = (raw: number, y: number, t: number) => {
    const d = drag.current
    if (!d) return
    d.samples.push({ y, t })
    if (d.samples.length > 8) d.samples.shift()
    const h = sheetRef.current?.offsetHeight ?? 600
    apply(raw >= 0 ? raw : -rubberband(-raw, h))
  }

  const release = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const last = d.samples[d.samples.length - 1]
    const first = d.samples.find((s) => last.t - s.t <= 100) ?? d.samples[0]
    const velocity = ((last.y - first.y) / Math.max(1, last.t - first.t)) * 1000
    const h = sheetRef.current?.offsetHeight ?? 600
    // proyección del impulso (deceleración 0,99): a dónde "iría" la hoja
    const projected = offset.current + (velocity / 1000) * (0.99 / 0.01)
    if (offset.current > 0 && (projected > h * 0.45 || velocity > 1100)) close(velocity)
    else apply(0, 420)
  }

  // arrastre desde la cabecera (ratón y dedo)
  const onHeaderDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dismissRef.current || closing.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return
    drag.current = {
      id: e.pointerId,
      y0: e.clientY - offset.current,
      samples: [{ y: e.clientY, t: e.timeStamp }]
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onHeaderMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    track(e.clientY - d.y0, e.clientY, e.timeStamp)
  }
  const onHeaderUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) release()
  }

  // arrastre desde el contenido cuando ya está arriba del todo (táctil)
  useEffect(() => {
    const body = bodyRef.current
    const scrim = scrimRef.current
    if (!body) return
    let startX = 0
    let startY = 0
    let state: 'idle' | 'undecided' | 'drag' | 'scroll' = 'idle'
    const onStart = (e: TouchEvent) => {
      const t = e.target as HTMLElement
      if (
        !dismissRef.current ||
        closing.current ||
        e.touches.length !== 1 ||
        t.closest('input, textarea, select, iframe, [data-no-drag]')
      ) {
        state = 'scroll'
        return
      }
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      state = 'undecided'
    }
    const onMove = (e: TouchEvent) => {
      if (state === 'scroll' || state === 'idle') return
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      if (state === 'undecided') {
        const dx = x - startX
        const dy = y - startY
        const pullingDown = dy > 0 && Math.abs(dy) >= Math.abs(dx) && body.scrollTop <= 0
        if (!pullingDown) {
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) state = 'scroll'
          return
        }
        e.preventDefault()
        if (dy < 8) return
        state = 'drag'
        drag.current = { id: -1, y0: y, samples: [{ y, t: e.timeStamp }] }
      }
      e.preventDefault()
      track(y - (drag.current?.y0 ?? y), y, e.timeStamp)
    }
    const onEnd = () => {
      if (state === 'drag') release()
      state = 'idle'
    }
    const blockScroll = (e: TouchEvent) => e.preventDefault()
    body.addEventListener('touchstart', onStart, { passive: true })
    body.addEventListener('touchmove', onMove, { passive: false })
    body.addEventListener('touchend', onEnd)
    body.addEventListener('touchcancel', onEnd)
    scrim?.addEventListener('touchmove', blockScroll, { passive: false })
    return () => {
      body.removeEventListener('touchstart', onStart)
      body.removeEventListener('touchmove', onMove)
      body.removeEventListener('touchend', onEnd)
      body.removeEventListener('touchcancel', onEnd)
      scrim?.removeEventListener('touchmove', blockScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escape, foco y bloqueo del scroll de fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !dismissRef.current) return
      // solo la hoja de arriba del todo
      const roots = document.querySelectorAll('.sheet-root:not(.sheet-ghost)')
      if (roots[roots.length - 1] === rootRef.current) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  useLayoutEffect(() => {
    const mountedAt = performance.now()
    const rootEl = rootRef.current
    const sheetEl = sheetRef.current
    const previousFocus = document.activeElement as HTMLElement | null
    lockScroll()
    sheetEl?.focus({ preventScroll: true })
    return () => {
      unlockScroll()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
      // StrictMode desmonta y monta al instante: eso no es un cierre real
      if (closing.current || performance.now() - mountedAt < 80 || reducedMotion()) return
      if (!rootEl?.isConnected || !sheetEl) return
      const top = sheetEl.getBoundingClientRect().top - offset.current
      const ghost = rootEl.cloneNode(true) as HTMLElement
      ghost.querySelectorAll('iframe, video').forEach((n) => n.remove())
      ghost.classList.add('sheet-ghost')
      ghost.setAttribute('aria-hidden', 'true')
      document.body.appendChild(ghost)
      const gSheet = ghost.querySelector<HTMLElement>('.sheet')
      const gScrim = ghost.querySelector<HTMLElement>('.sheet-scrim')
      ghost.getBoundingClientRect() // fuerza el estilo inicial antes de animar
      if (gSheet) {
        gSheet.style.transition = `transform 300ms ${IOS_EASE}`
        gSheet.style.transform = `translate3d(0, ${window.innerHeight - top + 12}px, 0)`
      }
      if (gScrim) {
        gScrim.style.transition = 'opacity 260ms ease'
        gScrim.style.opacity = '0'
      }
      window.setTimeout(() => ghost.remove(), 320)
    }
  }, [])

  return createPortal(
    <div ref={rootRef} className={`sheet-root ${size === 'large' ? 'is-large' : ''}`}>
      <div
        ref={scrimRef}
        className="sheet-scrim"
        onClick={() => dismissRef.current && close()}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={`sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        <div
          className="sheet-header"
          onPointerDown={onHeaderDown}
          onPointerMove={onHeaderMove}
          onPointerUp={onHeaderUp}
          onPointerCancel={onHeaderUp}
        >
          <span className="sheet-grabber" aria-hidden="true" />
          <div className="sheet-bar">
            <div className="sheet-bar-side">{leading}</div>
            {title ? (
              <h2 id={titleId} className="sheet-title">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <div className="sheet-bar-side is-end">
              {trailing ?? (
                <button
                  type="button"
                  className="glass-btn"
                  onClick={() => close()}
                  aria-label="Cerrar"
                  disabled={!dismissable}
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div ref={bodyRef} className="sheet-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// PageHeader: título grande que se pliega en la barra al hacer scroll
// ---------------------------------------------------------------------------

export function PageHeader(props: {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  /** Título corto para la barra plegada (si el grande es largo) */
  compactTitle?: ReactNode
  /** Pantalla a dos columnas en escritorio: los botones se alinean con ella */
  wide?: boolean
}) {
  const { title, subtitle, leading, trailing, compactTitle, wide } = props
  const navRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [state, setState] = useState({ scrolled: false, compact: false })

  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 60
      const titleBottom = titleRef.current?.getBoundingClientRect().bottom ?? 999
      const next = { scrolled: window.scrollY > 2, compact: titleBottom <= navBottom + 2 }
      setState((s) => (s.scrolled === next.scrolled && s.compact === next.compact ? s : next))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* la barra vive en <body>: la animación de entrada de la pantalla crea
          un bloque contenedor que rompería el position: fixed */}
      {createPortal(
        <div
          ref={navRef}
          className={`navbar ${state.scrolled ? 'is-scrolled' : ''} ${state.compact ? 'is-compact' : ''} ${wide ? 'is-wide' : ''}`}
        >
          <div className="navbar-inner">
            <div className="navbar-side">{leading}</div>
            <div className="navbar-title" aria-hidden={!state.compact}>
              {compactTitle ?? title}
            </div>
            <div className="navbar-side is-end">{trailing}</div>
          </div>
        </div>,
        document.body
      )}
      <header className="large-title">
        <h1 ref={titleRef}>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
    </>
  )
}

// ---------------------------------------------------------------------------
// Listas agrupadas (inset grouped)
// ---------------------------------------------------------------------------

export function Section(props: {
  title?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  /** Sin caja blanca: el contenido va directo sobre el fondo */
  bare?: boolean
}) {
  const { title, action, footer, children, className = '', bare } = props
  return (
    <section className={`section ${className}`}>
      {(title || action) && (
        <div className="section-head">
          {title && <h2 className="section-title">{title}</h2>}
          {action}
        </div>
      )}
      {bare ? children : <div className="group">{children}</div>}
      {footer && <p className="section-foot">{footer}</p>}
    </section>
  )
}

export type Tone = 'tint' | 'green' | 'red' | 'gray' | 'indigo'

export function Row(props: {
  icon?: ReactNode
  tone?: Tone
  title: ReactNode
  subtitle?: ReactNode
  detail?: ReactNode
  accessory?: ReactNode
  chevron?: boolean
  onClick?: () => void
  destructive?: boolean
  tint?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}) {
  const {
    icon,
    tone = 'tint',
    title,
    subtitle,
    detail,
    accessory,
    chevron,
    onClick,
    destructive,
    tint,
    disabled,
    className = '',
    ariaLabel
  } = props
  const content = (
    <>
      {icon && (
        <span className={`row-icon tone-${tone}`} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="row-text">
        <span className="row-title">{title}</span>
        {subtitle && <span className="row-sub">{subtitle}</span>}
      </span>
      {detail !== undefined && detail !== null && <span className="row-detail">{detail}</span>}
      {accessory}
      {chevron && <ChevronRight className="row-chevron" size={17} strokeWidth={2.4} aria-hidden="true" />}
    </>
  )
  const cls = [
    'row',
    icon ? 'has-icon' : '',
    onClick ? 'is-button' : '',
    destructive ? 'is-destructive' : '',
    tint ? 'is-tint' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')
  return onClick ? (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  )
}

// ---------------------------------------------------------------------------
// Controles
// ---------------------------------------------------------------------------

export function Segmented<T extends string>(props: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel?: string
}) {
  const { options, value, onChange, ariaLabel } = props
  const idx = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ '--n': options.length, '--i': idx } as CSSProperties}
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          className={`segmented-btn ${opt.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Switch(props: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  const { checked, onChange, label, disabled } = props
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-thumb" />
    </button>
  )
}

/** Botón emergente de iOS: muestra la opción actual y abre el selector nativo. */
export function PopupSelect<T extends string>(props: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  ariaLabel: string
  className?: string
}) {
  const { value, options, onChange, ariaLabel, className = '' } = props
  const current = options.find((o) => o.value === value)
  return (
    <label className={`popup ${className}`}>
      <span className="popup-text">{current?.label ?? '—'}</span>
      <ChevronsUpDown size={14} strokeWidth={2.4} aria-hidden="true" />
      <select value={value} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchField(props: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  const { value, onChange, placeholder = 'Buscar', autoFocus } = props
  return (
    <label className="search">
      <Search size={17} strokeWidth={2.3} aria-hidden="true" />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Borrar búsqueda">
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </label>
  )
}

// ---------------------------------------------------------------------------
// Menu: menú contextual anclado a su botón (vidrio, escala desde el origen)
// ---------------------------------------------------------------------------

export interface MenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  destructive?: boolean
  checked?: boolean
  divider?: boolean
}

export function Menu(props: {
  items: MenuItem[]
  label: string
  children: ReactNode
  className?: string
  title?: string
}) {
  const { items, label, children, className = '', title } = props
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const close = () => setRect(null)

  useEffect(() => {
    if (!rect) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onScroll = () => close()
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [rect])

  let style: CSSProperties = {}
  if (rect) {
    const width = 250
    const estimated = items.length * 46 + (title ? 34 : 0) + 12
    const below = rect.bottom + 8 + estimated < window.innerHeight - 16
    const left = clamp(rect.right - width, 12, window.innerWidth - width - 12)
    style = {
      width,
      left,
      top: below ? rect.bottom + 6 : undefined,
      bottom: below ? undefined : window.innerHeight - rect.top + 6,
      transformOrigin: `${rect.left + rect.width / 2 - left}px ${below ? 'top' : 'bottom'}`
    }
  }

  const onMenuKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const list = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = list.indexOf(document.activeElement as HTMLElement)
    const next = list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]
    next?.focus()
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={!!rect}
        aria-label={label}
        onClick={() => setRect(btnRef.current?.getBoundingClientRect() ?? null)}
      >
        {children}
      </button>
      {rect &&
        createPortal(
          <div className="menu-layer" onClick={close} onContextMenu={(e) => e.preventDefault()}>
            <div
              ref={menuRef}
              className="menu"
              role="menu"
              aria-label={label}
              style={style}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={onMenuKey}
            >
              {title && <p className="menu-title">{title}</p>}
              {items.map((item, i) => (
                <button
                  key={`${item.label}-${i}`}
                  type="button"
                  role="menuitem"
                  className={`menu-item ${item.destructive ? 'is-destructive' : ''} ${item.divider ? 'has-divider' : ''}`}
                  onClick={() => {
                    close()
                    item.onSelect()
                  }}
                >
                  <span className="menu-check" aria-hidden="true">
                    {item.checked && <Check size={16} strokeWidth={2.6} />}
                  </span>
                  <span className="menu-label">{item.label}</span>
                  {item.icon && <span className="menu-icon">{item.icon}</span>}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Estado vacío
// ---------------------------------------------------------------------------

export function EmptyState(props: {
  icon: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">
        {props.icon}
      </span>
      <p className="empty-title">{props.title}</p>
      {props.children && <p className="empty-text">{props.children}</p>}
      {props.action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LineChart: gráfica tipo Salud. Se lee arrastrando el dedo por encima.
// ---------------------------------------------------------------------------

/** Curva monótona (Fritsch–Carlson): suave pero sin inventar picos. */
function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length
  if (n === 0) return ''
  if (n === 1) return `M${pts[0].x},${pts[0].y}`
  if (n === 2) return `M${pts[0].x},${pts[0].y}L${pts[1].x},${pts[1].y}`
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x
    m[i] = (pts[i + 1].y - pts[i].y) / dx[i]
  }
  const t: number[] = new Array(n)
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
    } else {
      const a = t[i] / m[i]
      const b = t[i + 1] / m[i]
      const h = a * a + b * b
      if (h > 9) {
        const s = 3 / Math.sqrt(h)
        t[i] = s * a * m[i]
        t[i + 1] = s * b * m[i]
      }
    }
  }
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${(pts[i].x + h).toFixed(1)},${(pts[i].y + h * t[i]).toFixed(1)} ${(pts[i + 1].x - h).toFixed(1)},${(pts[i + 1].y - h * t[i + 1]).toFixed(1)} ${pts[i + 1].x.toFixed(1)},${pts[i + 1].y.toFixed(1)}`
  }
  return d
}

/** Marcas redondas del eje (75, 80, 85…) con algo de aire por arriba y por abajo. */
function niceTicks(min: number, max: number): number[] {
  const span = max - min
  const raw = span > 0 ? span / 2 : Math.max(1, Math.abs(max) * 0.1)
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow
  let lo = Math.floor(min / step) * step
  let hi = Math.ceil(max / step) * step
  if (hi - max < step * 0.15) hi += step
  if (min - lo < step * 0.15 && lo - step >= 0) lo -= step
  lo = Math.max(0, lo)
  if (hi <= lo) hi = lo + step
  const out: number[] = []
  for (let v = lo; v <= hi + step / 1000 && out.length < 7; v += step) {
    out.push(Math.round(v * 1000) / 1000)
  }
  return out
}

export function LineChart(props: {
  points: { label: string; value: number; detail?: string }[]
  unit?: string
  emptyText?: string
}) {
  const { points, unit = '', emptyText = 'Sin datos todavía.' } = props
  const [selected, setSelected] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const signature = points.map((p) => p.value).join(',')

  useEffect(() => setSelected(null), [signature])

  if (points.length === 0) {
    return <div className="chart chart-empty">{emptyText}</div>
  }

  const sel = selected === null ? points.length - 1 : Math.min(selected, points.length - 1)
  const W = 340
  const H = 190
  const PAD = { top: 14, right: 40, bottom: 26, left: 8 }
  const values = points.map((p) => p.value)
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]
  const x = (i: number) =>
    points.length === 1 ? (PAD.left + W - PAD.right) / 2 : PAD.left + (i * (W - PAD.left - PAD.right)) / (points.length - 1)
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.top - PAD.bottom)
  const pts = points.map((p, i) => ({ x: x(i), y: y(p.value) }))
  const line = monotonePath(pts)
  const base = H - PAD.bottom
  const area = points.length > 1 ? `${line} L${pts[pts.length - 1].x.toFixed(1)},${base} L${pts[0].x.toFixed(1)},${base} Z` : ''

  const pick = (clientX: number) => {
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const vx = ((clientX - r.left) / r.width) * W
    let best = 0
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].x - vx) < Math.abs(pts[best].x - vx)) best = i
    setSelected(best)
  }

  const fmt = (v: number) => fmtWeight(Math.round(v * 10) / 10)
  const current = points[sel]

  return (
    <div className="chart">
      <div className="chart-readout" aria-live="polite">
        <span className="chart-value">
          {fmt(current.value)}
          {unit && <span className="chart-unit"> {unit}</span>}
        </span>
        <span className="chart-date">
          {current.label}
          {current.detail ? ` · ${current.detail}` : ''}
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={`Gráfica con ${points.length} registros. Usa las flechas para recorrerla.`}
        tabIndex={0}
        data-no-drag
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          pick(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons || e.pointerType !== 'mouse') pick(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSelected(Math.max(0, sel - 1))
          if (e.key === 'ArrowRight') setSelected(Math.min(points.length - 1, sel + 1))
        }}
      >
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="chart-grid" x1={PAD.left} x2={W - PAD.right + 4} y1={y(t)} y2={y(t)} />
            <text className="chart-tick" x={W - PAD.right + 8} y={y(t) + 3.5}>
              {fmt(t)}
            </text>
          </g>
        ))}
        {area && <path d={area} fill="url(#chartArea)" />}
        {points.length > 1 && (
          <path key={signature} d={line} className="chart-line" pathLength={1} />
        )}
        <line className="chart-rule" x1={pts[sel].x} x2={pts[sel].x} y1={PAD.top - 6} y2={base} />
        {pts.map((p, i) =>
          i === sel ? null : <circle key={i} className="chart-dot" cx={p.x} cy={p.y} r={points.length > 24 ? 0 : 3} />
        )}
        <circle className="chart-dot is-selected" cx={pts[sel].x} cy={pts[sel].y} r={5.5} />
        <text
          className="chart-tick"
          x={points.length === 1 ? pts[0].x : PAD.left}
          y={H - 6}
          textAnchor={points.length === 1 ? 'middle' : undefined}
        >
          {points[0].label}
        </text>
        {points.length > 1 && (
          <text className="chart-tick" x={W - PAD.right} y={H - 6} textAnchor="end">
            {points[points.length - 1].label}
          </text>
        )}
      </svg>
      {points.length === 1 && (
        <p className="chart-note">Un solo registro: la línea aparece desde la segunda sesión.</p>
      )}
    </div>
  )
}
