import type { Metadata } from 'next'
import { HomeMovieSections } from '@/features/movie-list/components/HomeMovieSections'
import { getMovieListMetadata } from '@/lib/seo'

export const revalidate = 300

export function generateMetadata(): Metadata {
  return getMovieListMetadata('/', {})
}

export default function HomePage() {
  return <HomeMovieSections />
}
