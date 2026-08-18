import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { EnvironmentVariables } from '../config/env.validation'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { AuthTokensResponse } from './auth.types'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const email = dto.email.trim().toLowerCase()
    const existingUser = await this.usersService.findByEmail(email)
    if (existingUser) throw new ConflictException('Email is already registered')

    const password = await bcrypt.hash(dto.password, 12)
    try {
      const user = await this.usersService.create(email, password)
      return this.issueTokens(user.id, user.email, user.role, user.createdAt)
    } catch (error: unknown) {
      if (this.isDuplicateEmailError(error))
        throw new ConflictException('Email is already registered')
      throw error
    }
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const email = dto.email.trim().toLowerCase()
    const user = await this.usersService.findByEmail(email, true)
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password')
    }
    return this.issueTokens(user.id, user.email, user.role, user.createdAt)
  }

  async refresh(
    refreshToken: string,
  ): Promise<Pick<AuthTokensResponse, 'accessToken'>> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        },
      )
      const accessToken = await this.createAccessToken(payload)
      return { accessToken }
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  private async issueTokens(
    id: string,
    email: string,
    role: JwtPayload['role'],
    createdAt: Date,
  ): Promise<AuthTokensResponse> {
    const payload: JwtPayload = { sub: id, email, role }
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
          infer: true,
        }),
      }),
    ])

    return {
      accessToken,
      refreshToken,
      user: { id, email, role, createdAt },
    }
  }

  private createAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
        infer: true,
      }),
    })
  }

  private isDuplicateEmailError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    )
  }
}
