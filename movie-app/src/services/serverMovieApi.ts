import { parsePhimApiListResponse } from './providers/phimapi.parser'
import { getRequestedPage } from './providers/pagination'
import type { MovieListResult } from '@/types/movie'

const MOVIE_LIST_REVALIDATE_SECONDS = 300

export async function getCachedMovieList(endpoint: string): Promise<MovieListResult> {
  const response = await fetch(endpoint, {
    next: { revalidate: MOVIE_LIST_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Movie list request failed with status ${response.status}.`)
  }

  return parsePhimApiListResponse(await response.json(), getRequestedPage(endpoint))
}
