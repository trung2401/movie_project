export const isMockEnvironment =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://motchill.com'
