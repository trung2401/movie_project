import { Film } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="flex w-full max-w-lg flex-col items-center gap-4 border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-10 text-center shadow-xl shadow-black/20 sm:px-10">
        <Film className="size-10 text-[var(--color-primary-soft)]" />
        <h1 className="text-xl font-black text-white">Không tìm thấy phim</h1>
        <p className="text-sm text-[var(--color-muted)]">Phim này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <Link href="/" className="focus-ring rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-soft)]">
          Về trang chủ
        </Link>
      </section>
    </main>
  )
}
