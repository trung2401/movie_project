'use client'

import { AlertCircle, LoaderCircle, Star } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import {
  getRatingAverage,
  getRatings,
  Rating,
  RatingAverage,
  saveRating,
} from '@/services/userApi'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
    new Date(value),
  )
}

function getUserLabel(userId: string): string {
  return `Người xem ${userId.slice(-6)}`
}

export function RatingsPanel({ movieSlug }: { movieSlug: string }) {
  const { isReady, openAuthDialog, runAuthenticated, session } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [average, setAverage] = useState<RatingAverage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [score, setScore] = useState('8')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadRatings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [nextRatings, nextAverage] = await Promise.all([
        getRatings(movieSlug),
        getRatingAverage(movieSlug),
      ])
      setRatings(nextRatings.items)
      setAverage(nextAverage)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể tải đánh giá.',
      )
    } finally {
      setLoading(false)
    }
  }, [movieSlug])

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadRatings(), 0)
    return () => window.clearTimeout(requestId)
  }, [loadRatings])

  async function submitRating(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) {
      openAuthDialog()
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await runAuthenticated((accessToken) =>
        saveRating(accessToken, movieSlug, Number(score), comment),
      )
      setComment('')
      await loadRatings()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể lưu đánh giá.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="ratings-title" className="border-t border-[var(--color-line)] pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="ratings-title" className="flex items-center gap-2 text-xl font-black text-white">
            <Star className="size-5 fill-amber-300 text-amber-300" />
            Đánh giá
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {average?.totalRatings || 0} lượt đánh giá
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <strong className="text-3xl font-black text-white">
            {average?.averageScore?.toFixed(1) || '--'}
          </strong>
          <span className="text-sm text-[var(--color-muted)]">/ 10</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2 border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <form onSubmit={submitRating} className="mt-5 grid gap-3 border-y border-[var(--color-line)] py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
        <label className="block text-sm font-semibold text-white">
          Điểm
          <select
            value={score}
            onChange={(event) => setScore(event.target.value)}
            disabled={!isReady || submitting}
            className="focus-ring mt-2 h-10 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-white outline-none focus:border-[var(--color-primary)]"
          >
            {Array.from({ length: 10 }, (_, index) => String(index + 1)).map(
              (value) => (
                <option key={value} value={value}>
                  {value}/10
                </option>
              ),
            )}
          </select>
        </label>
        <label className="block text-sm font-semibold text-white">
          Bình luận
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={!isReady || submitting}
            maxLength={1000}
            className="focus-ring mt-2 h-10 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-white outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
            placeholder="Chia sẻ cảm nhận"
          />
        </label>
        <button
          type="submit"
          disabled={!isReady || submitting}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-soft)] disabled:cursor-wait disabled:opacity-60"
        >
          {submitting && <LoaderCircle className="size-4 animate-spin" />}
          {session ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {loading ? (
          [0, 1, 2].map((index) => (
            <div key={index} className="h-20 animate-pulse bg-[var(--color-panel)]" />
          ))
        ) : ratings.length ? (
          ratings.map((rating) => (
            <article key={rating.id} className="border-l-2 border-[var(--color-primary)] bg-[var(--color-panel)] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">
                  {getUserLabel(rating.userId)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-200">
                  <Star className="size-3.5 fill-current" />
                  {rating.score}/10
                </span>
              </div>
              {rating.comment && <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{rating.comment}</p>}
              <p className="mt-2 text-xs text-[var(--color-muted)]">{formatDate(rating.updatedAt)}</p>
            </article>
          ))
        ) : (
          <p className="py-4 text-sm text-[var(--color-muted)]">Chưa có đánh giá.</p>
        )}
      </div>
    </section>
  )
}
