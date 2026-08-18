import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { validateEnvironment } from './config/env.validation'
import { createNestTypeOrmOptions } from './config/typeorm.config'
import { FavoritesModule } from './favorites/favorites.module'
import { RatingsModule } from './ratings/ratings.module'
import { UsersModule } from './users/users.module'
import { WatchHistoryModule } from './watch-history/watch-history.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () =>
        createNestTypeOrmOptions(validateEnvironment(process.env)),
    }),
    UsersModule,
    AuthModule,
    FavoritesModule,
    WatchHistoryModule,
    RatingsModule,
  ],
})
export class AppModule {}
