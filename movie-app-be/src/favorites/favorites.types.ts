import { Favorite } from './entities/favorite.entity'
import { PaginatedResponse } from '../common/dto/pagination-query.dto'

export interface FavoriteResponse {
  id: string
  movieSlug: string
  movieName: string
  addedAt: Date
}

export type FavoriteListResponse = PaginatedResponse<FavoriteResponse>

export interface FavoriteSummaryResponse {
  totalItems: number
}

export function toFavoriteResponse(favorite: Favorite): FavoriteResponse {
  return {
    id: favorite.id,
    movieSlug: favorite.movieSlug,
    movieName: favorite.movieName || favorite.movieSlug,
    addedAt: favorite.addedAt,
  }
}
