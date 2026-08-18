export function LoadingState({ label = 'Đang tải...' }: { label?: string }) {
  return <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-sm text-[var(--color-muted)]"><span className="size-9 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-primary)]" />{label}</div>
}
