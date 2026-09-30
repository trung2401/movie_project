import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const routes = ['/', '/phim', '/xem-phim/[slug]']

function readWebpackRouteStats() {
  const statsPath = resolve('.next/diagnostics/route-bundle-stats.json')
  if (!existsSync(statsPath)) return null
  const stats = JSON.parse(readFileSync(statsPath, 'utf8'))
  const entries = routes.map((route) => stats.find((entry) => entry.route === route))
  return entries.every(Boolean) ? entries : null
}

function readManifest(filePath) {
  const source = readFileSync(filePath, 'utf8')
  const assignmentIndex = source.indexOf(']=')
  if (assignmentIndex === -1) throw new Error(`Invalid client manifest: ${filePath}`)
  return JSON.parse(source.slice(assignmentIndex + 2).replace(/;\s*$/, ''))
}

function readWebpackFallbackStats() {
  const buildManifestPath = resolve('.next/build-manifest.json')
  const manifestFiles = {
    '/': '.next/server/app/page_client-reference-manifest.js',
    '/phim': '.next/server/app/phim/page_client-reference-manifest.js',
    '/xem-phim/[slug]': '.next/server/app/xem-phim/[slug]/page_client-reference-manifest.js',
  }

  if (!existsSync(buildManifestPath)) return null
  if (routes.some((route) => !existsSync(resolve(manifestFiles[route])))) return null

  const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf8'))
  const rootChunks = buildManifest.rootMainFiles ?? []
  const routeModules = {
    '/': 'features/movie-list/components/HeroBanner.tsx',
    '/phim': 'features/movie-list/components/MovieListClient.tsx',
    '/xem-phim/[slug]': 'features/movie-detail/components/MovieWatchClient.tsx',
  }

  return routes.map((route) => {
    const manifest = readManifest(resolve(manifestFiles[route]))
    const moduleEntry = Object.entries(manifest.clientModules).find(([modulePath]) =>
      modulePath.endsWith(`/src/${routeModules[route]}`),
    )
    const routeChunks = moduleEntry?.[1]?.chunks ?? []
    return {
      route,
      firstLoadChunkPaths: [...new Set([...rootChunks, ...routeChunks.filter((path) => path.startsWith('static/'))])],
    }
  })
}

const routeStats = readWebpackRouteStats() ?? readWebpackFallbackStats()

if (!routeStats) {
  console.error(
    'Missing bundle stats. Run `npm run build:webpack` first, then retry `npm run check:bundle`.',
  )
  process.exit(1)
}

function getChunkSizes(chunkPaths) {
  const seen = new Set()
  const sizes = { raw: 0, gzip: 0, brotli: 0 }

  for (const chunkPath of chunkPaths) {
    if (seen.has(chunkPath)) continue
    seen.add(chunkPath)

    const normalizedPath = decodeURIComponent(chunkPath)
    const chunk = readFileSync(
      resolve(normalizedPath.startsWith('.next/') ? normalizedPath : `.next/${normalizedPath}`),
    )
    sizes.raw += chunk.byteLength
    sizes.gzip += gzipSync(chunk).byteLength
    sizes.brotli += brotliCompressSync(chunk).byteLength
  }

  return sizes
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function printSizes(label, sizes) {
  console.log(
    `${label}: raw ${formatBytes(sizes.raw)}, gzip ${formatBytes(sizes.gzip)}, Brotli ${formatBytes(sizes.brotli)}`,
  )
}

const routeSizes = routeStats.map((entry) => ({
  route: entry.route,
  sizes: getChunkSizes(entry.firstLoadChunkPaths),
}))

const sharedChunkPaths = routeStats.reduce((shared, entry) => {
  const paths = new Set(entry.firstLoadChunkPaths)
  return shared.filter((chunkPath) => paths.has(chunkPath))
}, [...routeStats[0].firstLoadChunkPaths])

const sharedSizes = getChunkSizes(sharedChunkPaths)
const budgets = {
  shared: { raw: 700_000, gzip: 220_000, brotli: 190_000 },
  '/': { raw: 700_000, gzip: 220_000, brotli: 190_000 },
  '/phim': { raw: 700_000, gzip: 220_000, brotli: 190_000 },
  '/xem-phim/[slug]': { raw: 720_000, gzip: 230_000, brotli: 200_000 },
}

console.log('Bundle budget report')
for (const { route, sizes } of routeSizes) printSizes(route, sizes)
printSizes('shared chunks', sharedSizes)

const failures = []
function checkBudget(label, sizes, budget) {
  for (const format of ['raw', 'gzip', 'brotli']) {
    if (sizes[format] > budget[format]) {
      failures.push(
        `${label} ${format} ${formatBytes(sizes[format])} > ${formatBytes(budget[format])}`,
      )
    }
  }
}

for (const { route, sizes } of routeSizes) checkBudget(route, sizes, budgets[route])
checkBudget('shared chunks', sharedSizes, budgets.shared)

if (failures.length) {
  console.error('Bundle budget exceeded:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('All configured bundle budgets passed.')
