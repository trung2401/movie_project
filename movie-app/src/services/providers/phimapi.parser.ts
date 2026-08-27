import { DEFAULT_IMAGE_BASE_URL } from '@/constants/movie'
import type { Movie, MovieListResult } from '@/types/movie'
import { createMovieListPagination } from './pagination'

interface PhimApiListPayload {
  data?: {
    items?: Movie[]
    params?: { itemBaseUrl?: string; pagination?: unknown }
    APP_DOMAIN_CDN_IMAGE?: string
  }
  items?: Movie[]
  pagination?: unknown
}

type MovieWithDescription = Movie & {
  description?: string
  summary?: string
  desc?: string
}

function normalizeMovieDescription(movie: Movie): Movie {
  const metadata = movie as MovieWithDescription
  if (metadata.content?.trim()) return movie

  const content = [metadata.description, metadata.summary, metadata.desc]
    .find((value) => value?.trim())

  return content ? { ...movie, content } : movie
}

export function parsePhimApiListResponse(payload: unknown, requestedPage: number): MovieListResult {
  const data = payload as PhimApiListPayload
  const rawItems = Array.isArray(data.data?.items) ? data.data.items : Array.isArray(data.items) ? data.items : []
  const items = rawItems.map(normalizeMovieDescription)
  const baseUrl = data.data?.params?.itemBaseUrl || data.data?.APP_DOMAIN_CDN_IMAGE || DEFAULT_IMAGE_BASE_URL

  return {
    items,
    baseUrl,
    pagination: createMovieListPagination(data.data?.params?.pagination ?? data.pagination, items.length, requestedPage),
  }
}
