import { useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { AppData } from '../../types'
import {
  canonicalBrand,
  knownBrand,
  normalizeText,
  OTHER_BRANDS,
  POPULAR_BRANDS
} from '../../data/brands'
import { brandsForExercise, recentBrands } from '../../lib/stats'
import { Row, SearchField, Section, Sheet } from '../../components/ui'

/**
 * Selector de marca de máquina: sin marca, las usadas con este ejercicio, las
 * recientes, las más habituales y todas las demás (A–Z). Se puede escribir una
 * que no esté en la lista.
 */
export function BrandPickerSheet(props: {
  data: AppData
  exerciseId?: string
  exerciseName?: string
  value?: string
  onChange: (brand: string | undefined) => void
  onClose: () => void
}) {
  const { data, exerciseId, exerciseName, value, onChange, onClose } = props
  const [query, setQuery] = useState('')
  const q = normalizeText(query)

  const used = useMemo(
    () => (exerciseId ? brandsForExercise(data, exerciseId) : []),
    [data, exerciseId]
  )
  const recent = useMemo(
    () => recentBrands(data).filter((b) => !used.includes(b)).slice(0, 5),
    [data, used]
  )
  const shown = new Set([...used, ...recent])
  const matches = (name: string) => !q || normalizeText(name).includes(q)
  const exact =
    !!q &&
    ([...POPULAR_BRANDS, ...OTHER_BRANDS].some((b) => normalizeText(b.name) === q) ||
      [...shown].some((b) => normalizeText(b) === q))

  const pick = (brand?: string) => {
    onChange(brand)
    onClose()
  }

  const check = (name?: string) =>
    (value ?? '') === (name ?? '') ? (
      <Check className="row-check" size={20} strokeWidth={2.6} aria-label="Seleccionada" />
    ) : null

  const brandRow = (name: string) => (
    <Row
      key={name}
      title={name}
      subtitle={knownBrand(name)?.country}
      onClick={() => pick(name)}
      accessory={check(name)}
    />
  )

  const popular = POPULAR_BRANDS.filter((b) => !shown.has(b.name) && matches(b.name))
  const others = OTHER_BRANDS.filter((b) => !shown.has(b.name) && matches(b.name))
  const usedShown = used.filter(matches)
  const recentShown = recent.filter(matches)

  return (
    <Sheet onClose={onClose} title="Marca de la máquina" size="large">
      <div className="picker-top">
        <SearchField value={query} onChange={setQuery} placeholder="Buscar o escribir una marca" />
      </div>

      {!q && (
        <p className="sheet-lead">
          {exerciseName
            ? `Tu historial de ${exerciseName} se guarda aparte para cada marca: 80 kg en una máquina no son 80 kg en otra.`
            : 'Cada marca guarda su propio historial, récords y pre-relleno.'}
        </p>
      )}

      {query.trim() && !exact && (
        <Section>
          <Row
            icon={<Plus />}
            title={`Usar «${query.trim()}»`}
            subtitle="Una marca que no está en la lista"
            tint
            onClick={() => pick(canonicalBrand(query))}
          />
        </Section>
      )}

      {!q && (
        <Section>
          <Row title="Sin marca" subtitle="Genérica o no lo sé" onClick={() => pick(undefined)} accessory={check(undefined)} />
        </Section>
      )}

      {usedShown.length > 0 && (
        <Section title="Con este ejercicio">{usedShown.map(brandRow)}</Section>
      )}
      {recentShown.length > 0 && <Section title="Recientes">{recentShown.map(brandRow)}</Section>}
      {popular.length > 0 && (
        <Section title="Más habituales">{popular.map((b) => brandRow(b.name))}</Section>
      )}
      {others.length > 0 && (
        <Section
          title="Otras marcas"
          footer="Solo mostramos el nombre de cada marca; HIERRO no está afiliada a ninguna."
        >
          {others.map((b) => brandRow(b.name))}
        </Section>
      )}
    </Sheet>
  )
}
