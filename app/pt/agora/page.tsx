'use client'

import { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAgora } from '@/hooks/use-agora'
import { createClient } from '@/lib/supabase/client'
import { DashboardClient } from './_components/dashboard-client'
import { GraduationCap } from 'lucide-react'

/**
 * Academy Dashboard Page
 *
 * Real authentication only - no demo mode.
 * Uses unified useAgora hook for consistent data flow.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-09 - Fix OAuth redirect stuck on loading
 */

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center academy-bg">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="academy-text-muted">Carregando dashboard...</p>
      </div>
    </div>
  )
}

function AcademyDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { user, isAuthenticated, isLoading, badges, xpTransactions, logout, refreshUser } =
    useAgora()

  // Handle OAuth completion - force session refresh
  useEffect(() => {
    const oauthComplete = searchParams.get('oauth_complete')
    if (oauthComplete && !isAuthenticated && !isRefreshing) {
      setIsRefreshing(true)
      // Force refresh after OAuth redirect to ensure session is synced
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Session exists, refresh user data
          refreshUser?.()
        }
        // Clean URL by removing oauth_complete param
        const url = new URL(window.location.href)
        url.searchParams.delete('oauth_complete')
        window.history.replaceState({}, '', url.toString())
        setIsRefreshing(false)
      })
    }
  }, [searchParams, isAuthenticated, isRefreshing, refreshUser])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Loading state
  if (isLoading) {
    return <LoadingFallback />
  }

  // Not authenticated - show redirect message
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center academy-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="academy-text-muted">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Build user data for dashboard
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
    hasCompletedOnboarding: user.hasCompletedOnboarding,
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
    router.push('/pt/agora/login')
  }

  return (
    <DashboardClient
      user={dashboardUser}
      badges={dashboardBadges}
      xpTransactions={dashboardXpTransactions}
      isDemoMode={false}
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
