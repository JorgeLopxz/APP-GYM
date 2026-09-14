import { createContext, useContext, useEffect } from 'react'
import { User } from 'lucide-react'

/** Lo que cualquier pantalla necesita del armazón de la app. */
export const ChromeContext = createContext<{
  openSettings: () => void
  name?: string
  /** Registra la acción de «volver» para el gesto desde el borde izquierdo */
  setBack: (fn: (() => void) | null) => void
}>({ openSettings: () => {}, setBack: () => {} })

/** Avatar con la inicial del usuario: abre Perfil y ajustes (como en App Store). */
export function AvatarButton() {
  const { openSettings, name } = useContext(ChromeContext)
  const initial = name?.trim().charAt(0).toUpperCase()
  return (
    <button
      type="button"
      className="avatar-btn"
      onClick={openSettings}
      aria-label="Perfil y ajustes"
    >
      {initial ? <span>{initial}</span> : <User size={19} strokeWidth={2.2} />}
    </button>
  )
}

/** Mientras la pantalla esté montada, deslizar desde el borde izquierdo vuelve atrás. */
export function useBackGesture(onBack: () => void) {
  const { setBack } = useContext(ChromeContext)
  useEffect(() => {
    setBack(onBack)
    return () => setBack(null)
  }, [onBack, setBack])
}
