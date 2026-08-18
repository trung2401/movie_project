import { UserRole } from '../users/entities/user.entity'

export interface AuthUserResponse {
  id: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
  user: AuthUserResponse
}
