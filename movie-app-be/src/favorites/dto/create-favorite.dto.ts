import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateFavoriteDto {
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'movieSlug must be a URL-safe slug',
  })
  movieSlug: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  movieName: string
}
