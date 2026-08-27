import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  getPagination,
  PaginationQueryDto,
  toPaginatedResponse,
} from '../common/dto/pagination-query.dto'
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto'
import { WatchHistory } from './entities/watch-history.entity'
import {
  toWatchHistoryResponse,
  WatchHistoryListResponse,
  WatchHistoryResponse,
  WatchHistorySummaryResponse,
} from './watch-history.types'

const DEFAULT_HISTORY_LIMIT = 20

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private readonly watchHistoryRepository: Repository<WatchHistory>,
  ) {}

  async upsert(
    userId: string,
    dto: UpsertWatchHistoryDto,
  ): Promise<WatchHistoryResponse> {
    const movieSlug = dto.movieSlug.trim().toLowerCase()
    const movieName = dto.movieName.trim()
    const episodeSlug = dto.episodeSlug.trim().toLowerCase()
    await this.watchHistoryRepository.upsert(
      {
        user: { id: userId },
        movieSlug,
        movieName,
        episodeSlug,
        progressSeconds: dto.progressSeconds,
      },
      ['user', 'movieSlug', 'episodeSlug'],
    )

    const history = await this.watchHistoryRepository.findOne({
      where: { user: { id: userId }, movieSlug, episodeSlug },
    })
    if (!history) {
      throw new InternalServerErrorException(
        'Không thể đọc lịch sử xem vừa cập nhật.',
      )
    }

    return toWatchHistoryResponse(history)
  }

  async findContinueWatching(
    userId: string,
    query: PaginationQueryDto = {},
  ): Promise<WatchHistoryListResponse> {
    const { limit, offset } = getPagination(query, DEFAULT_HISTORY_LIMIT)
    const [histories, totalItems] = await this.watchHistoryRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.progressSeconds > :minimumProgress', {
        minimumProgress: 0,
      })
      .orderBy('history.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()
    return toPaginatedResponse(
      histories.map(toWatchHistoryResponse),
      totalItems,
      limit,
      offset,
    )
  }

  async getSummaryForUser(
    userId: string,
  ): Promise<WatchHistorySummaryResponse> {
    const summary = await this.watchHistoryRepository
      .createQueryBuilder('history')
      .select('COUNT(history.id)', 'totalItems')
      .addSelect('MAX(history.updatedAt)', 'latestUpdatedAt')
      .where('history.userId = :userId', { userId })
      .andWhere('history.progressSeconds > :minimumProgress', {
        minimumProgress: 0,
      })
      .getRawOne<{ totalItems: string; latestUpdatedAt: Date | null }>()

    return {
      totalItems: Number(summary?.totalItems ?? 0),
      latestUpdatedAt: summary?.latestUpdatedAt ?? null,
    }
  }

  async findOneForEpisode(
    userId: string,
    movieSlug: string,
    episodeSlug: string,
  ): Promise<WatchHistoryResponse | null> {
    const history = await this.watchHistoryRepository.findOne({
      where: {
        user: { id: userId },
        movieSlug: movieSlug.trim().toLowerCase(),
        episodeSlug: episodeSlug.trim().toLowerCase(),
      },
    })
    return history ? toWatchHistoryResponse(history) : null
  }
}
