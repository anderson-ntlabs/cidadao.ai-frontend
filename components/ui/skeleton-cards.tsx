import { Skeleton } from './skeleton'
import { GlassCard, GlassCardContent } from './glass-card'
import { cn } from '@/lib/utils'

/**
 * Skeleton for Dashboard Stat Cards
 * Mimics the 4 metric cards layout
 */
export function SkeletonStatCard() {
  return (
    <GlassCard>
      <GlassCardContent className="p-6">
        {/* Icon and trend indicator */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Value */}
        <Skeleton className="h-8 w-24 mb-2" />

        {/* Title with tooltip icon */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

/**
 * Skeleton for Chat History Item
 * Mimics conversation entry in sidebar
 */
export function SkeletonChatHistoryItem() {
  return (
    <div className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
      {/* Title */}
      <Skeleton className="h-4 w-3/4 mb-2" />

      {/* Preview text */}
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-2" />

      {/* Timestamp */}
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

/**
 * Skeleton for Investigation Card
 * Mimics investigation item in list
 */
export function SkeletonInvestigationCard() {
  return (
    <GlassCard>
      <GlassCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title */}
            <Skeleton className="h-5 w-3/4 mb-2" />

            {/* Description */}
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Status badge */}
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          {/* Value */}
          <Skeleton className="h-5 w-32" />

          {/* Date */}
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Agents */}
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

/**
 * Skeleton for Chart/Graph placeholder
 */
export function SkeletonChart({ height = 256 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 px-4 pb-4">
        {[...Array(7)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Loading Grid - 4 skeleton stat cards
 */
export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  )
}

/**
 * Loading List - Chat history sidebar
 */
export function SkeletonChatHistory({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonChatHistoryItem key={i} />
      ))}
    </div>
  )
}

/**
 * Loading List - Investigations
 */
export function SkeletonInvestigationsList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonInvestigationCard key={i} />
      ))}
    </div>
  )
}
