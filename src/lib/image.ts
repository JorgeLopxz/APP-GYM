/**
 * Recorta un cuadrado de una imagen y lo reduce a un avatar JPEG (~5–30 KB)
 * como data URL, para que quepa en localStorage y viaje en la copia.
 * sx/sy/side están en píxeles de la imagen original.
 */
export function cropToDataUrl(
  img: HTMLImageElement,
  sx: number,
  sy: number,
  side: number,
  size = 256
): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Sin canvas')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', 0.85)
}

/** Avatar cuadrado recortado al centro (sin ajuste manual). */
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
    return cropToDataUrl(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      size
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
