import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Motchill - Xem phim online chất lượng cao',
    short_name: 'Motchill',
    description: 'Motchill - Xem phim online miễn phí, cập nhật phim mới nhanh nhất.',
    lang: 'vi-VN',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0a12',
    theme_color: '#863bff',
    icons: [
      {
        src: '/icons/motchill-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/motchill-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
