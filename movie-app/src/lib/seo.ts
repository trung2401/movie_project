import type { Metadata } from 'next'
import { SITE_URL } from '@/constants/environment'
import { COUNTRIES, DEFAULT_IMAGE_BASE_URL, GENRES, MOVIE_TYPES } from '@/constants/movie'
import { getMovieDescription } from '@/lib/movieText'
import type { Movie, MovieFilters } from '@/types/movie'

export const DEFAULT_SOCIAL_IMAGE = '/og-motchill.png'
const DEFAULT_MOVIE_IMAGE = '/fallback-poster.svg'

function getFirstQueryValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : ''
}

function toUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function getMoviePath(slug: string) {
  return `/xem-phim/${encodeURIComponent(slug)}`
}

export function getMovieUrl(slug: string) {
  return toUrl(getMoviePath(slug))
}

export function getMovieImageUrl(movie: Movie) {
  const image = movie.poster_url ?? movie.thumb_url
  if (!image) return toUrl(DEFAULT_MOVIE_IMAGE)

  try {
    return new URL(image).toString()
  } catch {
    return new URL(image, DEFAULT_IMAGE_BASE_URL).toString()
  }
}

export function getMetadataDescription(content?: string) {
  const description = getMovieDescription(content)
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description
}

export function isPlaceholderMovieDescription(content?: string) {
  if (!content?.trim()) return true

  const description = getMovieDescription(content).toLocaleLowerCase('vi-VN')
  return description === 'nội dung phim đang được cập nhật.'
    || (description.startsWith('nội dung phim ') && description.endsWith(' đang được cập nhật.'))
}

type MovieSeoRecord = Record<string, unknown>

function getMovieSeoRecord(movie: Movie): MovieSeoRecord {
  return movie as unknown as MovieSeoRecord
}

function getRecordValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  return keys.map((key) => record[key]).find((item) => item !== undefined && item !== null)
}

function getStringValue(value: unknown, seen = new Set<object>()): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim() || undefined
  if (!value || typeof value !== 'object' || seen.has(value)) return undefined

  seen.add(value)
  const nestedValue = getRecordValue(value, ['name', 'time', 'date', 'value', 'iso'])
  return nestedValue === undefined ? undefined : getStringValue(nestedValue, seen)
}

function getNamedValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => getNamedValues(item))
  if (typeof value === 'string') return value.split(/[|,]/).map((item) => item.trim()).filter(Boolean)

  const name = getStringValue(value)
  return name ? [name] : []
}

function getMovieFieldValues(movie: Movie, keys: string[]) {
  const record = getMovieSeoRecord(movie)
  for (const key of keys) {
    const values = getNamedValues(record[key])
    if (values.length) return [...new Set(values)]
  }
  return []
}

export function getMovieGenres(movie: Movie) {
  return getMovieFieldValues(movie, ['category', 'genre'])
}

export function getMovieCountries(movie: Movie) {
  return getMovieFieldValues(movie, ['country'])
}

export function getMovieActors(movie: Movie) {
  return getMovieFieldValues(movie, ['actor', 'actors'])
}

export function getMovieDirectors(movie: Movie) {
  return getMovieFieldValues(movie, ['director', 'directors'])
}

export function getMovieLanguage(movie: Movie) {
  const record = getMovieSeoRecord(movie)
  return getStringValue(record.inLanguage) ?? getStringValue(record.language) ?? getStringValue(record.lang)
}

function getIsoDate(value: unknown) {
  const dateValue = getStringValue(value)
  if (!dateValue || /^\d{4}$/.test(dateValue)) return undefined

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function getMovieDate(movie: Movie, keys: string[]) {
  const record = getMovieSeoRecord(movie)
  for (const key of keys) {
    const date = getIsoDate(record[key])
    if (date) return date
  }
  return undefined
}

export function getMovieUpdatedAt(movie: Movie) {
  return getMovieDate(movie, ['modified', 'updated_at', 'updatedAt', 'last_updated', 'lastUpdated', 'created'])
}

export function getMoviePublishedAt(movie: Movie) {
  return getMovieDate(movie, ['datePublished', 'date_published', 'release_date', 'released_at', 'premiere_date'])
}

function getNumberValue(value: unknown) {
  const number = typeof value === 'number' ? value : Number(getStringValue(value))
  return Number.isFinite(number) ? number : undefined
}

export function getMovieAggregateRating(movie: Movie) {
  const record = getMovieSeoRecord(movie)
  const candidates = [record.aggregateRating, record.rating, record.imdb, record.tmdb, record]

  for (const candidate of candidates) {
    const ratingValue = getNumberValue(getRecordValue(candidate, ['ratingValue', 'vote_average', 'value', 'score', 'rating']))
    const ratingCount = getNumberValue(getRecordValue(candidate, ['ratingCount', 'vote_count', 'count', 'votes']))
    if (ratingValue !== undefined && ratingCount !== undefined && ratingCount > 0 && ratingValue >= 0 && ratingValue <= 10) {
      return { ratingValue, ratingCount }
    }
  }

  return undefined
}

export function getMovieSchemaType(movie: Movie, episodeCount: number) {
  const type = movie.type?.toLowerCase()
  if (type?.includes('series') || type?.includes('tv') || type?.includes('show')) return 'TVSeries'
  if (type?.includes('movie') || type?.includes('single') || type?.includes('film')) return 'Movie'
  return episodeCount > 1 ? 'TVSeries' : 'Movie'
}

export function hasMovieFacts(movie: Movie) {
  return Boolean(
    movie.year
    || getMovieGenres(movie).length
    || getMovieCountries(movie).length
    || getMovieActors(movie).length
    || getMovieDirectors(movie).length
    || movie.episodes?.some((server) => server.server_data.some((episode) => Boolean(episode.link_embed))),
  )
}

export function getMovieStructuredData(movie: Movie, movieUrl: string, episodeCount: number) {
  const genres = getMovieGenres(movie)
  const countries = getMovieCountries(movie)
  const actors = getMovieActors(movie)
  const directors = getMovieDirectors(movie)
  const rating = getMovieAggregateRating(movie)
  const datePublished = getMoviePublishedAt(movie)
  const dateModified = getMovieUpdatedAt(movie)
  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': getMovieSchemaType(movie, episodeCount),
    name: movie.name,
    alternateName: movie.origin_name,
    description: getMovieDescription(movie.content),
    image: getMovieImageUrl(movie),
    url: movieUrl,
    ...(genres.length ? { genre: genres } : {}),
    ...(countries.length ? { countryOfOrigin: countries.map((name) => ({ '@type': 'Country', name })) } : {}),
    ...(getMovieLanguage(movie) ? { inLanguage: getMovieLanguage(movie) } : {}),
    ...(actors.length ? { actor: actors.map((name) => ({ '@type': 'Person', name })) } : {}),
    ...(directors.length ? { director: directors.map((name) => ({ '@type': 'Person', name })) } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(episodeCount > 1 ? { numberOfEpisodes: episodeCount } : {}),
    ...(rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.ratingValue,
        ratingCount: rating.ratingCount,
        bestRating: 10,
        worstRating: 0,
      },
    } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Motchill',
    },
    brand: {
      '@type': 'Brand',
      name: 'Motchill',
    },
  }

  return movieSchema
}

