/**
 * Chart Components
 *
 * For performance optimization, prefer using lazy-loaded versions:
 * ```tsx
 * import { LineChart, BarChart } from '@/components/charts/lazy'
 * ```
 *
 * Direct imports (loads recharts immediately):
 * ```tsx
 * import { LineChart, BarChart } from '@/components/charts'
 * ```
 */

// Direct exports (loads recharts immediately - avoid if possible)
export * from './line-chart'
export * from './bar-chart'
export * from './pie-chart'
export * from './area-chart'

// Lazy-loaded versions (recommended)
export * as lazy from './lazy'
