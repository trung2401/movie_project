import { API_BASE } from '@/constants/movie'
import type { Movie } from '@/types/movie'
import type { MovieProvider } from './types'
import { parsePhimApiListResponse } from './phimapi.parser'
import { getRequestedPage } from './pagination'

const REQUEST_TIMEOUT_MS = 5_000
const LIST_REVALIDATE_SECONDS = 300

interface PhimApiDetailPayload {
  data?: { item?: Movie }
}

export const phimapiProvider: MovieProvider = {
  name: 'phimapi',

  async getMovieList(endpoint) {
    const response = await fetch(endpoint, {
      next: { revalidate: LIST_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      const error = new Error(`Movie list request failed with status ${response.status}.`)
      Object.assign(error, { status: response.status })
      throw error
    }
    return parsePhimApiListResponse(await response.json(), getRequestedPage(endpoint))
  },

  async getMovieDetail(slug) {
    const response = await fetch(`${API_BASE}/phim/${encodeURIComponent(slug)}`, {
      next: { revalidate: LIST_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })
    if (response.status === 404) return null
    if (!response.ok) {
      const error = new Error(`Movie detail request failed with status ${response.status}.`)
      Object.assign(error, { status: response.status })
      throw error
    }

    return ((await response.json()) as PhimApiDetailPayload).data?.item ?? null
  },
}
