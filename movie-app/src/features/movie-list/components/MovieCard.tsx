import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Movie } from '@/types/movie'

function buildImageUrl(path: string | undefined, baseUrl: string) {
  if (!path) return '/fallback-poster.svg'
  if (/^https?:\/\//i.test(path)) return path
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export function MovieCard({ movie, imageBaseUrl }: { movie: Movie; imageBaseUrl: string }) {
  const posterUrl = buildImageUrl(movie.poster_url || movie.thumb_url, imageBaseUrl)

  return (
    <Link href={`/xem-phim/${movie.slug}`} className="focus-ring group block h-full">
      <article className="h-full overflow-hidden rounded-xl border border-[color:var(--color-line)/.85] bg-[var(--color-panel)] shadow-md shadow-black/20 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-[var(--color-primary)] group-hover:shadow-xl group-hover:shadow-[var(--color-primary)]/10">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-panel-soft)]">
          <Image
            src={posterUrl}
            alt={movie.name}
            fill
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 210px"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized={posterUrl.startsWith('data:')}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-white shadow-lg shadow-black/30">
              <Play className="size-4 fill-current" /> Xem phim
            </span>
          </div>
          {movie.year && <span className="absolute left-2 top-2 rounded-md border border-white/15 bg-black/45 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">{movie.year}</span>}
        </div>
        <div className="p-3.5">
          <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white">{movie.name}</h2>
          {movie.origin_name && <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted)]">{movie.origin_name}</p>}
        </div>
      </article>
    </Link>
  )
}
