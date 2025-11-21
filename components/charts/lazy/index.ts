/**
 * Lazy-loaded Chart Components
 *
 * These components use Next.js dynamic imports to load chart libraries
 * only when needed, significantly reducing the initial bundle size.
 *
 * Usage:
 * ```tsx
 * import { LineChart, BarChart } from '@/components/charts/lazy'
 * ```
 *
 * Benefits:
 * - Recharts (~500KB) is not loaded until a chart is rendered
 * - Skeleton loaders provide visual feedback during loading
 * - Better performance on initial page load
 */

export { LineChart } from './line-chart'
export { BarChart } from './bar-chart'
export { PieChart } from './pie-chart'
export { AreaChart } from './area-chart'

// Export skeletons for manual use if needed
export { ChartSkeleton, PieChartSkeleton, MetricCardSkeleton } from '../chart-skeleton'
