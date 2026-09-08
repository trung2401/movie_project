import Link from 'next/link'
import { ArrowUpRight, Film } from 'lucide-react'
import { CONTAINER_CLASS } from '@/constants/layout'

const popularGenres = [
  ['Hành động', '/phim?genre=hanh-dong'],
  ['Tình cảm', '/phim?genre=tinh-cam'],
  ['Hoạt hình', '/phim?genre=hoat-hinh'],
  ['Kinh dị', '/phim?genre=kinh-di'],
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className={CONTAINER_CLASS}>
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-12">
          <div>
            <Link href="/" className="focus-ring inline-flex items-center gap-2 text-white">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                <Film className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base font-black tracking-tight">Motchill</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              Không gian khám phá và thưởng thức phim trực tuyến với trải nghiệm gọn gàng, dễ dùng.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Khám phá</h2>
            <nav aria-label="Liên kết khám phá" className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
              <Link href="/" className="focus-ring w-fit transition hover:text-white">Trang chủ</Link>
              <Link href="/phim" className="focus-ring w-fit transition hover:text-white">Phim mới cập nhật</Link>
              <Link href="/phim?type=phim-bo" className="focus-ring w-fit transition hover:text-white">Phim bộ</Link>
              <Link href="/phim?type=phim-le" className="focus-ring w-fit transition hover:text-white">Phim lẻ</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Thể loại phổ biến</h2>
            <nav aria-label="Thể loại phổ biến" className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
              {popularGenres.map(([label, href]) => <Link key={href} href={href} className="focus-ring w-fit transition hover:text-white">{label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Hỗ trợ</h2>
            <div className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
              <a href="mailto:hello@motchill.local" className="focus-ring inline-flex w-fit items-center gap-1 transition hover:text-white">Liên hệ <ArrowUpRight className="size-3.5" /></a>
              <Link href="/" className="focus-ring w-fit transition hover:text-white">Điều khoản sử dụng</Link>
              <Link href="/" className="focus-ring w-fit transition hover:text-white">Chính sách riêng tư</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--color-line)] py-4 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Motchill. Nội dung thuộc về các nhà cung cấp tương ứng.</span>
          <span className="text-white/50">Xem phim có trách nhiệm</span>
        </div>
      </div>
    </footer>
  )
}
