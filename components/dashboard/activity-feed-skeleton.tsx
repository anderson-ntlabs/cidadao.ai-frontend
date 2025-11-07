import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from '@/components/ui/glass-card'

interface ActivityFeedSkeletonProps {
  /**
   * Number of activity items to render
   * @default 4
   */
  items?: number
}

/**
 * ActivityFeedSkeleton - Loading placeholder for dashboard activity feed
 *
 * Prevents CLS by reserving exact space for activity items during data fetch.
 * Matches dimensions from analysis:
 * - Each item: px-6 py-4 (24px + 16px padding)
 * - Icon: w-5 h-5 (20px)
 * - Title + description: ~48px
 * - Total per item: ~80px
 * - Total for 4 items: ~320px + card padding
 *
 * @see docs/phase1b-cls-analysis.md
 */
export function ActivityFeedSkeleton({ items = 4 }: ActivityFeedSkeletonProps) {
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        <div className="divide-y divide-gray-200/20 dark:divide-gray-700/20">
          {Array.from({ length: items }).map((_, index) => (
            <div key={index} className="px-6 py-4 animate-pulse">
              <div className="flex items-start gap-3">
                {/* Icon - w-5 h-5 */}
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mt-0.5" />

                {/* Content */}
                <div className="flex-1 space-y-2">
                  {/* Title */}
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />

                  {/* Description */}
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />

                  {/* Timestamp */}
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
