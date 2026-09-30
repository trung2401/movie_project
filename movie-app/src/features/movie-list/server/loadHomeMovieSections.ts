import { DEFAULT_IMAGE_BASE_URL } from '@/constants/movie'
import { buildHomeMovieEndpoint, type HomeMovieSectionKey } from '@/services/serverMovieEndpoints'
import { getCachedMovieList } from '@/services/serverMovieApi'
import type { Movie, MovieListResult } from '@/types/movie'

export interface HomeMovieSectionResult {
  result: MovieListResult
  error: string | null
}

function createEmptyResult(): MovieListResult {
  return {
    items: [],
    baseUrl: DEFAULT_IMAGE_BASE_URL,
    pagination: { hasNextPage: false },
  }
}

function dedupeMovies(movies: Movie[]) {
  const seen = new Set<string>()
  return movies.filter((movie) => {
    if (seen.has(movie.slug)) return false
    seen.add(movie.slug)
    return true
  })
}

export async function loadHomeMovieSection(section: HomeMovieSectionKey): Promise<HomeMovieSectionResult> {
  try {
    const result = await getCachedMovieList(buildHomeMovieEndpoint(section))
    return {
      result: { ...result, items: dedupeMovies(result.items) },
      error: null,
    }
  } catch (error) {
    console.error(`Home movie section "${section}" failed:`, error)
    return {
      result: createEmptyResult(),
      error: 'Không thể tải nội dung của mục này.',
    }
  }
}
