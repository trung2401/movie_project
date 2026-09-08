import { API_BASE, LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import { movieProviderManager } from './providers'
import type { Movie, MovieFilters, MovieListResult } from '@/types/movie'

export const HOME_MOVIE_SECTION_ENDPOINTS = {
  latest: LATEST_MOVIES_ENDPOINT,
  korean: `${API_BASE}/quoc-gia/han-quoc`,
  series: 'https://phimapi.com/danh-sach/phim-bo',
  single: 'https://phimapi.com/danh-sach/phim-le',
  animation: `${API_BASE}/the-loai/hoat-hinh`,
} as const

export type HomeMovieSectionKey = keyof typeof HOME_MOVIE_SECTION_ENDPOINTS

export function buildHomeMovieEndpoint(section: HomeMovieSectionKey, page = 1) {
  const endpoint = new URL(HOME_MOVIE_SECTION_ENDPOINTS[section])
  endpoint.searchParams.set('page', String(page))
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

export function getLatestMovies() {
  return getMovieList(buildHomeMovieEndpoint('latest'))
}

export function getHotKoreanMovies() {
  return getMovieList(buildHomeMovieEndpoint('korean'))
}

export function getFeaturedSeries() {
  return getMovieList(buildHomeMovieEndpoint('series'))
}

export function getFeaturedSingleMovies() {
  return getMovieList(buildHomeMovieEndpoint('single'))
}

export function getFeaturedAnimationMovies() {
  return getMovieList(buildHomeMovieEndpoint('animation'))
}

export async function getMovieDetail(slug: string): Promise<Movie> {
  return movieProviderManager.getMovieDetailWithFallback(slug)
}
