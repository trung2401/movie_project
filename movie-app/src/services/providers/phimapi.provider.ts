import axios from 'axios'
import { API_BASE, DEFAULT_IMAGE_BASE_URL } from '@/constants/movie'
import type { Movie, MovieListResult } from '@/types/movie'
import type { MovieProvider } from './types'

const REQUEST_TIMEOUT_MS = 5_000

interface PhimApiListPayload {
  data?: {
    items?: Movie[]
    params?: { itemBaseUrl?: string }
    APP_DOMAIN_CDN_IMAGE?: string
  }
  items?: Movie[]
}

interface PhimApiDetailPayload {
  data?: { item?: Movie }
}

function parseMovieListResponse(payload: unknown): MovieListResult {
  const data = payload as PhimApiListPayload
  const items = Array.isArray(data.data?.items) ? data.data.items : Array.isArray(data.items) ? data.items : []
  const baseUrl = data.data?.params?.itemBaseUrl || data.data?.APP_DOMAIN_CDN_IMAGE || DEFAULT_IMAGE_BASE_URL

  return { items, baseUrl }
}

export const phimapiProvider: MovieProvider = {
  name: 'phimapi',

  async getMovieList(endpoint) {
    const response = await axios.get<unknown>(endpoint, { timeout: REQUEST_TIMEOUT_MS })
    return parseMovieListResponse(response.data)
  },

  async getMovieDetail(slug) {
    try {
      const response = await axios.get<unknown>(`${API_BASE}/phim/${slug}`, { timeout: REQUEST_TIMEOUT_MS })
      return (response.data as PhimApiDetailPayload).data?.item ?? null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },
}
