import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

const VISIBLE_PAGE_COUNT = 5

export function Pagination({ currentPage, onPageChange }: { currentPage: number; onPageChange: (page: number) => void }) {
  const firstVisiblePage = currentPage <= 3 ? 1 : currentPage - 2
  const visiblePages = Array.from({ length: VISIBLE_PAGE_COUNT }, (_, index) => firstVisiblePage + index)

  return (
    <nav aria-label="Phân trang danh sách phim" className="flex items-center justify-center gap-2 pt-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </button>
      {firstVisiblePage > 1 && <span className="px-1 text-sm font-bold text-[var(--color-muted)]" aria-hidden="true">...</span>}
      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          className={cn(
            'focus-ring inline-flex size-10 items-center justify-center rounded-lg border text-sm font-bold transition',
            currentPage === page
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
              : 'border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-white',
          )}
        >
          {page}
        </button>
      ))}
      <span className="px-1 text-sm font-bold text-[var(--color-muted)]" aria-hidden="true">...</span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        className="focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white"
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
