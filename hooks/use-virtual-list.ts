'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useMemo } from 'react'

/**
 * Hook para virtualizar listas grandes
 * Renderiza apenas itens visíveis + buffer
 * Reduz DOM nodes de 100+ para 20-30 = 5x mais rápido
 */
export function useVirtualList<T>(
  items: T[],
  itemSize: number = 48,
  overscan: number = 5
) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan,
  })

  const virtualItems = useMemo(
    () => virtualizer.getVirtualItems(),
    [virtualizer]
  )

  const totalSize = useMemo(
    () => virtualizer.getTotalSize(),
    [virtualizer]
  )

  const paddingTop = useMemo(
    () => (virtualItems.length > 0 ? virtualItems?.[0]?.start || 0 : 0),
    [virtualItems]
  )

  const paddingBottom = useMemo(
    () =>
      virtualItems.length > 0
        ? totalSize - (virtualItems?.[virtualItems.length - 1]?.end || 0)
        : 0,
    [virtualItems, totalSize]
  )

  return {
    parentRef,
    virtualItems,
    paddingTop,
    paddingBottom,
    totalSize,
  }
}
