import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HomeMovieSections, HomeMovieSectionsSkeleton } from '@/features/movie-list/components/HomeMovieSections'
import { loadHomeMovieSections } from '@/features/movie-list/server/loadHomeMovieSections'
import { getMovieListMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  return getMovieListMetadata('/', {})
}

async function HomeMovieSectionsLoader() {
  return <HomeMovieSections sections={await loadHomeMovieSections()} />
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeMovieSectionsSkeleton />}>
      <HomeMovieSectionsLoader />
    </Suspense>
  )
}
