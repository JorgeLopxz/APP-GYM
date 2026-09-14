/**
 * Convierte una foto (de la galería o la cámara) en un avatar cuadrado,
 * recortado al centro y reducido, como data URL JPEG (~20–30 KB). Así cabe en
 * localStorage y viaja dentro de la copia de seguridad.
 */
export async function squareAvatar(file: File, size = 256): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('No se pudo leer la imagen'))
      el.src = url
    })
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    if (!side) throw new Error('Imagen vacía')
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Sin canvas')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    )
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
