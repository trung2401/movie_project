'use client'

import dynamic from 'next/dynamic'

const VideoFrame = dynamic(() => Promise.resolve(function VideoFrame({ embedLink, title }: { embedLink?: string; title: string }) {
  return embedLink ? <iframe src={embedLink} title={title} className="absolute inset-0 size-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /> : <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-muted)]">Không thể tải nguồn phát</div>
}), { ssr: false })

export function VideoPlayer({ embedLink, title }: { embedLink?: string; title: string }) {
  return <div className="relative aspect-video overflow-hidden bg-black"><VideoFrame embedLink={embedLink} title={title} /></div>
}
