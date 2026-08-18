import type { MovieFilters } from '@/types/movie'

export const API_BASE = 'https://phimapi.com/v1/api'
// Kept for the inactive Ophim provider; do not add it back to the manager until its player is healthy.
export const API_BASE_OPHIM = 'https://ophim1.com'
export const OPHIM_IMAGE_BASE_URL = 'https://img.ophim.live/uploads/movies/'
export const LATEST_MOVIES_ENDPOINT = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat'
export const DEFAULT_IMAGE_BASE_URL = 'https://img.phimapi.com/'

export const EMPTY_FILTERS: MovieFilters = { type: '', country: '', genre: '', year: '' }

export const MOVIE_TYPES = [
  { label: 'Phim lẻ', slug: 'phim-le' },
  { label: 'Phim bộ', slug: 'phim-bo' },
  { label: 'Phim chiếu rạp', slug: 'phim-chieu-rap' },
  { label: 'TV Shows', slug: 'tv-shows' },
]

export const COUNTRIES = [
  { label: 'Hàn Quốc', slug: 'han-quoc' },
  { label: 'Trung Quốc', slug: 'trung-quoc' },
  { label: 'Âu Mỹ', slug: 'au-my' },
  { label: 'Việt Nam', slug: 'viet-nam' },
]

export const GENRES = [
  { label: 'Hành động', slug: 'hanh-dong' },
  { label: 'Tình cảm', slug: 'tinh-cam' },
  { label: 'Hoạt hình', slug: 'hoat-hinh' },
  { label: 'Kinh dị', slug: 'kinh-di' },
]
