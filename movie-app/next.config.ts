import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.14.61'],
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.phimapi.com' },
      { protocol: 'https', hostname: 'phimapi.com' },
      { protocol: 'https', hostname: 'phimimg.com' },      // domain ảnh thumbnail/poster
      { protocol: 'https', hostname: '*.phimimg.com' },     // phòng trường hợp có subdomain (cdn., img....)
      { protocol: 'https', hostname: 'img.ophim.live' },
    ],
  },
}

export default nextConfig
