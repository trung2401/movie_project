export interface Movie {
  name: string
  origin_name?: string
  slug: string
  thumb_url?: string
  poster_url?: string
  year?: number
  content?: string
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
}

export interface MovieFilters {
  type: string
  country: string
  genre: string
  year: string
}
