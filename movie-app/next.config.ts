import type { NextConfig } from 'next'

function requireProductionEnvironmentVariable(
  name: string,
  value: string | undefined,
): void {
  if (process.env.NODE_ENV === 'production' && !value?.trim()) {
    throw new Error(`Environment variable ${name} is required in production`)
  }
}

requireProductionEnvironmentVariable(
  'NEXT_PUBLIC_USER_API_BASE',
  process.env.NEXT_PUBLIC_USER_API_BASE,
)
requireProductionEnvironmentVariable(
  'NEXT_PUBLIC_SITE_URL',
  process.env.NEXT_PUBLIC_SITE_URL,
)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.14.61'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    useTypeScriptCli: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.phimapi.com' },
      { protocol: 'https', hostname: 'phimapi.com' },
      { protocol: 'https', hostname: 'phimimg.com' },      // domain ảnh thumbnail/poster
      { protocol: 'https', hostname: '*.phimimg.com' },     // phòng trường hợp có subdomain (cdn., img....)
      { protocol: 'https', hostname: 'img.ophim.live' },
      { protocol: 'https', hostname: 'i.ex-cdn.com' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: 'phim.nguonc.com' },
    ],
  },
}

export default nextConfig
