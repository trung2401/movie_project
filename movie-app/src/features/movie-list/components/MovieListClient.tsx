'use client'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { CONTAINER_CLASS } from '@/constants/layout'
import { EMPTY_FILTERS } from '@/constants/movie'
import type { MovieFilters, MovieListResult } from '@/types/movie'
import { FilterSummary } from './FilterSummary'
import { MovieGrid } from './MovieGrid'
import { Pagination } from './Pagination'
import { useMovieList } from '../hooks/useMovieList'
import { cn } from '@/lib/cn'
import { getMovieListSeoCopy } from '@/lib/seo'

interface MovieListClientProps {
  initialFilters?: MovieFilters
  initialKeyword?: string
  initialPage?: number
  initialResult?: MovieListResult
  initialError?: string | null
}

export function CatalogMovieList({
  initialFilters = EMPTY_FILTERS,
  initialKeyword = '',
  initialPage = 1,
  initialResult,
  initialError = null,
}: MovieListClientProps = {}) {
  const movieList = useMovieList(initialFilters, initialKeyword, initialPage, initialResult, initialError)
  const hasCriteria = Boolean(
    movieList.appliedFilters.type
    || movieList.appliedFilters.country
    || movieList.appliedFilters.genre
    || movieList.appliedFilters.year
    || movieList.searchKeyword.trim(),
  )
  const pageSeoCopy = getMovieListSeoCopy('/phim', movieList.appliedFilters, movieList.searchKeyword)

  return (
    <div className="min-h-screen">
      <SiteHeader
        key={`${movieList.searchKeyword}|${movieList.appliedFilters.type}|${movieList.appliedFilters.country}|${movieList.appliedFilters.genre}|${movieList.appliedFilters.year}`}
        keyword={movieList.searchKeyword}
        filters={movieList.selectedFilters}
        onFiltersChange={movieList.setSelectedFilters}
        onApplyFilters={movieList.applyFilters}
        onSearch={movieList.search}
      />
      <main className={cn(CONTAINER_CLASS, 'space-y-7 pb-6 pt-6 lg:pb-9 lg:pt-9')}>
        <section className={cn('border-b border-[var(--color-line)] pb-6', !hasCriteria && 'border-b-0 pb-0')}>
          {hasCriteria && <p className="text-xl font-bold uppercase tracking-[.24em] text-[var(--color-primary-soft)]">Motchill <span className="px-1 text-[var(--color-line)]">/</span> Thư viện phim miễn phí</p>}
          <h1 className={cn('font-black text-white', hasCriteria ? 'mt-3 text-2xl sm:text-3xl' : 'text-2xl')}>{pageSeoCopy.heading}</h1>
          {hasCriteria && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">{pageSeoCopy.description}</p>}
        </section>

        <FilterSummary
          filters={movieList.appliedFilters}
          keyword={movieList.searchKeyword}
          onReset={movieList.reset}
          onRemove={(key) => movieList.applyFilters({ ...movieList.appliedFilters, [key]: '' })}
        />

        <section aria-label="Danh sách phim">
          {movieList.error && movieList.movies.length === 0 ? (
            <ErrorState message={movieList.error} onRetry={movieList.retry} />
          ) : (
            <>
              {movieList.error && (
                <div role="status" className="mb-4 border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  {movieList.error}
                </div>
              )}
              <MovieGrid movies={movieList.movies} imageBaseUrl={movieList.imageBaseUrl} loading={movieList.loading} />
            </>
          )}
        </section>

        {!movieList.error
          && !movieList.loading
          && (movieList.movies.length > 0 || movieList.currentPage > 1)
          && (movieList.currentPage > 1 || movieList.pagination.hasNextPage)
          && <Pagination currentPage={movieList.currentPage} totalPages={movieList.pagination.totalPages} hasNextPage={movieList.pagination.hasNextPage} />}
      </main>
    </div>
  )
}

// Kept as an export alias for callers that still use the previous component name.
export const MovieListClient = CatalogMovieList
