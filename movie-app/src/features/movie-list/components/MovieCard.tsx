'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { useState } from 'react'
import type { Movie } from '@/types/movie'
import { getMovieAggregateRating, getMovieCountries, getMovieGenres, getMovieLanguage } from '@/lib/seo'

const FALLBACK_IMAGE = '/fallback-poster.svg'

function buildImageUrl(path: string | undefined, baseUrl: string) {
  if (!path) return FALLBACK_IMAGE
  if (/^https?:\/\//i.test(path)) return path
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

function getImageCandidates(movie: Movie, imageBaseUrl: string) {
  const remoteSources = [movie.poster_url, movie.thumb_url]
    .filter((path): path is string => Boolean(path?.trim()))
    .map((path) => buildImageUrl(path, imageBaseUrl))

  return [...new Set([...remoteSources, FALLBACK_IMAGE])]
}

function MoviePoster({ movie, imageBaseUrl }: { movie: Movie; imageBaseUrl: string }) {
  const imageSources = getImageCandidates(movie, imageBaseUrl)
  const [sourceIndex, setSourceIndex] = useState(0)
  const imageSrc = imageSources[sourceIndex] ?? FALLBACK_IMAGE

  function handleImageError() {
    setSourceIndex((currentIndex) => Math.min(currentIndex + 1, imageSources.length - 1))
  }

  return (
    <Image
      src={imageSrc}
      alt={movie.name}
      fill
      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 210px"
      className="object-cover transition duration-300 group-hover:scale-105"
      onError={handleImageError}
      unoptimized={imageSrc.startsWith('data:')}
    />
  )
}

export function MovieCard({ movie, imageBaseUrl }: { movie: Movie; imageBaseUrl: string }) {
  const rating = getMovieAggregateRating(movie)?.ratingValue ?? (typeof movie.rating === 'number' ? movie.rating : typeof movie.rating === 'string' ? Number(movie.rating) : undefined)
  const genres = getMovieGenres(movie)
  const countries = getMovieCountries(movie)
  const language = getMovieLanguage(movie) ?? movie.lang ?? movie.language
  const episodeCount = movie.episodes?.reduce((count, server) => count + server.server_data.length, 0) ?? 0
  const metadata = movie as Movie & { quality?: string; sub_docquyen?: string; chieurap?: boolean }
  const quality = metadata.quality || (metadata.chieurap ? 'Rạp' : undefined)

  return (
    <Link href={`/xem-phim/${movie.slug}`} className="focus-ring group block h-full">
      <article className="h-full overflow-hidden rounded-lg border border-[color:var(--color-line)/.8] bg-[var(--color-panel)] transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-[var(--color-primary)]/70 group-hover:bg-[var(--color-panel-soft)]">
        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-panel-soft)]">
          <MoviePoster movie={movie} imageBaseUrl={imageBaseUrl} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <span className="absolute bottom-2 left-2 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-2.5 text-xs font-bold text-white shadow-lg shadow-black/30 transition group-hover:bg-[var(--color-primary-soft)]">
            <Play className="size-3.5 fill-current" /> Xem phim
          </span>
          <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
            {quality && <span className="rounded-md border border-white/15 bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">{quality}</span>}
            {movie.year && <span className="rounded-md border border-white/15 bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">{movie.year}</span>}
          </div>
          {rating !== undefined && Number.isFinite(Number(rating)) && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-[var(--color-warning)] backdrop-blur">★ {Number(rating).toFixed(1)}</span>}
        </div>
        <div className="flex min-h-[7.25rem] flex-col p-3">
          <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white">{movie.name}</h2>
          {movie.origin_name && <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted)]">{movie.origin_name}</p>}
          <div className="mt-auto flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[11px] text-[var(--color-muted)]">
            {episodeCount > 0 && <span>{episodeCount} tập</span>}
            {language && <span>{language}</span>}
            {!language && (genres[0] || countries[0]) && <span>{genres[0] || countries[0]}</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}
