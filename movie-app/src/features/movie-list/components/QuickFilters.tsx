import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CONTAINER_CLASS } from '@/constants/layout'
import { cn } from '@/lib/cn'
import { buildQuickFilters } from '../utils/buildQuickFilters'

const quickFilters = buildQuickFilters()

export function QuickFilters() {
  return (
    <section aria-labelledby="quick-filters-title" className={cn(CONTAINER_CLASS, 'pb-5 sm:pb-7')}>
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--color-primary-soft)]">Khám phá nhanh</p><h2 id="quick-filters-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">Bạn đang quan tâm gì?</h2></div>
        <Link href="/phim" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-muted)] transition hover:text-white">Xem tất cả <ArrowRight className="size-4" /></Link>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="grid min-w-max grid-flow-col auto-cols-[minmax(176px,1fr)] gap-3 sm:min-w-0 sm:grid-flow-row sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {quickFilters.map((filter) => (
            <Link
              key={`${filter.key}-${filter.slug}`}
              href={`/phim?${filter.key}=${filter.slug}`}
              className={cn(
                'group flex min-h-20 min-w-[176px] flex-col justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3.5 text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/70 hover:bg-[var(--color-panel-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] sm:min-w-0',
              )}
            >
              <span className="text-sm font-bold leading-tight">{filter.label}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-muted)] transition group-hover:text-white">
                Xem chủ đề
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
