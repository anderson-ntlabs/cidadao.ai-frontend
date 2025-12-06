'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Academy Onboarding Page - Demo Mode
 *
 * In demo mode, we don't need onboarding.
 * This page redirects directly to the dashboard.
 */
export default function AcademyOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // In demo mode, redirect directly to dashboard
    router.replace('/pt/academy')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Configurando modo demo...</p>
      </div>
    </div>
  )
}
