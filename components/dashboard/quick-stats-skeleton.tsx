import { GlassCard } from '@/components/ui/glass-card'

interface QuickStatsSkeletonProps {
  /**
   * Number of skeleton cards to render
   * @default 4
   */
  count?: number
}

/**
 * QuickStatsSkeleton - Loading placeholder for dashboard quick stats cards
 *
 * Prevents CLS by reserving exact space for GlassCard stats during data fetch.
 * Matches dimensions from analysis:
 * - GlassCard with p-6 (24px padding)
 * - Icon row: ~32px
 * - Value text: ~40px
 * - Label text: ~20px
 * - Total height: ~140px
 *
 * @see docs/phase1b-cls-analysis.md
 */
export function QuickStatsSkeleton({ count = 4 }: QuickStatsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <GlassCard key={index} className="p-6 animate-pulse">
          {/* Icon row (mb-2) - ~32px */}
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-10 h-10" />
            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Value (text-2xl mb-1) - ~40px */}
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />

          {/* Label (text-sm) - ~20px */}
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </GlassCard>
      ))}
    </div>
  )
}
