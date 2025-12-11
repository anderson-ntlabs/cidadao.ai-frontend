/**
 * Tour Components - Lazy Loaded
 *
 * Exports tour components with dynamic imports to reduce initial bundle.
 * framer-motion (~50KB) is only loaded when tour is actually used.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11
 */

'use client'

import dynamic from 'next/dynamic'

// Lazy load tour components - framer-motion only loads when needed
export const InteractiveTour = dynamic(
  () => import('./interactive-tour').then((mod) => mod.InteractiveTour),
  {
    ssr: false,
    loading: () => null,
  }
)

export const TourTrigger = dynamic(
  () => import('./interactive-tour').then((mod) => mod.TourTrigger),
  {
    ssr: false,
    loading: () => null,
  }
)

export const TourControls = dynamic(
  () => import('./tour-controls').then((mod) => mod.TourControls),
  {
    ssr: false,
    loading: () => null,
  }
)

export const TourFloatingButton = dynamic(
  () => import('./tour-controls').then((mod) => mod.TourFloatingButton),
  {
    ssr: false,
    loading: () => null,
  }
)
