/**
 * Unified Skeleton Components
 *
 * Comprehensive skeleton library for consistent loading states across the app.
 *
 * Usage:
 * ```tsx
 * import { Skeleton, SkeletonCard, SkeletonMessage } from '@/components/ui/skeletons'
 * ```
 *
 * @module components/ui/skeletons
 */

// Base skeleton components
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonMessage,
  SkeletonAgentCard,
  type SkeletonProps,
} from '../skeleton'

// Specialized skeletons
export {
  SkeletonStatCard,
  SkeletonChatHistoryItem,
  SkeletonInvestigationCard,
  SkeletonChart,
  SkeletonStatsGrid,
  SkeletonChatHistory,
  SkeletonInvestigationsList,
} from '../skeleton-cards'

// Dashboard skeletons
export { NavigationCardSkeleton } from '@/components/dashboard/navigation-card-skeleton'
export { QuickStatsSkeleton } from '@/components/dashboard/quick-stats-skeleton'
export { ActivityFeedSkeleton } from '@/components/dashboard/activity-feed-skeleton'

// Chart skeletons
export {
  ChartSkeleton,
  PieChartSkeleton,
  MetricCardSkeleton,
} from '@/components/charts/chart-skeleton'

// Chat skeletons
export {
  MessageSkeleton,
  MessageListSkeleton,
  TypingIndicator,
  ThinkingIndicator,
} from '@/components/chat/message-skeleton'

/**
 * Skeleton Usage Guide
 *
 * | Component                 | Use Case                              |
 * |---------------------------|---------------------------------------|
 * | Skeleton                  | Base skeleton for custom shapes       |
 * | SkeletonText              | Text paragraphs (2-4 lines)           |
 * | SkeletonCard              | Generic card with avatar              |
 * | SkeletonAvatar            | User avatars                          |
 * | SkeletonMessage           | Chat messages (user/agent)            |
 * | SkeletonAgentCard         | Agent selection cards                 |
 * | SkeletonStatCard          | Stat cards with icons                 |
 * | SkeletonChatHistoryItem   | Chat history sidebar items            |
 * | SkeletonInvestigationCard | Investigation list cards              |
 * | SkeletonStatsGrid         | Grid of 4 stat cards                  |
 * | SkeletonChatHistory       | Full chat history sidebar             |
 * | SkeletonInvestigationsList| Full investigation list               |
 * | NavigationCardSkeleton    | Dashboard navigation tiles            |
 * | QuickStatsSkeleton        | Dashboard stat counters               |
 * | ActivityFeedSkeleton      | Activity/timeline feeds               |
 * | ChartSkeleton             | Bar/line charts                       |
 * | PieChartSkeleton          | Pie/donut charts                      |
 * | MetricCardSkeleton        | Metric display cards                  |
 * | MessageSkeleton           | Chat bubble loading states            |
 * | MessageListSkeleton       | Full message list                     |
 * | TypingIndicator           | Agent typing animation                |
 * | ThinkingIndicator         | Agent thinking animation              |
 */
