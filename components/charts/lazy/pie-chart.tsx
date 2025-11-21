'use client'

import dynamic from 'next/dynamic'
import { PieChartSkeleton } from '../chart-skeleton'

// Lazy load the PieChart component
export const PieChart = dynamic(
  () => import('../pie-chart').then((mod) => ({ default: mod.PieChart })),
  {
    ssr: false,
    loading: () => <PieChartSkeleton height={300} />,
  }
)
