import { Rating } from './entities/rating.entity'

export interface RatingResponse {
  id: string
  movieSlug: string
  score: number
  comment: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface RatingAverageResponse {
  movieSlug: string
  averageScore: number | null
  totalRatings: number
}

export function toRatingResponse(rating: Rating): RatingResponse {
  return {
    id: rating.id,
    movieSlug: rating.movieSlug,
    score: rating.score,
    comment: rating.comment,
    userId: rating.user.id,
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
  }
}
