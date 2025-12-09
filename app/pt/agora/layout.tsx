'use client'

import '@/styles/design-system/tokens/index.css'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AgoraProvider, useAgora } from '@/hooks/use-agora'
import { AgoraAuthProvider } from '@/hooks/use-agora-auth'
import { useKids } from '@/hooks/use-kids'
import { AgoraHeader, CelebrationModal, SessionManager, LogoutModal } from '@/components/agora'
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

// Kids area pages (use simplified header)
const kidsPages = ['/pt/agora/kids']

function AgoraLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center academy-bg">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="academy-text-muted">Carregando Ágora...</p>
      </div>
    </div>
  )
}

// Session cleanup on page close/refresh
function useSessionCleanup() {
  const { currentSession, endSession } = useAgora()
  const { isKidsMode, endSession: endKidsSession, isSessionActive } = useKids()

  useEffect(() => {
    const handleBeforeUnload = () => {
      // End Agora session
      if (currentSession) {
        // Use sendBeacon for reliable cleanup on page close
        navigator.sendBeacon(
          '/api/agora/end-session',
          JSON.stringify({
            sessionId: currentSession.id,
          })
        )
      }
      // End Kids session
      if (isKidsMode && isSessionActive) {
        navigator.sendBeacon(
          '/api/kids/end-session',
          JSON.stringify({
            timestamp: Date.now(),
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentSession, isKidsMode, isSessionActive])
}

// Header wrapper that uses the Agora hook with logout confirmation
function AgoraHeaderWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, endSession, currentSession } = useAgora()
  const { isKidsMode, childName, disableKidsMode } = useKids()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Check if we're on a kids page
  const isOnKidsPage = kidsPages.some((page) => pathname?.startsWith(page))

  const handleLogoutRequest = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    // End active session if exists
    if (currentSession) {
      await endSession()
    }
    // If in kids mode, just disable kids mode and redirect to agora
    if (isOnKidsPage && isKidsMode) {
      await disableKidsMode()
      router.push('/pt/agora')
      return
    }
    await logout()
    router.push('/pt/agora/login')
  }

  // Don't render header if not authenticated or no user
  if (!isAuthenticated || !user) {
    return null
  }

  // Calculate session duration in minutes
  const sessionDuration = currentSession
    ? Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000)
    : 0

  return (
    <>
      <AgoraHeader
        user={{
          name: user.name,
          avatar: user.avatar,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentRank: user.currentRank,
        }}
        onLogout={handleLogoutRequest}
        isDemoMode={false}
        isKidsMode={isOnKidsPage && isKidsMode}
        kidsChildName={childName || undefined}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        hasActiveSession={!!currentSession}
        sessionDuration={sessionDuration}
      />
    </>
  )
}

// Auth protection component (onboarding is now optional, shown on dashboard)
function AuthGuard({ children }: { children: React.ReactNode }) {
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

    // Redirect to contract if LGPD or terms not accepted
    // Note: Onboarding is now optional - users can access dashboard without it
    // Onboarding is required only for trilhas (learning tracks)
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

  // Only check LGPD/terms, not onboarding
  if (!user.hasAcceptedLgpd || !user.hasAcceptedTerms) {
    return <AgoraLoadingFallback />
  }

  return <>{children}</>
}

function AgoraLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useMobileDetection()
  const pathname = usePathname()

  // Setup session cleanup on page close
  useSessionCleanup()

  // Check if we should show header
  const shouldShowHeader = !noHeaderPages.some((page) => pathname?.startsWith(page))
  const isLoginPage = pathname === '/pt/agora/login'

  return (
    <div className="min-h-screen">
      {/* Global Header */}
      {shouldShowHeader && <AgoraHeaderWrapper />}

      {/* Main content with auth protection (onboarding is optional) */}
      <AuthGuard>
        <div className={isMobile && !isLoginPage ? 'pb-20' : ''}>{children}</div>
      </AuthGuard>

      {/* Mobile Bottom Navigation - same as main app */}
      {isMobile && !isLoginPage && <BottomNavigation items={agoraNavItems} />}

      {/* Global Celebration Modal - uses store state */}
      <CelebrationModal />

      {/* Session Manager - handles inactivity timeout */}
      <SessionManager timeoutMinutes={30} warningMinutes={5} enabled={true} />
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
