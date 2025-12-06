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

// Academy AI Agent
const academyAgent = {
  id: 'santos-dumont',
  name: 'Alberto Santos-Dumont',
  role: 'Mentor da Academy',
  emoji: '✈️',
  description:
    'O Pai da Aviacao e seu mentor na Academy! Santos-Dumont incentiva a inovacao, criatividade e persistencia.',
}

// Loading fallback
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

  // Detect dark mode
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', check)
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', check)
    }
  }, [])

  // Auth hooks
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Background customization
  const { currentBackground, getBackgroundStyle, getOverlayStyle, overlayEnabled } =
    useAcademyBackground()
  const bgStyle = getBackgroundStyle()
  const overlayStyle = getOverlayStyle(isDark)

  // Determine auth mode
  const isRealAuth = !isDemoMode && realAuth.isAuthenticated
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  // Get user data
  const user = useMemo(() => {
    if (isDemoMode) return demoAuth.user
    if (realAuth.isAuthenticated && realAuth.user) {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user.name)}&background=f59e0b&color=fff`
      return {
        ...demoAuth.user,
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

  // Modal states
  const [showContractModal, setShowContractModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (isDemoMode || realAuth.isLoading || realAuth.isAuthenticated) return
    const isOAuth =
      typeof window !== 'undefined' &&
      (window.location.search.includes('oauth_complete=') ||
        document.cookie.includes('oauth_session_ready=true'))
    if (isOAuth) {
      const timer = setTimeout(() => {
        if (!realAuth.isAuthenticated) router.replace('/pt/academy/login')
      }, 5000)
      return () => clearTimeout(timer)
    }
    router.replace('/pt/academy/login')
  }, [isDemoMode, realAuth.isLoading, realAuth.isAuthenticated, router])

  // LGPD modal
  useEffect(() => {
    if (isRealAuth && realAuth.user && !realAuth.user.hasAcceptedLgpd) {
      setShowLgpdModal(true)
    }
  }, [isRealAuth, realAuth.user])

  // Internship contract modal (demo)
  useEffect(() => {
    if (isDemoMode && !demoAuth.isLoading && !demoAuth.user.hasAcceptedInternshipContract) {
      setShowContractModal(true)
    }
  }, [isDemoMode, demoAuth.isLoading, demoAuth.user.hasAcceptedInternshipContract])

  // Badge check
  useEffect(() => {
    if (!isLoading) checkAndAwardBadges()
  }, [isLoading, user, checkAndAwardBadges])

  if (isLoading) return <LoadingFallback />

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

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpForNextRank = nextRank ? nextRank.minXp - user.totalXp : 0

  const handleLogout = async () => {
    if (isRealAuth) await realAuth.logout()
    else resetDemo()
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={bgStyle}>
      {/* Background overlay for images */}
      {overlayStyle && (
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
            {/* Demo Banner */}
            {isDemoMode && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Modo Demonstracao
                  </span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    - Os dados sao salvos apenas localmente
                  </span>
                </div>
              </div>
            )}

            {/* Welcome */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Ola, {user.name.split(' ')[0]}!
                  </h2>
                  <span className="text-2xl animate-bounce">👋</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackgroundSelector(true)}
                  className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
                >
                  <Palette className="w-4 h-4" />
                  Personalizar
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Pronto para mais uma sessao de aprendizado? Seu progresso esta incrivel!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
                        label: `Faltam ${xpForNextRank} XP`,
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

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Mentor Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <span className="text-5xl sm:text-6xl">{academyAgent.emoji}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          Mentor IA
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {academyAgent.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {academyAgent.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          'Duvidas de Codigo',
                          'Revisao de PRs',
                          'Arquitetura',
                          'Boas Praticas',
                        ].map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
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
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0"
                      >
                        Iniciar Conversa
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="lg:hidden">
                  <ActivityFeed activities={xpTransactions} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Acoes Rapidas</h3>
                  </div>
                  <div className="space-y-2">
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
                      label="Certificado"
                      description="Baixe seu certificado"
                      onClick={() => setShowCertificateModal(true)}
                      variant="gradient"
                    />
                  </div>
                </div>
                <div className="hidden lg:block">
                  <ActivityFeed activities={xpTransactions} />
                </div>
                <BadgeShowcase badges={badges} />
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Design: Bo Bardi + Dumont + Anderson
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Academy Cidadao.AI - Formando desenvolvedores brasileiros
                </p>
              </div>
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

export default function AcademyDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcademyDashboardContent />
    </Suspense>
  )
}
