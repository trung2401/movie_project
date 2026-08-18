import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { MovieFilters } from '@/types/movie'

export function FilterSummary({ filters, keyword, onReset }: { filters: MovieFilters; keyword: string; onReset: () => void }) {
  const values = [filters.type, filters.country, filters.genre, filters.year, keyword.trim()]
  if (!values.some(Boolean)) return null
  return <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-md shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3"><SlidersHorizontal className="mt-0.5 size-4 shrink-0 text-[var(--color-primary-soft)]" /><div><p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Đang lọc theo</p><div className="mt-2 flex flex-wrap gap-2">{filters.type && <span className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white">{filters.type}</span>}{filters.country && <span className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white">{filters.country}</span>}{filters.genre && <span className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white">{filters.genre}</span>}{filters.year && <span className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white">{filters.year}</span>}{keyword.trim() && <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-2 py-1 text-xs text-white"><Search className="size-3" />{keyword}</span>}</div></div></div>
    <button type="button" onClick={onReset} className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-xs font-bold text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white"><X className="size-4" />Xóa bộ lọc</button>
  </div>
}
