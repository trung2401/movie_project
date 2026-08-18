'use client'

import { Play } from 'lucide-react'
import type { Episode } from '@/types/movie'
import { cn } from '@/lib/cn'

export function EpisodeList({ episodes, currentEpisode, onEpisodeSelect }: { episodes: Episode[]; currentEpisode: Episode | null; onEpisodeSelect: (episode: Episode) => void }) {
  if (!episodes.length) return <p className="py-4 text-sm text-[var(--color-muted)]">Nguồn phim này chưa có tập để phát.</p>

  return (
    <section aria-labelledby="episode-list-title">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 id="episode-list-title" className="text-lg font-bold text-white">Danh sách tập</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Chọn tập để phát video.</p>
        </div>
        <span className="rounded-full bg-[var(--color-panel-soft)] px-2.5 py-1 text-xs text-[var(--color-muted)]">{episodes.length} tập</span>
      </div>
      <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {episodes.map((episode) => {
          const isSelected = currentEpisode?.slug === episode.slug

          return (
            <button
              key={episode.slug}
              type="button"
              onClick={() => onEpisodeSelect(episode)}
              className={cn(
                'focus-ring inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-bold transition-all duration-200',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                  : 'border-[var(--color-line)] bg-[var(--color-panel-soft)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:bg-[var(--color-panel)] hover:text-white',
              )}
            >
              <Play className={cn('size-3.5', isSelected && 'fill-current')} />
              {episode.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}
