import { readPublicEnvironmentVariable } from '@/constants/environment'

const userApiBaseUrl = readPublicEnvironmentVariable(
  'NEXT_PUBLIC_USER_API_BASE',
  process.env.NEXT_PUBLIC_USER_API_BASE,
).replace(/\/+$/, '')
const USER_API_TIMEOUT_MS = 5_000

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface Favorite {
  id: string
  movieSlug: string
  movieName: string
  addedAt: string
}

export interface WatchHistory {
  id: string
  movieSlug: string
  movieName: string
  episodeSlug: string
  progressSeconds: number
  updatedAt: string
}

export interface Rating {
  id: string
  movieSlug: string
  score: number
  comment: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface RatingAverage {
  movieSlug: string
  averageScore: number | null
  totalRatings: number
}

export interface PaginatedResponse<T> {
  items: T[]
  limit: number
  offset: number
  totalItems: number
  hasNextPage: boolean
}

export type FavoriteList = PaginatedResponse<Favorite>
export type WatchHistoryList = PaginatedResponse<WatchHistory>
export type RatingList = PaginatedResponse<Rating>

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export class UserApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'UserApiError'
  }
}

interface RequestOptions {
  method?: 'DELETE' | 'GET' | 'POST'
  body?: unknown
  accessToken?: string
}

function readErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return 'Không thể kết nối đến dịch vụ tài khoản.'
  }

  const message = data.message
  if (Array.isArray(message)) return message.join(' ')
  return typeof message === 'string' ? message : 'Yêu cầu không hợp lệ.'
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!userApiBaseUrl) {
    throw new UserApiError(
      'NEXT_PUBLIC_USER_API_BASE chưa được cấu hình cho dịch vụ tài khoản.',
      0,
    )
  }

  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), USER_API_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${userApiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
      signal: controller.signal,
    })

    if (response.status === 204) return undefined as T

    const responseText = await response.text()
    let responseData: unknown
    try {
      responseData = responseText ? JSON.parse(responseText) : undefined
    } catch {
      responseData = undefined
    }

    if (!response.ok) {
      throw new UserApiError(
        responseData ? readErrorMessage(responseData) : 'Không thể kết nối đến dịch vụ tài khoản.',
        response.status,
      )
    }

    return responseData as T
  } catch (error: unknown) {
    if (error instanceof UserApiError) throw error
    throw new UserApiError('Không thể kết nối đến dịch vụ tài khoản.', 0)
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}

export function register(email: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>('/auth/register', {
    method: 'POST',
    body: { email, password },
  })
}

export function login(email: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function refreshAccessToken(
  refreshToken: string,
): Promise<Pick<AuthTokens, 'accessToken'>> {
  return request<Pick<AuthTokens, 'accessToken'>>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

function withPagination(path: string, options?: PaginationOptions): string {
  if (!options || (options.limit === undefined && options.offset === undefined)) {
    return path
  }
  const params = new URLSearchParams()
  if (options.limit !== undefined) params.set('limit', String(options.limit))
  if (options.offset !== undefined) params.set('offset', String(options.offset))
  return `${path}?${params.toString()}`
}

export function getFavorites(
  accessToken: string,
  options?: PaginationOptions,
): Promise<FavoriteList> {
  return request<FavoriteList>(withPagination('/favorites', options), { accessToken })
}

export function getFavoriteStatus(
  accessToken: string,
  movieSlug: string,
): Promise<Favorite | null> {
  return request<Favorite | null>(`/favorites/${encodeURIComponent(movieSlug)}`, {
    accessToken,
  })
}

export function createFavorite(
  accessToken: string,
  movieSlug: string,
  movieName: string,
): Promise<Favorite> {
  return request<Favorite>('/favorites', {
    method: 'POST',
    accessToken,
    body: { movieSlug, movieName },
  })
}

export function deleteFavorite(accessToken: string, movieSlug: string): Promise<void> {
  return request<void>(`/favorites/${encodeURIComponent(movieSlug)}`, {
    method: 'DELETE',
    accessToken,
  })
}

export function getContinueWatching(
  accessToken: string,
  options?: PaginationOptions,
): Promise<WatchHistoryList> {
  return request<WatchHistoryList>(
    withPagination('/watch-history/continue-watching', options),
    {
    accessToken,
    },
  )
}

export function getWatchHistory(
  accessToken: string,
  movieSlug: string,
  episodeSlug: string,
): Promise<WatchHistory | null> {
  return request<WatchHistory | null>(
    `/watch-history/${encodeURIComponent(movieSlug)}/${encodeURIComponent(episodeSlug)}`,
    { accessToken },
  )
}

export function saveWatchHistory(
  accessToken: string,
  movieSlug: string,
  movieName: string,
  episodeSlug: string,
  progressSeconds: number,
): Promise<WatchHistory> {
  return request<WatchHistory>('/watch-history', {
    method: 'POST',
    accessToken,
    body: { movieSlug, movieName, episodeSlug, progressSeconds },
  })
}

export function getRatings(
  movieSlug: string,
  options?: PaginationOptions,
): Promise<RatingList> {
  return request<RatingList>(
    withPagination(`/ratings/${encodeURIComponent(movieSlug)}`, options),
  )
}

export function getRatingAverage(movieSlug: string): Promise<RatingAverage> {
  return request<RatingAverage>(
    `/ratings/${encodeURIComponent(movieSlug)}/summary`,
  )
}

export function saveRating(
  accessToken: string,
  movieSlug: string,
  score: number,
  comment: string,
): Promise<Rating> {
  return request<Rating>('/ratings', {
    method: 'POST',
    accessToken,
    body: { movieSlug, score, comment: comment.trim() || undefined },
  })
}
