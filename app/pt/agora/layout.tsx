'use client'

import '@/styles/design-system/tokens/index.css'

import { Suspense, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AgoraProvider, useAgora } from '@/hooks/use-agora'
import { AgoraAuthProvider } from '@/hooks/use-agora-auth'
import { AgoraHeader, CelebrationModal } from '@/components/agora'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { GraduationCap, Home, MessageSquare, BookOpen, Trophy, User } from 'lucide-react'

/**
 * Agora Layout
 *
 * Provides auth context for all Agora pages via AgoraProvider + AgoraAuthProvider.
 * Includes AgoraHeader for consistent navigation across all pages.
 * Real authentication only - no demo mode.
 *
 * Use `useAgora()` hook in pages for user data and actions.
 * Use `useAgoraAuth()` hook for auth-specific operations (login, logout).
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-08 - Added AgoraHeader to layout for consistency
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

// Pages that should NOT show the header
const noHeaderPages = ['/pt/agora/login', '/pt/agora/onboarding', '/pt/agora/contract']

// Pages that can be accessed without completing onboarding
const publicPages = ['/pt/agora/login', '/pt/agora/onboarding', '/pt/agora/contract']

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

// Header wrapper that uses the Agora hook
function AgoraHeaderWrapper() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAgora()

  const handleLogout = async () => {
    await logout()
    router.push('/pt/agora/login')
  }

  // Don't render header if not authenticated or no user
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <AgoraHeader
      user={{
        name: user.name,
        avatar: user.avatar,
        totalXp: user.totalXp,
        currentLevel: user.currentLevel,
        currentRank: user.currentRank,
      }}
      onLogout={handleLogout}
      isDemoMode={false}
    />
  )
}

// Onboarding protection component
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAgora()

  useEffect(() => {
    // Skip if still loading or on public pages
    if (isLoading) return
    const isPublicPage = publicPages.some((page) => pathname?.startsWith(page))
    if (isPublicPage) return

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.replace('/pt/agora/login')
      return
    }

    // Redirect to onboarding if not completed
    if (!user.hasCompletedOnboarding) {
      router.replace('/pt/agora/onboarding')
      return
    }

    // Redirect to contract if LGPD or terms not accepted
    if (!user.hasAcceptedLgpd || !user.hasAcceptedTerms) {
      router.replace('/pt/agora/contract')
      return
    }
  }, [isAuthenticated, isLoading, user, pathname, router])

  // Show loading while checking
  if (isLoading) {
    return <AgoraLoadingFallback />
  }

  // Allow public pages without checks
  const isPublicPage = publicPages.some((page) => pathname?.startsWith(page))
  if (isPublicPage) {
    return <>{children}</>
  }

  // Block render if requirements not met (redirect will happen via useEffect)
  if (!isAuthenticated || !user) {
    return <AgoraLoadingFallback />
  }

  if (!user.hasCompletedOnboarding || !user.hasAcceptedLgpd || !user.hasAcceptedTerms) {
    return <AgoraLoadingFallback />
  }

  return <>{children}</>
}

function AgoraLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useMobileDetection()
  const pathname = usePathname()

  // Check if we should show header
  const shouldShowHeader = !noHeaderPages.some((page) => pathname?.startsWith(page))
  const isLoginPage = pathname === '/pt/agora/login'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Global Header */}
      {shouldShowHeader && <AgoraHeaderWrapper />}

      {/* Main content with onboarding protection */}
      <OnboardingGuard>
        <div className={isMobile && !isLoginPage ? 'pb-20' : ''}>{children}</div>
      </OnboardingGuard>

      {/* Mobile Bottom Navigation - same as main app */}
      {isMobile && !isLoginPage && <BottomNavigation items={agoraNavItems} />}

      {/* Global Celebration Modal - uses store state */}
      <CelebrationModal />
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
