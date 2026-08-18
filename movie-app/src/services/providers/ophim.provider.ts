// Intentionally inactive: Ophim's player was returning TLS/522 failures when last verified.
// Keep this provider implementation so it can be re-enabled after its video infrastructure recovers.
import axios from 'axios'
import { API_BASE_OPHIM, OPHIM_IMAGE_BASE_URL } from '@/constants/movie'
import type { Episode, EpisodeServer, Movie, MovieListResult } from '@/types/movie'
import type { MovieProvider } from './types'

const REQUEST_TIMEOUT_MS = 5_000

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function readYear(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return undefined

  const parsedYear = Number(value)
  return Number.isFinite(parsedYear) ? parsedYear : undefined
}

function mapEpisode(value: unknown): Episode | null {
  if (!isRecord(value)) return null

  const name = readString(value.name)
  const slug = readString(value.slug)
  if (!name || !slug) return null

  return { name, slug, link_embed: readString(value.link_embed) }
}

function mapEpisodes(value: unknown): EpisodeServer[] | undefined {
  if (!Array.isArray(value)) return undefined

  const servers = value.flatMap((server) => {
    if (!isRecord(server)) return []
    const serverName = readString(server.server_name)
    if (!serverName || !Array.isArray(server.server_data)) return []

    const serverData = server.server_data.flatMap((episode) => {
      const mappedEpisode = mapEpisode(episode)
      return mappedEpisode ? [mappedEpisode] : []
    })

    return [{ server_name: serverName, server_data: serverData }]
  })

  return servers.length ? servers : undefined
}

function mapOphimToMovie(movieValue: unknown, episodesValue?: unknown): Movie | null {
  if (!isRecord(movieValue)) return null

  const name = readString(movieValue.name)
  const slug = readString(movieValue.slug)
  if (!name || !slug) return null

  return {
    name,
    slug,
    origin_name: readString(movieValue.origin_name),
    thumb_url: readString(movieValue.thumb_url),
    poster_url: readString(movieValue.poster_url),
    year: readYear(movieValue.year),
    content: readString(movieValue.content),
    episodes: mapEpisodes(episodesValue),
  }
}

function mapOphimList(payload: unknown): MovieListResult {
  const root = isRecord(payload) ? payload : {}
  const rawItems = Array.isArray(root.items) ? root.items : []
  const items = rawItems.flatMap((item) => {
    const movie = mapOphimToMovie(item)
    return movie ? [movie] : []
  })

  return { items, baseUrl: readString(root.pathImage) ?? OPHIM_IMAGE_BASE_URL }
}

function getOphimListEndpoint(endpoint: string): string {
  const requestedUrl = new URL(endpoint)
  const ophimUrl = new URL(API_BASE_OPHIM)
  requestedUrl.protocol = ophimUrl.protocol
  requestedUrl.host = ophimUrl.host
  return requestedUrl.toString()
}

export const ophimProvider: MovieProvider = {
  name: 'ophim',

  async getMovieList(endpoint) {
    const response = await axios.get<unknown>(getOphimListEndpoint(endpoint), { timeout: REQUEST_TIMEOUT_MS })
    return mapOphimList(response.data)
  },

  async getMovieDetail(slug) {
    try {
      const response = await axios.get<unknown>(`${API_BASE_OPHIM}/phim/${slug}`, { timeout: REQUEST_TIMEOUT_MS })
      const root = isRecord(response.data) ? response.data : {}
      return mapOphimToMovie(root.movie, root.episodes)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },
}
