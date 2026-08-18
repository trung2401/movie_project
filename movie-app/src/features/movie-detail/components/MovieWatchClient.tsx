'use client'

import Link from 'next/link'
import { ArrowLeft, CalendarDays, Clapperboard } from 'lucide-react'
import { useState } from 'react'
import type { Episode, EpisodeServer, Movie } from '@/types/movie'
import { AccountControl } from '@/features/auth/components/AccountControl'
import { useAuth } from '@/features/auth/auth-context'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { RatingsPanel } from '@/features/ratings/components/RatingsPanel'
import { VideoPlayer } from '@/features/player/components/VideoPlayer'
import { getMovieDescription } from '@/lib/movieText'
import { getContinueWatching, saveWatchHistory } from '@/services/userApi'
import { EpisodeList } from './EpisodeList'
import { ServerSelector } from './ServerSelector'

function getServers(movie: Movie, fallbackEpisodes: Episode[]): EpisodeServer[] {
  const availableServers = movie.episodes?.filter((server) => server.server_data.length > 0) ?? []
  return availableServers.length ? availableServers : [{ server_name: 'Nguồn mặc định', server_data: fallbackEpisodes }]
}

function getInitialPlayback(
  servers: EpisodeServer[],
  initialEpisodeSlug?: string,
): { currentEpisode: Episode | null; selectedServer: EpisodeServer } {
  const selectedServer =
    servers.find((server) =>
      server.server_data.some((episode) => episode.slug === initialEpisodeSlug),
    ) ?? servers[0]

  return {
    selectedServer,
    currentEpisode:
      selectedServer.server_data.find(
        (episode) => episode.slug === initialEpisodeSlug,
      ) ??
      selectedServer.server_data[0] ??
      null,
  }
}

export function MovieWatchClient({
  movie,
  episodes: fallbackEpisodes,
  initialEpisodeSlug,
}: {
  movie: Movie
  episodes: Episode[]
  initialEpisodeSlug?: string
}) {
  const servers = getServers(movie, fallbackEpisodes)
  const initialPlayback = getInitialPlayback(servers, initialEpisodeSlug)
  const [selectedServer, setSelectedServer] = useState(initialPlayback.selectedServer)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(initialPlayback.currentEpisode)
  const [watchStatus, setWatchStatus] = useState('')
  const { runAuthenticated, session } = useAuth()

  function selectServer(server: EpisodeServer) {
    setSelectedServer(server)
    setCurrentEpisode(server.server_data[0] || null)
  }

  function selectEpisode(episode: Episode) {
    setCurrentEpisode(episode)
    setWatchStatus('')
    if (!session) return

    void runAuthenticated(async (accessToken) => {
      const history = await getContinueWatching(accessToken)
      const existingHistory = history.find(
        (item) => item.episodeSlug === episode.slug,
      )
      if (!existingHistory || existingHistory.movieName !== movie.name) {
        await saveWatchHistory(
          accessToken,
          movie.slug,
          movie.name,
          episode.slug,
          existingHistory?.progressSeconds ?? 1,
        )
        setWatchStatus('Đã cập nhật lịch sử xem')
      }
    }).catch(() => setWatchStatus('Không thể lưu lịch sử xem'))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)/.75] bg-[color:var(--color-ink)/.86] shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold text-[var(--color-muted)] transition hover:bg-[var(--color-panel)] hover:text-white">
            <ArrowLeft className="size-4" />
            Quay lại
          </Link>
          <span className="h-4 w-px bg-[var(--color-line)]" />
          <h1 className="truncate text-sm font-bold text-white sm:text-base">{movie.name}</h1>
          <div className="ml-auto"><AccountControl /></div>
        </div>
      </header>
      <main className="mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-2 shadow-xl shadow-black/20 sm:p-3">
          <VideoPlayer embedLink={currentEpisode?.link_embed} title={`${movie.name} - Tập ${currentEpisode?.name || ''}`} />
        </div>

        <section className="mt-6 border-b border-[var(--color-line)] pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-3 py-1.5">
              <Clapperboard className="size-4 text-[var(--color-primary-soft)]" />
              Đang phát tập {currentEpisode?.name || 'chưa chọn'} · {selectedServer.server_name}
            </span>
            {movie.year && <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-3 py-1.5"><CalendarDays className="size-4" />{movie.year}</span>}
            <FavoriteButton movieSlug={movie.slug} movieName={movie.name} />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">{movie.name}</h2>
          {movie.origin_name && <p className="mt-1 text-sm text-[var(--color-primary-soft)]">{movie.origin_name}</p>}
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--color-muted)]">{getMovieDescription(movie.content)}</p>
          {watchStatus && <p className="mt-3 text-xs text-[var(--color-primary-soft)]">{watchStatus}</p>}
        </section>

        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-md shadow-black/10 sm:p-5">
            <ServerSelector servers={servers} selectedServer={selectedServer} onServerSelect={selectServer} />
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 shadow-md shadow-black/10 sm:p-5">
            <EpisodeList episodes={selectedServer.server_data} currentEpisode={currentEpisode} onEpisodeSelect={selectEpisode} />
          </div>
        </div>
        <RatingsPanel movieSlug={movie.slug} />
      </main>
    </div>
  )
}
