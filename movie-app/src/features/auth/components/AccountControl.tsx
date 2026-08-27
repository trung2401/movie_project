'use client'

import { LogIn, UserRound } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getDisplayName, useAuth } from '../auth-context'

export function AccountControl({ compact = false }: { compact?: boolean }) {
  const { isReady, openAccountDrawer, openAuthDialog, session } = useAuth()

  if (!isReady) {
    return <div className={cn('animate-pulse rounded-lg bg-[var(--color-panel-soft)]', compact ? 'size-8' : 'size-10')} />
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => openAuthDialog()}
        className={cn(
          'focus-ring inline-flex items-center gap-2 border text-white transition hover:border-[var(--color-primary)]',
          compact
            ? 'h-8 rounded-md border-white/20 bg-black/20 px-2.5 text-xs'
            : 'h-10 rounded-lg border-[var(--color-line)] bg-[var(--color-panel)] px-3 text-sm font-bold',
        )}
      >
        <LogIn className={compact ? 'size-3.5' : 'size-4'} />
        <span className="hidden sm:inline">Đăng nhập</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openAccountDrawer}
      className={cn(
        'focus-ring inline-flex max-w-44 items-center gap-2 border text-sm font-bold text-white transition hover:border-[var(--color-primary)]',
        compact
          ? 'h-8 rounded-md border-white/20 bg-black/20 px-2'
          : 'h-10 rounded-lg border-[var(--color-line)] bg-[var(--color-panel)] px-2.5',
      )}
      title="Tài khoản"
    >
      <UserRound className={cn('shrink-0 text-[var(--color-primary-soft)]', compact ? 'size-3.5' : 'size-4')} />
      <span className="hidden truncate sm:inline">{getDisplayName(session.user)}</span>
    </button>
  )
}
