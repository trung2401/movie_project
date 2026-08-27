'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import { CONTAINER_CLASS } from '@/constants/layout'
import { getMovieDescription } from '@/lib/movieText'
import { getMovieDetail } from '@/services/movieApi'
import type { Movie } from '@/types/movie'
import { cn } from '@/lib/cn'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useHeroCarousel } from '../hooks/useHeroCarousel'

type OptionalMovieMetadata = Movie & {
  category?: string | string[] | Array<{ name?: string }>
  genre?: string | string[] | Array<{ name?: string }>
  quality?: string
}

function resolveImageUrl(path: string | undefined, baseUrl: string) {
  if (!path) return '/fallback-poster.svg'
  if (/^https?:\/\//i.test(path)) return path
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

function splitMovieTitle(name: string) {
  const parts = name.split(':')
  if (parts.length < 2) return { eyebrow: '', title: name }

  return {
    eyebrow: parts.shift()?.trim() || '',
    title: parts.join(':').trim(),
  }
}

function getMovieGenres(movie: Movie) {
  const metadata = movie as OptionalMovieMetadata
  const rawGenres = metadata.category ?? metadata.genre

  if (typeof rawGenres === 'string') {
    return rawGenres.split('|').map((genre) => genre.trim()).filter(Boolean)
  }

  if (!Array.isArray(rawGenres)) return []

  return rawGenres
    .flatMap((genre) => (typeof genre === 'string' ? [genre] : genre.name ? [genre.name] : []))
    .map((genre) => genre.trim())
    .filter(Boolean)
}

interface HeroSlideImageProps {
  movie: Movie
  imageBaseUrl: string
  priority: boolean
}

function HeroSlideImage({ movie, imageBaseUrl, priority }: HeroSlideImageProps) {
  const imageSrc = resolveImageUrl(movie.thumb_url ?? movie.poster_url, imageBaseUrl)
  const [isPortrait, setIsPortrait] = useState(() => !movie.thumb_url && Boolean(movie.poster_url))

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget
    setIsPortrait(image.naturalHeight > image.naturalWidth)
  }

  return (
    <>
      {isPortrait && (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="hero-image-feather scale-110 object-cover opacity-35 blur-2xl"
          unoptimized={imageSrc.startsWith('data:')}
        />
      )}
      <Image
        src={imageSrc}
        alt={`${movie.name} - xem phim online`}
        fill
        priority={priority}
        sizes="100vw"
        onLoad={handleImageLoad}
        className={cn(
          'hero-image-feather transition-[object-position] duration-500',
          isPortrait
            ? 'object-contain object-top md:object-center'
            : 'object-cover object-top md:object-center',
        )}
        unoptimized={imageSrc.startsWith('data:')}
      />
    </>
  )
}

function HeroBannerSkeleton() {
  return (
    <section
      aria-label="Đang tải phim nổi bật"
      className="relative min-h-[430px] overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-panel)] sm:min-h-[500px]"
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[var(--color-panel)] via-[var(--color-panel-soft)] to-[var(--color-panel)]" />
      <div className={cn(CONTAINER_CLASS, 'relative z-10 flex min-h-[430px] items-end pb-20 sm:min-h-[500px] lg:min-h-[680px]')}>
        <div className="w-full max-w-xl space-y-4">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-12 w-4/5 rounded bg-white/10 sm:h-16" />
          <div className="h-12 w-full rounded bg-white/10" />
          <div className="flex gap-3">
            <div className="h-11 w-36 rounded-lg bg-white/10" />
            <div className="h-11 w-28 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function HeroBanner({ movies, imageBaseUrl, loading }: { movies: Movie[]; imageBaseUrl: string; loading: boolean }) {
  const [paused, setPaused] = useState(false)
  const [hydratedHeroMovies, setHydratedHeroMovies] = useState<Movie[]>([])
  const { currentIndex, goTo } = useHeroCarousel({
    itemCount: Math.min(movies.length, 5),
    paused,
  })
  const heroMovies = movies.slice(0, 5).map((movie) =>
    hydratedHeroMovies.find((hydratedMovie) => hydratedMovie.slug === movie.slug) ?? movie,
  )

  useEffect(() => {
    const candidates = movies.slice(0, 5)
    let active = true

    const missingDescriptions = candidates.filter((movie) => !movie.content?.trim())
    if (!missingDescriptions.length) return () => { active = false }

    void Promise.all(
      missingDescriptions.map(async (movie) => {
        try {
          const detail = await getMovieDetail(movie.slug)
          return detail?.content?.trim() ? { ...movie, content: detail.content } : movie
        } catch {
          return movie
        }
      }),
    ).then((hydratedMovies) => {
      if (!active) return
      const hydratedBySlug = new Map(hydratedMovies.map((movie) => [movie.slug, movie]))
      setHydratedHeroMovies(candidates.map((movie) => hydratedBySlug.get(movie.slug) ?? movie))
    })

    return () => {
      active = false
    }
  }, [movies])

  const activeMovie = heroMovies[currentIndex]
  const activeTitle = activeMovie ? splitMovieTitle(activeMovie.name) : { eyebrow: '', title: '' }

  if (loading) return <HeroBannerSkeleton />
  if (!heroMovies.length || !activeMovie) return null

  return (
    <>
      <section
        aria-label="Phim nổi bật"
        className="relative isolate min-h-[430px] overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-ink)] sm:min-h-[500px] lg:min-h-[680px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[var(--color-ink)]" />

        {heroMovies.map((movie, index) => {
          const isActive = index === currentIndex

          return (
            <div
              key={movie.slug}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0',
              )}
              aria-hidden={!isActive}
            >
              <HeroSlideImage movie={movie} imageBaseUrl={imageBaseUrl} priority={index === 0} />
            </div>
          )
        })}

        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-ink)]/75 to-[var(--color-ink)]/20" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[var(--color-ink)]/95 via-[var(--color-ink)]/35 to-transparent" />

        <div className={cn(CONTAINER_CLASS, 'relative z-30 flex min-h-[430px] items-end pb-20 pt-24 sm:min-h-[500px] sm:pb-24 lg:min-h-[680px] lg:pb-28')}>
          <div className="w-full max-w-2xl text-center lg:text-left">
            {activeTitle.eyebrow && (
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-primary-soft)] sm:text-base">
                {activeTitle.eyebrow}:
              </p>
            )}
            <h2 className="mt-2 max-w-3xl text-4xl font-black uppercase leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              {activeTitle.title}
            </h2>
            <p className="mt-5 line-clamp-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              {getMovieDescription(activeMovie.content)}
            </p>

            {getMovieGenres(activeMovie).length > 0 && (
              <p className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs font-semibold text-white/75 sm:text-sm lg:justify-start">
                {getMovieGenres(activeMovie).map((genre, index) => (
                  <span key={`${activeMovie.slug}-${genre}`}>
                    {index > 0 && <span className="mr-2 text-[var(--color-primary-soft)]">|</span>}
                    {genre}
                  </span>
                ))}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href={`/xem-phim/${activeMovie.slug}`}
                className="focus-ring inline-flex min-h-11 min-w-40 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[var(--color-ink)] shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)]"
              >
                <Play className="size-4 fill-current" />
                Xem phim ngay
                <ArrowRight className="size-4" />
              </Link>
              <FavoriteButton movieSlug={activeMovie.slug} movieName={activeMovie.name} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-7">
          {heroMovies.map((movie, index) => (
            <button
              key={movie.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Chuyển đến phim ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className="focus-ring flex min-h-9 min-w-9 items-center justify-center"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-1.5 bg-white/45 hover:bg-white/75',
                )}
              />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
