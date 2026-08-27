import axios from 'axios'
import { API_BASE } from '@/constants/movie'
import type { Movie } from '@/types/movie'
import type { MovieProvider } from './types'
import { parsePhimApiListResponse } from './phimapi.parser'
import { getRequestedPage } from './pagination'

const REQUEST_TIMEOUT_MS = 5_000

interface PhimApiDetailPayload {
  data?: { item?: Movie }
}

export const phimapiProvider: MovieProvider = {
  name: 'phimapi',

  async getMovieList(endpoint) {
    const response = await axios.get<unknown>(endpoint, { timeout: REQUEST_TIMEOUT_MS })
    return parsePhimApiListResponse(response.data, getRequestedPage(endpoint))
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
