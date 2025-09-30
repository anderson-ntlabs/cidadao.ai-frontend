'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Chart loading skeleton
const ChartSkeleton = () => (
  <div className="w-full h-[400px] p-4">
    <Skeleton className="w-full h-full rounded-lg" />
    <div className="mt-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

// Lazy load all chart components with loading states
export const LineChart = dynamic(
  () => import('./line-chart').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Charts use browser-only features
  }
)

export const BarChart = dynamic(
  () => import('./bar-chart').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const PieChart = dynamic(
  () => import('./pie-chart').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const AreaChart = dynamic(
  () => import('./area-chart').then(mod => ({ default: mod.AreaChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

// Export individual chart skeletons for custom loading states
export { ChartSkeleton }