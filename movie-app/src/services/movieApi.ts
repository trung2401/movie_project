import { API_BASE, DEFAULT_IMAGE_BASE_URL, LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import { movieProviderManager } from './providers'
import type { Episode, Movie, MovieFilters, MovieListResult } from '@/types/movie'

export function buildMoviesEndpoint(filters: MovieFilters, keyword = '', page = 1) {
  const { type, country, genre, year } = filters
  let baseEndpoint = LATEST_MOVIES_ENDPOINT
  const queryParams = new URLSearchParams()

  if (keyword.trim()) {
    baseEndpoint = `${API_BASE}/tim-kiem`
    queryParams.set('keyword', keyword.trim())
  } else if (type) {
    baseEndpoint = `https://phimapi.com/danh-sach/${type}`
  } else if (genre) {
    baseEndpoint = `${API_BASE}/the-loai/${genre}`
  } else if (country) {
    baseEndpoint = `${API_BASE}/quoc-gia/${country}`
  } else if (year) {
    baseEndpoint = `${API_BASE}/nam/${year}`
  }

  if (country) queryParams.set('country', country)
  if (genre) queryParams.set('category', genre)
  if (year) queryParams.set('year', year)
  queryParams.set('page', String(page))
  const queryString = queryParams.toString()
  return queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint
}

export async function getMovieList(endpoint = LATEST_MOVIES_ENDPOINT): Promise<MovieListResult> {
  return movieProviderManager.getMovieListWithFallback(endpoint)
}

export function getFallbackEpisodes(slug: string): Episode[] {
  return [{ name: '1', slug: `${slug}-tap-1`, link_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }]
}

export async function getMovieDetail(slug: string): Promise<Movie> {
  return movieProviderManager.getMovieDetailWithFallback(slug)
}
