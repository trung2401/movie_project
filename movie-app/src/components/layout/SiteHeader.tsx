'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export function SiteHeader({
  keyword = '',
  filters = EMPTY_FILTERS,
  onFiltersChange,
  onApplyFilters,
  onSearch,
  overlay = false,
  showFilters = true,
}: SiteHeaderProps) {
  const { openAuthDialog, session } = useAuth()
  const router = useRouter()
  const [searchDraft, setSearchDraft] = useState({ source: keyword, value: keyword })
  const [filterDraft, setFilterDraft] = useState<MovieFilters>(filters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const years = useMemo(
    () => currentYear === null
      ? []
      : Array.from({ length: 30 }, (_, index) => String(currentYear - index)),
    [currentYear],
  )
  const searchValue = searchDraft.source === keyword ? searchDraft.value : keyword

  useEffect(() => {
    const hydrationId = window.setTimeout(() => {
      setIsHydrated(true)
      setCurrentYear(new Date().getFullYear())
    }, 0)
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.clearTimeout(hydrationId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!filterOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setFilterOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filterOpen])

  const updateFilter = (key: keyof MovieFilters, value: string) => {
    const nextFilters = { ...filterDraft, [key]: value }
    setFilterDraft(nextFilters)
    onFiltersChange?.(nextFilters)
  }

  const resetFilterDraft = () => {
    setFilterDraft(EMPTY_FILTERS)
    onFiltersChange?.(EMPTY_FILTERS)
  }

  const applyFilterDraft = () => {
    if (onApplyFilters) {
      onApplyFilters(filterDraft)
    } else {
      const params = new URLSearchParams()
      if (keyword.trim()) params.set('keyword', keyword.trim())
      if (filterDraft.type) params.set('type', filterDraft.type)
      if (filterDraft.country) params.set('country', filterDraft.country)
      if (filterDraft.genre) params.set('genre', filterDraft.genre)
      if (filterDraft.year) params.set('year', filterDraft.year)
      const query = params.toString()
      router.push(query ? `/phim?${query}` : '/phim')
    }
    setFilterOpen(false)
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (onSearch) onSearch(searchValue)
    else router.push(searchValue.trim() ? `/phim?keyword=${encodeURIComponent(searchValue.trim())}` : '/phim')
    setFilterOpen(false)
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

          <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 max-w-xl flex-1 md:flex">
            <label className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/80 transition focus-within:border-[var(--color-primary-soft)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <input aria-label="Tìm kiếm phim" value={searchValue} onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })} placeholder="Tìm kiếm phim..." className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]" />
              <button type="submit" className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm" title="Tìm kiếm"><Search className="size-4" /></button>
            </label>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-3">
            {showFilters && (
              <button
                type="button"
                onClick={() => {
                  setFilterDraft(filters)
                  setFilterOpen((open) => !open)
                }}
                className={cn(
                  'focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border px-2.5 text-sm font-semibold transition sm:px-3',
                  filterOpen
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-white'
                    : 'border-white/15 bg-black/20 text-white/80 hover:border-white/30 hover:text-white',
                )}
                aria-label={filterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
                title={filterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
                aria-expanded={filterOpen}
                aria-controls="movie-filters"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
            )}
            <AccountControl compact />
            {isHydrated && !session && <button type="button" onClick={() => openAuthDialog('register')} className="focus-ring hidden min-h-11 rounded-lg border border-white/20 px-3 text-xs font-bold text-white transition hover:border-white hover:bg-white hover:text-[var(--color-ink)] sm:inline-flex sm:items-center">Đăng ký</button>}
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex pb-3 md:hidden">
          <label className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white/80 focus-within:border-[var(--color-primary-soft)]">
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <input aria-label="Tìm kiếm phim" value={searchValue} onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })} placeholder="Tìm kiếm phim..." className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]" />
            <button type="submit" className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm" title="Tìm kiếm"><Search className="size-4" /></button>
          </label>
        </form>
      </div>

      {showFilters && filterOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setFilterOpen(false)} aria-hidden="true" />
          <section id="movie-filters" aria-labelledby="movie-filters-title" className="z-[70] border-t border-[var(--color-line)] bg-[color:var(--color-ink)/.98] shadow-2xl shadow-black/30 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-xl">
            <div className={cn(CONTAINER_CLASS, 'py-4')}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 id="movie-filters-title" className="text-base font-bold text-white">Bộ lọc</h2>
                <button type="button" onClick={() => setFilterOpen(false)} className="focus-ring inline-flex size-10 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-panel-soft)] hover:text-white" aria-label="Đóng bộ lọc" title="Đóng bộ lọc"><X className="size-5" /></button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                {([
                  ['type', 'Loại phim', 'Tất cả loại phim', MOVIE_TYPES],
                  ['country', 'Quốc gia', 'Tất cả quốc gia', COUNTRIES],
                  ['genre', 'Thể loại', 'Tất cả thể loại', GENRES],
                  ['year', 'Năm phát hành', 'Tất cả năm', years.map((year) => ({ label: year, slug: year }))],
                ] as const).map(([key, label, placeholder, options]) => (
                  <label key={key} className="block min-w-0">
                    <span className="sr-only">{label}</span>
                    <select aria-label={label} value={filterDraft[key]} onChange={(event) => updateFilter(key, event.target.value)} className="focus-ring block min-h-11 w-full rounded-lg border border-white/15 bg-[var(--color-panel)] px-3 text-sm text-white outline-none transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]">
                      <option value="">{placeholder}</option>
                      {options.map((option) => <option key={option.slug} value={option.slug}>{option.label}</option>)}
                    </select>
                  </label>
                ))}
                <div className="flex gap-2 md:col-span-2 lg:col-span-1">
                  <button type="button" onClick={resetFilterDraft} className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-white">Đặt lại</button>
                  <button type="button" onClick={applyFilterDraft} className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-soft)]"><SlidersHorizontal className="size-4" aria-hidden="true" />Lọc phim</button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </header>
  )
}
