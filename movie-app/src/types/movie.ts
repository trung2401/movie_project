export type MovieNamedValue = string | { name?: string; slug?: string }
export type MovieDateValue = string | { time?: string; date?: string; value?: string }

export interface Movie {
  name: string
  origin_name?: string
  slug: string
  thumb_url?: string
  poster_url?: string
  year?: number
  content?: string
  type?: string
  category?: MovieNamedValue[]
  genre?: MovieNamedValue[]
  country?: MovieNamedValue[]
  actor?: MovieNamedValue[] | string
  director?: MovieNamedValue[] | string
  lang?: string
  language?: string
  modified?: MovieDateValue
  updated_at?: MovieDateValue
  updatedAt?: MovieDateValue
  created?: MovieDateValue
  datePublished?: MovieDateValue
  date_published?: MovieDateValue
  release_date?: MovieDateValue
  released_at?: MovieDateValue
  rating?: number | string | { ratingValue?: number | string; value?: number | string; score?: number | string; ratingCount?: number | string; count?: number | string }
  vote_average?: number | string
  vote_count?: number | string
  episodes?: EpisodeServer[]
}

export interface Episode {
  name: string
  slug: string
  link_embed?: string
}

export interface EpisodeServer {
  server_name: string
  server_data: Episode[]
  provider_name?: string
}

export interface MovieListResult {
  items: Movie[]
  baseUrl: string
  pagination: MovieListPagination
}

export interface MovieListPagination {
  totalItems?: number
  totalPages?: number
  hasNextPage: boolean
}

export interface MovieFilters {
  type: string
  country: string
  genre: string
  year: string
}
