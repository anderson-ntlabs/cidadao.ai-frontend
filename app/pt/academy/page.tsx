'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import {
  AcademyHeader,
  AcademySidebar,
  StatCard,
  QuickActionCard,
  ActivityFeed,
  BadgeShowcase,
  InternshipContractModal,
  CertificateModal,
  LgpdConsentModal,
} from '@/components/academy'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Flame,
  Clock,
  MessageSquare,
  Video,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

/**
 * Academy Dashboard Page
 *
 * Supports both real authentication and demo mode.
 * - Real auth: Users logged in via GitHub/Google
 * - Demo mode: URL param ?demo=true
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */

// Rank configuration
const ranks = {
  novato: { name: 'Novato', color: 'gray', minXp: 0 },
  aprendiz: { name: 'Aprendiz', color: 'green', minXp: 100 },
  contribuidor: { name: 'Contribuidor', color: 'blue', minXp: 500 },
  mentor: { name: 'Mentor', color: 'purple', minXp: 2000 },
  arquiteto: { name: 'Arquiteto', color: 'yellow', minXp: 5000 },
}

// Academy AI Agent - Santos Dumont (single agent for mentorship)
const academyAgent = {
  id: 'santos-dumont',
  name: 'Alberto Santos-Dumont',
  role: 'Mentor da Academy',
  emoji: '✈️',
  avatar: '/agents/santos-dumont.png',
  specialty: 'Inovacao, engenharia criativa e apoio ao aprendizado',
  description:
    'O Pai da Aviacao e seu mentor na Academy! Santos-Dumont incentiva a inovacao, criatividade e persistencia. Tire duvidas tecnicas e receba orientacao para seus projetos.',
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
      </div>
    </div>
  )
}

