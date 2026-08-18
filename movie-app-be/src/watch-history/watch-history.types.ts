import { WatchHistory } from './entities/watch-history.entity'

export interface WatchHistoryResponse {
  id: string
  movieSlug: string
  movieName: string
  episodeSlug: string
  progressSeconds: number
  updatedAt: Date
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
