import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/environment'

const DEEP_FILTER_PATTERNS = [
  '/*?*keyword=*',
  '/*?*type=*&*country=*',
  '/*?*type=*&*genre=*',
  '/*?*type=*&*year=*',
  '/*?*country=*&*type=*',
  '/*?*country=*&*genre=*',
  '/*?*country=*&*year=*',
  '/*?*genre=*&*type=*',
  '/*?*genre=*&*country=*',
  '/*?*genre=*&*year=*',
  '/*?*year=*&*type=*',
  '/*?*year=*&*country=*',
  '/*?*year=*&*genre=*',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/phim', '/xem-phim/'],
      disallow: DEEP_FILTER_PATTERNS,
    },
    sitemap: new URL('/sitemap-index.xml', SITE_URL).toString(),
    host: SITE_URL,
  }
}
