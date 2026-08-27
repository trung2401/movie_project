'use client'

import { AlertCircle, Home, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export function RouteErrorState({
  message,
  reset,
}: {
  message: string
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="flex w-full max-w-lg flex-col items-center gap-4 border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-10 text-center shadow-xl shadow-black/20 sm:px-10">
        <AlertCircle className="size-10 text-[var(--color-primary-soft)]" />
        <h1 className="text-xl font-black text-white">Không thể tải trang</h1>
        <p className="max-w-md text-sm leading-6 text-[var(--color-muted)]">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--color-primary)]"
          >
            <RotateCcw className="size-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-soft)]"
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  )
}
