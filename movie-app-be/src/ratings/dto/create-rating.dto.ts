import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateRatingDto {
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'movieSlug must be a URL-safe slug',
  })
  movieSlug: string

  @IsInt()
  @Min(1)
  @Max(10)
  score: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
