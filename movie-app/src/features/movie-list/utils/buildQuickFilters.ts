import { COUNTRIES, GENRES, MOVIE_TYPES } from '@/constants/movie'
import type { MovieFilters } from '@/types/movie'

export type QuickFilterKey = keyof Pick<MovieFilters, 'type' | 'country' | 'genre'>

interface MovieOption {
  label: string
  slug: string
}

export interface QuickFilter {
  key: QuickFilterKey
  label: string
  slug: string
  gradient: string
}

const optionsByKey: Record<QuickFilterKey, readonly MovieOption[]> = {
  type: MOVIE_TYPES,
  country: COUNTRIES,
  genre: GENRES,
}

const quickFilterDefinitions: ReadonlyArray<Pick<QuickFilter, 'key' | 'slug' | 'gradient'>> = [
  { key: 'type', slug: 'phim-chieu-rap', gradient: 'from-blue-500 to-blue-900' },
  { key: 'type', slug: 'tv-shows', gradient: 'from-emerald-400 to-teal-900' },
  { key: 'country', slug: 'han-quoc', gradient: 'from-slate-400 to-violet-900' },
  { key: 'country', slug: 'trung-quoc', gradient: 'from-violet-500 to-fuchsia-900' },
  { key: 'genre', slug: 'tinh-cam', gradient: 'from-orange-400 to-rose-800' },
  { key: 'genre', slug: 'hanh-dong', gradient: 'from-red-500 to-red-950' },
  { key: 'genre', slug: 'hoat-hinh', gradient: 'from-zinc-500 to-slate-950' },
]

export function buildQuickFilters(): QuickFilter[] {
  return quickFilterDefinitions.map((definition) => {
    const option = optionsByKey[definition.key].find((item) => item.slug === definition.slug)

    if (!option) {
      throw new Error(`Không tìm thấy quick filter: ${definition.key}/${definition.slug}`)
    }

    return {
      ...definition,
      label: option.label,
    }
  })
}
