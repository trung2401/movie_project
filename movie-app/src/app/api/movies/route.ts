import { NextResponse } from 'next/server'
import { buildMoviesEndpoint } from '@/services/serverMovieEndpoints'
import { getCachedMovieList } from '@/services/serverMovieApi'
import type { MovieFilters } from '@/types/movie'

export const revalidate = 300

const MAX_PAGE = 1_000
const MAX_QUERY_VALUE_LENGTH = 120

function readQueryValue(url: URL, key: string) {
  return url.searchParams.get(key)?.trim().slice(0, MAX_QUERY_VALUE_LENGTH) ?? ''
}

function readPage(url: URL) {
  const rawPage = url.searchParams.get('page')
  if (!rawPage) return 1

  const page = Number.parseInt(rawPage, 10)
  return Number.isInteger(page) && page > 0 && page <= MAX_PAGE ? page : null
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = readPage(url)
  if (page === null) return errorResponse('Trang phim không hợp lệ.', 400)

  const filters: MovieFilters = {
    type: readQueryValue(url, 'type'),
    country: readQueryValue(url, 'country'),
    genre: readQueryValue(url, 'genre'),
    year: readQueryValue(url, 'year'),
  }
  const keyword = readQueryValue(url, 'keyword')

  try {
    const result = await getCachedMovieList(buildMoviesEndpoint(filters, keyword, page))
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Movie list route failed:', error)
    return errorResponse('Không thể tải danh sách phim.', 502)
  }
}
