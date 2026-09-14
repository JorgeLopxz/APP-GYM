import { useMemo, useState } from 'react'
import { Link2, Search } from 'lucide-react'
import type { AppData, ExerciseDef, Update } from '../../types'
import { EQUIPMENT_LABEL, LEVEL_LABEL, MUSCLE_NAMES } from '../../types'
import { effectiveEquipment, exerciseSpecs, logLabel, musclesFor } from '../../lib/exercise'
import { fmtDate, fmtSet } from '../../lib/stats'
import { youtubeId, youtubeSearchUrl } from '../../lib/youtube'
import { Row, Section, Sheet } from '../../components/ui'

/** Ficha de un ejercicio: vídeo corto de técnica, especificaciones, claves e historial. */
export function ExerciseInfoSheet(props: {
  data: AppData
  def: ExerciseDef
  variant?: string
  update: Update
  onClose: () => void
}) {
  const { data, def, variant, update, onClose } = props
  const specs = exerciseSpecs(def)
  const muscles = musclesFor(def, variant)
  const [editingVideo, setEditingVideo] = useState(false)
  const [videoInput, setVideoInput] = useState(def.videoUrl ?? '')
  const videoId = def.videoUrl ? youtubeId(def.videoUrl) : null

  const history = useMemo(() => {
    const out: { date: string; label: string; sets: string }[] = []
    const sessions = data.sessions
      .filter((s) => s.finished)
      .sort((a, b) => b.date.localeCompare(a.date))
    for (const session of sessions) {
      for (const log of session.exercises) {
        if (log.exerciseId !== def.id || log.sets.length === 0) continue
        out.push({
          date: session.date,
          label: logLabel(log.variant, log.brand),
          sets: log.sets.map((s) => fmtSet(s, def.bodyweight)).join(' · ')
        })
      }
      if (out.length >= 5) break
    }
    return out.slice(0, 5)
  }, [data, def])

  const saveVideo = () => {
    const url = videoInput.trim()
    if (url && !youtubeId(url)) {
      alert('Eso no parece un enlace de YouTube válido.')
      return
    }
    update((d) => ({
      ...d,
      exercises: d.exercises.map((e) => (e.id === def.id ? { ...e, videoUrl: url || undefined } : e))
    }))
    setEditingVideo(false)
  }

  return (
    <Sheet onClose={onClose} title={def.name} size="large">
      {videoId ? (
        <div className="video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={`Técnica: ${def.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <Section>
          <Row
            icon={<Search />}
            tone="red"
            title="Buscar la técnica en YouTube"
            subtitle="Este ejercicio aún no tiene vídeo"
            chevron
            onClick={() => window.open(youtubeSearchUrl(def.name), '_blank', 'noopener')}
          />
        </Section>
      )}

      <Section title="Ficha">
        <Row title="Material" detail={EQUIPMENT_LABEL[effectiveEquipment(def, variant)]} />
        {specs.mechanic && (
          <Row title="Tipo" detail={specs.mechanic === 'compuesto' ? 'Compuesto' : 'Aislamiento'} />
        )}
        {specs.level && <Row title="Nivel" detail={LEVEL_LABEL[specs.level]} />}
        <Row title="Ejecución" detail={specs.unilateral ? 'Unilateral' : 'Bilateral'} />
        {def.bodyweight && <Row title="Carga" detail="Tu peso + lastre" />}
        {def.variants.length > 0 && <Row title="Variantes" subtitle={def.variants.join(' · ')} />}
      </Section>

      {specs.cues.length > 0 && (
        <Section title="Claves de técnica">
          {specs.cues.map((cue, i) => (
            <div key={i} className="cue">
              <span className="cue-num">{i + 1}</span>
              <span>{cue}</span>
            </div>
          ))}
        </Section>
      )}

      <Section title="Músculos" bare footer="En color, los principales; en gris, los que ayudan.">
        <div className="chips">
          {muscles.primary.map((m) => (
            <span key={m} className="chip is-soft">
              {MUSCLE_NAMES[m]}
            </span>
          ))}
          {muscles.secondary.map((m) => (
            <span key={m} className="chip">
              {MUSCLE_NAMES[m]}
            </span>
          ))}
        </div>
      </Section>

      {history.length > 0 && (
        <Section title="Últimas sesiones">
          {history.map((h, i) => (
            <Row
              key={i}
              title={<span className="tabular">{h.sets}</span>}
              subtitle={`${fmtDate(h.date)}${h.label ? ` · ${h.label}` : ''}`}
            />
          ))}
        </Section>
      )}

      <Section title="Vídeo de técnica" footer="Pega el enlace de un vídeo de YouTube que te guste más y lo verás aquí.">
        {editingVideo ? (
          <>
            <div className="field-row">
              <Link2 size={18} className="muted" aria-hidden="true" />
              <input
                type="url"
                inputMode="url"
                placeholder="https://youtu.be/…"
                value={videoInput}
                autoFocus
                onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveVideo()}
                aria-label="Enlace de YouTube"
              />
            </div>
            <Row title="Guardar vídeo" tint onClick={saveVideo} />
          </>
        ) : (
          <Row
            title={def.videoUrl ? 'Cambiar vídeo' : 'Poner mi vídeo'}
            tint
            onClick={() => setEditingVideo(true)}
          />
        )}
      </Section>
    </Sheet>
  )
}
