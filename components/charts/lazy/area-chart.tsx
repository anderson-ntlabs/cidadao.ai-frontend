'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '../chart-skeleton'

// Lazy load the AreaChart component
export const AreaChart = dynamic(
  () => import('../area-chart').then((mod) => ({ default: mod.AreaChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  }
)
