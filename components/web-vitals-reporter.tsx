'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/web-vitals'

export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return null
}