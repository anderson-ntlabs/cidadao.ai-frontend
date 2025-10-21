'use client'

import { useEffect } from 'react'
import { initWebVitals } from '@/lib/performance/web-vitals-tracker'

/**
 * Web Vitals Provider
 * Initializes Web Vitals tracking on mount
 */
export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initWebVitals()
  }, [])

  return <>{children}</>
}
