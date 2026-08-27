'use client'

import Image from 'next/image'
import { ArrowLeft, CalendarDays, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Episode, EpisodeServer, Movie } from '@/types/movie'
import { AccountControl } from '@/features/auth/components/AccountControl'
import { useAuth } from '@/features/auth/auth-context'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { RatingsPanel } from '@/features/ratings/components/RatingsPanel'
import { useUserData } from '@/features/user-data/user-data-context'
import { VideoPlayer } from '@/features/player/components/VideoPlayer'
import { getMovieDescription } from '@/lib/movieText'
import { getMovieActors, getMovieCountries, getMovieDirectors, getMovieGenres, getMovieImageUrl } from '@/lib/seo'
import { EpisodeList } from './EpisodeList'
import { ServerSelector } from './ServerSelector'

function getServers(movie: Movie): EpisodeServer[] {
  return movie.episodes?.flatMap((server) => {
    const playableEpisodes = server.server_data.filter((episode) => Boolean(episode.link_embed))
    return playableEpisodes.length ? [{ ...server, server_data: playableEpisodes }] : []
  }) ?? []
}

function getInitialPlayback(
  servers: EpisodeServer[],
  initialEpisodeSlug?: string,
): { currentEpisode: Episode | null; selectedServer: EpisodeServer | null } {
  const selectedServer =
    servers.find((server) =>
      server.server_data.some((episode) => episode.slug === initialEpisodeSlug),
    ) ?? servers[0]

  return {
    selectedServer: selectedServer ?? null,
    currentEpisode:
      selectedServer?.server_data.find(
        (episode) => episode.slug === initialEpisodeSlug,
      ) ??
      selectedServer?.server_data[0] ??
      null,
  }
}

