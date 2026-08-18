'use client'

import { Clock3, Heart, LogOut, RefreshCw, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import {
  deleteFavorite,
  Favorite,
  getContinueWatching,
  getFavorites,
  WatchHistory,
} from '@/services/userApi'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AccountDrawer() {
  const {
    accountDrawerOpen,
    closeAccountDrawer,
    runAuthenticated,
    session,
    signOut,
  } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [history, setHistory] = useState<WatchHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removingSlug, setRemovingSlug] = useState('')

  const loadLibrary = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError('')
    try {
      const [nextFavorites, nextHistory] = await Promise.all([
        runAuthenticated(getFavorites),
        runAuthenticated(getContinueWatching),
      ])
      setFavorites(nextFavorites)
      setHistory(nextHistory)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể tải dữ liệu tài khoản.',
      )
    } finally {
      setLoading(false)
    }
  }, [runAuthenticated, session])

  useEffect(() => {
    if (!accountDrawerOpen) return
    const requestId = window.setTimeout(() => void loadLibrary(), 0)
    return () => window.clearTimeout(requestId)
  }, [accountDrawerOpen, loadLibrary])

  if (!accountDrawerOpen || !session) return null

  async function removeFavorite(movieSlug: string) {
    setRemovingSlug(movieSlug)
    setError('')
    try {
      await runAuthenticated((accessToken) =>
        deleteFavorite(accessToken, movieSlug),
      )
      setFavorites((items) => items.filter((item) => item.movieSlug !== movieSlug))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể xóa phim yêu thích.',
      )
    } finally {
      setRemovingSlug('')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={closeAccountDrawer}
        aria-label="Đóng khu vực tài khoản"
      />
      <aside
        aria-label="Tài khoản"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[var(--color-line)] bg-[var(--color-ink)] shadow-2xl shadow-black/40"
      >
        <header className="flex items-start justify-between border-b border-[var(--color-line)] px-5 py-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--color-primary-soft)]">
              Tài khoản
            </p>
            <h2 className="mt-1 truncate text-lg font-black text-white">
              {session.user.email}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void loadLibrary()}
              disabled={loading}
              className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-panel)] hover:text-white disabled:opacity-50"
              aria-label="Làm mới"
              title="Làm mới"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={closeAccountDrawer}
              className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-panel)] hover:text-white"
              aria-label="Đóng"
              title="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5">
          {error && (
            <p className="border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}

          <section aria-labelledby="favorites-title">
            <div className="mb-3 flex items-center justify-between">
              <h3 id="favorites-title" className="flex items-center gap-2 text-sm font-bold text-white">
                <Heart className="size-4 text-rose-300" />
                Yêu thích
              </h3>
              <span className="text-xs text-[var(--color-muted)]">{favorites.length}</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="h-14 animate-pulse bg-[var(--color-panel)]" />
                ))}
              </div>
            ) : favorites.length ? (
              <ul className="space-y-2">
                {favorites.map((favorite) => (
                  <li
                    key={favorite.id}
                    className="flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-panel)] p-3"
                  >
                    <Heart className="size-4 shrink-0 fill-rose-300 text-rose-300" />
                    <Link
                      href={`/xem-phim/${favorite.movieSlug}`}
                      onClick={closeAccountDrawer}
                      className="focus-ring min-w-0 flex-1 truncate text-sm font-semibold text-white hover:text-[var(--color-primary-soft)]"
                    >
                      {favorite.movieName || favorite.movieSlug}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void removeFavorite(favorite.movieSlug)}
                      disabled={removingSlug === favorite.movieSlug}
                      className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] transition hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-50"
                      aria-label={`Xóa ${favorite.movieSlug} khỏi yêu thích`}
                      title="Xóa yêu thích"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-l-2 border-[var(--color-line)] pl-3 text-sm text-[var(--color-muted)]">
                Chưa có phim yêu thích.
              </p>
            )}
          </section>

          <section aria-labelledby="history-title">
            <div className="mb-3 flex items-center justify-between">
              <h3 id="history-title" className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock3 className="size-4 text-sky-300" />
                Lịch sử xem
              </h3>
              <span className="text-xs text-[var(--color-muted)]">{history.length}</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[0, 1].map((index) => (
                  <div key={index} className="h-16 animate-pulse bg-[var(--color-panel)]" />
                ))}
              </div>
            ) : history.length ? (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li key={item.id} className="border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
                    <Link
                      href={`/xem-phim/${item.movieSlug}?episode=${encodeURIComponent(item.episodeSlug)}`}
                      onClick={closeAccountDrawer}
                      className="focus-ring block truncate text-sm font-semibold text-white hover:text-[var(--color-primary-soft)]"
                    >
                      {item.movieName || item.movieSlug}
                    </Link>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
                      <span className="truncate">{item.episodeSlug}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {formatDate(item.updatedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-l-2 border-[var(--color-line)] pl-3 text-sm text-[var(--color-muted)]">
                Chưa có lịch sử xem.
              </p>
            )}
          </section>
        </div>

        <footer className="border-t border-[var(--color-line)] p-4">
          <button
            type="button"
            onClick={signOut}
            className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] text-sm font-bold text-[var(--color-muted)] transition hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-100"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </footer>
      </aside>
    </div>
  )
}
