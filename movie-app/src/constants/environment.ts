export const isMockEnvironment =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

export function readPublicEnvironmentVariable(
  name: string,
  value: string | undefined,
  fallback = '',
): string {
  const normalizedValue = value?.trim()
  if (normalizedValue) return normalizedValue

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Environment variable ${name} is required in production`)
  }

  return fallback
}

export const SITE_URL = readPublicEnvironmentVariable(
  'NEXT_PUBLIC_SITE_URL',
  process.env.NEXT_PUBLIC_SITE_URL,
  'https://motchill.com',
).replace(/\/+$/, '')
