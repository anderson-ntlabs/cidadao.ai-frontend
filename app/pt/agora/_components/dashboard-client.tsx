'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgoraBackground } from '@/hooks/use-agora-background'
import { Button } from '@/components/ui/button'
import { CertificateModal, LgpdConsentModal, BackgroundSelector } from '@/components/agora'
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
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Medal,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="min-h-screen relative" style={bgStyle}>
      {/* Background overlay */}
      {overlayStyle && (
        <div className="fixed inset-0 pointer-events-none z-0" style={overlayStyle} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Academy</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cidadao.AI</p>
              </div>
            </div>

            {/* XP Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-700/30">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-yellow-700 dark:text-yellow-400">
                {user.totalXp.toLocaleString()} XP
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setShowBackgroundSelector(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
              </button>
              <Avatar
                src={user.avatar}
                alt={user.name}
                fallbackName={user.name}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover"
              />
            </div>
          </div>
        </div>
      </header>

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

        {/* Hero Section - User Profile + Stats */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
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
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Mentor + Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mentor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
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
            </div>

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
                  label: 'Videos',
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
                  desc: 'Sua posicao',
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
            {/* Activity Feed */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Atividade Recente</h3>
              </div>

              {xpTransactions.length > 0 ? (
                <div className="space-y-3">
                  {xpTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                        {tx.description}
                      </p>
                      <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-sm font-bold text-green-700 dark:text-green-400">
                        +{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma atividade ainda
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Converse com o mentor!</p>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Badges</h3>
                {badges.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({badges.length})
                  </span>
                )}
              </div>

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
            </div>
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
  )
}
