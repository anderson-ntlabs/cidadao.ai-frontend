'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAgoraBackground } from '@/hooks/use-agora-background'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import {
  CertificateModal,
  LgpdConsentModal,
  BackgroundSelector,
  AgoraHeader,
} from '@/components/agora'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  Trophy,
  Flame,
  Clock,
  MessageSquare,
  Video,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Palette,
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Medal,
  Filter,
  Activity,
  ArrowUpRight,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/utils/logger'
import { toast } from '@/hooks/use-toast'

// Lazy load ActivityTimeline (same as main app)
const ActivityTimeline = dynamic(
  () => import('@/components/activity').then((mod) => ({ default: mod.ActivityTimeline })),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
)

/**
 * Academy Dashboard Client Component
 *
 * New Design System v2 - Bo Bardi + Dumont + Anderson
 * Clean, modern, with better visual hierarchy.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

// Avatar component with error fallback
function Avatar({
  src,
  alt,
  className,
  fallbackName,
}: {
  src?: string
  alt: string
  className?: string
  fallbackName: string
}) {
  const [error, setError] = useState(false)
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=f59e0b&color=fff&size=256`

  return (
    <img
      src={error || !src ? fallbackUrl : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  )
}

interface DashboardUser {
  id: string
  name: string
  email: string
  avatar?: string
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  longestStreak: number
  totalTimeMinutes: number
  totalSessions: number
  hasAcceptedLgpd: boolean
}

interface Badge {
  id: string
  badge_id: string
  badge_name: string
  criteria: string
  created_at: string
}

interface XpTransaction {
  id: string
  amount: number
  description: string
  source_type: string
  created_at: string
}

interface DashboardClientProps {
  user: DashboardUser
  badges: Badge[]
  xpTransactions: XpTransaction[]
  isDemoMode: boolean
  onLogout: () => Promise<void>
}

// Rank configuration
const ranks = {
  novato: { name: 'Novato', color: 'gray', minXp: 0, emoji: '🌱' },
  aprendiz: { name: 'Aprendiz', color: 'green', minXp: 100, emoji: '📚' },
  contribuidor: { name: 'Contribuidor', color: 'blue', minXp: 500, emoji: '🔧' },
  mentor: { name: 'Mentor', color: 'purple', minXp: 2000, emoji: '🎓' },
  arquiteto: { name: 'Arquiteto', color: 'yellow', minXp: 5000, emoji: '🏛️' },
}

// Badge emoji mapping
const badgeEmojis: Record<string, string> = {
  pioneiro: '🚀',
  explorador: '🧭',
  dedicado: '⭐',
  japaguri: '🍜',
  cinefilo: '🎬',
  leitor: '📚',
}

export function DashboardClient({
  user,
  badges,
  xpTransactions,
  isDemoMode,
  onLogout,
}: DashboardClientProps) {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

  // Background customization
  const { currentBackground, getBackgroundStyle, getOverlayStyle } = useAgoraBackground()
  const bgStyle = getBackgroundStyle()
  const overlayStyle = getOverlayStyle(isDark)

  // Detect dark mode
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
    return () => observer.disconnect()
  }, [])

  // Show LGPD modal if not accepted
  useEffect(() => {
    if (!user.hasAcceptedLgpd && !isDemoMode) {
      setShowLgpdModal(true)
    }
  }, [user.hasAcceptedLgpd, isDemoMode])

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpProgress = nextRank
    ? ((user.totalXp - rankInfo.minXp) / (nextRank.minXp - rankInfo.minXp)) * 100
    : 100

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Dashboard error:', { error, errorInfo })
        toast.error('Erro no Dashboard', 'Ocorreu um erro ao carregar o dashboard.')
      }}
    >
      <div className="min-h-screen relative" style={bgStyle}>
        {/* Background overlay */}
        {overlayStyle && (
          <div className="fixed inset-0 pointer-events-none z-0" style={overlayStyle} />
        )}

        {/* Header - Using shared AgoraHeader component (same as main app pattern) */}
        <AgoraHeader
          user={{
            name: user.name,
            avatar: user.avatar,
            totalXp: user.totalXp,
            currentLevel: user.currentLevel,
            currentRank: user.currentRank,
          }}
          onLogout={onLogout}
          isDemoMode={isDemoMode}
        />

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Demo Banner */}
          {isDemoMode && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Modo Demonstracao
                  </span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">
                    Dados salvos apenas localmente
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section - User Profile + Stats (Using GlassCard like main app) */}
          <div className="mb-8">
            <GlassCard className="overflow-hidden">
              {/* Gradient Header */}
              <div className="h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative">
                <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-20" />
              </div>

              {/* Profile Content */}
              <div className="px-6 sm:px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      fallbackName={user.name}
                      className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl object-cover bg-gray-100 dark:bg-gray-800"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                      {rankInfo.emoji}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 pt-4 sm:pt-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Ola, {user.name.split(' ')[0]}! 👋
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Level {user.currentLevel} - {rankInfo.name}
                      </span>
                      {nextRank && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {nextRank.minXp - user.totalXp} XP para {nextRank.name}
                        </span>
                      )}
                    </div>

                    {/* XP Progress */}
                    <div className="mt-4 max-w-md">
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats Mini */}
                  <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                        <Flame className="w-6 h-6 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.currentStreak}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(user.totalTimeMinutes / 60)}h
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Estudo</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                        <MessageSquare className="w-6 h-6 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.totalSessions}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sessoes</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Mentor + Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mentor Card */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Mentor IA disponivel
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-5xl shadow-lg flex-shrink-0">
                    ✈️
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Alberto Santos-Dumont
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      O Pai da Aviacao e seu mentor na Academy! Incentiva inovacao, criatividade e
                      persistencia.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Codigo', 'PRs', 'Arquitetura', 'Boas Praticas'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/pt/agora/chat?agent=santos-dumont${isDemoMode ? '&demo=true' : ''}`
                        )
                      }
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Iniciar Conversa
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Onboarding Card - Always visible for revisiting */}
              <Link
                href={`/pt/agora/onboarding${isDemoMode ? '?demo=true' : ''}`}
                className="block p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                    📽️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Apresentação Ágora
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        NOVO
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reveja nossa apresentação completa com 40 slides
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Quick Actions Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Target,
                    emoji: '🧭',
                    label: 'Minhas Trilhas',
                    desc: 'Progresso e conquistas',
                    href: '/pt/agora/trilhas',
                    color: 'green',
                  },
                  {
                    icon: Video,
                    emoji: '🎬',
                    label: 'Vídeos',
                    desc: 'Continue assistindo',
                    href: '/pt/agora/videos',
                    color: 'blue',
                  },
                  {
                    icon: BookOpen,
                    emoji: '📚',
                    label: 'Leituras',
                    desc: 'Material essencial',
                    href: '/pt/agora/leituras',
                    color: 'purple',
                  },
                  {
                    icon: Trophy,
                    emoji: '🏆',
                    label: 'Ranking',
                    desc: 'Sua posição',
                    href: '/pt/agora/ranking',
                    color: 'yellow',
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={`${action.href}${isDemoMode ? '?demo=true' : ''}`}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all group"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                        action.color === 'green' && 'bg-green-100 dark:bg-green-900/30',
                        action.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                        action.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30',
                        action.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30'
                      )}
                    >
                      {action.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>

              {/* Certificate CTA */}
              <button
                onClick={() => setShowCertificateModal(true)}
                className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white text-left hover:from-green-600 hover:to-emerald-700 transition-all group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                    🎓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Certificado de Conclusao</h3>
                    <p className="text-green-100 text-sm">
                      Baixe seu certificado com QR Code verificavel
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </div>

            {/* Right Column - Activity + Badges */}
            <div className="space-y-6">
              {/* Activity Feed - Using same pattern as main app */}
              <GlassCard>
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Atividade Recente
                    </h2>
                  </div>
                </GlassCardHeader>

                <GlassCardContent>
                  {/* Convert XP transactions to activity format for ActivityTimeline */}
                  <ActivityTimeline
                    activities={xpTransactions.slice(0, 5).map((tx) => ({
                      id: tx.id,
                      user_id: user.id,
                      type: 'chat' as const,
                      title: tx.description,
                      description: `+${tx.amount} XP`,
                      created_at: tx.created_at,
                    }))}
                    isLoading={false}
                    emptyMessage="Nenhuma atividade ainda. Converse com o mentor!"
                    maxItems={5}
                  />

                  <Button
                    variant="secondary"
                    className="w-full mt-4"
                    onClick={() => router.push(`/pt/agora/chat${isDemoMode ? '?demo=true' : ''}`)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Conversar com Mentores
                  </Button>
                </GlassCardContent>
              </GlassCard>

              {/* Badges - Using GlassCard */}
              <GlassCard>
                <GlassCardHeader>
                  <div className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Badges</h3>
                    {badges.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({badges.length})
                      </span>
                    )}
                  </div>
                </GlassCardHeader>

                <GlassCardContent>
                  {badges.length > 0 ? (
                    <div className="space-y-3">
                      {badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-700/30"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow">
                            {badgeEmojis[badge.badge_id] || '🏅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {badge.badge_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {badge.criteria}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 mx-auto rounded-xl bg-yellow-100/50 dark:bg-yellow-900/20 flex items-center justify-center mb-3">
                        <span className="text-3xl">🍜</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Seja assiduo para ganhar Japaguri!
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        3+ dias, 5+ sessoes ou 3+ diarios
                      </p>
                    </div>
                  )}

                  {/* Locked badges preview */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                      Proximos badges
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {['🍜', '🚀', '⭐', '🎬']
                        .filter((e) => !badges.some((b) => badgeEmojis[b.badge_id] === e))
                        .slice(0, 4)
                        .map((emoji, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl opacity-40 grayscale"
                          >
                            {emoji}
                          </div>
                        ))}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic font-serif">
                Design: Bo Bardi + Dumont + Anderson
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Academy Cidadao.AI - Formando desenvolvedores brasileiros
              </p>
            </div>
          </footer>
        </main>

        {/* Modals */}
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
        <LgpdConsentModal
          isOpen={showLgpdModal}
          onClose={() => setShowLgpdModal(false)}
          useRealAuth={!isDemoMode}
        />
        <BackgroundSelector
          isOpen={showBackgroundSelector}
          onClose={() => setShowBackgroundSelector(false)}
        />
      </div>
    </ErrorBoundary>
  )
}
