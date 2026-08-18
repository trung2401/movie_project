import { Film } from 'lucide-react'

export function EmptyState({ message = 'Không tìm thấy phim nào' }: { message?: string }) {
  return <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-[var(--color-muted)]"><Film className="size-8" /><p>{message}</p></div>
}
