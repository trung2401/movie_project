import type { MovieFilters, MovieListResult } from '@/types/movie'

function appendFilter(params: URLSearchParams, key: string, value: string) {
  const trimmedValue = value.trim()
  if (trimmedValue) params.set(key, trimmedValue)
}

export function buildMovieListApiEndpoint(
  filters: MovieFilters,
  keyword = '',
  page = 1,
) {
  const params = new URLSearchParams()
  appendFilter(params, 'keyword', keyword)
  appendFilter(params, 'type', filters.type)
  appendFilter(params, 'country', filters.country)
  appendFilter(params, 'genre', filters.genre)
  appendFilter(params, 'year', filters.year)
  params.set('page', String(Math.max(1, page)))

  return `/api/movies?${params.toString()}`
}

export async function getMovieList(
  filters: MovieFilters,
  keyword = '',
  page = 1,
  signal?: AbortSignal,
): Promise<MovieListResult> {
  const response = await fetch(buildMovieListApiEndpoint(filters, keyword, page), {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    let message = `Movie list request failed with status ${response.status}.`

    try {
      const payload = await response.json() as { message?: unknown }
      if (typeof payload.message === 'string' && payload.message.trim()) message = payload.message
    } catch {
      // Keep the status-based message when the error response is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<MovieListResult>
}
