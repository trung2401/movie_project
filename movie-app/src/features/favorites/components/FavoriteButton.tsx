'use client'

import { Heart, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
} from '@/services/userApi'

export function FavoriteButton({
  movieSlug,
  movieName,
}: {
  movieSlug: string
  movieName: string
}) {
  const { isReady, openAuthDialog, runAuthenticated, session } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return

    let active = true
    void runAuthenticated(getFavorites)
      .then((favorites) => {
        if (active) {
          const favorite = favorites.find((item) => item.movieSlug === movieSlug)
          setIsFavorite(Boolean(favorite))
          if (favorite && favorite.movieName !== movieName) {
            return runAuthenticated((accessToken) =>
              createFavorite(accessToken, movieSlug, movieName),
            )
          }
        }
      })
      .catch(() => {
        if (active) setError('Không thể tải trạng thái yêu thích.')
      })

    return () => {
      active = false
    }
  }, [movieName, movieSlug, runAuthenticated, session])

  async function toggleFavorite() {
    if (!session) {
      openAuthDialog()
      return
    }

    setLoading(true)
    setError('')
    try {
      if (activeFavorite) {
        await runAuthenticated((accessToken) =>
          deleteFavorite(accessToken, movieSlug),
        )
      } else {
        await runAuthenticated((accessToken) =>
          createFavorite(accessToken, movieSlug, movieName),
        )
      }
      setIsFavorite((value) => !value)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể cập nhật yêu thích.',
      )
    } finally {
      setLoading(false)
    }
  }

  const activeFavorite = session ? isFavorite : false
  const label = !isReady
    ? 'Đang tải'
    : !session
      ? 'Đăng nhập để thêm yêu thích'
      : activeFavorite
        ? 'Bỏ yêu thích'
        : 'Thêm vào yêu thích'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void toggleFavorite()}
        disabled={!isReady || loading}
        className={`focus-ring inline-flex size-10 items-center justify-center rounded-lg border transition disabled:cursor-wait disabled:opacity-60 ${
          activeFavorite
            ? 'border-rose-300/60 bg-rose-400/15 text-rose-200'
            : 'border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-rose-300/60 hover:text-rose-200'
        }`}
        aria-label={label}
        title={label}
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Heart className={`size-4 ${activeFavorite ? 'fill-current' : ''}`} />
        )}
      </button>
      {error && <span className="text-xs text-rose-200">{error}</span>}
    </div>
  )
}