function getFilterLabel(key: keyof MovieFilters, value: string) {
  const options = key === 'type' ? MOVIE_TYPES : key === 'country' ? COUNTRIES : key === 'genre' ? GENRES : []
  return options.find((option) => option.slug === value)?.label ?? value
}

export function getMovieListSeoCopy(
  pathname: '/' | '/phim',
  filters: MovieFilters,
  keyword = '',
) {
  const activeFilters = (Object.entries(filters) as Array<[keyof MovieFilters, string]>).filter(([, value]) => Boolean(value))
  const trimmedKeyword = keyword.trim()

  if (trimmedKeyword) {
    return {
      heading: 'Kết quả tìm kiếm',
      title: `Tìm kiếm phim: ${trimmedKeyword}`,
      description: `Kết quả tìm kiếm phim ${trimmedKeyword} trên Motchill.`,
    }
  }

  if (activeFilters.length === 1) {
    const [key, value] = activeFilters[0]
    const label = getFilterLabel(key, value)
    const heading = key === 'year' ? `Phim ${label} mới nhất` : `${label} mới nhất`

    return {
      heading,
      title: heading,
      description: `Xem ${heading.toLocaleLowerCase('vi-VN')} trên Motchill, cập nhật nhanh với vietsub, thuyết minh và chất lượng Full HD.`,
    }
  }

  if (activeFilters.length > 1) {
    return {
      heading: 'Kết quả tìm kiếm',
      title: 'Kết quả lọc phim',
      description: 'Khám phá phim mới theo quốc gia, thể loại, loại phim và năm phát hành trên Motchill.',
    }
  }

  return pathname === '/'
    ? {
        heading: 'Xem phim online',
        description: 'Xem phim online miễn phí trên Motchill với phim mới cập nhật mỗi ngày.',
      }
    : {
        heading: 'Phim mới cập nhật',
        title: 'Phim mới cập nhật',
        description: 'Danh sách phim mới cập nhật trên Motchill, xem online với vietsub, thuyết minh và chất lượng Full HD.',
      }
}

export function getMovieListMetadata(
  pathname: '/' | '/phim',
  searchParams: Record<string, string | string[] | undefined>,
): Metadata {
  const keyword = getFirstQueryValue(searchParams.keyword).trim()
  const filterKeys = ['type', 'country', 'genre', 'year'] as const
  const activeFilters = filterKeys.filter((key) => Boolean(getFirstQueryValue(searchParams[key])))
  const isThinSearchOrFilter = Boolean(keyword) || activeFilters.length > 1
  const page = Number.parseInt(getFirstQueryValue(searchParams.page), 10)
  const filters: MovieFilters = {
    type: getFirstQueryValue(searchParams.type),
    country: getFirstQueryValue(searchParams.country),
    genre: getFirstQueryValue(searchParams.genre),
    year: getFirstQueryValue(searchParams.year),
  }
  const copy = getMovieListSeoCopy(pathname, filters, keyword)
  const isDefaultHome = pathname === '/' && !keyword && activeFilters.length === 0

  const canonicalParams = new URLSearchParams()
  if (!isThinSearchOrFilter && activeFilters.length === 1) {
    const key = activeFilters[0]
    canonicalParams.set(key, getFirstQueryValue(searchParams[key]))
  }
  if (!isThinSearchOrFilter && Number.isInteger(page) && page > 1) {
    canonicalParams.set('page', String(page))
  }

  const canonical = canonicalParams.size ? `${pathname}?${canonicalParams}` : pathname

  return {
    ...(copy.title ? { title: copy.title } : {}),
    ...(!isDefaultHome ? { description: copy.description } : {}),
    alternates: { canonical },
    ...(isThinSearchOrFilter ? { robots: { index: false, follow: true } } : {}),
  }
}
