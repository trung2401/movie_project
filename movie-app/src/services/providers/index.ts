import type { Movie, MovieListResult } from '@/types/movie'
import { phimapiProvider } from './phimapi.provider'
import type { MovieProvider } from './types'

function hasValidEmbedLink(link: string | undefined): boolean {
  if (!link) return false

  try {
    const url = new URL(link)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function hasPlayableEpisode(movie: Movie): boolean {
  return movie.episodes?.some((server) => server.server_data.some((episode) => hasValidEmbedLink(episode.link_embed))) ?? false
}

function addProviderName(movie: Movie, provider: MovieProvider): Movie {
  return {
    ...movie,
    episodes: movie.episodes?.map((server) => ({ ...server, provider_name: provider.name })),
  }
}

function logFallback(currentProvider: MovieProvider, nextProvider: MovieProvider, reason: string) {
  console.warn(`[movie-provider] Falling back from ${currentProvider.name} to ${nextProvider.name}: ${reason}`)
}

interface ProviderDetailResult {
  provider: MovieProvider
  movie: Movie | null
  error?: unknown
}

export class MovieNotFoundError extends Error {
  constructor(slug: string) {
    super(`Không tìm thấy phim: ${slug}`)
    this.name = 'MovieNotFoundError'
  }
}

async function getProviderDetail(provider: MovieProvider, slug: string): Promise<ProviderDetailResult> {
  try {
    const movie = await provider.getMovieDetail(slug)
    if (!movie) return { provider, movie: null, error: new MovieNotFoundError(slug) }
    if (!hasPlayableEpisode(movie)) return { provider, movie: null, error: new Error('Phim không có link_embed hợp lệ.') }

    return { provider, movie: addProviderName(movie, provider) }
  } catch (error) {
    return { provider, movie: null, error }
  }
}

async function getMovieListWithFallback(endpoint: string): Promise<MovieListResult> {
  let lastError: unknown

  for (const [index, provider] of movieProviderManager.providers.entries()) {
    try {
      return await provider.getMovieList(endpoint)
    } catch (error) {
      lastError = error
      const nextProvider = movieProviderManager.providers[index + 1]
      if (nextProvider) logFallback(provider, nextProvider, 'request failed')
    }
  }

  throw new Error('Không thể tải danh sách phim từ tất cả provider.', { cause: lastError })
}

async function getMovieDetailWithFallback(slug: string): Promise<Movie> {
  const results = await Promise.all(movieProviderManager.providers.map((provider) => getProviderDetail(provider, slug)))
  const availableSources = results.filter((result): result is ProviderDetailResult & { movie: Movie } => result.movie !== null)

  for (const [index, result] of results.entries()) {
    if (result.movie) continue

    const nextProvider = movieProviderManager.providers[index + 1]
    if (nextProvider) {
      const reason = result.error instanceof Error ? result.error.message : 'request failed'
      logFallback(result.provider, nextProvider, reason)
    }
  }

  if (!availableSources.length) {
    const allProvidersNotFound = results.every(
      (result) => result.error instanceof MovieNotFoundError,
    )
    if (allProvidersNotFound) {
      throw results[0].error
    }

    const lastError = results.at(-1)?.error
    throw new Error('Không thể tải phim có link phát hợp lệ từ tất cả provider.', { cause: lastError })
  }

  const primaryMovie = availableSources[0].movie
  return {
    ...primaryMovie,
    episodes: availableSources.flatMap(({ movie }) => movie.episodes ?? []),
  }
}

export const movieProviderManager = {
  providers: [phimapiProvider] as const,
  getMovieListWithFallback,
  getMovieDetailWithFallback,
}
