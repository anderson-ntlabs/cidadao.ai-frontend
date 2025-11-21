'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '../chart-skeleton'

// Lazy load the LineChart component
export const LineChart = dynamic(
  () => import('../line-chart').then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  }
)
