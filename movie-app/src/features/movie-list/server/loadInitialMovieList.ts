import { mockMovies } from '@/api/mockData'
import { isMockEnvironment } from '@/constants/environment'
import { DEFAULT_IMAGE_BASE_URL } from '@/constants/movie'
import { buildMoviesEndpoint } from '@/services/movieApi'
import { getCachedMovieList } from '@/services/serverMovieApi'
import type { MovieFilters, MovieListResult } from '@/types/movie'

interface InitialMovieList {
  result: MovieListResult
  error: string | null
}

export async function loadInitialMovieList(
  filters: MovieFilters,
  keyword: string,
  page: number,
): Promise<InitialMovieList> {
  try {
    return {
      result: await getCachedMovieList(buildMoviesEndpoint(filters, keyword, page)),
      error: null,
    }
  } catch (error) {
    console.error('Initial movie list API error:', error)

    if (!isMockEnvironment) throw error

    return {
      result: {
        items: mockMovies,
        baseUrl: DEFAULT_IMAGE_BASE_URL,
        pagination: { hasNextPage: false },
      },
      error: 'Không thể tải dữ liệu API. Đang dùng dữ liệu mẫu.',
    }
  }
}
