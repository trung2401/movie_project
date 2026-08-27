import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CreateFavoriteDto } from './dto/create-favorite.dto'
import {
  FavoriteListResponse,
  FavoriteResponse,
  FavoriteSummaryResponse,
} from './favorites.types'
import { FavoritesService } from './favorites.service'

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFavoriteDto,
  ): Promise<FavoriteResponse> {
    return this.favoritesService.create(user.sub, dto)
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ): Promise<FavoriteListResponse> {
    return this.favoritesService.findAllForUser(user.sub, query)
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<FavoriteSummaryResponse> {
    return this.favoritesService.getSummaryForUser(user.sub)
  }

  @Get(':movieSlug')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('movieSlug') movieSlug: string,
  ): Promise<FavoriteResponse | null> {
    return this.favoritesService.findOneForUser(user.sub, movieSlug)
  }

  @Delete(':movieSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('movieSlug') movieSlug: string,
  ): Promise<void> {
    return this.favoritesService.remove(user.sub, movieSlug)
  }
}
