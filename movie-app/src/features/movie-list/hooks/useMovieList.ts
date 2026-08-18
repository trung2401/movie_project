'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_IMAGE_BASE_URL, EMPTY_FILTERS, LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import { mockMovies } from '@/api/mockData'
import { buildMoviesEndpoint, getMovieList } from '@/services/movieApi'
import type { Movie, MovieFilters } from '@/types/movie'

export function useMovieList() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [imageBaseUrl, setImageBaseUrl] = useState(DEFAULT_IMAGE_BASE_URL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<MovieFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<MovieFilters>(EMPTY_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchMovies = useCallback(async (endpoint: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await getMovieList(endpoint)
      setMovies(result.items)
      setImageBaseUrl(result.baseUrl)
    } catch (err) {
      console.error('API Error:', err)
      setError('Không thể tải dữ liệu API. Đang dùng dữ liệu mẫu.')
      setMovies(mockMovies)
      setImageBaseUrl(DEFAULT_IMAGE_BASE_URL)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadInitialMovies = async () => {
      await fetchMovies(`${LATEST_MOVIES_ENDPOINT}?page=1`)
    }
    void loadInitialMovies()
  }, [fetchMovies])

  const applyFilters = useCallback((nextFilters: MovieFilters = selectedFilters) => {
    setSelectedFilters(nextFilters)
    setAppliedFilters(nextFilters)
    setCurrentPage(1)
    void fetchMovies(buildMoviesEndpoint(nextFilters, searchKeyword, 1))
  }, [fetchMovies, searchKeyword, selectedFilters])

  const search = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim()
    setSearchKeyword(keyword)
    setSelectedFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setCurrentPage(1)
    void fetchMovies(
      trimmedKeyword
        ? buildMoviesEndpoint(EMPTY_FILTERS, trimmedKeyword, 1)
        : `${LATEST_MOVIES_ENDPOINT}?page=1`,
    )
  }, [fetchMovies])

  const reset = useCallback(() => {
    setSelectedFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setSearchKeyword('')
    setCurrentPage(1)
    void fetchMovies(`${LATEST_MOVIES_ENDPOINT}?page=1`)
  }, [fetchMovies])

  const changePage = useCallback((page: number) => {
    if (page < 1 || page === currentPage) return
    setCurrentPage(page)
    void fetchMovies(buildMoviesEndpoint(appliedFilters, searchKeyword, page))
  }, [appliedFilters, currentPage, fetchMovies, searchKeyword])

  return {
    movies,
    imageBaseUrl,
    loading,
    error,
    searchKeyword,
    selectedFilters,
    appliedFilters,
    currentPage,
    setSelectedFilters,
    applyFilters,
    search,
    reset,
    changePage,
    retry: () => fetchMovies(buildMoviesEndpoint(appliedFilters, searchKeyword, currentPage)),
  }
}
