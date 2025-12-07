'use client'

import { Suspense } from 'react'
import { AgoraDemoProvider } from '@/hooks/use-agora-demo'
import { AgoraAuthProvider } from '@/hooks/use-agora-auth'
import { UnifiedAgoraProvider } from '@/hooks/use-agora'
import { GraduationCap } from 'lucide-react'

/**
 * Agora Layout
 *
 * Provides auth contexts for all Agora pages:
 * - AgoraAuthProvider: Handles real authentication with Supabase
 * - AgoraDemoProvider: Provides demo mode functionality
 * - UnifiedAgoraProvider: Auto-selects between real/demo based on auth state
 *
 * Use `useAgora()` hook in pages for automatic mode selection.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */

function AgoraLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando Ágora...</p>
      </div>
    </div>
  )
}

export default function AgoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgoraAuthProvider>
      <AgoraDemoProvider>
        <Suspense fallback={<AgoraLoadingFallback />}>
          <UnifiedAgoraProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
              {children}
            </div>
          </UnifiedAgoraProvider>
        </Suspense>
      </AgoraDemoProvider>
    </AgoraAuthProvider>
  )
}
