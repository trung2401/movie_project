import { EmptyState } from '@/components/ui/EmptyState'
import type { Movie } from '@/types/movie'
import { MovieCard } from './MovieCard'

export function MovieGrid({ movies, imageBaseUrl, loading }: { movies: Movie[]; imageBaseUrl: string; loading: boolean }) {
  if (loading) {
    return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <div key={index} className="animate-pulse overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)]"><div className="aspect-[2/3] bg-[var(--color-panel-soft)]" /><div className="min-h-[7.25rem] space-y-2 p-3"><div className="h-4 rounded bg-[var(--color-panel-soft)]" /><div className="h-3 w-2/3 rounded bg-[var(--color-panel-soft)]" /><div className="mt-6 h-3 w-1/2 rounded bg-[var(--color-panel-soft)]" /></div></div>)}</div>
  }
  if (!movies.length) return <EmptyState />
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{movies.map((movie) => <MovieCard key={movie.slug} movie={movie} imageBaseUrl={imageBaseUrl} />)}</div>
}
