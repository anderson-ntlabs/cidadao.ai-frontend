import { GlassCard } from '@/components/ui/glass-card'
import { GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'

/**
 * NavigationCardSkeleton - Loading placeholder for dashboard navigation cards
 *
 * Prevents CLS by reserving exact space for large navigation cards during data fetch.
 * Matches dimensions from analysis:
 * - GlassCard with p-6 (24px padding)
 * - Icon row: ~56px (p-3 icon box)
 * - Title: ~32px (text-xl mb-2)
 * - Description: ~48px (2 lines, mb-4)
 * - Footer stats: ~24px
 * - Total height: ~208px
 *
 * @see docs/phase1b-cls-analysis.md
 */
export function NavigationCardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mb-8">
      {Array.from({ length: 2 }).map((_, index) => (
        <GlassCard key={index} className="animate-pulse">
          <GlassCardHeader>
            <GlassCardContent className="p-6">
              {/* Icon row (mb-4) - ~56px */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-xl w-14 h-14" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>

              {/* Title (text-xl mb-2) - ~32px */}
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

              {/* Description (mb-4) - ~48px (2 lines) */}
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>

              {/* Footer stats - ~24px */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </GlassCardContent>
          </GlassCardHeader>
        </GlassCard>
      ))}
    </div>
  )
}
