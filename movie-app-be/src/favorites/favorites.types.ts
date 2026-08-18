import { Favorite } from './entities/favorite.entity'

export interface FavoriteResponse {
  id: string
  movieSlug: string
  movieName: string
  addedAt: Date
}

export function toFavoriteResponse(favorite: Favorite): FavoriteResponse {
  return {
    id: favorite.id,
    movieSlug: favorite.movieSlug,
    movieName: favorite.movieName || favorite.movieSlug,
    addedAt: favorite.addedAt,
  }
}
