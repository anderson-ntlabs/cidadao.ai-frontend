'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAgoraAuth } from '@/hooks/use-agora-auth'
import { useAgoraDemo } from '@/hooks/use-agora-demo'
import { DashboardClient } from './_components/dashboard-client'
import { GraduationCap } from 'lucide-react'

/**
 * Academy Dashboard Page
 *
 * Design System v2 - Bo Bardi + Dumont + Anderson
 * Clean architecture with proper separation of concerns.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
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
  const isDemoMode = searchParams.get('demo') === 'true'

  // Auth hooks
  const realAuth = useAgoraAuth()
  const demoAuth = useAgoraDemo()

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
      const timer = setTimeout(() => setAuthCheckComplete(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setAuthCheckComplete(true)
    }
  }, [])

  // Auth redirect
  useEffect(() => {
    if (isDemoMode || realAuth.isLoading) return
    if (realAuth.isAuthenticated) return
    if (isOAuthFlow && !authCheckComplete) return
    router.replace('/pt/agora/login')
  }, [
    isDemoMode,
    realAuth.isLoading,
    realAuth.isAuthenticated,
    isOAuthFlow,
    authCheckComplete,
    router,
  ])

  // Loading state
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading
  if (isLoading || (isOAuthFlow && !authCheckComplete && !realAuth.isAuthenticated)) {
    return <LoadingFallback />
  }

  // Not authenticated
  if (!isDemoMode && !realAuth.isAuthenticated) {
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

  // Build user data
  const user = isDemoMode
    ? {
        id: demoAuth.user.id,
        name: demoAuth.user.name,
        email: demoAuth.user.email,
        avatar: demoAuth.user.avatar,
        totalXp: demoAuth.user.totalXp,
        currentLevel: demoAuth.user.currentLevel,
        currentRank: demoAuth.user.currentRank,
        currentStreak: demoAuth.user.currentStreak,
        longestStreak: demoAuth.user.longestStreak || 0,
        totalTimeMinutes: demoAuth.user.totalTimeMinutes,
        totalSessions: demoAuth.user.totalSessions,
        hasAcceptedLgpd: demoAuth.user.hasAcceptedInternshipContract,
      }
    : {
        id: realAuth.user!.id,
        name: realAuth.user!.name,
        email: realAuth.user!.email,
        avatar:
          realAuth.user!.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user!.name)}&background=f59e0b&color=fff`,
        totalXp: realAuth.user!.totalXp,
        currentLevel: realAuth.user!.currentLevel,
        currentRank: realAuth.user!.currentRank,
        currentStreak: realAuth.user!.currentStreak,
        longestStreak: 0,
        totalTimeMinutes: realAuth.user!.totalTimeMinutes,
        totalSessions: realAuth.user!.totalSessions,
        hasAcceptedLgpd: realAuth.user!.hasAcceptedLgpd,
      }

  // Build badges data
  const badges = isDemoMode
    ? demoAuth.badges.map((b) => ({
        id: b.id,
        badge_id: b.id,
        badge_name: b.name,
        criteria: b.criteria,
        created_at: b.earnedAt || new Date().toISOString(),
      }))
    : []

  // Build XP transactions
  const xpTransactions = isDemoMode
    ? demoAuth.xpTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        source_type: tx.sourceType || 'system',
        created_at: tx.createdAt,
      }))
    : []

  // Logout handler
  const handleLogout = async () => {
    if (isDemoMode) {
      demoAuth.resetDemo()
      router.push('/pt/agora/login')
    } else {
      await realAuth.logout()
    }
  }

  return (
    <DashboardClient
      user={user}
      badges={badges}
      xpTransactions={xpTransactions}
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
