import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { EnvironmentVariables } from '../config/env.validation'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { JwtPayload } from './interfaces/jwt-payload.interface'

describe('AuthService', () => {
  const payload: JwtPayload = {
    sub: '07b04b3a-7894-4bb7-9f06-1c1775dc2b91',
    email: 'viewer@example.com',
    role: 'user',
  }

  function createService(): {
    service: AuthService
    verifyAsync: jest.Mock
    signAsync: jest.Mock
  } {
    const verifyAsync = jest.fn()
    const signAsync = jest.fn()
    const jwtService = { verifyAsync, signAsync } as unknown as JwtService
    const configService = {
      get: jest.fn((key: keyof EnvironmentVariables) => {
        const values: Pick<
          EnvironmentVariables,
          'JWT_SECRET' | 'JWT_REFRESH_SECRET' | 'JWT_ACCESS_EXPIRES_IN'
        > = {
          JWT_SECRET: 'access-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_ACCESS_EXPIRES_IN: '15m',
        }
        return values[key as keyof typeof values]
      }),
    } as unknown as ConfigService<EnvironmentVariables, true>

    return {
      service: new AuthService({} as UsersService, jwtService, configService),
      verifyAsync,
      signAsync,
    }
  }

  it('issues a new access token from a valid refresh token', async () => {
    const { service, verifyAsync, signAsync } = createService()
    verifyAsync.mockResolvedValue(payload)
    signAsync.mockResolvedValue('new-access-token')

    await expect(service.refresh('valid-refresh-token')).resolves.toEqual({
      accessToken: 'new-access-token',
    })
    expect(verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
      secret: 'refresh-secret',
    })
    expect(signAsync).toHaveBeenCalledWith(payload, {
      secret: 'access-secret',
      expiresIn: '15m',
    })
  })

  it('rejects an invalid refresh token', async () => {
    const { service, verifyAsync } = createService()
    verifyAsync.mockRejectedValue(new Error('invalid signature'))

    await expect(
      service.refresh('invalid-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
