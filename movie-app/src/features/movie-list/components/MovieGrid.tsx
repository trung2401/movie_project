import { EmptyState } from '@/components/ui/EmptyState'
import type { Movie } from '@/types/movie'
import { MovieCard } from './MovieCard'

export function MovieGrid({ movies, imageBaseUrl, loading }: { movies: Movie[]; imageBaseUrl: string; loading: boolean }) {
  if (loading) {
    return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6"><>{Array.from({ length: 10 }, (_, index) => <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-md"><div className="aspect-[3/4] bg-[var(--color-panel-soft)]" /><div className="space-y-2 p-3.5"><div className="h-4 rounded bg-[var(--color-panel-soft)]" /><div className="h-3 w-2/3 rounded bg-[var(--color-panel-soft)]" /></div></div>)}</></div>
  }
  if (!movies.length) return <EmptyState />
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">{movies.map((movie) => <MovieCard key={movie.slug} movie={movie} imageBaseUrl={imageBaseUrl} />)}</div>
}
