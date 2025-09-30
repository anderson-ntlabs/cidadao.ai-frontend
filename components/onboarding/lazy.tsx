'use client'

import dynamic from 'next/dynamic'

// Lazy load onboarding component - only used on first visit
export const OnboardingFlow = dynamic(
  () => import('./onboarding-flow').then(mod => ({ default: mod.OnboardingFlow })),
  {
    loading: () => null, // No loading state needed
    ssr: false // Uses browser features
  }
)