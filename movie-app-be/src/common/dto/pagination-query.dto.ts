import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export const MAX_PAGE_SIZE = 100

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  limit: number
  offset: number
  totalItems: number
  hasNextPage: boolean
}

export function getPagination(query: PaginationQueryDto, defaultLimit: number) {
  const limit = query.limit ?? defaultLimit
  const offset = query.offset ?? 0
  return { limit, offset }
}

export function toPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  limit: number,
  offset: number,
): PaginatedResponse<T> {
  return {
    items,
    limit,
    offset,
    totalItems,
    hasNextPage: offset + items.length < totalItems,
  }
}
