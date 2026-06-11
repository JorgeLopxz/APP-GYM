/** Extrae el ID de un vídeo de YouTube de cualquiera de sus formatos de URL. */
export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/
  )
  return m ? m[1] : null
}

/** URL de búsqueda en YouTube para la técnica de un ejercicio. */
export function youtubeSearchUrl(exerciseName: string): string {
  const q = encodeURIComponent(`${exerciseName} técnica ejercicio`)
  return `https://www.youtube.com/results?search_query=${q}`
}
