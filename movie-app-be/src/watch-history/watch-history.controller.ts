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
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto'
import { WatchHistoryService } from './watch-history.service'
import {
  WatchHistoryListResponse,
  WatchHistoryResponse,
  WatchHistorySummaryResponse,
} from './watch-history.types'

@Controller('watch-history')
@UseGuards(JwtAuthGuard)
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post()
  upsert(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertWatchHistoryDto,
  ): Promise<WatchHistoryResponse> {
    return this.watchHistoryService.upsert(user.sub, dto)
  }

  @Get('continue-watching')
  findContinueWatching(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ): Promise<WatchHistoryListResponse> {
    return this.watchHistoryService.findContinueWatching(user.sub, query)
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<WatchHistorySummaryResponse> {
    return this.watchHistoryService.getSummaryForUser(user.sub)
  }

  @Get(':movieSlug/:episodeSlug')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('movieSlug') movieSlug: string,
    @Param('episodeSlug') episodeSlug: string,
  ): Promise<WatchHistoryResponse | null> {
    return this.watchHistoryService.findOneForEpisode(
      user.sub,
      movieSlug,
      episodeSlug,
    )
  }
}
