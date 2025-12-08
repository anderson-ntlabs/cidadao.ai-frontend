'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAgora } from '@/hooks/use-agora'
import { DashboardClient } from './_components/dashboard-client'
import { GraduationCap } from 'lucide-react'

/**
 * Academy Dashboard Page
 *
 * Design System v2 - Bo Bardi + Dumont + Anderson
 * Clean architecture with proper separation of concerns.
 * Uses unified useAgora hook for consistent data flow.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-07 - Migrated to unified useAgora hook
 */

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
      </div>
    </div>
  )
}

function AcademyDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoParam = searchParams.get('demo') === 'true'

  // Unified Agora hook - automatically handles real vs demo mode
  const {
    user,
    isAuthenticated,
    isLoading,
    isDemoMode,
    isRealAuth,
    badges,
    xpTransactions,
    logout,
  } = useAgora()

  // OAuth flow detection
  const [isOAuthFlow, setIsOAuthFlow] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  // Detect OAuth flow on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasOAuthParam = window.location.search.includes('oauth_complete=')
    const hasOAuthCookie = document.cookie.includes('oauth_session_ready=true')
    if (hasOAuthParam || hasOAuthCookie) {
      setIsOAuthFlow(true)
      // Increased timeout to 8 seconds to allow auth hook retries to complete
      const timer = setTimeout(() => setAuthCheckComplete(true), 8000)
      return () => clearTimeout(timer)
    } else {
      setAuthCheckComplete(true)
    }
  }, [])

  // Auth redirect - only redirect after OAuth timeout or if not in OAuth flow
  useEffect(() => {
    // Never redirect in demo mode
    if (isDemoParam || isDemoMode) return

    // Don't redirect while auth is loading
    if (isLoading) return

    // Authenticated - no redirect needed
    if (isRealAuth) return

    // In OAuth flow - wait for timeout before redirecting
    if (isOAuthFlow && !authCheckComplete) return

    // Not authenticated - redirect to login
    router.replace('/pt/agora/login')
  }, [isDemoParam, isDemoMode, isLoading, isRealAuth, isOAuthFlow, authCheckComplete, router])

  // Loading state
  if (isLoading || (isOAuthFlow && !authCheckComplete && !isRealAuth)) {
    return <LoadingFallback />
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // At this point, user is guaranteed to be non-null
  // Build user data from unified hook
  const dashboardUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar:
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff`,
    totalXp: user.totalXp,
    currentLevel: user.currentLevel,
    currentRank: user.currentRank,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak || 0,
    totalTimeMinutes: user.totalTimeMinutes,
    totalSessions: user.totalSessions,
    hasAcceptedLgpd: user.hasAcceptedLgpd,
  }

  // Build badges data
  const dashboardBadges = badges.map((b) => ({
    id: b.id,
    badge_id: b.id,
    badge_name: b.name,
    criteria: b.criteria,
    created_at: b.earnedAt || new Date().toISOString(),
  }))

  // Build XP transactions
  const dashboardXpTransactions = xpTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    description: tx.description,
    source_type: tx.sourceType || 'system',
    created_at: tx.createdAt,
  }))

  // Logout handler
  const handleLogout = async () => {
    await logout()
    if (isDemoMode) {
      router.push('/pt/agora/login')
    }
  }

  return (
    <DashboardClient
      user={dashboardUser}
      badges={dashboardBadges}
      xpTransactions={dashboardXpTransactions}
      isDemoMode={isDemoMode}
      onLogout={handleLogout}
    />
  )
}

export default function AcademyDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcademyDashboardContent />
    </Suspense>
  )
}
