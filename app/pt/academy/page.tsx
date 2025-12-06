'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { useAcademyBackground } from '@/hooks/use-academy-background'
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
  BackgroundSelector,
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
  Palette,
} from 'lucide-react'

/**
 * Academy Dashboard Page
 *
 * Supports both real authentication and demo mode.
 * - Real auth: Users logged in via GitHub/Google
 * - Demo mode: URL param ?demo=true
 *
 * Visual Design: Bo Bardi + Santos-Dumont + Anderson
 * Light Mode: Tarsila do Amaral color palette
 * Dark Mode: Elegant gray theme
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

// Inner component that uses useSearchParams
function AcademyDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  // Detect dark mode from CSS media query
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches || document.documentElement.classList.contains('dark'))

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)

    // Also observe class changes on html element
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      mediaQuery.removeEventListener('change', handler)
      observer.disconnect()
    }
  }, [])

  // Auth hooks
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Background customization
  const {
    preference,
    getBackgroundStyles,
    getCurrentBackground,
    isLoaded: bgLoaded,
  } = useAcademyBackground()
  const currentBg = getCurrentBackground(isDark)
  const bgStyles = getBackgroundStyles(isDark)

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
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

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

  // Build background with optional overlay for images
  const hasImageBg = currentBg?.type === 'image'
  const overlayStyle =
    hasImageBg && preference.useOverlay
      ? {
          backgroundColor: isDark
            ? `rgba(23, 23, 23, ${preference.overlayOpacity})`
            : `rgba(255, 248, 231, ${preference.overlayOpacity})`,
        }
      : {}

  return (
    <div className="min-h-screen flex flex-col relative" style={bgStyles}>
      {/* Background overlay for image backgrounds */}
      {hasImageBg && preference.useOverlay && (
        <div className="fixed inset-0 pointer-events-none z-0" style={overlayStyle} />
      )}

      {/* Header */}
      <AcademyHeader user={user} onLogout={handleLogout} isDemoMode={isDemoMode} />

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <AcademySidebar user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Demo Mode Banner */}
            {isDemoMode && (
              <div className="mb-6 p-4 bg-tarsila-amarelo/10 dark:bg-yellow-900/20 border border-tarsila-ocre/30 dark:border-yellow-700/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  <span className="font-medium text-tarsila-terra dark:text-yellow-200">
                    Modo Demonstracao
                  </span>
                  <span className="text-sm text-tarsila-ocre dark:text-yellow-400/80">
                    - Os dados sao salvos apenas localmente
                  </span>
                </div>
              </div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold academy-text">
                    Ola, {user.name.split(' ')[0]}!
                  </h2>
                  <span className="text-2xl animate-bounce">👋</span>
                </div>
                {/* Customize Background Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackgroundSelector(true)}
                  className="hidden sm:flex items-center gap-2 text-tarsila-ocre hover:text-tarsila-amarelo dark:text-gray-400 dark:hover:text-yellow-400"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-sm">Personalizar</span>
                </Button>
              </div>
              <p className="academy-text-muted">
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
                {/* Mentor Section - Elegant Tarsila-inspired design */}
                <Card
                  variant="elevated"
                  padding="lg"
                  className="bg-gradient-to-br from-tarsila-creme via-white to-tarsila-rosa/30 dark:from-gray-800/90 dark:via-gray-900/90 dark:to-gray-800/90 border-tarsila-ocre/20 dark:border-gray-700/50 backdrop-blur-sm academy-shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Agent Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl academy-gradient flex items-center justify-center shadow-xl">
                        <span className="text-6xl sm:text-7xl">{academyAgent.emoji}</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-tarsila-verde dark:bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-tarsila-amarelo" />
                        <span className="text-sm font-medium text-tarsila-laranja dark:text-yellow-400">
                          Mentor IA
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold academy-text mb-2">{academyAgent.name}</h3>
                      <p className="academy-text-muted mb-4">{academyAgent.description}</p>

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
                            className="px-3 py-1 rounded-full text-xs font-medium bg-tarsila-verde/10 text-tarsila-verde dark:bg-green-900/30 dark:text-green-400 border border-tarsila-verde/20 dark:border-green-700/30"
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
                        className="academy-gradient hover:opacity-90 border-0"
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
                <Card variant="elevated" padding="md" className="academy-card backdrop-blur-sm">
                  <CardHeader className="mb-4">
                    <CardTitle className="flex items-center gap-2 text-lg academy-text">
                      <Trophy className="w-5 h-5 text-tarsila-amarelo dark:text-yellow-400" />
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

            {/* Designer Signature Footer */}
            <footer className="mt-12 pt-6 border-t border-tarsila-ocre/20 dark:border-gray-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm academy-text-muted">
                  <span className="designer-signature">
                    Design: Lina Bo Bardi + Santos-Dumont + Anderson
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs academy-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tarsila-amarelo" />
                    Paleta Tarsila do Amaral
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Cinza Elegante
                  </span>
                </div>
              </div>
              <p className="text-center text-xs academy-text-muted mt-4 opacity-60">
                Academy Cidadao.AI - Formando a proxima geracao de desenvolvedores brasileiros
              </p>
            </footer>
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
      <BackgroundSelector
        isOpen={showBackgroundSelector}
        onClose={() => setShowBackgroundSelector(false)}
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
