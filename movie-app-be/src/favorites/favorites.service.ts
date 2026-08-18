import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateFavoriteDto } from './dto/create-favorite.dto'
import { Favorite } from './entities/favorite.entity'
import { FavoriteResponse, toFavoriteResponse } from './favorites.types'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
  ) {}

  async create(
    userId: string,
    dto: CreateFavoriteDto,
  ): Promise<FavoriteResponse> {
    const movieSlug = dto.movieSlug.trim().toLowerCase()
    const movieName = dto.movieName.trim()
    const existingFavorite = await this.favoritesRepository.findOne({
      where: { user: { id: userId }, movieSlug },
    })
    if (existingFavorite) {
      if (existingFavorite.movieName !== movieName) {
        existingFavorite.movieName = movieName
        return toFavoriteResponse(
          await this.favoritesRepository.save(existingFavorite),
        )
      }
      throw new ConflictException('Movie is already in favorites')
    }

    try {
      const favorite = await this.favoritesRepository.save(
        this.favoritesRepository.create({
          user: { id: userId },
          movieSlug,
          movieName,
        }),
      )
      return toFavoriteResponse(favorite)
    } catch (error: unknown) {
      if (this.isDuplicateFavoriteError(error))
        throw new ConflictException('Movie is already in favorites')
      throw error
    }
  }

  async findAllForUser(userId: string): Promise<FavoriteResponse[]> {
    const favorites = await this.favoritesRepository.find({
      where: { user: { id: userId } },
      order: { addedAt: 'DESC' },
    })
    return favorites.map(toFavoriteResponse)
  }

  async remove(userId: string, movieSlug: string): Promise<void> {
    const result = await this.favoritesRepository.delete({
      user: { id: userId },
      movieSlug: movieSlug.trim().toLowerCase(),
    })
    if (result.affected === 0)
      throw new NotFoundException('Favorite was not found')
  }

  private isDuplicateFavoriteError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    )
  }
}
