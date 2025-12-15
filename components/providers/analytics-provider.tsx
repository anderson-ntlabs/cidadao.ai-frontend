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

  // Initialize PostHog after a delay to improve initial page load
  // PostHog is now lazy-loaded, so this is doubly optimized
  useEffect(() => {
    // Delay analytics initialization to prioritize critical rendering
    const timer = setTimeout(() => {
      // initPostHog is now async and handles lazy loading internally
      void initPostHog()
    }, 2000) // 2 second delay

    return () => clearTimeout(timer)
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
