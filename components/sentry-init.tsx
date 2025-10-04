'use client'

import { useEffect } from 'react'
import { initSentry } from '@/lib/monitoring/sentry.config'

export function SentryInit() {
  useEffect(() => {
    initSentry()
  }, [])

  return null
}
