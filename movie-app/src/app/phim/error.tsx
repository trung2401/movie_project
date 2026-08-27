'use client'

import { RouteErrorState } from '@/components/ui/RouteErrorState'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorState message="Không thể tải danh sách phim. Vui lòng thử lại sau." reset={reset} />
}
