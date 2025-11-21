'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '../chart-skeleton'

// Lazy load the BarChart component
export const BarChart = dynamic(
  () => import('../bar-chart').then((mod) => ({ default: mod.BarChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  }
)
