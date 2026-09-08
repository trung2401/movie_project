'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Movie } from '@/types/movie'
import { CONTAINER_CLASS } from '@/constants/layout'
import { MovieCard } from './MovieCard'

interface MovieRailProps {
  title: string
  description?: string
  movies: Movie[]
  imageBaseUrl: string
  href?: string
}

export function MovieRail({ title, description, movies, imageBaseUrl, href = '/phim' }: MovieRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  if (!movies.length) return null

  const scroll = (direction: 'left' | 'right') => railRef.current?.scrollBy({ left: direction === 'right' ? railRef.current.clientWidth * 0.82 : -railRef.current.clientWidth * 0.82, behavior: 'smooth' })

  return <section aria-labelledby={`rail-${title}`} className="py-5 sm:py-7">
    <div className={CONTAINER_CLASS}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0"><h2 id={`rail-${title}`} className="text-xl font-bold text-white sm:text-2xl">{title}</h2>{description && <p className="mt-1 line-clamp-1 text-sm text-[var(--color-muted)]">{description}</p>}</div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex"><button type="button" onClick={() => scroll('left')} className="focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white" aria-label={`Cuộn ${title} sang trái`}><ChevronLeft className="size-4" /></button><button type="button" onClick={() => scroll('right')} className="focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white" aria-label={`Cuộn ${title} sang phải`}><ChevronRight className="size-4" /></button></div>
          <Link href={href} className="focus-ring text-sm font-semibold text-[var(--color-muted)] transition hover:text-white">Xem tất cả</Link>
        </div>
      </div>
      <div ref={railRef} className="mt-4 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-flow-col sm:auto-cols-[minmax(168px,1fr)] sm:gap-4 sm:overflow-x-auto sm:px-0 sm:pb-0">
        {movies.slice(0, 10).map((movie) => <div key={movie.slug} className="w-[calc((100vw-2.75rem)/2.1)] min-w-[148px] max-w-[220px] snap-start sm:w-auto sm:min-w-0"><MovieCard movie={movie} imageBaseUrl={imageBaseUrl} /></div>)}
      </div>
    </div>
  </section>
}

export function MovieRailSkeleton({ title }: { title: string }) {
  return (
    <section aria-label={`Đang tải ${title}`} className="py-5 sm:py-7">
      <div className={CONTAINER_CLASS}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
          <div className="h-5 w-20 animate-pulse rounded bg-[var(--color-panel-soft)]" />
        </div>
        <div className="mt-4 flex gap-3 overflow-hidden sm:gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="w-[calc((100vw-2.75rem)/2.1)] min-w-[148px] max-w-[220px] shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] sm:w-[calc((100% - 4rem)/5)] sm:min-w-0">
              <div className="aspect-[2/3] animate-pulse bg-[var(--color-panel-soft)]" />
              <div className="min-h-[7.25rem] space-y-2 p-3">
                <div className="h-4 animate-pulse rounded bg-[var(--color-panel-soft)]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-panel-soft)]" />
                <div className="mt-6 h-3 w-1/2 animate-pulse rounded bg-[var(--color-panel-soft)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
