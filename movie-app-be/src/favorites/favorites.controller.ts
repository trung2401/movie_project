import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CreateFavoriteDto } from './dto/create-favorite.dto'
import { FavoriteResponse } from './favorites.types'
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
  findAll(@CurrentUser() user: JwtPayload): Promise<FavoriteResponse[]> {
    return this.favoritesService.findAllForUser(user.sub)
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
