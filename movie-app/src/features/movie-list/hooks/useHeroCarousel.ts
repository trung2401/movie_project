'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseHeroCarouselOptions {
  itemCount: number
  autoplayMs?: number
  paused?: boolean
}

interface UseHeroCarouselResult {
  currentIndex: number
  goTo: (index: number) => void
  next: () => void
  previous: () => void
}

export function useHeroCarousel({
  itemCount,
  autoplayMs = 6_000,
  paused = false,
}: UseHeroCarouselOptions): UseHeroCarouselResult {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = useCallback((index: number) => {
    if (itemCount === 0) return

    const normalizedIndex = ((index % itemCount) + itemCount) % itemCount
    setCurrentIndex(normalizedIndex)
  }, [itemCount])

  const next = useCallback(() => {
    setCurrentIndex((index) => (itemCount === 0 ? 0 : (index + 1) % itemCount))
  }, [itemCount])

  const previous = useCallback(() => {
    setCurrentIndex((index) => {
      if (itemCount === 0) return 0
      return (index - 1 + itemCount) % itemCount
    })
  }, [itemCount])

  useEffect(() => {
    if (paused || itemCount < 2) return

    const timer = window.setInterval(next, autoplayMs)
    return () => window.clearInterval(timer)
  }, [autoplayMs, itemCount, next, paused])

  const safeIndex = itemCount === 0 ? 0 : Math.min(currentIndex, itemCount - 1)

  return { currentIndex: safeIndex, goTo, next, previous }
}
