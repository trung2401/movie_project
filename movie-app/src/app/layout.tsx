import type { Metadata } from 'next'
import { FloatingParticles } from '@/components/layout/FloatingParticles'
import { AuthOverlays } from '@/features/auth/components/AuthOverlays'
import { AuthProvider } from '@/features/auth/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'MovieApp',
  description: 'Xem phim trực tuyến',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <FloatingParticles />
        <AuthProvider>
          <div className="relative z-10">{children}</div>
          <AuthOverlays />
        </AuthProvider>
      </body>
    </html>
  )
}
