'use client'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { CONTAINER_CLASS } from '@/constants/layout'
import { EMPTY_FILTERS } from '@/constants/movie'
import type { MovieFilters, MovieListResult } from '@/types/movie'
import { HeroBanner } from './HeroBanner'
import { FilterSummary } from './FilterSummary'
import { MovieGrid } from './MovieGrid'
import { Pagination } from './Pagination'
import { QuickFilters } from './QuickFilters'
import { useMovieList } from '../hooks/useMovieList'
import { cn } from '@/lib/cn'
import { getMovieListSeoCopy } from '@/lib/seo'

interface MovieListClientProps {
  initialFilters?: MovieFilters
  initialKeyword?: string
  initialPage?: number
  initialResult?: MovieListResult
  initialError?: string | null
  showHero?: boolean
}

export function MovieListClient({
  initialFilters = EMPTY_FILTERS,
  initialKeyword = '',
  initialPage = 1,
  initialResult,
  initialError = null,
  showHero = true,
}: MovieListClientProps = {}) {
  const movieList = useMovieList(initialFilters, initialKeyword, initialPage, initialResult, initialError)
  const hasCriteria = Boolean(movieList.appliedFilters.type || movieList.appliedFilters.country || movieList.appliedFilters.genre || movieList.appliedFilters.year || movieList.searchKeyword.trim())
  const pageSeoCopy = getMovieListSeoCopy(showHero ? '/' : '/phim', movieList.appliedFilters, movieList.searchKeyword)

  return <div className="min-h-screen">
    <SiteHeader key={`${movieList.searchKeyword}|${movieList.appliedFilters.type}|${movieList.appliedFilters.country}|${movieList.appliedFilters.genre}|${movieList.appliedFilters.year}`} keyword={movieList.searchKeyword} filters={movieList.selectedFilters} onFiltersChange={movieList.setSelectedFilters} onApplyFilters={movieList.applyFilters} onSearch={movieList.search} overlay={showHero && !hasCriteria} />
    {showHero && !hasCriteria && <HeroBanner movies={movieList.movies} imageBaseUrl={movieList.imageBaseUrl} loading={movieList.loading} />}
    {showHero && !hasCriteria && <QuickFilters />}
    <main className={cn(CONTAINER_CLASS, 'space-y-7 pb-6 lg:pb-9', hasCriteria ? 'pt-6 lg:pt-9' : 'pt-0')}>
      {hasCriteria ? (
        <section className="border-b border-[var(--color-line)] pb-6">
          <p className="text-xl font-bold uppercase tracking-[.24em] text-[var(--color-primary-soft)]">Motchill <span className="px-1 text-[var(--color-line)]">/</span> Thư viện phim miễn phí</p>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">{pageSeoCopy.heading}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">{pageSeoCopy.description}</p>
        </section>
      ) : (
        <div className="space-y-[1.125rem]">
          <h1 className="text-2xl font-bold text-white">{pageSeoCopy.heading}</h1>
        </div>
      )}
      <FilterSummary filters={movieList.appliedFilters} keyword={movieList.searchKeyword} onReset={movieList.reset} />
      <div>
        <section aria-label="Danh sách phim">
          {movieList.error && movieList.movies.length === 0 ? (
            <ErrorState message={movieList.error} onRetry={movieList.retry} />
          ) : (
            <>
              {movieList.error && (
                <div
                  role="status"
                  className="mb-4 border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"
                >
                  {movieList.error}
                </div>
              )}
              <MovieGrid
                movies={movieList.movies}
                imageBaseUrl={movieList.imageBaseUrl}
                loading={movieList.loading}
              />
            </>
          )}
        </section>
      </div>
      {!movieList.error && !movieList.loading && (movieList.movies.length > 0 || movieList.currentPage > 1) && (movieList.currentPage > 1 || movieList.pagination.hasNextPage) && <Pagination currentPage={movieList.currentPage} totalPages={movieList.pagination.totalPages} hasNextPage={movieList.pagination.hasNextPage} />}
    </main>
  </div>
}
