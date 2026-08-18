import { notFound } from 'next/navigation'
import { mockMovies } from '@/api/mockData'
import { getFallbackEpisodes, getMovieDetail } from '@/services/movieApi'
import { MovieWatchClient } from '@/features/movie-detail/components/MovieWatchClient'

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ episode?: string | string[] }>
}) {
  const { slug } = await params
  const { episode } = await searchParams
  let movie

  try {
    movie = await getMovieDetail(slug)
  } catch (error) {
    console.error('Error:', error)
    const fallbackMovie = mockMovies.find((item) => item.slug === slug)
    if (!fallbackMovie) notFound()
    movie = { ...fallbackMovie, content: `Nội dung phim ${fallbackMovie.name} đang được cập nhật.` }
  }

  const episodes = movie.episodes?.[0]?.server_data || getFallbackEpisodes(slug)
  return (
    <MovieWatchClient
      movie={movie}
      episodes={episodes}
      initialEpisodeSlug={typeof episode === 'string' ? episode : undefined}
    />
  )
}
