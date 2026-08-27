import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { CreateRatingDto } from './dto/create-rating.dto'
import {
  RatingAverageResponse,
  RatingListResponse,
  RatingResponse,
  RatingSummaryResponse,
} from './ratings.types'
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

  @Get(':movieSlug/summary')
  getSummary(
    @Param('movieSlug') movieSlug: string,
  ): Promise<RatingSummaryResponse> {
    return this.ratingsService.getAverage(movieSlug)
  }

  @Get(':movieSlug')
  findByMovieSlug(
    @Param('movieSlug') movieSlug: string,
    @Query() query: PaginationQueryDto,
  ): Promise<RatingListResponse> {
    return this.ratingsService.findByMovieSlug(movieSlug, query)
  }
}
