import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CONTAINER_CLASS } from '@/constants/layout'
import { cn } from '@/lib/cn'
import { buildQuickFilters } from '../utils/buildQuickFilters'

const quickFilters = buildQuickFilters()

export function QuickFilters() {
  return (
    <section aria-labelledby="quick-filters-title" className={cn(CONTAINER_CLASS, 'pb-3 sm:pb-5')}>
      <h2 id="quick-filters-title" className="text-2xl font-bold text-white">
        Bạn đang quan tâm gì?
      </h2>

      <div className="mt-4.5 -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="grid min-w-max grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 sm:min-w-0 sm:grid-flow-row sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {quickFilters.map((filter) => (
            <Link
              key={`${filter.key}-${filter.slug}`}
              href={`/phim?${filter.key}=${filter.slug}`}
              className={cn(
                'group flex min-h-24 min-w-[220px] flex-col justify-between rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg shadow-black/15 transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] sm:min-w-0',
                filter.gradient,
              )}
            >
              <span className="text-base font-bold leading-tight">{filter.label}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 transition group-hover:text-white">
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
