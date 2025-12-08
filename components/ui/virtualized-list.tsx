/**
 * Virtualized List Component
 *
 * High-performance list rendering using @tanstack/react-virtual.
 * Renders only visible items for O(1) render performance regardless of list size.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-08
 */

'use client'

import { useRef, useCallback, type ReactNode, type CSSProperties } from 'react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of each item in pixels (for fixed height) or function for variable heights */
  estimateSize: number | ((index: number) => number)
  /** Height of the scrollable container */
  height: number | string
  /** Render function for each item */
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode
  /** Number of items to render above/below visible area */
  overscan?: number
  /** Custom className for the container */
  className?: string
  /** Custom className for the inner wrapper */
  innerClassName?: string
  /** Gap between items in pixels */
  gap?: number
  /** Callback when scrolling near the end (for infinite scroll) */
  onEndReached?: () => void
  /** Threshold for onEndReached (0-1, percentage from bottom) */
  endReachedThreshold?: number
  /** Key extractor for items */
  getItemKey?: (item: T, index: number) => string | number
  /** Empty state component */
  emptyState?: ReactNode
  /** Show loading indicator at bottom */
  isLoading?: boolean
  /** Loading indicator component */
  loadingIndicator?: ReactNode
}

export function VirtualizedList<T>({
  items,
  estimateSize,
  height,
  renderItem,
  overscan = 5,
  className,
  innerClassName,
  gap = 0,
  onEndReached,
  endReachedThreshold = 0.8,
  getItemKey,
  emptyState,
  isLoading,
  loadingIndicator,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const hasTriggeredEndRef = useRef(false)

  // Reset end trigger when items change
  const itemCount = items.length
  if (itemCount > 0) {
    hasTriggeredEndRef.current = false
  }

  const estimateSizeFn = typeof estimateSize === 'function' ? estimateSize : () => estimateSize

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => estimateSizeFn(index) + gap,
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Check if scrolled near end
  const handleScroll = useCallback(() => {
    if (!onEndReached || !parentRef.current || hasTriggeredEndRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    if (scrollPercentage >= endReachedThreshold) {
      hasTriggeredEndRef.current = true
      onEndReached()
    }
  }, [onEndReached, endReachedThreshold])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: typeof height === 'number' ? height : undefined }}
      >
        {emptyState || <p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado</p>}
      </div>
    )
  }

  const containerStyle: CSSProperties = {
    height: typeof height === 'number' ? height : undefined,
    minHeight: typeof height === 'string' ? height : undefined,
    overflow: 'auto',
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div className={cn('relative w-full', innerClassName)} style={{ height: totalSize }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: virtualItem.size - gap,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index, virtualItem)}
            </div>
          )
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          {loadingIndicator || (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Simple virtualized list for fixed-height items
 * Convenience wrapper with sensible defaults
 */
export interface SimpleVirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number | string
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  emptyState?: ReactNode
}

export function SimpleVirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  emptyState,
}: SimpleVirtualListProps<T>) {
  return (
    <VirtualizedList
      items={items}
      estimateSize={itemHeight}
      height={height}
      renderItem={(item, index) => renderItem(item, index)}
      className={className}
      emptyState={emptyState}
      overscan={3}
    />
  )
}
