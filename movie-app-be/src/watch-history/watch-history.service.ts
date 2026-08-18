import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto'
import { WatchHistory } from './entities/watch-history.entity'
import {
  toWatchHistoryResponse,
  WatchHistoryResponse,
} from './watch-history.types'

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
    const existingHistory = await this.watchHistoryRepository.findOne({
      where: { user: { id: userId }, episodeSlug },
    })

    const history = existingHistory
      ? this.watchHistoryRepository.merge(existingHistory, {
          movieSlug,
          movieName,
          progressSeconds: dto.progressSeconds,
        })
      : this.watchHistoryRepository.create({
          user: { id: userId },
          movieSlug,
          movieName,
          episodeSlug,
          progressSeconds: dto.progressSeconds,
        })
    return toWatchHistoryResponse(
      await this.watchHistoryRepository.save(history),
    )
  }

  async findContinueWatching(userId: string): Promise<WatchHistoryResponse[]> {
    const histories = await this.watchHistoryRepository
      .createQueryBuilder('history')
      .innerJoin('history.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('history.progressSeconds > :minimumProgress', {
        minimumProgress: 0,
      })
      .orderBy('history.updatedAt', 'DESC')
      .getMany()
    return histories.map(toWatchHistoryResponse)
  }
}
