'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  /** Function to call when refresh is triggered */
  onRefresh: () => Promise<void>
  /** Children to render (scrollable content) */
  children: React.ReactNode
  /** Custom refresh threshold in pixels (default: 80) */
  threshold?: number
  /** Custom pull indicator content */
  pullIndicator?: React.ReactNode
  /** Custom refreshing indicator content */
  refreshingIndicator?: React.ReactNode
  /** Whether pull-to-refresh is disabled */
  disabled?: boolean
  /** Custom class name for container */
  className?: string
}

/**
 * Pull-to-Refresh Component
 *
 * Mobile-friendly pull-to-refresh component that triggers a refresh
 * action when user pulls down at the top of scrollable content.
 *
 * Features:
 * - Native-like pull-to-refresh experience
 * - Customizable threshold and indicators
 * - Smooth animations and transitions
 * - Prevents refresh when not at scroll top
 * - Accessible with loading states
 *
 * @example
 * ```tsx
 * function ChatHistory() {
 *   const [messages, setMessages] = useState([])
 *
 *   const handleRefresh = async () => {
 *     const newMessages = await fetchOlderMessages()
 *     setMessages([...newMessages, ...messages])
 *   }
 *
 *   return (
 *     <PullToRefresh onRefresh={handleRefresh}>
 *       <div className="space-y-4">
 *         {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *       </div>
 *     </PullToRefresh>
 *   )
 * }
 * ```
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  pullIndicator,
  refreshingIndicator,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartYRef = useRef<number>(0)
  const isPullingRef = useRef(false)

  // Calculate pull progress (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1)

  // Determine state
  const isReadyToRefresh = pullDistance >= threshold && !isRefreshing
  const isPulling = pullDistance > 0 && !isRefreshing

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull when scrolled to top
      const isAtTop = container.scrollTop === 0
      setCanPull(isAtTop)

      if (isAtTop) {
        touchStartYRef.current = e.touches[0].clientY
        isPullingRef.current = false
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - touchStartYRef.current

      // Only pull down (positive deltaY)
      if (deltaY > 0) {
        isPullingRef.current = true

        // Apply resistance (diminishing returns)
        const resistance = 0.5
        const adjustedDistance = Math.pow(deltaY, resistance) * 2

        setPullDistance(adjustedDistance)

        // Prevent default scroll when pulling
        if (adjustedDistance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshing) {
        setPullDistance(0)
        return
      }

      if (pullDistance >= threshold) {
        // Trigger refresh
        setIsRefreshing(true)
        setPullDistance(threshold) // Lock at threshold during refresh

        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        // Snap back
        setPullDistance(0)
      }

      isPullingRef.current = false
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [canPull, isRefreshing, pullDistance, threshold, disabled, onRefresh])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full overflow-y-auto', className)}
      style={{
        // Add padding when pulling
        paddingTop: isPulling || isRefreshing ? pullDistance : 0,
        transition: isPulling ? 'none' : 'padding-top 0.3s ease-out',
      }}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-50',
          'flex items-center justify-center',
          'transition-all duration-300'
        )}
        style={{
          height: pullDistance,
          opacity: pullProgress,
        }}
      >
        {isRefreshing
          ? // Refreshing state
            refreshingIndicator || (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Atualizando...</span>
              </div>
            )
          : // Pulling state
            pullIndicator || (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RefreshCw
                  className={cn('w-5 h-5 transition-transform', {
                    'rotate-180': isReadyToRefresh,
                  })}
                  style={{
                    transform: `rotate(${pullProgress * 180}deg)`,
                  }}
                />
                <span className="text-sm font-medium">
                  {isReadyToRefresh ? 'Solte para atualizar' : 'Puxe para atualizar'}
                </span>
              </div>
            )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

/**
 * Simple Pull-to-Refresh Wrapper
 *
 * Minimal variant without custom indicators, for quick integration.
 *
 * @example
 * ```tsx
 * <SimplePullToRefresh onRefresh={loadMoreData}>
 *   <MessageList messages={messages} />
 * </SimplePullToRefresh>
 * ```
 */
export function SimplePullToRefresh({
  onRefresh,
  children,
  className,
}: {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}) {
  return (
    <PullToRefresh onRefresh={onRefresh} threshold={60} className={className}>
      {children}
    </PullToRefresh>
  )
}
