import { mockMovies } from '@/api/mockData'
import { isMockEnvironment } from '@/constants/environment'
import { MovieWatchClient } from '@/features/movie-detail/components/MovieWatchClient'
import { getMetadataDescription, getMovieImageUrl, getMoviePath, getMovieStructuredData, getMovieUrl, hasMovieFacts, isPlaceholderMovieDescription } from '@/lib/seo'
import { getMovieDetail } from '@/services/movieApi'
import { MovieNotFoundError } from '@/services/providers'
import type { Movie } from '@/types/movie'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

type WatchPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ episode?: string | string[] }>
}

const loadMovie = cache(async (slug: string): Promise<Movie> => {
  try {
    return await getMovieDetail(slug)
  } catch (error) {
    if (error instanceof MovieNotFoundError) notFound()
    if (!isMockEnvironment) throw error

    const fallbackMovie = mockMovies.find((item) => item.slug === slug)
    if (!fallbackMovie) notFound()

    return { ...fallbackMovie, content: `Nội dung phim ${fallbackMovie.name} đang được cập nhật.` }
  }
})

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const [{ slug }, { episode }] = await Promise.all([params, searchParams])
  const movie = await loadMovie(slug)
  const title = `${movie.name} - Xem phim online`
  const description = getMetadataDescription(movie.content)
  const canonical = getMoviePath(movie.slug)
  const hasEpisodeQuery = Array.isArray(episode) || typeof episode === 'string'
  const shouldNoIndex = hasEpisodeQuery || isPlaceholderMovieDescription(movie.content)

  return {
    title,
    description,
    alternates: { canonical },
    ...(shouldNoIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'video.movie',
      siteName: 'Motchill',
      images: [{ url: getMovieImageUrl(movie), alt: movie.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getMovieImageUrl(movie)],
    },
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const [{ slug }, { episode }] = await Promise.all([params, searchParams])
  const movie = await loadMovie(slug)
  if (isPlaceholderMovieDescription(movie.content) && !hasMovieFacts(movie)) notFound()
  const movieUrl = getMovieUrl(movie.slug)
  const episodeCount = movie.episodes?.reduce((count, server) => count + server.server_data.length, 0) ?? 0
  const movieSchema = getMovieStructuredData(movie, movieUrl, episodeCount)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: new URL('/', movieUrl).toString() },
      { '@type': 'ListItem', position: 2, name: 'Phim', item: new URL('/phim', movieUrl).toString() },
      { '@type': 'ListItem', position: 3, name: movie.name, item: movieUrl },
    ],
  }
  const structuredData = JSON.stringify([movieSchema, breadcrumbSchema]).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <MovieWatchClient
        movie={movie}
        initialEpisodeSlug={typeof episode === 'string' ? episode : undefined}
      />
    </>
  )
}
