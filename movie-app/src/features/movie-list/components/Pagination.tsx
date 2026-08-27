'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/cn'

const VISIBLE_PAGE_COUNT = 5

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
}: {
  currentPage: number
  totalPages?: number
  hasNextPage: boolean
}) {
  const pathname = usePathname() ?? '/phim'
  const searchParams = useSearchParams()
  const hasKnownTotalPages = totalPages !== undefined && totalPages > 0
  const lastPage = hasKnownTotalPages ? totalPages : hasNextPage ? currentPage + 1 : currentPage
  const firstVisiblePage = hasKnownTotalPages
    ? Math.max(1, Math.min(currentPage - 2, lastPage - VISIBLE_PAGE_COUNT + 1))
    : Math.max(1, currentPage - 2)
  const visiblePageCount = Math.min(VISIBLE_PAGE_COUNT, lastPage - firstVisiblePage + 1)
  const visiblePages = Array.from({ length: visiblePageCount }, (_, index) => firstVisiblePage + index)
  const canGoNext = hasKnownTotalPages ? currentPage < lastPage : hasNextPage
  const getPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }
  const controlClassName = 'focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white'

  return (
    <nav aria-label="Phân trang danh sách phim" className="flex items-center justify-center gap-2 pt-2">
      {currentPage > 1 ? (
        <Link href={getPageHref(currentPage - 1)} rel="prev" className={controlClassName} aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={`${controlClassName} cursor-not-allowed opacity-40`} aria-disabled="true" aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </span>
      )}
      {firstVisiblePage > 1 && <span className="px-1 text-sm font-bold text-[var(--color-muted)]" aria-hidden="true">...</span>}
      {visiblePages.map((page) => currentPage === page ? (
        <span
          key={page}
          aria-current="page"
          className="focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] text-sm font-bold text-white shadow-md shadow-[var(--color-primary)]/20"
        >
          {page}
        </span>
      ) : (
        <Link
          key={page}
          href={getPageHref(page)}
          className={cn(
            'focus-ring inline-flex size-10 items-center justify-center rounded-lg border text-sm font-bold transition',
            'border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-white',
          )}
        >
          {page}
        </Link>
      ))}
      {lastPage > visiblePages.at(-1)! && <span className="px-1 text-sm font-bold text-[var(--color-muted)]" aria-hidden="true">...</span>}
      {canGoNext ? (
        <Link href={getPageHref(currentPage + 1)} rel="next" className={controlClassName} aria-label="Trang sau">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${controlClassName} cursor-not-allowed opacity-40`} aria-disabled="true" aria-label="Trang sau">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
