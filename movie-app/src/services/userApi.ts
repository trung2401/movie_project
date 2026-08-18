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

export function getFavorites(accessToken: string): Promise<Favorite[]> {
  return request<Favorite[]>('/favorites', { accessToken })
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

export function getContinueWatching(accessToken: string): Promise<WatchHistory[]> {
  return request<WatchHistory[]>('/watch-history/continue-watching', {
    accessToken,
  })
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

export function getRatings(movieSlug: string): Promise<Rating[]> {
  return request<Rating[]>(`/ratings/${encodeURIComponent(movieSlug)}`)
}

export function getRatingAverage(movieSlug: string): Promise<RatingAverage> {
  return request<RatingAverage>(
    `/ratings/${encodeURIComponent(movieSlug)}/average`,
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
