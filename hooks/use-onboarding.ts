import { useState, useEffect } from 'react'

interface OnboardingState {
  hasCompletedOnboarding: boolean
  hasSeenTour: boolean
  shouldShowOnboarding: boolean
  shouldShowTour: boolean
  completeOnboarding: () => void
  completeTour: () => void
  resetOnboarding: () => void
  startTour: () => void
}

export function useOnboarding(): OnboardingState {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const [hasSeenTour, setHasSeenTour] = useState(true)
  const [shouldShowTour, setShouldShowTour] = useState(false)

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true'
    const tourComplete = localStorage.getItem('tourComplete') === 'true'
    
    setHasCompletedOnboarding(onboardingComplete)
    setHasSeenTour(tourComplete)
  }, [])

  const shouldShowOnboarding = !hasCompletedOnboarding

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true')
    setHasCompletedOnboarding(true)
    
    // Show tour after onboarding
    if (!hasSeenTour) {
      setShouldShowTour(true)
    }
  }

  const completeTour = () => {
    localStorage.setItem('tourComplete', 'true')
    setHasSeenTour(true)
    setShouldShowTour(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete')
    localStorage.removeItem('tourComplete')
    setHasCompletedOnboarding(false)
    setHasSeenTour(false)
    setShouldShowTour(false)
  }

  const startTour = () => {
    setShouldShowTour(true)
  }

  return {
    hasCompletedOnboarding,
    hasSeenTour,
    shouldShowOnboarding,
    shouldShowTour,
    completeOnboarding,
    completeTour,
    resetOnboarding,
    startTour
  }
}