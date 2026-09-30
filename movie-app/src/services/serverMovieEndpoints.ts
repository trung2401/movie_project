import { API_BASE, LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import type { MovieFilters } from '@/types/movie'

export const HOME_MOVIE_SECTION_ENDPOINTS = {
  latest: LATEST_MOVIES_ENDPOINT,
  korean: `${API_BASE}/quoc-gia/han-quoc`,
  series: 'https://phimapi.com/danh-sach/phim-bo',
  single: 'https://phimapi.com/danh-sach/phim-le',
  animation: `${API_BASE}/the-loai/hoat-hinh`,
} as const

export type HomeMovieSectionKey = keyof typeof HOME_MOVIE_SECTION_ENDPOINTS

const HOME_MOVIE_LIMIT = 10

function pathSegment(value: string) {
  return encodeURIComponent(value.trim())
}

export function buildHomeMovieEndpoint(section: HomeMovieSectionKey, page = 1) {
  const endpoint = new URL(HOME_MOVIE_SECTION_ENDPOINTS[section])
  endpoint.searchParams.set('page', String(Math.max(1, page)))
  endpoint.searchParams.set('limit', String(HOME_MOVIE_LIMIT))
  return endpoint.toString()
}

export function buildMoviesEndpoint(filters: MovieFilters, keyword = '', page = 1) {
  const { type, country, genre, year } = filters
  let baseEndpoint = LATEST_MOVIES_ENDPOINT
  const queryParams = new URLSearchParams()

  if (keyword.trim()) {
    baseEndpoint = `${API_BASE}/tim-kiem`
    queryParams.set('keyword', keyword.trim())
  } else if (type) {
    baseEndpoint = `https://phimapi.com/danh-sach/${pathSegment(type)}`
  } else if (genre) {
    baseEndpoint = `${API_BASE}/the-loai/${pathSegment(genre)}`
  } else if (country) {
    baseEndpoint = `${API_BASE}/quoc-gia/${pathSegment(country)}`
  } else if (year) {
    baseEndpoint = `${API_BASE}/nam/${pathSegment(year)}`
  }

  if (country) queryParams.set('country', country)
  if (genre) queryParams.set('category', genre)
  if (year) queryParams.set('year', year)
  queryParams.set('page', String(Math.max(1, page)))
  const queryString = queryParams.toString()
  return queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint
}
