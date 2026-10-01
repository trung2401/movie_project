import { unstable_cache } from 'next/cache'
import { MovieNotFoundError, movieProviderManager } from './providers'
import type { Movie } from '@/types/movie'
import type { MovieListResult } from '@/types/movie'

const MOVIE_API_MAX_RETRIES = 2
const MOVIE_API_RETRY_BASE_MS = 250
const MOVIE_DATA_REVALIDATE_SECONDS = 300
const STALE_FALLBACK_MAX_AGE_SECONDS = 6 * 60 * 60

interface Snapshot<T> {
  value: T
  savedAt: number
}

const movieListSnapshots = new Map<string, Snapshot<MovieListResult>>()
const movieDetailSnapshots = new Map<string, Snapshot<Movie>>()

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

async function fetchMovieListWithRetry(endpoint: string): Promise<MovieListResult> {
  let lastError: unknown

  for (let attempt = 0; attempt <= MOVIE_API_MAX_RETRIES; attempt += 1) {
    try {
      // Fallback keeps the requested page; NguonC returns its own pagination when it takes over.
      return await movieProviderManager.getMovieListWithFallback(endpoint)
    } catch (error) {
      lastError = error
      if (attempt === MOVIE_API_MAX_RETRIES || !isRetryableError(error)) throw error
      await wait(MOVIE_API_RETRY_BASE_MS * 2 ** attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Movie list request failed.')
}

async function fetchMovieDetailWithRetry(slug: string): Promise<Movie> {
  let lastError: unknown

  for (let attempt = 0; attempt <= MOVIE_API_MAX_RETRIES; attempt += 1) {
    try {
      return await movieProviderManager.getMovieDetailWithFallback(slug)
    } catch (error) {
      lastError = error
      if (attempt === MOVIE_API_MAX_RETRIES || !isRetryableError(error)) throw error
      await wait(MOVIE_API_RETRY_BASE_MS * 2 ** attempt)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Movie detail request failed.')
}

const cachedMovieList = unstable_cache(
  async (endpoint: string) => fetchMovieListWithRetry(endpoint),
  ['motchill-movie-list'],
  {
    revalidate: MOVIE_DATA_REVALIDATE_SECONDS,
    tags: ['motchill-movie-list'],
  },
)

const cachedMovieDetail = unstable_cache(
  async (slug: string) => fetchMovieDetailWithRetry(slug),
  ['motchill-movie-detail'],
  {
    revalidate: MOVIE_DATA_REVALIDATE_SECONDS,
    tags: ['motchill-movie-detail'],
  },
)

function getFreshSnapshot<T>(snapshot: Snapshot<T> | undefined) {
  if (!snapshot) return undefined
  if (Date.now() - snapshot.savedAt > STALE_FALLBACK_MAX_AGE_SECONDS * 1_000) return undefined
  return snapshot.value
}

export async function getCachedMovieList(endpoint: string): Promise<MovieListResult> {
  try {
    const result = process.env.NODE_ENV === 'test'
      ? await fetchMovieListWithRetry(endpoint)
      : await cachedMovieList(endpoint)
    movieListSnapshots.set(endpoint, { value: result, savedAt: Date.now() })
    return result
  } catch (error) {
    const staleResult = getFreshSnapshot(movieListSnapshots.get(endpoint))
    if (staleResult) {
      console.warn(`[movie-cache] Serving stale movie list for ${endpoint}.`, error)
      return staleResult
    }

    throw error
  }
}

export async function getServerMovieDetail(slug: string): Promise<Movie> {
  try {
    const movie = process.env.NODE_ENV === 'test'
      ? await movieProviderManager.getMovieDetailWithFallback(slug)
      : await cachedMovieDetail(slug)
    movieDetailSnapshots.set(slug, { value: movie, savedAt: Date.now() })
    return movie
  } catch (error) {
    if (error instanceof MovieNotFoundError) throw error

    const staleMovie = getFreshSnapshot(movieDetailSnapshots.get(slug))
    if (staleMovie) {
      console.warn(`[movie-cache] Serving stale movie detail for ${slug}.`, error)
      return staleMovie
    }

    throw error
  }
}