// Inner component that uses useSearchParams
function AcademyDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  // Auth hooks
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Determine which auth to use
  const isRealAuth = !isDemoMode && realAuth.isAuthenticated
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  // Get user data based on auth mode
  const user = useMemo(() => {
    if (isDemoMode) {
      return demoAuth.user
    }
    if (realAuth.isAuthenticated && realAuth.user) {
      // Map real auth user to demo user format for compatibility
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user.name)}&background=16a34a&color=fff`
      return {
        ...demoAuth.user, // Keep demo defaults for missing fields
        id: realAuth.user.id,
        name: realAuth.user.name,
        email: realAuth.user.email,
        avatar: realAuth.user.avatar || defaultAvatar,
        totalXp: realAuth.user.totalXp,
        currentLevel: realAuth.user.currentLevel,
        currentRank: realAuth.user.currentRank,
        currentStreak: realAuth.user.currentStreak,
        totalTimeMinutes: realAuth.user.totalTimeMinutes,
        totalSessions: realAuth.user.totalSessions,
        hasAcceptedLgpd: realAuth.user.hasAcceptedLgpd,
      }
    }
    return demoAuth.user
  }, [isDemoMode, realAuth.isAuthenticated, realAuth.user, demoAuth.user])

  const { xpTransactions, badges, checkAndAwardBadges, resetDemo } = demoAuth

  const [showContractModal, setShowContractModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)

  // Redirect unauthenticated users to login (if not in demo mode)
  // But wait longer if coming from OAuth callback
  useEffect(() => {
    if (isDemoMode) return
    if (realAuth.isLoading) return
    if (realAuth.isAuthenticated) return

    // Check if we're coming from OAuth - give more time for session to establish
    const isOAuthComplete =
      typeof window !== 'undefined' &&
      (window.location.search.includes('oauth_complete=') ||
        document.cookie.includes('oauth_session_ready=true'))

    if (isOAuthComplete) {
      // Wait additional time before redirecting - the auth hook is still trying
      const timer = setTimeout(() => {
        // Re-check authentication status
        if (!realAuth.isAuthenticated) {
          console.log('[Academy] OAuth timeout - redirecting to login')
          router.replace('/pt/academy/login')
        }
      }, 5000) // 5 second grace period for OAuth

      return () => clearTimeout(timer)
    }

    // Not from OAuth - redirect immediately
    router.replace('/pt/academy/login')
  }, [isDemoMode, realAuth.isLoading, realAuth.isAuthenticated, router])

  // Show LGPD consent modal for authenticated users who haven't accepted
  useEffect(() => {
    if (isRealAuth && realAuth.user && !realAuth.user.hasAcceptedLgpd) {
      setShowLgpdModal(true)
    }
  }, [isRealAuth, realAuth.user])

  // Show internship contract modal for demo mode on first access
  useEffect(() => {
    if (isDemoMode && !demoAuth.isLoading && !demoAuth.user.hasAcceptedInternshipContract) {
      setShowContractModal(true)
    }
  }, [isDemoMode, demoAuth.isLoading, demoAuth.user.hasAcceptedInternshipContract])

  // Check for badge eligibility whenever user data changes
  useEffect(() => {
    if (!isLoading) {
      checkAndAwardBadges()
    }
  }, [isLoading, user, checkAndAwardBadges])

  if (isLoading) {
    return <LoadingFallback />
  }

  // If not demo and not authenticated, show loading (redirect will happen)
  if (!isDemoMode && !realAuth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpForNextRank = nextRank ? nextRank.minXp - user.totalXp : 0

  const handleLogout = async () => {
    if (isRealAuth) {
      await realAuth.logout()
    } else {
      resetDemo()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <AcademyHeader user={user} onLogout={handleLogout} isDemoMode={isDemoMode} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AcademySidebar user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Demo Mode Banner */}
            {isDemoMode && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    Modo Demonstracao
                  </span>
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    - Os dados sao salvos apenas localmente
                  </span>
                </div>
              </div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Ola, {user.name.split(' ')[0]}!
                </h2>
                <span className="text-2xl animate-bounce">👋</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Pronto para mais uma sessao de aprendizado? Seu progresso esta incrivel!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Trophy}
                value={`Lv.${user.currentLevel}`}
                label={rankInfo.name}
                iconColor="green"
                progress={
                  nextRank
                    ? {
                        current: user.totalXp,
                        max: nextRank.minXp,
                        label: `Faltam ${xpForNextRank} XP para ${nextRank.name}`,
                      }
                    : undefined
                }
              />

              <StatCard
                icon={Flame}
                value={user.currentStreak}
                label="Dias seguidos"
                sublabel={
                  user.longestStreak > user.currentStreak
                    ? `Recorde: ${user.longestStreak}`
                    : undefined
                }
                iconColor="orange"
              />

              <StatCard
                icon={Clock}
                value={`${Math.floor(user.totalTimeMinutes / 60)}h`}
                label="Total de estudo"
                sublabel={`${user.totalTimeMinutes % 60}min acumulados`}
                iconColor="blue"
              />

              <StatCard
                icon={MessageSquare}
                value={user.totalSessions}
                label="Sessoes"
                iconColor="purple"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Mentor Agent - Featured Card - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Mentor Section */}
                <Card
                  variant="elevated"
                  padding="lg"
                  className="bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-900 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/30"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Agent Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center shadow-xl">
                        <span className="text-6xl sm:text-7xl">{academyAgent.emoji}</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          Mentor IA
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {academyAgent.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {academyAgent.description}
                      </p>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {[
                          'Duvidas de Codigo',
                          'Revisao de PRs',
                          'Arquitetura',
                          'Boas Praticas',
                        ].map((cap) => (
                          <span
                            key={cap}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        size="lg"
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                        onClick={() =>
                          (window.location.href = `/pt/academy/chat?agent=${academyAgent.id}${isDemoMode ? '&demo=true' : ''}`)
                        }
                      >
                        Iniciar Conversa
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Activity Feed - Mobile/Tablet */}
                <div className="lg:hidden">
                  <ActivityFeed activities={xpTransactions} />
                </div>
              </div>

              {/* Sidebar Content - 1 column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card variant="elevated" padding="md">
                  <CardHeader className="mb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Acoes Rapidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <QuickActionCard
                      icon="🧭"
                      label="Minhas Trilhas"
                      description="Gerencie suas trilhas"
                      href={`/pt/academy/trilhas${isDemoMode ? '?demo=true' : ''}`}
                    />
                    <QuickActionCard
                      icon={Video}
                      label="Assistir videos"
                      description="Continue seu progresso"
                      href={`/pt/academy/videos${isDemoMode ? '?demo=true' : ''}`}
                    />
                    <QuickActionCard
                      icon={FileText}
                      label="Leituras obrigatorias"
                      description="Material essencial"
                      href={`/pt/academy/leituras${isDemoMode ? '?demo=true' : ''}`}
                    />
                    <QuickActionCard
                      icon={Trophy}
                      label="Ver ranking"
                      description="Sua posicao atual"
                      href={`/pt/academy/ranking${isDemoMode ? '?demo=true' : ''}`}
                    />
                    <QuickActionCard
                      icon={GraduationCap}
                      label="Certificado e Relatorio"
                      description="Baixe seu certificado"
                      onClick={() => setShowCertificateModal(true)}
                      variant="gradient"
                    />
                  </CardContent>
                </Card>

                {/* Activity Feed - Desktop */}
                <div className="hidden lg:block">
                  <ActivityFeed activities={xpTransactions} />
                </div>

                {/* Badges */}
                <BadgeShowcase badges={badges} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <InternshipContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
      />
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
      <LgpdConsentModal
        isOpen={showLgpdModal}
        onClose={() => setShowLgpdModal(false)}
        useRealAuth={isRealAuth}
      />
    </div>
  )
}

// Main export with Suspense boundary for useSearchParams
export default function AcademyDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcademyDashboardContent />
    </Suspense>
  )
}