export function MovieWatchClient({
  movie,
  initialEpisodeSlug,
}: {
  movie: Movie
  initialEpisodeSlug?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const servers = useMemo(() => getServers(movie), [movie])
  const initialPlayback = getInitialPlayback(servers, initialEpisodeSlug)
  const initialEpisodeForUrl = initialPlayback.currentEpisode?.slug
  const [selectedServer, setSelectedServer] = useState<EpisodeServer | null>(initialPlayback.selectedServer)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(initialPlayback.currentEpisode)
  const [watchStatus, setWatchStatus] = useState('')
  const { session } = useAuth()
  const { getWatchHistory, saveWatchHistory } = useUserData()
  const movieGenres = getMovieGenres(movie)
  const movieCountries = getMovieCountries(movie)
  const movieActors = getMovieActors(movie)
  const movieDirectors = getMovieDirectors(movie)
  const movieFacts = [
    movie.year ? `Năm: ${movie.year}` : '',
    movieCountries.length ? `Quốc gia: ${movieCountries.join(', ')}` : '',
    movieGenres.length ? `Thể loại: ${movieGenres.join(', ')}` : '',
    movieActors.length ? `Diễn viên: ${movieActors.slice(0, 5).join(', ')}` : '',
    movieDirectors.length ? `Đạo diễn: ${movieDirectors.join(', ')}` : '',
  ].filter(Boolean)
  const selectionSequenceRef = useRef(0)

  const replaceEpisodeInUrl = useCallback((episodeSlug: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('episode', episodeSlug)
    router.replace(`${pathname ?? window.location.pathname}?${params.toString()}`, {
      scroll: false,
    })
  }, [pathname, router])

  useEffect(() => {
    if (
      !initialEpisodeSlug &&
      initialEpisodeForUrl
    ) {
      replaceEpisodeInUrl(initialEpisodeForUrl)
    }
  }, [initialEpisodeForUrl, initialEpisodeSlug, replaceEpisodeInUrl])

  function selectServer(server: EpisodeServer) {
    const nextEpisode = server.server_data[0] || null
    setSelectedServer(server)
    setCurrentEpisode(nextEpisode)
    if (nextEpisode) replaceEpisodeInUrl(nextEpisode.slug)
  }

  function selectEpisode(episode: Episode) {
    setCurrentEpisode(episode)
    replaceEpisodeInUrl(episode.slug)
  }

  function handleBackToList() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/phim')
  }

  useEffect(() => {
    const episodeSlug = currentEpisode?.slug.trim()
    if (!session || !episodeSlug) return

    let active = true
    const selectionSequence = ++selectionSequenceRef.current

    void (async () => {
      let progressSeconds = 1
      try {
        const existingHistory = await getWatchHistory(movie.slug, episodeSlug)
        progressSeconds = existingHistory?.progressSeconds ?? progressSeconds
      } catch {
        // Saving the newly selected episode should not depend on the optional read.
      }

      const savedHistory = await saveWatchHistory(
        movie.slug,
        movie.name,
        episodeSlug,
        progressSeconds,
      )

      if (active && selectionSequence === selectionSequenceRef.current) {
        setWatchStatus(
          savedHistory.movieName === movie.name
            ? 'Đã cập nhật lịch sử xem'
            : 'Đã lưu lịch sử xem',
        )
      }
    })().catch(() => {
      if (active && selectionSequence === selectionSequenceRef.current) {
        setWatchStatus('Không thể lưu lịch sử xem')
      }
    })

    return () => {
      active = false
    }
  }, [currentEpisode?.slug, getWatchHistory, movie.name, movie.slug, saveWatchHistory, session])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)/.75] bg-[color:var(--color-ink)/.86] shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={handleBackToList} className="focus-ring inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold text-[var(--color-muted)] transition hover:bg-[var(--color-panel)] hover:text-white">
            <ArrowLeft className="size-4" />
            Danh sách phim
          </button>
          <span className="h-4 w-px bg-[var(--color-line)]" />
          <span className="truncate text-sm font-bold text-white sm:text-base">{movie.name}</span>
          <div className="ml-auto"><AccountControl /></div>
        </div>
      </header>
      <main className="mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
          <Link href="/" className="focus-ring transition hover:text-white">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={handleBackToList} className="focus-ring transition hover:text-white">Phim</button>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate text-white">{movie.name}</span>
        </nav>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-2 shadow-xl shadow-black/20 sm:p-3">
          <VideoPlayer embedLink={currentEpisode?.link_embed} title={`${movie.name} - Tập ${currentEpisode?.name || ''}`} />
        </div>

        <section className="mt-6 border-b border-[var(--color-line)] pb-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] shadow-lg shadow-black/20">
              <Image
                src={getMovieImageUrl(movie)}
                alt={`${movie.name} poster - xem phim online`}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-3 py-1.5">
                  <Clapperboard className="size-4 text-[var(--color-primary-soft)]" />
                  {currentEpisode ? `Đang phát tập ${currentEpisode.name} · ${selectedServer?.server_name ?? ''}` : 'Không thể tải nguồn phát'}
                </span>
                {movie.year && <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-3 py-1.5"><CalendarDays className="size-4" />{movie.year}</span>}
                <FavoriteButton movieSlug={movie.slug} movieName={movie.name} />
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">{movie.name}</h1>
              {movie.origin_name && <p className="mt-1 text-sm text-[var(--color-primary-soft)]">{movie.origin_name}</p>}
              {movieFacts.length > 0 && <p className="mt-3 max-w-4xl text-xs leading-6 text-[var(--color-muted)]">{movieFacts.join(' · ')}</p>}
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--color-muted)]">{getMovieDescription(movie.content)}</p>
              {watchStatus && <p className="mt-3 text-xs text-[var(--color-primary-soft)]">{watchStatus}</p>}
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          {selectedServer ? (
            <>
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-md shadow-black/10 sm:p-5">
                <ServerSelector servers={servers} selectedServer={selectedServer} onServerSelect={selectServer} />
              </div>
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-md shadow-black/10 sm:p-5">
                <EpisodeList episodes={selectedServer.server_data} currentEpisode={currentEpisode} onEpisodeSelect={selectEpisode} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-sm text-[var(--color-muted)]">
              Không thể tải nguồn phát
            </div>
          )}
        </div>
        <RatingsPanel movieSlug={movie.slug} />
      </main>
    </div>
  )
}
