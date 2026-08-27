import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { unstable_cache } from 'next/cache'
import { getCachedMovieList } from '@/services/serverMovieApi'
import { LATEST_MOVIES_ENDPOINT } from '@/constants/movie'
import { DEFAULT_MOVIE_PAGE_SIZE } from '@/services/providers/pagination'
import type { Movie } from '@/types/movie'

const SITEMAP_CATALOG_REVALIDATE_SECONDS = 6 * 60 * 60
const SITEMAP_FETCH_CONCURRENCY = 2
const SITEMAP_FETCH_MAX_RETRIES = 3
const SITEMAP_FETCH_RETRY_BASE_MS = 350
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
    await writeFile(CACHE_FILE, JSON.stringify(catalog), 'utf8')
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
) {
  const previous = await readCatalog()
  const previousPage = previous?.pages[String(page)]
  logCatalogHealth(page, movies.length, previousPage?.length, reportedTotal, previous?.reportedTotal)

  await writeCatalog({
    pages: { ...(previous?.pages ?? {}), [page]: movies },
    pageCount: Math.max(pageCount, previous?.pageCount ?? 0),
    reportedTotal: reportedTotal ?? previous?.reportedTotal,
    pageSize: pageSize ?? previous?.pageSize,
    savedAt: new Date().toISOString(),
  })
}

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) return undefined
  const status = error.message.match(/status (\d{3})/i)?.[1]
  return status ? Number(status) : undefined
}

function isRetryableSitemapError(error: unknown) {
  const status = getErrorStatus(error)
  return status === 429 || (status !== undefined && status >= 500)
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function getMovieListWithRetry(endpoint: string) {
  let lastError: unknown

  for (let attempt = 0; attempt <= SITEMAP_FETCH_MAX_RETRIES; attempt += 1) {
    try {
      return await getCachedMovieList(endpoint)
    } catch (error) {
      lastError = error
      if (!isRetryableSitemapError(error) || attempt === SITEMAP_FETCH_MAX_RETRIES) throw error
      await wait(SITEMAP_FETCH_RETRY_BASE_MS * 2 ** attempt)
    }
  }

  throw lastError
}

const getFreshSitemapPage = (page: number) => unstable_cache(
  async (): Promise<SitemapMoviePage> => {
    const result = await getMovieListWithRetry(getPageEndpoint(page))
    const pageCount = result.pagination.totalPages
      ?? (result.pagination.totalItems && result.items.length
        ? Math.ceil(result.pagination.totalItems / result.items.length)
        : result.pagination.hasNextPage ? page + 1 : page)
    const pageSize = result.items.length || DEFAULT_MOVIE_PAGE_SIZE

    await persistPage(page, result.items, pageCount, result.pagination.totalItems, pageSize)
    return { movies: result.items, pageCount, totalItems: result.pagination.totalItems, pageSize }
  },
  ['motchill-sitemap-page', String(page)],
  { revalidate: SITEMAP_CATALOG_REVALIDATE_SECONDS },
)()

export async function getSitemapMoviePage(page: number): Promise<SitemapMoviePage> {
  try {
    return await getFreshSitemapPage(page)
  } catch (error) {
    const catalog = await readCatalog()
    const cachedMovies = catalog?.pages[String(page)]
    if (cachedMovies) {
      console.error(`[sitemap] Upstream movie page ${page} failed; serving ${cachedMovies.length} cached items.`, error)
      return {
        movies: cachedMovies,
        pageCount: catalog.pageCount,
        totalItems: catalog.reportedTotal,
        pageSize: catalog.pageSize ?? DEFAULT_MOVIE_PAGE_SIZE,
      }
    }

    console.error(`[sitemap] Upstream movie page ${page} failed and no cached items are available.`, error)
    return {
      movies: [],
      pageCount: catalog?.pageCount ?? 0,
      totalItems: catalog?.reportedTotal,
      pageSize: catalog?.pageSize ?? DEFAULT_MOVIE_PAGE_SIZE,
    }
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
