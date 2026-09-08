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
}

const optionsByKey: Record<QuickFilterKey, readonly MovieOption[]> = {
  type: MOVIE_TYPES,
  country: COUNTRIES,
  genre: GENRES,
}

const quickFilterDefinitions: ReadonlyArray<Pick<QuickFilter, 'key' | 'slug'>> = [
  { key: 'type', slug: 'phim-chieu-rap' },
  { key: 'type', slug: 'tv-shows' },
  { key: 'country', slug: 'han-quoc' },
  { key: 'country', slug: 'trung-quoc' },
  { key: 'genre', slug: 'tinh-cam' },
  { key: 'genre', slug: 'hanh-dong' },
  { key: 'genre', slug: 'hoat-hinh' },
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
