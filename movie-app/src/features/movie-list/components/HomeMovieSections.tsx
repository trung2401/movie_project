'use client'

import Link from 'next/link'
import { AlertCircle, ArrowRight, Film } from 'lucide-react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { CONTAINER_CLASS } from '@/constants/layout'
import type { HomeMovieSectionKey } from '@/services/movieApi'
import type { HomeMovieSectionResult, HomeMovieSectionsResult } from '../server/loadHomeMovieSections'
import { HeroBanner } from './HeroBanner'
import { MovieRail, MovieRailSkeleton } from './MovieRail'

const HOME_SECTIONS: Array<{ key: HomeMovieSectionKey; title: string; href: string; description?: string }> = [
  { key: 'latest', title: 'Phim mới cập nhật', href: '/phim', description: 'Những tựa phim vừa được bổ sung trên hệ thống.' },
  { key: 'korean', title: 'Phim Hàn Quốc hot', href: '/phim?country=han-quoc', description: 'Những bộ phim Hàn Quốc đang được quan tâm.' },
  { key: 'series', title: 'Phim bộ nổi bật', href: '/phim?type=phim-bo', description: 'Series nổi bật để xem liên tục.' },
  { key: 'single', title: 'Phim lẻ nổi bật', href: '/phim?type=phim-le', description: 'Phim điện ảnh chọn lọc cho một buổi xem trọn vẹn.' },
  { key: 'animation', title: 'Phim hoạt hình nổi bật', href: '/phim?genre=hoat-hinh', description: 'Những câu chuyện hoạt hình được yêu thích.' },
]

function HomeSectionStatus({ section, status }: { section: (typeof HOME_SECTIONS)[number]; status: HomeMovieSectionResult }) {
  if (status.error) {
    return (
      <section aria-labelledby={`home-rail-${section.key}`} className="py-5 sm:py-7">
        <div className={CONTAINER_CLASS}>
          <div className="flex items-center justify-between gap-4">
            <h2 id={`home-rail-${section.key}`} className="text-xl font-bold text-white sm:text-2xl">{section.title}</h2>
            <Link href={section.href} className="focus-ring inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-muted)] transition hover:text-white">
              Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 flex min-h-28 items-center gap-3 border-y border-[var(--color-line)] py-5 text-sm text-[var(--color-muted)]" role="status">
            <AlertCircle className="size-5 shrink-0 text-[var(--color-primary-soft)]" aria-hidden="true" />
            <span>{status.error}</span>
          </div>
        </div>
      </section>
    )
  }

  if (!status.result.items.length) {
    return (
      <section aria-labelledby={`home-rail-${section.key}`} className="py-5 sm:py-7">
        <div className={CONTAINER_CLASS}>
          <div className="flex items-center justify-between gap-4">
            <h2 id={`home-rail-${section.key}`} className="text-xl font-bold text-white sm:text-2xl">{section.title}</h2>
            <Link href={section.href} className="focus-ring inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-muted)] transition hover:text-white">
              Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex min-h-24 items-center gap-3 text-sm text-[var(--color-muted)]" role="status">
            <Film className="size-5 shrink-0" aria-hidden="true" />
            <span>Chưa có phim trong mục này</span>
          </div>
        </div>
      </section>
    )
  }

  return <MovieRail title={section.title} description={section.description} movies={status.result.items} imageBaseUrl={status.result.baseUrl} href={section.href} />
}

export function HomeMovieSectionsSkeleton() {
  return (
    <div className="min-h-screen">
      <SiteHeader showFilters={false} overlay />
      <HeroBanner movies={[]} imageBaseUrl="" loading />
      <main aria-label="Đang tải trang chủ">
        {HOME_SECTIONS.map((section) => <MovieRailSkeleton key={section.key} title={section.title} />)}
      </main>
    </div>
  )
}

export function HomeMovieSections({ sections }: { sections: HomeMovieSectionsResult }) {
  const latest = sections.latest.result

  return (
    <div className="min-h-screen">
      <SiteHeader showFilters={false} overlay />
      <HeroBanner movies={latest.items} imageBaseUrl={latest.baseUrl} loading={false} />
      <main className="space-y-1 pb-8" aria-label="Các mục phim trên trang chủ">
        {HOME_SECTIONS.map((section) => <HomeSectionStatus key={section.key} section={section} status={sections[section.key]} />)}
      </main>
    </div>
  )
}
