import { movieProviderManager } from './providers'
import type { Movie } from '@/types/movie'
import type { MovieListResult } from '@/types/movie'

const MOVIE_LIST_MAX_RETRIES = 2
const MOVIE_LIST_RETRY_BASE_MS = 250

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function getErrorCause(error: unknown): unknown {
  return error instanceof Error ? error.cause : undefined
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const status = (error as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}

function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) return true
  return getErrorCause(error) !== undefined && isTimeoutError(getErrorCause(error))
}

function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error)
  if (status === 429 || (status !== undefined && status >= 500)) return true
  if (isTimeoutError(error)) return true
  return getErrorCause(error) !== undefined && isRetryableError(getErrorCause(error))
}

export async function getCachedMovieList(endpoint: string): Promise<MovieListResult> {
  let lastError: unknown

  for (let attempt = 0; attempt <= MOVIE_LIST_MAX_RETRIES; attempt += 1) {
    try {
      // Fallback keeps the requested page; NguonC returns its own pagination when it takes over.
      return await movieProviderManager.getMovieListWithFallback(endpoint)
    } catch (error) {
      lastError = error
      if (attempt === MOVIE_LIST_MAX_RETRIES || !isRetryableError(error)) throw error
      await wait(MOVIE_LIST_RETRY_BASE_MS * 2 ** attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Movie list request failed.')
}

export async function getServerMovieDetail(slug: string): Promise<Movie> {
  return movieProviderManager.getMovieDetailWithFallback(slug)
}
