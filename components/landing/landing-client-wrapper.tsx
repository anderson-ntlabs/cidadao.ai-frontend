/**
 * Landing Client Wrapper
 *
 * Minimal client component for interactive features
 * Only loads when user interacts with the page
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-21
 */

'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Lazy load PWA component only after user interaction
const InstallPWASection = dynamic(
  () =>
    import('@/components/install-pwa-section').then((mod) => ({ default: mod.InstallPWASection })),
  {
    ssr: false,
    loading: () => null,
  }
)

export function LandingClientWrapper() {
  useEffect(() => {
    // Add gradient animation only after page loads
    const title = document.querySelector('h1')
    if (title) {
      title.classList.add('animate-gradient')
    }
  }, [])

  return (
    <>
      {/* PWA Install prompt - only shows if PWA is installable */}
      <InstallPWASection />
    </>
  )
}
