import type { Episode, EpisodeServer, Movie, MovieListResult } from '@/types/movie'
import { createMovieListPagination } from './pagination'

type UnknownRecord = Record<string, unknown>

interface NguonCListPayload {
  status?: unknown
  paginate?: unknown
  items?: unknown
}

interface NguonCDetailPayload {
  status?: unknown
  movie?: unknown
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function readYear(value: unknown): number | undefined {
  const year = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(year) && year > 0 ? year : undefined
}

function readList(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function getCategoryGroups(value: unknown) {
  if (!isRecord(value)) return []

  return Object.values(value).flatMap((groupValue) => {
    if (!isRecord(groupValue)) return []

    const group = isRecord(groupValue.group) ? groupValue.group : {}
    const groupName = readString(group.name)?.toLocaleLowerCase('vi-VN')
    const names = readList(groupValue.list)
      .map((item) => readString(item.name))
      .filter((name): name is string => Boolean(name))

    return groupName && names.length ? [{ groupName, names }] : []
  })
}

function readCategoryFields(value: unknown) {
  let type: string | undefined
  let year: number | undefined
  let genres: string[] = []
  let countries: string[] = []

  for (const { groupName, names } of getCategoryGroups(value)) {
    if (groupName === 'định dạng') type = names[0]
    if (groupName === 'năm') year = readYear(names[0])
    if (groupName === 'thể loại') genres = names
    if (groupName === 'quốc gia') countries = names
  }

  return { type, year, genres, countries }
}

function mapMovie(value: unknown): Movie | null {
  if (!isRecord(value)) return null

  const name = readString(value.name)
  const slug = readString(value.slug)
  if (!name || !slug) return null

  const categories = readCategoryFields(value.category)
  const movie: Movie = {
    name,
    slug,
    ...(readString(value.original_name) ? { origin_name: readString(value.original_name) } : {}),
    ...(readString(value.thumb_url) ? { thumb_url: readString(value.thumb_url) } : {}),
    ...(readString(value.poster_url) ? { poster_url: readString(value.poster_url) } : {}),
    ...(categories.type ? { type: categories.type } : {}),
    ...(categories.year ?? readYear(value.year) ? { year: categories.year ?? readYear(value.year) } : {}),
    ...(readString(value.description) ? { content: readString(value.description) } : {}),
    ...(readString(value.director) ? { director: readString(value.director) } : {}),
    ...(readString(value.casts) ? { actor: readString(value.casts) } : {}),
    ...(readString(value.language) ? { language: readString(value.language) } : {}),
    ...(readString(value.modified) ? { modified: readString(value.modified) } : {}),
    ...(readString(value.created) ? { created: readString(value.created) } : {}),
    ...(categories.genres.length ? { category: categories.genres.map((name) => ({ name })) } : {}),
    ...(categories.countries.length ? { country: categories.countries.map((name) => ({ name })) } : {}),
  }

  return movie
}

function mapEpisode(value: unknown): Episode | null {
  if (!isRecord(value)) return null

  const name = readString(value.name)
  const slug = readString(value.slug)
  if (!name || !slug) return null

  return {
    name,
    slug,
    ...(readString(value.embed) ? { link_embed: readString(value.embed) } : {}),
  }
}

function mapEpisodes(value: unknown): EpisodeServer[] | undefined {
  if (!Array.isArray(value)) return undefined

  const servers = value.flatMap((serverValue) => {
    if (!isRecord(serverValue)) return []

    const serverName = readString(serverValue.server_name)
    if (!serverName) return []

    const serverData = readList(serverValue.items)
      .flatMap((episodeValue) => {
        const episode = mapEpisode(episodeValue)
        return episode ? [episode] : []
      })

    return [{ server_name: serverName, server_data: serverData }]
  })

  return servers.length ? servers : undefined
}

function assertSuccess(payload: UnknownRecord): void {
  if (payload.status !== undefined && payload.status !== 'success') {
    throw new Error('NguonC trả về response không thành công.')
  }
}

export function parseNguonCListResponse(
  payload: unknown,
  requestedPage: number,
): MovieListResult {
  const data = isRecord(payload) ? payload as NguonCListPayload & UnknownRecord : {}
  assertSuccess(data)

  const items = readList(data.items)
    .flatMap((item) => {
      const movie = mapMovie(item)
      return movie ? [movie] : []
    })
  const pagination = isRecord(data.paginate) ? data.paginate : {}

  return {
    items,
    baseUrl: 'https://phim.nguonc.com/public/images/',
    pagination: createMovieListPagination(
      {
        totalItems: pagination.total_items,
        totalPages: pagination.total_page,
        totalItemsPerPage: pagination.items_per_page,
      },
      items.length,
      requestedPage,
    ),
  }
}

export function parseNguonCDetailResponse(payload: unknown): Movie | null {
  const data = isRecord(payload) ? payload as NguonCDetailPayload & UnknownRecord : {}
  assertSuccess(data)

  const movie = mapMovie(data.movie)
  if (!movie || !isRecord(data.movie)) return movie

  const episodes = mapEpisodes(data.movie.episodes)
  return episodes ? { ...movie, episodes } : movie
}
