import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { WatchHistory } from './entities/watch-history.entity'
import { WatchHistoryController } from './watch-history.controller'
import { WatchHistoryService } from './watch-history.service'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([WatchHistory])],
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService],
})
export class WatchHistoryModule {}
