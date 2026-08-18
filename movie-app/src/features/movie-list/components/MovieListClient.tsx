'use client'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { HeroBanner } from './HeroBanner'
import { FilterSummary } from './FilterSummary'
import { MovieGrid } from './MovieGrid'
import { Pagination } from './Pagination'
import { useMovieList } from '../hooks/useMovieList'

export function MovieListClient() {
  const movieList = useMovieList()
  const hasCriteria = Boolean(movieList.appliedFilters.type || movieList.appliedFilters.country || movieList.appliedFilters.genre || movieList.appliedFilters.year || movieList.searchKeyword.trim())

  return <div className="min-h-screen">
    <SiteHeader filters={movieList.selectedFilters} onFiltersChange={movieList.setSelectedFilters} onApplyFilters={movieList.applyFilters} onSearch={movieList.search} />
    {!hasCriteria && <HeroBanner />}
    <main className="mx-auto max-w-[100rem] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      {hasCriteria && <section className="border-b border-[var(--color-line)] pb-6"><p className="text-xl font-bold uppercase tracking-[.24em] text-[var(--color-primary-soft)]">MovieApp <span className="px-1 text-[var(--color-line)]">/</span> Thư viện phim miễn phí</p><h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">Kết quả tìm kiếm</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">Khám phá phim mới, lọc theo quốc gia, thể loại hoặc năm phát hành.</p></section>}
      <FilterSummary filters={movieList.appliedFilters} keyword={movieList.searchKeyword} onReset={movieList.reset} />
      <section aria-label="Danh sách phim">{movieList.error ? <ErrorState message={movieList.error} onRetry={movieList.retry} /> : <MovieGrid movies={movieList.movies} imageBaseUrl={movieList.imageBaseUrl} loading={movieList.loading} />}</section>
      {!movieList.error && !movieList.loading && movieList.movies.length > 0 && <Pagination currentPage={movieList.currentPage} onPageChange={movieList.changePage} />}
    </main>
  </div>
}
