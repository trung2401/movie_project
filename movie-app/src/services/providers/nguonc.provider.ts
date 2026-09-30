import axios from 'axios'
import { getRequestedPage } from './pagination'
import type { MovieProvider } from './types'
import type { MovieListResult } from '@/types/movie'
import { parseNguonCDetailResponse, parseNguonCListResponse } from './nguonc.parser'

const NGUONC_API_BASE = 'https://phim.nguonc.com/api'
const REQUEST_TIMEOUT_MS = 5_000
const LIST_REVALIDATE_SECONDS = 300

function readPage(endpoint: URL) {
  const page = Number.parseInt(endpoint.searchParams.get('page') ?? '1', 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function readPathPart(pathname: string, marker: string) {
  const markerIndex = pathname.indexOf(marker)
  if (markerIndex < 0) return undefined

  const value = pathname.slice(markerIndex + marker.length).split('/')[0]
  return value ? decodeURIComponent(value) : undefined
}

export function buildNguonCListEndpoint(endpoint: string): string {
  const source = new URL(endpoint)
  const target = new URL(NGUONC_API_BASE)
  const { pathname } = source

  let targetPath: string
  if (pathname.includes('/danh-sach/phim-moi-cap-nhat')) {
    targetPath = '/films/phim-moi-cap-nhat'
  } else if (pathname.includes('/danh-sach/')) {
    const type = readPathPart(pathname, '/danh-sach/')
    if (!type) throw new Error('Không thể xác định loại phim cho NguonC.')
    targetPath = `/films/danh-sach/${encodeURIComponent(type)}`
  } else if (pathname.includes('/tim-kiem')) {
    targetPath = '/films/search'
    const keyword = source.searchParams.get('keyword')?.trim()
    if (!keyword) throw new Error('NguonC yêu cầu keyword cho endpoint tìm kiếm.')
    target.searchParams.set('keyword', keyword)
  } else if (pathname.includes('/the-loai/')) {
    const genre = readPathPart(pathname, '/the-loai/')
    if (!genre) throw new Error('Không thể xác định thể loại phim cho NguonC.')
    targetPath = `/films/the-loai/${encodeURIComponent(genre)}`
  } else if (pathname.includes('/quoc-gia/')) {
    const country = readPathPart(pathname, '/quoc-gia/')
    if (!country) throw new Error('Không thể xác định quốc gia phim cho NguonC.')
    targetPath = `/films/quoc-gia/${encodeURIComponent(country)}`
  } else if (pathname.includes('/nam/')) {
    throw new Error('NguonC chưa có endpoint năm được xác nhận.')
  } else {
    throw new Error(`NguonC không hỗ trợ endpoint danh sách: ${endpoint}`)
  }

  target.pathname = `/api${targetPath}`
  target.searchParams.set('page', String(readPage(source)))
  return target.toString()
}

async function requestList(endpoint: string) {
  const response = await fetch(endpoint, {
    next: { revalidate: LIST_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const error = new Error(`NguonC movie list request failed with status ${response.status}.`)
    Object.assign(error, { status: response.status })
    throw error
  }

  return response.json() as Promise<unknown>
}

export const nguoncProvider: MovieProvider = {
  name: 'nguonc',

  async getMovieList(endpoint): Promise<MovieListResult> {
    const nguoncEndpoint = buildNguonCListEndpoint(endpoint)
    const payload = await requestList(nguoncEndpoint)
    return parseNguonCListResponse(payload, getRequestedPage(endpoint))
  },

  async getMovieDetail(slug) {
    try {
      const response = await axios.get<unknown>(`${NGUONC_API_BASE}/film/${encodeURIComponent(slug)}`, {
        timeout: REQUEST_TIMEOUT_MS,
      })
      return parseNguonCDetailResponse(response.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },
}
