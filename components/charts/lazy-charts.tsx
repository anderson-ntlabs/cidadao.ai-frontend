/**
 * Lazy-loaded Chart Components
 * Optimization: Load charts only when needed to reduce initial bundle
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Chart Loading Component
const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex items-center justify-center">
    <Skeleton className="w-full h-full" />
  </div>
)

// Lazy load each chart component
// This prevents recharts from being included in the initial bundle
export const LazyBarChart = dynamic(
  () => import('./bar-chart').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  }
)

export const LazyLineChart = dynamic(
  () => import('./line-chart').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const LazyAreaChart = dynamic(
  () => import('./area-chart').then(mod => ({ default: mod.AreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export const LazyPieChart = dynamic(
  () => import('./pie-chart').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

// Export all for convenience
export const LazyCharts = {
  Bar: LazyBarChart,
  Line: LazyLineChart,
  Area: LazyAreaChart,
  Pie: LazyPieChart,
}