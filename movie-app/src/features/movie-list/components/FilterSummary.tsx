import { Search, SlidersHorizontal, X } from 'lucide-react'
import { COUNTRIES, GENRES, MOVIE_TYPES } from '@/constants/movie'
import type { MovieFilters } from '@/types/movie'

function getLabel(key: keyof MovieFilters, value: string) {
  const options = key === 'type' ? MOVIE_TYPES : key === 'country' ? COUNTRIES : key === 'genre' ? GENRES : []
  return options.find((option) => option.slug === value)?.label ?? value
}

export function FilterSummary({ filters, keyword, onReset, onRemove }: { filters: MovieFilters; keyword: string; onReset: () => void; onRemove?: (key: keyof MovieFilters) => void }) {
  const values = [filters.type, filters.country, filters.genre, filters.year, keyword.trim()]
  if (!values.some(Boolean)) return null
  const chips = (['type', 'country', 'genre', 'year'] as const).filter((key) => filters[key]).map((key) => ({ key, label: getLabel(key, filters[key]) }))
  return <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3"><SlidersHorizontal className="mt-0.5 size-4 shrink-0 text-[var(--color-primary-soft)]" /><div><p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Đang lọc theo</p><div className="mt-2 flex flex-wrap gap-2">{chips.map(({ key, label }) => <span key={key} className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white"><span>{label}</span>{onRemove && <button type="button" onClick={() => onRemove(key)} className="focus-ring inline-flex size-4 items-center justify-center rounded text-[var(--color-muted)] hover:text-white" aria-label={`Xóa bộ lọc ${label}`}><X className="size-3" /></button>}</span>)}{keyword.trim() && <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white"><Search className="size-3" />{keyword}</span>}</div></div></div>
    <button type="button" onClick={onReset} className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-xs font-bold text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white"><X className="size-4" />Xóa tất cả</button>
  </div>
}
