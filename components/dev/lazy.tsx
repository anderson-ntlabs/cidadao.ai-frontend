'use client'

import dynamic from 'next/dynamic'

// Only load telemetry panel in development
export const TelemetryPanel = dynamic(
  () => import('./telemetry-panel').then(mod => ({ default: mod.TelemetryPanel })),
  {
    loading: () => null,
    ssr: false
  }
)