import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto'
import { WatchHistoryService } from './watch-history.service'
import { WatchHistoryResponse } from './watch-history.types'

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
  ): Promise<WatchHistoryResponse[]> {
    return this.watchHistoryService.findContinueWatching(user.sub)
  }
}
