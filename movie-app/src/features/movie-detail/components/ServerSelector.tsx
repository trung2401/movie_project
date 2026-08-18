'use client'

import { Radio } from 'lucide-react'
import type { EpisodeServer } from '@/types/movie'
import { cn } from '@/lib/cn'

interface ServerSelectorProps {
  servers: EpisodeServer[]
  selectedServer: EpisodeServer
  onServerSelect: (server: EpisodeServer) => void
}

function getServerLabel(server: EpisodeServer) {
  if (!server.provider_name) return server.server_name

  const providerName = server.provider_name === 'phimapi'
    ? 'PhimAPI'
    : server.provider_name

  return `${providerName} (${server.server_name})`
}

function getServerKey(server: EpisodeServer) {
  return `${server.provider_name ?? 'default'}:${server.server_name}`
}

export function ServerSelector({ servers, selectedServer, onServerSelect }: ServerSelectorProps) {
  return (
    <section aria-labelledby="server-list-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="server-list-title" className="flex items-center gap-2 text-lg font-bold text-white">
            <Radio className="size-4 text-[var(--color-primary-soft)]" />
            Nguồn phim
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Đổi nguồn nếu video hiện tại phát không ổn định.</p>
        </div>
        <span className="rounded-full bg-[var(--color-panel-soft)] px-2.5 py-1 text-xs text-[var(--color-muted)]">
          {servers.length} nguồn
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {servers.map((server) => {
          const isSelected = getServerKey(server) === getServerKey(selectedServer)

          return (
            <button
              key={getServerKey(server)}
              type="button"
              onClick={() => onServerSelect(server)}
              className={cn(
                'focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                  : 'border-[var(--color-line)] bg-[var(--color-panel-soft)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-white',
              )}
            >
              <span className={cn('size-2 rounded-full', isSelected ? 'bg-white' : 'bg-[var(--color-muted)]')} />
              {getServerLabel(server)}
            </button>
          )
        })}
      </div>
    </section>
  )
}
