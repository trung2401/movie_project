import { WatchHistory } from './entities/watch-history.entity'
import { PaginatedResponse } from '../common/dto/pagination-query.dto'

export interface WatchHistoryResponse {
  id: string
  movieSlug: string
  movieName: string
  episodeSlug: string
  progressSeconds: number
  updatedAt: Date
}

export type WatchHistoryListResponse = PaginatedResponse<WatchHistoryResponse>

export interface WatchHistorySummaryResponse {
  totalItems: number
  latestUpdatedAt: Date | null
}

export function toWatchHistoryResponse(
  history: WatchHistory,
): WatchHistoryResponse {
  return {
    id: history.id,
    movieSlug: history.movieSlug,
    movieName: history.movieName || history.movieSlug,
    episodeSlug: history.episodeSlug,
    progressSeconds: history.progressSeconds,
    updatedAt: history.updatedAt,
  }
}
