'use client'

import Image from 'next/image'
import { Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import movieLogo from '@/assets/logo.webp'
import { cn } from '@/lib/cn'
import { COUNTRIES, GENRES, MOVIE_TYPES } from '@/constants/movie'
import { CONTAINER_CLASS } from '@/constants/layout'
import { AccountControl } from '@/features/auth/components/AccountControl'
import { useAuth } from '@/features/auth/auth-context'
import type { MovieFilters } from '@/types/movie'

interface SiteHeaderProps {
  keyword?: string
  filters: MovieFilters
  onFiltersChange: (filters: MovieFilters) => void
  onApplyFilters: (filters?: MovieFilters) => void
  onSearch: (keyword: string) => void
  overlay?: boolean
}

export function SiteHeader({
  keyword = '',
  filters,
  onFiltersChange,
  onApplyFilters,
  onSearch,
  overlay = false,
}: SiteHeaderProps) {
  const { openAuthDialog, session } = useAuth()
  const [searchDraft, setSearchDraft] = useState({ source: keyword, value: keyword })
  const [filterOpen, setFilterOpen] = useState(false)
  const years = Array.from({ length: 30 }, (_, index) => String(new Date().getFullYear() - index))
  const searchValue = searchDraft.source === keyword ? searchDraft.value : keyword

  const updateFilter = (key: keyof MovieFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    onSearch(searchValue)
    setFilterOpen(false)
  }

  const toggleFilters = () => {
    setFilterOpen((open) => !open)
  }

  return (
    <header
      className={cn(
        'z-50',
        overlay
          ? 'absolute inset-x-0 top-0 border-b border-white/5 bg-transparent drop-shadow-[0_2px_10px_rgb(0_0_0/0.35)]'
          : 'sticky top-0 border-b border-white/10 bg-[color:var(--color-ink)/.72] shadow-lg shadow-black/20 backdrop-blur-xl',
      )}
    >
      <div className={CONTAINER_CLASS}>
        <div className="flex h-14 items-center gap-3">
          <Link
            href="/"
            aria-label="Motchill - Trang chủ"
            className="focus-ring flex h-11 w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-md sm:h-12 sm:w-[120px]"
          >
            <Image
              src={movieLogo}
              alt="Motchill"
              width={480}
              height={262}
              priority
              className="h-full w-full translate-y-1 scale-[1.3] object-cover"
            />
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 max-w-xl flex-1 md:flex">
            <label className="flex w-full items-center gap-3 rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-sm text-white/80 shadow-lg shadow-black/20 transition focus-within:border-[var(--color-primary-soft)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
              <Search className="size-4 shrink-0" />
              <input
                aria-label="Tìm kiếm phim"
                value={searchValue}
                onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })}
                placeholder="Tìm kiếm phim..."
                className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]"
              />
              <button type="submit" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm">
                <Search className="size-4" />
              </button>
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFilters}
              className={cn(
                'focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition',
                filterOpen
                  ? 'border-[var(--color-primary-soft)] bg-[var(--color-primary)]/20 text-white'
                  : 'border-white/15 bg-black/15 text-white/80 hover:border-white/30 hover:text-white',
              )}
              aria-label={filterOpen ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
              title={filterOpen ? 'Đóng bộ lọc' : 'Bộ lọc'}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Bộ lọc</span>
            </button>
            <AccountControl compact />
            {!session && (
              <button
                type="button"
                onClick={() => openAuthDialog('register')}
                className="hidden h-8 rounded-md border border-white/35 bg-transparent px-3 text-xs font-bold text-white shadow-lg shadow-black/25 transition hover:border-white hover:bg-white hover:text-[var(--color-ink)] sm:inline-flex sm:items-center"
              >
                Đăng ký ngay
              </button>
            )}
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex pb-3 md:hidden">
          <label className="flex w-full items-center gap-3 rounded-full border border-white/20 bg-transparent px-3 py-2 text-sm text-white/80 shadow-lg shadow-black/20 focus-within:border-[var(--color-primary-soft)]">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Tìm kiếm phim"
              value={searchValue}
              onChange={(event) => setSearchDraft({ source: keyword, value: event.target.value })}
              placeholder="Tìm kiếm phim..."
              className="w-full bg-transparent text-white outline-none placeholder:text-[var(--color-muted)]"
            />
            <button type="submit" className="focus-ring rounded-md p-1 text-[var(--color-muted)] hover:text-white" aria-label="Tìm kiếm">
              <Search className="size-4" />
            </button>
          </label>
        </form>
      </div>

      {filterOpen && (
        <div id="movie-filters" className="border-t border-white/10 bg-[color:var(--color-ink)/.96] shadow-2xl shadow-black/30">
          <div className={cn(CONTAINER_CLASS, 'grid items-stretch gap-3 py-3 md:grid-cols-5')}>
            {([
              ['type', 'Loại phim', 'Tất cả loại phim', MOVIE_TYPES],
              ['country', 'Quốc gia', 'Tất cả quốc gia', COUNTRIES],
              ['genre', 'Thể loại', 'Tất cả thể loại', GENRES],
              ['year', 'Năm phát hành', 'Tất cả năm', years.map((year) => ({ label: year, slug: year }))],
            ] as const).map(([key, label, placeholder, options]) => (
              <label key={key} className="block min-w-0">
                <span className="sr-only">{label}</span>
                <select
                  aria-label={label}
                  value={filters[key]}
                  onChange={(event) => updateFilter(key, event.target.value)}
                  className="focus-ring block h-10 w-full rounded-md border border-white/15 bg-[var(--color-panel)] px-3 text-sm text-white outline-none transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]"
                >
                  <option value="">{placeholder}</option>
                  {options.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button
              type="button"
              onClick={() => {
                onApplyFilters()
                setFilterOpen(false)
              }}
              className="focus-ring flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-soft)]"
            >
              <SlidersHorizontal className="size-4" />
              Lọc phim
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
