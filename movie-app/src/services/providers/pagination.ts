import type { MovieListPagination } from '@/types/movie'

export const DEFAULT_MOVIE_PAGE_SIZE = 24

type PaginationRecord = Record<string, unknown>

function asRecord(value: unknown): PaginationRecord {
  return typeof value === 'object' && value !== null ? value as PaginationRecord : {}
}

function readNonNegativeInteger(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}

function readPositiveInteger(value: unknown) {
  const number = readNonNegativeInteger(value)
  return number && number > 0 ? number : undefined
}

export function getRequestedPage(endpoint: string) {
  try {
    return readPositiveInteger(new URL(endpoint).searchParams.get('page')) ?? 1
  } catch {
    return 1
  }
}

export function createMovieListPagination(
  metadata: unknown,
  itemCount: number,
  requestedPage: number,
): MovieListPagination {
  const pagination = asRecord(metadata)
  const totalItems = readNonNegativeInteger(pagination.totalItems)
  const pageSize = readPositiveInteger(pagination.totalItemsPerPage) ?? DEFAULT_MOVIE_PAGE_SIZE
  const totalPages = readPositiveInteger(pagination.totalPages)
    ?? (totalItems === undefined ? undefined : Math.ceil(totalItems / pageSize))

  return {
    totalItems,
    totalPages,
    hasNextPage: totalPages !== undefined
      ? requestedPage < totalPages
      : itemCount >= pageSize,
  }
}
