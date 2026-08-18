import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { Rating } from './entities/rating.entity'
import { RatingsController } from './ratings.controller'
import { RatingsService } from './ratings.service'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Rating])],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
