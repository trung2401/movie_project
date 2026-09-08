import { DEFAULT_IMAGE_BASE_URL } from '@/constants/movie'
import { buildHomeMovieEndpoint, HOME_MOVIE_SECTION_ENDPOINTS, type HomeMovieSectionKey } from '@/services/movieApi'
import { getCachedMovieList } from '@/services/serverMovieApi'
import type { Movie, MovieListResult } from '@/types/movie'

export interface HomeMovieSectionResult {
  result: MovieListResult
  error: string | null
}

export type HomeMovieSectionsResult = Record<HomeMovieSectionKey, HomeMovieSectionResult>

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

async function loadSection(section: HomeMovieSectionKey): Promise<HomeMovieSectionResult> {
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

export async function loadHomeMovieSections(): Promise<HomeMovieSectionsResult> {
  const sections = Object.keys(HOME_MOVIE_SECTION_ENDPOINTS) as HomeMovieSectionKey[]
  const results = await Promise.all(sections.map((section) => loadSection(section)))

  return sections.reduce((loadedSections, section, index) => {
    loadedSections[section] = results[index]
    return loadedSections
  }, {} as HomeMovieSectionsResult)
}
