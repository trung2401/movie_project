import type { Movie, MovieListResult } from '@/types/movie'

export interface MovieProvider {
  name: string
  getMovieList(endpoint: string): Promise<MovieListResult>
  getMovieDetail(slug: string): Promise<Movie | null>
}
