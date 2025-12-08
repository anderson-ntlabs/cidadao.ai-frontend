'use client'

import '@/styles/design-system/tokens/index.css'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { AgoraProvider } from '@/hooks/use-agora'
import { AgoraAuthProvider } from '@/hooks/use-agora-auth'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { GraduationCap, Home, MessageSquare, BookOpen, Trophy, User } from 'lucide-react'

/**
 * Agora Layout
 *
 * Provides auth context for all Agora pages via AgoraProvider + AgoraAuthProvider.
 * Real authentication only - no demo mode.
 *
 * Use `useAgora()` hook in pages for user data and actions.
 * Use `useAgoraAuth()` hook for auth-specific operations (login, logout).
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-08 - Added AgoraAuthProvider for auth operations
 */

// Agora navigation items for mobile bottom nav
const agoraNavItems = [
  {
    id: 'dashboard',
    label: 'Inicio',
    path: '/pt/agora',
    icon: Home,
  },
  {
    id: 'chat',
    label: 'Chat',
    path: '/pt/agora/chat',
    icon: MessageSquare,
  },
  {
    id: 'diario',
    label: 'Diario',
    path: '/pt/agora/diario',
    icon: BookOpen,
  },
  {
    id: 'ranking',
    label: 'Ranking',
    path: '/pt/agora/ranking',
    icon: Trophy,
  },
  {
    id: 'perfil',
    label: 'Perfil',
    path: '/pt/agora/perfil',
    icon: User,
  },
]

function AgoraLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando Agora...</p>
      </div>
    </div>
  )
}

function AgoraLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useMobileDetection()
  const pathname = usePathname()

  // Don't show bottom nav on login page
  const isLoginPage = pathname === '/pt/agora/login'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Main content with bottom padding for mobile nav */}
      <div className={isMobile && !isLoginPage ? 'pb-20' : ''}>{children}</div>

      {/* Mobile Bottom Navigation - same as main app */}
      {isMobile && !isLoginPage && <BottomNavigation items={agoraNavItems} />}
    </div>
  )
}

export default function AgoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AgoraLoadingFallback />}>
      <AgoraAuthProvider>
        <AgoraProvider>
          <AgoraLayoutContent>{children}</AgoraLayoutContent>
        </AgoraProvider>
      </AgoraAuthProvider>
    </Suspense>
  )
}
