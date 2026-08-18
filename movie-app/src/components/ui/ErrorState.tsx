import { AlertCircle, RotateCcw } from 'lucide-react'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] text-center shadow-md shadow-black/10"><AlertCircle className="size-9 text-[var(--color-primary-soft)]" /><p className="max-w-md text-sm text-[var(--color-muted)]">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--color-primary)]"><RotateCcw className="size-4" />Thử lại</button>}</div>
}
