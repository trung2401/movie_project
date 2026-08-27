import { SITE_URL } from '@/constants/environment'
import { getSitemapIds } from '@/services/sitemapMovieCatalog'

export const revalidate = 300

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character)
}

export async function GET() {
  const sitemapIds = await getSitemapIds()
  const sitemapEntries = sitemapIds.map(({ id }) => {
    const url = new URL(`/sitemap/${id}.xml`, SITE_URL).toString()
    return `<sitemap><loc>${escapeXml(url)}</loc></sitemap>`
  }).join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</sitemapindex>`

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
