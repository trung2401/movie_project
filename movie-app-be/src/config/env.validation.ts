export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'test' | 'production'
  PORT: number
  FRONTEND_ORIGIN: string
  DB_HOST: string
  DB_PORT: number
  DB_USER: string
  DB_PASS: string
  DB_NAME: string
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_ACCESS_EXPIRES_IN: string
  JWT_REFRESH_EXPIRES_IN: string
}

function requireValue(config: Record<string, unknown>, key: string): string {
  const value = config[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

function readPort(
  config: Record<string, unknown>,
  key: string,
  fallback?: number,
): number {
  const rawValue = config[key]
  if (rawValue === undefined && fallback !== undefined) return fallback
  const value = Number(rawValue)
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Environment variable ${key} must be a valid port`)
  }
  return value
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const nodeEnv = (config.NODE_ENV ??
    'development') as EnvironmentVariables['NODE_ENV']
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production')
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: readPort(config, 'PORT', 3001),
    FRONTEND_ORIGIN: requireValue(config, 'FRONTEND_ORIGIN'),
    DB_HOST: requireValue(config, 'DB_HOST'),
    DB_PORT: readPort(config, 'DB_PORT'),
    DB_USER: requireValue(config, 'DB_USER'),
    DB_PASS: requireValue(config, 'DB_PASS'),
    DB_NAME: requireValue(config, 'DB_NAME'),
    JWT_SECRET: requireValue(config, 'JWT_SECRET'),
    JWT_REFRESH_SECRET: requireValue(config, 'JWT_REFRESH_SECRET'),
    JWT_ACCESS_EXPIRES_IN: requireValue(config, 'JWT_ACCESS_EXPIRES_IN'),
    JWT_REFRESH_EXPIRES_IN: requireValue(config, 'JWT_REFRESH_EXPIRES_IN'),
  }
}
