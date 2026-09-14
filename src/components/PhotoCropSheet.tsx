import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent
} from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { cropToDataUrl } from '../lib/image'
import { Sheet } from './ui'

const MAX_ZOOM = 5

interface View {
  z: number
  x: number
  y: number
}

/**
 * Ajuste de la foto de perfil: arrastra para encuadrar, pellizca (o usa el
 * control) para acercar y mira en vivo cómo queda en el círculo grande y en el
 * avatar pequeño de la barra.
 */
export function PhotoCropSheet(props: {
  file: File
  onCancel: () => void
  onDone: (dataUrl: string) => void
}) {
  const { file, onCancel, onDone } = props
  const boxRef = useRef<HTMLDivElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [box, setBox] = useState(300)
  const [view, setView] = useState<View>({ z: 1, x: 0, y: 0 })
  const viewRef = useRef(view)
  viewRef.current = view

  useEffect(() => {
    // `alive`: si el efecto se desmonta antes de cargar (StrictMode lo hace en
    // desarrollo), esa carga cancelada no debe marcar la foto como fallida
    let alive = true
    const url = URL.createObjectURL(file)
    const el = new Image()
    el.onload = () => {
      if (!alive) return
      setFailed(false)
      setImg(el)
    }
    el.onerror = () => {
      if (alive) setFailed(true)
    }
    el.src = url
    return () => {
      alive = false
      URL.revokeObjectURL(url)
    }
  }, [file])

  useLayoutEffect(() => {
    const measure = () => {
      const w = boxRef.current?.getBoundingClientRect().width
      if (w) setBox(w)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [img])

  const base = img ? box / Math.min(img.naturalWidth, img.naturalHeight) : 1

  /** Mantiene la imagen cubriendo siempre todo el cuadro. */
  const clamp = useCallback(
    (z: number, x: number, y: number): View => {
      if (!img) return { z, x, y }
      const zz = Math.min(MAX_ZOOM, Math.max(1, z))
      const k = base * zz
      const w = img.naturalWidth * k
      const h = img.naturalHeight * k
      return {
        z: zz,
        x: Math.min(0, Math.max(box - w, x)),
        y: Math.min(0, Math.max(box - h, y))
      }
    },
    [img, base, box]
  )

  // al cargar o cambiar de tamaño: centrada y sin zoom
  useEffect(() => {
    if (!img) return
    const k = base
    setView(clamp(1, (box - img.naturalWidth * k) / 2, (box - img.naturalHeight * k) / 2))
  }, [img, box, base, clamp])

  /** Zoom manteniendo fijo el punto (px, py) del cuadro. */
  const zoomAt = useCallback(
    (z2: number, px: number, py: number, from: View = viewRef.current) => {
      const zz = Math.min(MAX_ZOOM, Math.max(1, z2))
      const r = zz / from.z
      setView(clamp(zz, px - (px - from.x) * r, py - (py - from.y) * r))
    },
    [clamp]
  )

  // rueda del ratón (no pasiva para que no desplace la hoja)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(viewRef.current.z * Math.exp(-e.deltaY * 0.002), e.clientX - rect.left, e.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // arrastre con un dedo y pellizco con dos
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{
    view: View
    cx: number
    cy: number
    dist: number
  } | null>(null)

  const snapshot = () => {
    const pts = [...pointers.current.values()]
    const rect = boxRef.current!.getBoundingClientRect()
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length - rect.left
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length - rect.top
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
    gesture.current = { view: viewRef.current, cx, cy, dist }
  }

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    snapshot()
  }

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    const pts = [...pointers.current.values()]
    const rect = boxRef.current!.getBoundingClientRect()
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length - rect.left
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length - rect.top
    if (pts.length > 1 && g.dist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const z2 = Math.min(MAX_ZOOM, Math.max(1, g.view.z * (dist / g.dist)))
      const r = z2 / g.view.z
      // el punto que estaba bajo los dedos sigue bajo los dedos
      setView(clamp(z2, cx - (g.cx - g.view.x) * r, cy - (g.cy - g.view.y) * r))
    } else {
      setView(clamp(g.view.z, g.view.x + (cx - g.cx), g.view.y + (cy - g.cy)))
    }
  }

  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) snapshot()
    else gesture.current = null
  }

  const use = () => {
    if (!img) return
    const k = base * view.z
    onDone(cropToDataUrl(img, -view.x / k, -view.y / k, box / k))
  }

  const k = base * view.z
  const preview = (size: number) => {
    const f = size / box
    return img ? (
      <span className="crop-preview" style={{ width: size, height: size }}>
        <img
          src={img.src}
          alt=""
          draggable={false}
          style={{
            width: img.naturalWidth * k * f,
            height: img.naturalHeight * k * f,
            transform: `translate3d(${view.x * f}px, ${view.y * f}px, 0)`
          }}
        />
      </span>
    ) : null
  }

  return (
    <Sheet
      onClose={onCancel}
      title="Ajustar foto"
      size="large"
      leading={
        <button type="button" className="btn btn-plain" onClick={onCancel}>
          Cancelar
        </button>
      }
      trailing={
        <button type="button" className="glass-btn is-text is-tint" onClick={use} disabled={!img}>
          Usar
        </button>
      }
    >
      {failed ? (
        <p className="sheet-lead">No se pudo abrir esa imagen. Prueba con otra foto.</p>
      ) : (
        <div className="crop-wrap">
          <div
            ref={boxRef}
            className="crop-box"
            data-no-drag
            role="img"
            aria-label="Encuadre de la foto de perfil"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {img && (
              <img
                className="crop-img"
                src={img.src}
                alt=""
                draggable={false}
                style={{
                  width: img.naturalWidth * k,
                  height: img.naturalHeight * k,
                  transform: `translate3d(${view.x}px, ${view.y}px, 0)`
                }}
              />
            )}
            <span className="crop-ring" aria-hidden="true" />
          </div>

          <div className="crop-zoom">
            <button
              type="button"
              className="icon-btn"
              onClick={() => zoomAt(view.z - 0.25, box / 2, box / 2)}
              aria-label="Alejar"
            >
              <ZoomOut size={20} strokeWidth={2.2} />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={view.z}
              onChange={(e) => zoomAt(Number(e.target.value), box / 2, box / 2)}
              aria-label="Zoom de la foto"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => zoomAt(view.z + 0.25, box / 2, box / 2)}
              aria-label="Acercar"
            >
              <ZoomIn size={20} strokeWidth={2.2} />
            </button>
          </div>

          <div className="crop-previews" aria-hidden="true">
            <span className="crop-preview-item">
              {preview(88)}
              <span>Perfil</span>
            </span>
            <span className="crop-preview-item">
              {preview(36)}
              <span>Barra</span>
            </span>
          </div>

          <p className="section-foot">
            Arrastra para encuadrar y pellizca o usa el control para acercar. Lo que queda dentro del
            círculo es tu foto.
          </p>
        </div>
      )}
    </Sheet>
  )
}
