'use client'

import { Suspense } from 'react'
import { AcademyDemoProvider } from '@/hooks/use-academy-demo'
import { AcademyAuthProvider } from '@/hooks/use-academy-auth'
import { UnifiedAcademyProvider } from '@/hooks/use-academy'
import { GraduationCap } from 'lucide-react'

/**
 * Academy Layout
 *
 * Provides auth contexts for all Academy pages:
 * - AcademyAuthProvider: Handles real authentication with Supabase
 * - AcademyDemoProvider: Provides demo mode functionality
 * - UnifiedAcademyProvider: Auto-selects between real/demo based on auth state
 *
 * Use `useAcademy()` hook in pages for automatic mode selection.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */

function AcademyLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando Academy...</p>
      </div>
    </div>
  )
}

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AcademyAuthProvider>
      <AcademyDemoProvider>
        <Suspense fallback={<AcademyLoadingFallback />}>
          <UnifiedAcademyProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
              {children}
            </div>
          </UnifiedAcademyProvider>
        </Suspense>
      </AcademyDemoProvider>
    </AcademyAuthProvider>
  )
}
