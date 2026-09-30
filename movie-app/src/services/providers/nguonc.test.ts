import assert from 'node:assert/strict'
import test from 'node:test'
import type { Movie, MovieListResult } from '@/types/movie'
import { movieProviderManager } from './index'
import { buildNguonCListEndpoint, nguoncProvider } from './nguonc.provider'
import { parseNguonCDetailResponse, parseNguonCListResponse } from './nguonc.parser'
import { phimapiProvider } from './phimapi.provider'
import { getCachedMovieList } from '../serverMovieApi'

const listPayload = {
  status: 'success',
  paginate: {
    current_page: 1,
    total_page: 3335,
    total_items: 33349,
    items_per_page: 10,
  },
  items: [{
    name: 'Trọng Giáp Hiệp Sĩ Chuyển Sinh Bị Lưu Đày Trở Nên Vô Địch Nhờ Kiến Thức Về Game',
    slug: 'trong-giap-hiep-si-chuyen-sinh-bi-luu-day-tro-nen-vo-dich-nho-kien-thuc-ve-game',
    original_name: 'Tsuihou sareta Tensei Juukishi wa Game Chishiki de Musou suru',
    thumb_url: 'https://phim.nguonc.com/public/images/Film/thumb-360x504-example.jpg',
    poster_url: 'https://phim.nguonc.com/public/images/Post/3/example.jpg',
    description: 'Mô tả phim thật từ response NguonC.',
    total_episodes: 13,
    current_episode: 'Hoàn tất (13/13)',
    language: 'Vietsub',
    year: '2026',
  }],
}

const detailPayload = {
  status: 'success',
  movie: {
    ...listPayload.items[0],
    category: {
      '1': { group: { name: 'Định dạng' }, list: [{ name: 'Phim bộ' }] },
      '2': { group: { name: 'Thể loại' }, list: [{ name: 'Hành Động' }] },
      '3': { group: { name: 'Năm' }, list: [{ name: '2026' }] },
      '4': { group: { name: 'Quốc gia' }, list: [{ name: 'Nhật Bản' }] },
    },
    casts: 'Diễn viên kiểm thử',
    episodes: [{
      server_name: 'Vietsub #1',
      items: [{ name: '1', slug: 'tap-1', embed: 'https://embed.example/episode-1' }],
    }],
  },
}

test('parses NguonC list response into MovieListResult', () => {
  const result = parseNguonCListResponse(listPayload, 1)

  assert.equal(result.items[0].slug, listPayload.items[0].slug)
  assert.equal(result.items[0].content, listPayload.items[0].description)
  assert.equal(result.items[0].language, listPayload.items[0].language)
  assert.equal(result.items[0].year, 2026)
  assert.equal(result.baseUrl, 'https://phim.nguonc.com/public/images/')
  assert.deepEqual(result.pagination, {
    totalItems: 33349,
    totalPages: 3335,
    hasNextPage: true,
  })
})

test('parses NguonC detail category groups and embed episodes', () => {
  const result = parseNguonCDetailResponse(detailPayload)

  assert.equal(result?.type, 'Phim bộ')
  assert.deepEqual(result?.category, [{ name: 'Hành Động' }])
  assert.deepEqual(result?.country, [{ name: 'Nhật Bản' }])
  assert.deepEqual(result?.episodes, [{
    server_name: 'Vietsub #1',
    server_data: [{ name: '1', slug: 'tap-1', link_embed: 'https://embed.example/episode-1' }],
  }])
})

test('adapts PhimAPI list paths to verified NguonC paths', () => {
  assert.equal(
    buildNguonCListEndpoint('https://phimapi.com/v1/api/tim-kiem?keyword=test&page=2'),
    'https://phim.nguonc.com/api/films/search?keyword=test&page=2',
  )
  assert.equal(
    buildNguonCListEndpoint('https://phimapi.com/v1/api/the-loai/hoat-hinh?page=1'),
    'https://phim.nguonc.com/api/films/the-loai/hoat-hinh?page=1',
  )
  assert.throws(
    () => buildNguonCListEndpoint('https://phimapi.com/v1/api/nam/2026?page=1'),
    /chưa có endpoint năm được xác nhận/,
  )
})

test('falls back to NguonC when PhimAPI list fails', async () => {
  const originalPhimApiList = phimapiProvider.getMovieList
  const originalNguonCList = nguoncProvider.getMovieList
  let fallbackEndpoint = ''
  const fallbackResult: MovieListResult = {
    items: [{ name: 'NguonC fallback', slug: 'nguonc-fallback' }],
    baseUrl: 'https://phim.nguonc.com/public/images/',
    pagination: { hasNextPage: false },
  }

  phimapiProvider.getMovieList = async () => { throw new Error('PhimAPI unavailable') }
  nguoncProvider.getMovieList = async (endpoint) => {
    fallbackEndpoint = endpoint
    return fallbackResult
  }

  try {
    await assert.doesNotReject(async () => {
      const result = await getCachedMovieList('https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=3')
      assert.deepEqual(result, fallbackResult)
      assert.equal(fallbackEndpoint, 'https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=3')
    })
  } finally {
    phimapiProvider.getMovieList = originalPhimApiList
    nguoncProvider.getMovieList = originalNguonCList
  }
})

test('ignores a detail provider result without a playable episode', async () => {
  const originalPhimApiDetail = phimapiProvider.getMovieDetail
  const originalNguonCDetail = nguoncProvider.getMovieDetail
  const playableMovie: Movie = {
    name: 'PhimAPI movie',
    slug: 'shared-slug',
    episodes: [{
      server_name: 'PhimAPI',
      server_data: [{ name: '1', slug: 'tap-1', link_embed: 'https://embed.example/phimapi' }],
    }],
  }

  phimapiProvider.getMovieDetail = async () => playableMovie
  nguoncProvider.getMovieDetail = async () => ({
    name: 'NguonC movie',
    slug: 'shared-slug',
    episodes: [{ server_name: 'NguonC', server_data: [{ name: '1', slug: 'tap-1' }] }],
  })

  try {
    const result = await movieProviderManager.getMovieDetailWithFallback('shared-slug')
    assert.deepEqual(result.episodes, playableMovie.episodes?.map((server) => ({ ...server, provider_name: 'phimapi' })))
  } finally {
    phimapiProvider.getMovieDetail = originalPhimApiDetail
    nguoncProvider.getMovieDetail = originalNguonCDetail
  }
})
