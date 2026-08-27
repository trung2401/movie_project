import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/environment'
import { COUNTRIES, GENRES, MOVIE_TYPES } from '@/constants/movie'
import { getMovieUpdatedAt } from '@/lib/seo'
import { getIndexableSitemapMovies, getSitemapIds } from '@/services/sitemapMovieCatalog'

const PRIMARY_YEARS = Array.from({ length: 7 }, (_, index) => String(new Date().getFullYear() - index))

export const revalidate = 300

function toSiteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

function getPrimaryFilterUrls() {
  const filters = [
    ...MOVIE_TYPES.map(({ slug }) => ['type', slug] as const),
    ...GENRES.map(({ slug }) => ['genre', slug] as const),
    ...COUNTRIES.map(({ slug }) => ['country', slug] as const),
    ...PRIMARY_YEARS.map((year) => ['year', year] as const),
  ]

  return filters.map(([key, value]) => toSiteUrl(`/phim?${key}=${encodeURIComponent(value)}`))
}

export async function generateSitemaps() {
  return getSitemapIds()
}

export default async function sitemap({ id }: { id: Promise<number> }): Promise<MetadataRoute.Sitemap> {
  const pageId = await id
  const normalizedPageId = Number(pageId)

  if (normalizedPageId === 0) {
    return [
      { url: toSiteUrl('/'), changeFrequency: 'daily', priority: 1 },
      { url: toSiteUrl('/phim'), changeFrequency: 'daily', priority: 0.9 },
      ...getPrimaryFilterUrls().map((url) => ({ url, changeFrequency: 'daily' as const, priority: 0.7 })),
    ]
  }

  const movies = await getIndexableSitemapMovies(normalizedPageId)
  return movies.map((movie) => ({
    url: toSiteUrl(`/xem-phim/${encodeURIComponent(movie.slug)}`),
    ...(getMovieUpdatedAt(movie) ? { lastModified: getMovieUpdatedAt(movie) } : {}),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
}
