import { Rating } from './entities/rating.entity'
import { PaginatedResponse } from '../common/dto/pagination-query.dto'

export interface RatingResponse {
  id: string
  movieSlug: string
  score: number
  comment: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type RatingListResponse = PaginatedResponse<RatingResponse>

export interface RatingAverageResponse {
  movieSlug: string
  averageScore: number | null
  totalRatings: number
}

export type RatingSummaryResponse = RatingAverageResponse

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
