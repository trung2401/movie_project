import type { MovieFilters } from '@/types/movie'

export type MovieListSearchParams = Record<string, string | string[] | undefined>

function firstQueryValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : ''
}

function firstQueryPage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstQueryValue(value), 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function parseMovieListQuery(query: MovieListSearchParams) {
  const filters: MovieFilters = {
    type: firstQueryValue(query.type),
    country: firstQueryValue(query.country),
    genre: firstQueryValue(query.genre),
    year: firstQueryValue(query.year),
  }

  return {
    filters,
    keyword: firstQueryValue(query.keyword),
    page: firstQueryPage(query.page),
  }
}
