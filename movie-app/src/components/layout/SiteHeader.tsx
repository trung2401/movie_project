'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import movieLogo from '@/assets/logo.webp'
import { cn } from '@/lib/cn'
import { COUNTRIES, EMPTY_FILTERS, GENRES, MOVIE_TYPES } from '@/constants/movie'
import { CONTAINER_CLASS } from '@/constants/layout'
import { AccountControl } from '@/features/auth/components/AccountControl'
import { useAuth } from '@/features/auth/auth-context'
import type { MovieFilters } from '@/types/movie'

interface SiteHeaderProps {
  keyword?: string
  filters?: MovieFilters
  onFiltersChange?: (filters: MovieFilters) => void
  onApplyFilters?: (filters?: MovieFilters) => void
  onSearch?: (keyword: string) => void
  overlay?: boolean
  showFilters?: boolean
}

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Phim', href: '/phim' },
  { label: 'Thể loại', href: '/phim?genre=hanh-dong' },
  { label: 'Quốc gia', href: '/phim?country=han-quoc' },
  { label: 'Phim mới cập nhật', href: '/phim' },
]

export function SiteHeader({
  keyword = '',
  filters = EMPTY_FILTERS,
  onFiltersChange = () => undefined,
  onApplyFilters = () => undefined,
  onSearch,
  overlay = false,
  showFilters = true,
}: SiteHeaderProps) {
  const { openAuthDialog, session } = useAuth()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const [searchDraft, setSearchDraft] = useState({ source: keyword, value: keyword })
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const years = useMemo(() => Array.from({ length: 30 }, (_, index) => String(new Date().getFullYear() - index)), [])
  const searchValue = searchDraft.source === keyword ? searchDraft.value : keyword

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen, menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false) }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const updateFilter = (key: keyof MovieFilters, value: string) => onFiltersChange({ ...filters, [key]: value })
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (onSearch) onSearch(searchValue)
    else router.push(searchValue.trim() ? `/phim?keyword=${encodeURIComponent(searchValue.trim())}` : '/phim')
    setFilterOpen(false)
    setMenuOpen(false)
  }
  const isActive = (label: string) => {
    if (label === 'Trang chủ') return pathname === '/'
    if (label === 'Thể loại') return pathname.startsWith('/phim') && Boolean(filters.genre)
    if (label === 'Quốc gia') return pathname.startsWith('/phim') && Boolean(filters.country)
    if (label === 'Phim mới cập nhật') return pathname === '/phim' && !keyword && !filters.type && !filters.country && !filters.genre && !filters.year
    return pathname.startsWith('/phim') && Boolean(keyword || filters.type || filters.country || filters.genre || filters.year)
  }

  return (
    <header className={cn(
      'z-50 transition-colors duration-300',
      overlay && !scrolled
        ? 'absolute inset-x-0 top-0 border-b border-white/10 bg-transparent'
        : 'sticky top-0 border-b border-[var(--color-line)] bg-[color:var(--color-ink)/.88] shadow-lg shadow-black/20 backdrop-blur-xl',
    )}>
      <div className={CONTAINER_CLASS}>
        <div className="flex min-h-16 items-center gap-3">
          <Link href="/" aria-label="Motchill - Trang chủ" className="focus-ring flex h-10 w-24 shrink-0 items-center overflow-hidden sm:h-11 sm:w-28">
            <Image src={movieLogo} alt="Motchill" width={480} height={262} priority className="h-full w-full object-contain" />
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={cn('focus-ring inline-flex min-h-10 items-center px-3 text-sm font-semibold transition', isActive(item.label) ? 'text-white' : 'text-[var(--color-muted)] hover:text-white')}>
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 max-w-xs flex-1 md:flex lg:max-w-sm">
            <label className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/80 transition focus-within:border-[var(--color-primary-soft)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <input aria-label="Tìm kiếm phim" value={searchValue} onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })} placeholder="Tìm kiếm phim..." className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]" />
              <button type="submit" className="focus-ring inline-flex size-7 items-center justify-center rounded-md text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm"><Search className="size-4" /></button>
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            {showFilters && <button type="button" onClick={() => setFilterOpen((open) => !open)} className={cn('focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-2.5 text-sm font-semibold transition sm:px-3', filterOpen ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-white' : 'border-white/15 bg-black/20 text-white/80 hover:border-white/30 hover:text-white')} aria-label={filterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc'} aria-expanded={filterOpen}><SlidersHorizontal className="size-4" /><span className="hidden sm:inline">Bộ lọc</span></button>}
            <AccountControl compact />
            {!session && <button type="button" onClick={() => openAuthDialog('register')} className="focus-ring hidden min-h-10 rounded-lg border border-white/20 px-3 text-xs font-bold text-white transition hover:border-white hover:bg-white hover:text-[var(--color-ink)] sm:inline-flex sm:items-center">Đăng ký</button>}
            <button type="button" onClick={() => setMenuOpen(true)} className="focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden" aria-label="Mở menu"><Menu className="size-5" /></button>
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex pb-3 md:hidden">
          <label className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white/80 focus-within:border-[var(--color-primary-soft)]">
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <input aria-label="Tìm kiếm phim" value={searchValue} onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })} placeholder="Tìm kiếm phim..." className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]" />
            <button type="submit" className="focus-ring inline-flex size-7 items-center justify-center rounded-md text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm"><Search className="size-4" /></button>
          </label>
        </form>
      </div>

      {showFilters && filterOpen && <>
        <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setFilterOpen(false)} aria-hidden="true" />
        <div id="movie-filters" className="z-[70] border-t border-[var(--color-line)] bg-[color:var(--color-ink)/.98] shadow-2xl shadow-black/30 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-xl">
        <div className={cn(CONTAINER_CLASS, 'grid gap-3 py-4 md:grid-cols-5')}>
          {([
            ['type', 'Loại phim', 'Tất cả loại phim', MOVIE_TYPES],
            ['country', 'Quốc gia', 'Tất cả quốc gia', COUNTRIES],
            ['genre', 'Thể loại', 'Tất cả thể loại', GENRES],
            ['year', 'Năm phát hành', 'Tất cả năm', years.map((year) => ({ label: year, slug: year }))],
          ] as const).map(([key, label, placeholder, options]) => <label key={key} className="block min-w-0"><span className="sr-only">{label}</span><select aria-label={label} value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} className="focus-ring block min-h-11 w-full rounded-lg border border-white/15 bg-[var(--color-panel)] px-3 text-sm text-white outline-none transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]"><option value="">{placeholder}</option>{options.map((option) => <option key={option.slug} value={option.slug}>{option.label}</option>)}</select></label>)}
          <button type="button" onClick={() => { onApplyFilters(); setFilterOpen(false) }} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-soft)]"><SlidersHorizontal className="size-4" />Lọc phim</button>
        </div>
        </div>
      </>}

      {menuOpen && <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden">
        <button type="button" className="absolute inset-0" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" />
        <aside className="absolute right-0 top-0 flex h-full w-[min(86vw,22rem)] flex-col border-l border-[var(--color-line)] bg-[var(--color-panel)] p-5 shadow-2xl" aria-label="Menu điều hướng">
          <div className="flex items-center justify-between"><span className="text-sm font-bold text-white">Điều hướng</span><button type="button" onClick={() => setMenuOpen(false)} className="focus-ring inline-flex size-10 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-panel-soft)] hover:text-white" aria-label="Đóng menu"><X className="size-5" /></button></div>
          <nav className="mt-6 grid gap-1" aria-label="Điều hướng di động">{navItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className={cn('focus-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold', isActive(item.label) ? 'bg-[var(--color-primary)]/15 text-white' : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-soft)] hover:text-white')}>{item.label}</Link>)}</nav>
          {!session && <button type="button" onClick={() => { setMenuOpen(false); openAuthDialog('register') }} className="focus-ring mt-auto min-h-11 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-white">Tạo tài khoản</button>}
        </aside>
      </div>}
    </header>
  )
}
