import type { Metadata } from 'next'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { AuthOverlays } from '@/features/auth/components/AuthOverlays'
import { AuthProvider } from '@/features/auth/auth-context'
import { SITE_URL } from '@/constants/environment'
import { DEFAULT_SOCIAL_IMAGE, getWebsiteStructuredData } from '@/lib/seo'
import './globals.css'

const websiteStructuredData = JSON.stringify(getWebsiteStructuredData()).replace(/</g, '\\u003c')

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/icons/motchill-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/icons/motchill-180.png', type: 'image/png', sizes: '180x180' }],
  },
  title: {
    default: 'Motchill - Xem phim online chất lượng cao',
    template: '%s | Motchill',
  },
  description: 'Motchill - Xem phim online miễn phí, cập nhật phim mới nhanh nhất: phim lẻ, phim bộ, phim chiếu rạp, vietsub, thuyết minh, lồng tiếng chất lượng Full HD.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Motchill',
    title: 'Motchill - Xem phim online chất lượng cao',
    description: 'Motchill - Xem phim online miễn phí, cập nhật phim mới nhanh nhất: phim lẻ, phim bộ, phim chiếu rạp, vietsub, thuyết minh, lồng tiếng chất lượng Full HD.',
    url: new URL('/', SITE_URL).toString(),
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: 'Motchill - Xem phim online' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motchill - Xem phim online chất lượng cao',
    description: 'Motchill - Xem phim online miễn phí, cập nhật phim mới nhanh nhất: phim lẻ, phim bộ, phim chiếu rạp, vietsub, thuyết minh, lồng tiếng chất lượng Full HD.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteStructuredData }} />
        <AuthProvider>
          <div className="relative z-10">{children}<SiteFooter /></div>
          <AuthOverlays />
        </AuthProvider>
      </body>
    </html>
  )
}
