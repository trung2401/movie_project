import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CreateRatingDto } from './dto/create-rating.dto'
import { RatingAverageResponse, RatingResponse } from './ratings.types'
import { RatingsService } from './ratings.service'

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRatingDto,
  ): Promise<RatingResponse> {
    return this.ratingsService.upsert(user.sub, dto)
  }

  @Get(':movieSlug/average')
  getAverage(
    @Param('movieSlug') movieSlug: string,
  ): Promise<RatingAverageResponse> {
    return this.ratingsService.getAverage(movieSlug)
  }

  @Get(':movieSlug')
  findByMovieSlug(
    @Param('movieSlug') movieSlug: string,
  ): Promise<RatingResponse[]> {
    return this.ratingsService.findByMovieSlug(movieSlug)
  }
}
