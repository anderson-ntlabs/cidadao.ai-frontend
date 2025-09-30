'use client'

import dynamic from 'next/dynamic'

// Lazy load tour components - they're only used on first visit
export const InteractiveTour = dynamic(
  () => import('./interactive-tour').then(mod => ({ default: mod.InteractiveTour })),
  {
    loading: () => null, // No loading state needed for tour
    ssr: false // Tour uses browser-only features
  }
)

export const GuidedTour = dynamic(
  () => import('./guided-tour').then(mod => ({ default: mod.GuidedTour })),
  {
    loading: () => null,
    ssr: false
  }
)

export const TourControls = dynamic(
  () => import('./tour-controls').then(mod => ({ default: mod.TourControls })),
  {
    loading: () => null,
    ssr: false
  }
)