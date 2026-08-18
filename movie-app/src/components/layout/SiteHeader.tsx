'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { COUNTRIES, GENRES, MOVIE_TYPES } from '@/constants/movie'
import { AccountControl } from '@/features/auth/components/AccountControl'
import { useAuth } from '@/features/auth/auth-context'
import type { MovieFilters } from '@/types/movie'

interface SiteHeaderProps {
  filters: MovieFilters
  onFiltersChange: (filters: MovieFilters) => void
  onApplyFilters: (filters?: MovieFilters) => void
  onSearch: (keyword: string) => void
}

export function SiteHeader({
  filters,
  onFiltersChange,
  onApplyFilters,
  onSearch,
}: SiteHeaderProps) {
  const { openAuthDialog } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const years = Array.from({ length: 30 }, (_, index) => String(new Date().getFullYear() - index))

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--color-ink)/.72] shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3">
          <Link
            href="/"
            className="focus-ring shrink-0 text-lg font-black tracking-[0.02em] text-white sm:text-xl"
          >
            <span className="text-[var(--color-primary-soft)]">Phim</span>Moi
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 max-w-xl flex-1 md:flex">
            <label className="flex w-full items-center gap-3 rounded-full border border-white/15 bg-[var(--color-panel)]/90 px-3 py-1.5 text-sm text-[var(--color-muted)] shadow-inner shadow-black/10 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
              <Search className="size-4 shrink-0" />
              <input
                aria-label="Tìm kiếm phim"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
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
            <button
              type="button"
              onClick={openAuthDialog}
              className="hidden h-8 rounded-md bg-[var(--color-primary-soft)] px-3 text-xs font-bold text-[var(--color-ink)] shadow-lg shadow-black/20 transition hover:bg-white sm:inline-flex sm:items-center"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex pb-3 md:hidden">
          <label className="flex w-full items-center gap-3 rounded-full border border-white/15 bg-[var(--color-panel)]/90 px-3 py-2 text-sm text-[var(--color-muted)] focus-within:border-[var(--color-primary)]">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Tìm kiếm phim"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
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
        <div id="movie-filters" className="border-t border-white/10 bg-[color:var(--color-ink)/.96] px-4 py-4 shadow-2xl shadow-black/30 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[100rem] items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {([
              ['type', 'Loại phim', 'Tất cả loại phim', MOVIE_TYPES],
              ['country', 'Quốc gia', 'Tất cả quốc gia', COUNTRIES],
              ['genre', 'Thể loại', 'Tất cả thể loại', GENRES],
              ['year', 'Năm phát hành', 'Tất cả năm', years.map((year) => ({ label: year, slug: year }))],
            ] as const).map(([key, label, placeholder, options]) => (
              <label key={key} className="block">
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
