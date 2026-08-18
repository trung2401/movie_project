import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateRatingDto } from './dto/create-rating.dto'
import { Rating } from './entities/rating.entity'
import {
  RatingAverageResponse,
  RatingResponse,
  toRatingResponse,
} from './ratings.types'

interface RatingAggregate {
  averageScore: string | null
  totalRatings: string
}

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
  ) {}

  async upsert(userId: string, dto: CreateRatingDto): Promise<RatingResponse> {
    const movieSlug = dto.movieSlug.trim().toLowerCase()
    const existingRating = await this.ratingsRepository.findOne({
      where: { user: { id: userId }, movieSlug },
      relations: { user: true },
    })

    const rating = existingRating
      ? this.ratingsRepository.merge(existingRating, {
          score: dto.score,
          comment: dto.comment?.trim() || null,
        })
      : this.ratingsRepository.create({
          user: { id: userId },
          movieSlug,
          score: dto.score,
          comment: dto.comment?.trim() || null,
        })
    const savedRating = await this.ratingsRepository.save(rating)
    if (!savedRating.user) savedRating.user = { id: userId } as Rating['user']
    return toRatingResponse(savedRating)
  }

  async findByMovieSlug(movieSlug: string): Promise<RatingResponse[]> {
    const ratings = await this.ratingsRepository.find({
      where: { movieSlug: movieSlug.trim().toLowerCase() },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    })
    return ratings.map(toRatingResponse)
  }

  async getAverage(movieSlug: string): Promise<RatingAverageResponse> {
    const normalizedMovieSlug = movieSlug.trim().toLowerCase()
    const aggregate = await this.ratingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'averageScore')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .where('rating.movieSlug = :movieSlug', {
        movieSlug: normalizedMovieSlug,
      })
      .getRawOne<RatingAggregate>()

    return {
      movieSlug: normalizedMovieSlug,
      averageScore:
        aggregate?.averageScore === null ||
        aggregate?.averageScore === undefined
          ? null
          : Number(aggregate.averageScore),
      totalRatings: Number(aggregate?.totalRatings ?? 0),
    }
  }
}
