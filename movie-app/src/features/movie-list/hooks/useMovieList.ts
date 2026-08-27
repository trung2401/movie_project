'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_IMAGE_BASE_URL, EMPTY_FILTERS } from '@/constants/movie'
import { isMockEnvironment } from '@/constants/environment'
import { mockMovies } from '@/api/mockData'
import { buildMoviesEndpoint, getMovieList } from '@/services/movieApi'
import type { Movie, MovieFilters, MovieListPagination, MovieListResult } from '@/types/movie'

function parsePage(value: string | null, fallback = 1) {
  const page = Number.parseInt(value ?? '', 10)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function useMovieList(
  initialFilters: MovieFilters = EMPTY_FILTERS,
  initialKeyword = '',
  initialPage = 1,
  initialResult?: MovieListResult,
  initialError: string | null = null,
) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryType = searchParams?.get('type') ?? initialFilters.type
  const queryCountry = searchParams?.get('country') ?? initialFilters.country
  const queryGenre = searchParams?.get('genre') ?? initialFilters.genre
  const queryYear = searchParams?.get('year') ?? initialFilters.year
  const queryKeyword = searchParams?.get('keyword') ?? initialKeyword
  const queryFilters = useMemo<MovieFilters>(() => ({
    type: queryType,
    country: queryCountry,
    genre: queryGenre,
    year: queryYear,
  }), [queryCountry, queryGenre, queryType, queryYear])
  const queryPage = parsePage(searchParams?.get('page') ?? null, initialPage)
  const queryKey = `${queryKeyword}|${queryType}|${queryCountry}|${queryGenre}|${queryYear}|${queryPage}`
  const [movies, setMovies] = useState<Movie[]>(initialResult?.items ?? [])
  const [imageBaseUrl, setImageBaseUrl] = useState(initialResult?.baseUrl ?? DEFAULT_IMAGE_BASE_URL)
  const [loading, setLoading] = useState(!initialResult)
  const [error, setError] = useState<string | null>(initialError)
  const [pagination, setPagination] = useState<MovieListPagination>(initialResult?.pagination ?? { hasNextPage: false })
  const [filterDraft, setFilterDraft] = useState({ key: queryKey, filters: initialFilters })
  const latestRequestId = useRef(0)
  const initialQueryKey = useRef(initialResult ? queryKey : null)
  const searchKeyword = queryKeyword
  const appliedFilters = queryFilters
  const currentPage = queryPage
  const selectedFilters = filterDraft.key === queryKey ? filterDraft.filters : queryFilters

  const fetchMovies = useCallback(async (endpoint: string) => {
    const requestId = ++latestRequestId.current

    try {
      setLoading(true)
      setError(null)
      const result = await getMovieList(endpoint)
      if (requestId !== latestRequestId.current) return

      setMovies(result.items)
      setImageBaseUrl(result.baseUrl)
      setPagination(result.pagination)
    } catch (err) {
      if (requestId !== latestRequestId.current) return

      console.error('API Error:', err)
      setError(isMockEnvironment ? 'Không thể tải dữ liệu API. Đang dùng dữ liệu mẫu.' : 'Không thể tải dữ liệu API.')
      setMovies(isMockEnvironment ? mockMovies : [])
      setImageBaseUrl(DEFAULT_IMAGE_BASE_URL)
      setPagination({ hasNextPage: false })
    } finally {
      if (requestId === latestRequestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQueryKey.current === queryKey) {
      const timeoutId = window.setTimeout(() => {
        if (initialQueryKey.current === queryKey) initialQueryKey.current = null
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }

    latestRequestId.current += 1
    const timeoutId = window.setTimeout(() => {
      void fetchMovies(buildMoviesEndpoint(queryFilters, queryKeyword, queryPage))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchMovies, queryFilters, queryKey, queryKeyword, queryPage])

  const setSelectedFilters = useCallback((filters: MovieFilters) => {
    setFilterDraft({ key: queryKey, filters })
  }, [queryKey])

  const updateUrl = useCallback((keyword: string, filters: MovieFilters, page: number) => {
    const params = new URLSearchParams()
    const trimmedKeyword = keyword.trim()

    if (trimmedKeyword) params.set('keyword', trimmedKeyword)
    if (filters.type) params.set('type', filters.type)
    if (filters.country) params.set('country', filters.country)
    if (filters.genre) params.set('genre', filters.genre)
    if (filters.year) params.set('year', filters.year)
    if (page > 1) params.set('page', String(page))

    const nextPathname = pathname ?? '/'
    const query = params.toString()
    router.push(query ? `${nextPathname}?${query}` : nextPathname)
  }, [pathname, router])

  const applyFilters = useCallback((nextFilters: MovieFilters = selectedFilters) => {
    updateUrl('', nextFilters, 1)
  }, [selectedFilters, updateUrl])

  const search = useCallback((keyword: string) => {
    updateUrl(keyword, EMPTY_FILTERS, 1)
  }, [updateUrl])

  const reset = useCallback(() => {
    router.push(pathname ?? '/')
  }, [pathname, router])

  const changePage = useCallback((page: number) => {
    if (page < 1 || page === currentPage) return
    updateUrl(searchKeyword, appliedFilters, page)
  }, [appliedFilters, currentPage, searchKeyword, updateUrl])

  const retry = useCallback(() => {
    void fetchMovies(buildMoviesEndpoint(appliedFilters, searchKeyword, currentPage))
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
    pagination,
    setSelectedFilters,
    applyFilters,
    search,
    reset,
    changePage,
    retry,
  }
}
