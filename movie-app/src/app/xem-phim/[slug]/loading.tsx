import { CONTAINER_CLASS } from '@/constants/layout'

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--color-ink)]">
      <div className="h-14 animate-pulse border-b border-[var(--color-line)] bg-[var(--color-panel)]" />
      <div className={CONTAINER_CLASS}>
        <div className="mt-5 aspect-video animate-pulse border border-[var(--color-line)] bg-[var(--color-panel)] lg:mt-8" />
        <div className="space-y-4 border-b border-[var(--color-line)] py-6">
          <div className="h-4 w-44 animate-pulse bg-[var(--color-panel)]" />
          <div className="h-8 w-2/3 max-w-xl animate-pulse bg-[var(--color-panel)]" />
          <div className="h-4 w-full max-w-3xl animate-pulse bg-[var(--color-panel)]" />
          <div className="h-4 w-5/6 max-w-2xl animate-pulse bg-[var(--color-panel)]" />
        </div>
        <div className="mt-6 h-32 animate-pulse border border-[var(--color-line)] bg-[var(--color-panel)]" />
      </div>
    </main>
  )
}
