import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { unstable_cache } from 'next/cache'
import { getCachedMovieList } from '@/services/serverMovieApi'
import { LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import { DEFAULT_MOVIE_PAGE_SIZE } from '@/services/providers/pagination'
import type { Movie, MovieListResult } from '@/types/movie'

const SITEMAP_CATALOG_REVALIDATE_SECONDS = 6 * 60 * 60
const SITEMAP_FETCH_CONCURRENCY = 2
const SITEMAP_REFRESH_COOLDOWN_MS = 60_000
const SITEMAP_MAX_REFRESH_PAGES = 1_000
const CACHE_FILE = path.join(process.cwd(), '.next', 'cache', 'motchill-sitemap-catalog.json')

export const SITEMAP_MOVIE_URL_LIMIT = 8_000

interface CachedCatalog {
  pages: Record<string, Movie[]>
  pageCount: number
  reportedTotal?: number
  pageSize?: number
  savedAt: string
}

export interface SitemapMoviePage {
  movies: Movie[]
  pageCount: number
  totalItems?: number
  pageSize?: number
}

export interface SitemapCatalogStats {
  pageCount: number
  totalItems: number
  pageSize: number
}

let memoryCatalog: CachedCatalog | null = null
let refreshPromise: Promise<void> | null = null
let lastRefreshStartedAt = 0
let bootstrapPromise: Promise<SitemapMoviePage> | null = null

function getPageEndpoint(page: number) {
  const endpoint = new URL(LATEST_MOVIES_ENDPOINT)
  endpoint.searchParams.set('page', String(page))
  return endpoint.toString()
}

async function readCatalog() {
  if (memoryCatalog) return memoryCatalog

  try {
    const catalog = JSON.parse(await readFile(CACHE_FILE, 'utf8')) as CachedCatalog
    if (!catalog || typeof catalog !== 'object' || !catalog.pages) return null
    memoryCatalog = catalog
    return catalog
  } catch {
    return null
  }
}

async function writeCatalog(catalog: CachedCatalog) {
  memoryCatalog = catalog

  try {
    await mkdir(path.dirname(CACHE_FILE), { recursive: true })
    const temporaryFile = `${CACHE_FILE}.${randomUUID()}.tmp`
    await writeFile(temporaryFile, JSON.stringify(catalog), 'utf8')
    await rename(temporaryFile, CACHE_FILE)
  } catch (error) {
    console.error('[sitemap] Unable to persist movie catalog cache:', error)
  }
}

function logCatalogHealth(page: number, currentCount: number, previousCount: number | undefined, reportedTotal: number | undefined, previousTotal: number | undefined) {
  if (currentCount === 0) {
    console.error(`[sitemap] Movie page ${page} returned zero URLs.`)
  }

  if (previousCount && currentCount < previousCount * 0.5) {
    console.error(`[sitemap] Movie page ${page} dropped from ${previousCount} to ${currentCount} items.`)
  }

  if (reportedTotal && previousTotal && reportedTotal < previousTotal * 0.5) {
    console.error(`[sitemap] Upstream movie total dropped from ${previousTotal} to ${reportedTotal}.`)
  }
}

async function persistPage(
  page: number,
  movies: Movie[],
  pageCount: number,
  reportedTotal?: number,
  pageSize?: number,
  savedAt = new Date().toISOString(),
) {
  const previous = await readCatalog()
  const previousPage = previous?.pages[String(page)]
  logCatalogHealth(page, movies.length, previousPage?.length, reportedTotal, previous?.reportedTotal)

  await writeCatalog({
    pages: { ...(previous?.pages ?? {}), [page]: movies },
    pageCount: Math.max(pageCount, previous?.pageCount ?? 0),
    reportedTotal: reportedTotal ?? previous?.reportedTotal,
    pageSize: pageSize ?? previous?.pageSize,
    savedAt,
  })
}

function getPageCount(result: MovieListResult | SitemapMoviePage, page: number) {
  const totalPages = 'pagination' in result ? result.pagination.totalPages : result.pageCount
  if (totalPages && totalPages > 0) return totalPages

  const totalItems = 'pagination' in result ? result.pagination.totalItems : result.totalItems
  const itemCount = 'pagination' in result ? result.items.length : result.movies.length
  if (totalItems && itemCount) return Math.ceil(totalItems / itemCount)

  const hasNextPage = 'pagination' in result ? result.pagination.hasNextPage : result.pageCount > page
  return hasNextPage ? page + 1 : page
}

function getSnapshotPage(catalog: CachedCatalog, page: number): SitemapMoviePage | null {
  const movies = catalog.pages[String(page)]
  if (!movies) return null

  return {
    movies,
    pageCount: catalog.pageCount,
    totalItems: catalog.reportedTotal,
    pageSize: catalog.pageSize ?? DEFAULT_MOVIE_PAGE_SIZE,
  }
}

function isSnapshotStale(catalog: CachedCatalog) {
  const savedAt = Date.parse(catalog.savedAt)
  return !Number.isFinite(savedAt) || Date.now() - savedAt >= SITEMAP_CATALOG_REVALIDATE_SECONDS * 1_000
}

const getCachedSitemapPage = (page: number) => unstable_cache(
  async (): Promise<SitemapMoviePage> => {
    const result = await getCachedMovieList(getPageEndpoint(page))
    const pageCount = getPageCount(result, page)
    const pageSize = result.items.length || DEFAULT_MOVIE_PAGE_SIZE

    return { movies: result.items, pageCount, totalItems: result.pagination.totalItems, pageSize }
  },
  ['motchill-sitemap-page-data', String(page)],
  { revalidate: SITEMAP_CATALOG_REVALIDATE_SECONDS },
)()

async function getFreshSitemapPage(page: number) {
  const result = await getCachedSitemapPage(page)
  await persistPage(page, result.movies, result.pageCount, result.totalItems, result.pageSize)
  return result
}

function getEmptySitemapPage(catalog?: CachedCatalog): SitemapMoviePage {
  return {
    movies: [],
    pageCount: catalog?.pageCount ?? 0,
    totalItems: catalog?.reportedTotal,
    pageSize: catalog?.pageSize ?? DEFAULT_MOVIE_PAGE_SIZE,
  }
}

async function refreshCatalogSnapshot() {
  const previous = await readCatalog()
  let firstPage: SitemapMoviePage

  try {
    firstPage = await getCachedSitemapPage(1)
  } catch (error) {
    console.error('[sitemap] Snapshot refresh could not load page 1.', error)
    return
  }

  const pageCount = getPageCount(firstPage, 1)
  const pageSize = firstPage.movies.length || DEFAULT_MOVIE_PAGE_SIZE
  const pagesToFetch = Array.from(
    { length: Math.max(0, Math.min(pageCount, SITEMAP_MAX_REFRESH_PAGES) - 1) },
    (_, index) => index + 2,
  )
  const pageResults = await mapWithConcurrency(pagesToFetch, SITEMAP_FETCH_CONCURRENCY, async (page) => {
    try {
      return { page, result: await getCachedSitemapPage(page) }
    } catch (error) {
      console.error(`[sitemap] Snapshot refresh skipped page ${page}.`, error)
      return null
    }
  })
  const hadFailures = pageResults.some((result) => result === null)
  const savedAt = hadFailures
    ? previous?.savedAt ?? new Date(0).toISOString()
    : new Date().toISOString()

  logCatalogHealth(
    1,
    firstPage.movies.length,
    previous?.pages['1']?.length,
    firstPage.totalItems,
    previous?.reportedTotal,
  )
  const pages: Record<string, Movie[]> = { ...(previous?.pages ?? {}), '1': firstPage.movies }
  let snapshotPageCount = Math.max(pageCount, previous?.pageCount ?? 0)
  let snapshotTotalItems = firstPage.totalItems ?? previous?.reportedTotal
  let snapshotPageSize = pageSize || previous?.pageSize

  for (const pageResult of pageResults) {
    if (!pageResult) continue
    const resultPageCount = getPageCount(pageResult.result, pageResult.page)
    const previousPage = previous?.pages[String(pageResult.page)]
    logCatalogHealth(
      pageResult.page,
      pageResult.result.movies.length,
      previousPage?.length,
      pageResult.result.totalItems,
      previous?.reportedTotal,
    )
    pages[String(pageResult.page)] = pageResult.result.movies
    snapshotPageCount = Math.max(snapshotPageCount, resultPageCount)
    snapshotTotalItems ??= pageResult.result.totalItems
    snapshotPageSize ??= pageResult.result.movies.length || pageSize
  }

  await writeCatalog({
    pages,
    pageCount: snapshotPageCount,
    reportedTotal: snapshotTotalItems,
    pageSize: snapshotPageSize,
    savedAt,
  })
}

function scheduleCatalogRefresh() {
  const now = Date.now()
  if (refreshPromise || now - lastRefreshStartedAt < SITEMAP_REFRESH_COOLDOWN_MS) return

  lastRefreshStartedAt = now
  refreshPromise = refreshCatalogSnapshot()
    .catch((error) => console.error('[sitemap] Snapshot refresh failed.', error))
    .finally(() => { refreshPromise = null })
}

function getBootstrapPage() {
  if (!bootstrapPromise) {
    bootstrapPromise = getFreshSitemapPage(1).finally(() => { bootstrapPromise = null })
  }

  return bootstrapPromise
}

export async function getSitemapMoviePage(page: number): Promise<SitemapMoviePage> {
  const catalog = await readCatalog()
  const snapshotPage = catalog ? getSnapshotPage(catalog, page) : null

  if (snapshotPage && catalog) {
    if (isSnapshotStale(catalog)) scheduleCatalogRefresh()
    return snapshotPage
  }

  if (catalog) {
    scheduleCatalogRefresh()
    return getEmptySitemapPage(catalog)
  }

  if (page !== 1) {
    scheduleCatalogRefresh()
    return getEmptySitemapPage()
  }

  try {
    return await getBootstrapPage()
  } catch (error) {
    const catalog = await readCatalog()
    console.error('[sitemap] No snapshot is available after bootstrap failure.', error)
    return getEmptySitemapPage(catalog ?? undefined)
  }
}

export async function getSitemapCatalogStats(): Promise<SitemapCatalogStats> {
  const page = await getSitemapMoviePage(1)
  const catalog = await readCatalog()
  const pageCount = Math.max(page.pageCount, catalog?.pageCount ?? 0)
  const pageSize = page.pageSize ?? catalog?.pageSize ?? DEFAULT_MOVIE_PAGE_SIZE
  const totalItems = page.totalItems ?? catalog?.reportedTotal ?? pageCount * pageSize

  if (pageCount === 0 || totalItems === 0) {
    console.error('[sitemap] No movie pages are available for sitemap generation.')
  }

  return { pageCount, totalItems, pageSize }
}

export async function getSitemapPageCount() {
  return (await getSitemapCatalogStats()).pageCount
}

export async function getSitemapIds() {
  const { totalItems } = await getSitemapCatalogStats()
  const movieSitemapCount = Math.ceil(totalItems / SITEMAP_MOVIE_URL_LIMIT)

  return [
    { id: 0 },
    ...Array.from({ length: movieSitemapCount }, (_, index) => ({ id: index + 1 })),
  ]
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length)
  let cursor = 0

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index])
    }
  }))

  return results
}

export async function getIndexableSitemapMovies(sitemapId: number) {
  if (!Number.isInteger(sitemapId) || sitemapId < 1) return []

  const stats = await getSitemapCatalogStats()
  const startOffset = (sitemapId - 1) * SITEMAP_MOVIE_URL_LIMIT
  if (startOffset >= stats.totalItems) return []

  const endOffset = Math.min(sitemapId * SITEMAP_MOVIE_URL_LIMIT, stats.totalItems)
  const firstPage = Math.floor(startOffset / stats.pageSize) + 1
  const lastPage = Math.min(stats.pageCount, Math.ceil(endOffset / stats.pageSize))
  const pageNumbers = Array.from({ length: Math.max(0, lastPage - firstPage + 1) }, (_, index) => firstPage + index)
  const pages = await mapWithConcurrency(pageNumbers, SITEMAP_FETCH_CONCURRENCY, getSitemapMoviePage)
  const localStart = startOffset - (firstPage - 1) * stats.pageSize
  const localEnd = localStart + (endOffset - startOffset)
  const movies = pages.flatMap((page) => page.movies).slice(localStart, localEnd)

  return movies.filter((movie): movie is Movie => Boolean(movie.slug?.trim() && movie.name?.trim()))
}
