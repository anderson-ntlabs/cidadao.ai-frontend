/**
 * Analytics Provider
 *
 * Initializes PostHog, Vercel Analytics and manages analytics consent
 * Must be placed high in the component tree
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { initPostHog, trackPageView, updateConsentStatus } from '@/lib/analytics/posthog-config'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog()
    updateConsentStatus()
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      updateConsentStatus()
    }

    window.addEventListener('consent-updated', handleConsentChange)

    return () => {
      window.removeEventListener('consent-updated', handleConsentChange)
    }
  }, [])

  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
