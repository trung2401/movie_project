import axios from 'axios'

const userApiBaseUrl = (
  process.env.NEXT_PUBLIC_USER_API_BASE || 'http://localhost:4000'
).replace(/\/+$/, '')
const USER_API_TIMEOUT_MS = 5_000

const userApiClient = axios.create({
  baseURL: userApiBaseUrl,
  timeout: USER_API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

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
  try {
    const response = await userApiClient.request<T>({
      url: path,
      method: options.method ?? 'GET',
      data: options.body,
      headers: options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : undefined,
    })

    if (response.status === 204) return undefined as T
    return response.data
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) throw error

    const responseData: unknown = error.response?.data
    const message = responseData
      ? readErrorMessage(responseData)
      : 'Không thể kết nối đến dịch vụ tài khoản.'
    throw new UserApiError(message, error.response?.status ?? 0)
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
