import { CONTAINER_CLASS } from '@/constants/layout'

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--color-ink)]">
      <div className="h-14 animate-pulse border-b border-[var(--color-line)] bg-[var(--color-panel)]" />
      <div className={CONTAINER_CLASS}>
        <div className="space-y-3 py-8">
          <div className="h-8 w-56 animate-pulse bg-[var(--color-panel)]" />
          <div className="h-4 w-80 max-w-full animate-pulse bg-[var(--color-panel)]" />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-10 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="animate-pulse overflow-hidden border border-[var(--color-line)] bg-[var(--color-panel)]">
              <div className="aspect-[3/4] bg-[var(--color-panel-soft)]" />
              <div className="space-y-2 p-3">
                <div className="h-4 bg-[var(--color-panel-soft)]" />
                <div className="h-3 w-2/3 bg-[var(--color-panel-soft)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
