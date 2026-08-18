import {
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export class UpsertWatchHistoryDto {
  @IsString()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: 'movieSlug must be a URL-safe slug' })
  movieSlug: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  movieName: string

  @IsString()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: 'episodeSlug must be a URL-safe slug' })
  episodeSlug: string

  @IsInt()
  @Min(0)
  @Max(2147483647)
  progressSeconds: number
}
