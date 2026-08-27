import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MovieListClient } from '@/features/movie-list/components/MovieListClient'
import { loadInitialMovieList } from '@/features/movie-list/server/loadInitialMovieList'
import { parseMovieListQuery, type MovieListSearchParams } from '@/features/movie-list/utils/parseMovieListQuery'
import { getMovieListMetadata } from '@/lib/seo'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<MovieListSearchParams>
}): Promise<Metadata> {
  return getMovieListMetadata('/', await searchParams)
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<MovieListSearchParams>
}) {
  const query = parseMovieListQuery(await searchParams)
  const initialMovieList = await loadInitialMovieList(query.filters, query.keyword, query.page)

  return (
    <Suspense fallback={null}>
      <MovieListClient
        key={`${query.keyword}|${query.filters.type}|${query.filters.country}|${query.filters.genre}|${query.filters.year}|${query.page}`}
        initialFilters={query.filters}
        initialKeyword={query.keyword}
        initialPage={query.page}
        initialResult={initialMovieList.result}
        initialError={initialMovieList.error}
      />
    </Suspense>
  )
}
