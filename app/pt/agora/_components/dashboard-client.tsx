'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgoraBackground } from '@/hooks/use-agora-background'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import {
  CertificateModal,
  LgpdConsentModal,
  BackgroundSelector,
  TimelineCard,
  TimelineModal,
  GamificationCard,
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
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Medal,
  ArrowUpRight,
  Users,
  TrendingUp,
} from 'lucide-react'
import { logger } from '@/lib/utils/logger'
import { toast } from '@/hooks/use-toast'

/**
 * Academy Dashboard Client Component
 *
 * Design System v3 - Sober & Professional
 * Clean, modern design with cohesive color palette for learning platform.
 * Primary accent: Emerald (growth, learning)
 * Secondary: Slate tones for professional look
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-08
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
  hasCompletedOnboarding?: boolean
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

interface DiaryEntry {
  id: string
  content: string
  mood: string
  what_learned: string
  what_struggled: string
  next_steps: string
  entry_date: string
  created_at: string
}

interface StudySession {
  id: string
  started_at: string
  ended_at?: string
  duration_minutes: number
  xp_earned: number
  status: string
}

interface DashboardClientProps {
  user: DashboardUser
  badges: Badge[]
  xpTransactions: XpTransaction[]
  diaryEntries?: DiaryEntry[]
  sessions?: StudySession[]
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

// Track definitions for "Continue Track" card
const TRACKS_INFO = {
  introducao: {
    id: 'introducao',
    name: 'Introducao',
    icon: '🎓',
    color: 'emerald',
    totalModules: 6,
  },
  backend: {
    id: 'backend',
    name: 'Backend',
    icon: '🖥️',
    color: 'blue',
    totalModules: 6,
  },
  frontend: {
    id: 'frontend',
    name: 'Frontend',
    icon: '🎨',
    color: 'purple',
    totalModules: 6,
  },
  ia: {
    id: 'ia',
    name: 'IA/ML',
    icon: '🧠',
    color: 'green',
    totalModules: 7,
  },
  devops: {
    id: 'devops',
    name: 'DevOps',
    icon: '⚙️',
    color: 'orange',
    totalModules: 6,
  },
} as const

type TrackId = keyof typeof TRACKS_INFO

export function DashboardClient({
  user,
  badges,
  xpTransactions,
  diaryEntries = [],
  sessions = [],
  isDemoMode,
  onLogout,
}: DashboardClientProps) {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showLgpdModal, setShowLgpdModal] = useState(false)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [lastTrack, setLastTrack] = useState<{ trackId: TrackId; moduleId: number } | null>(null)

  // Load last accessed track from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agora_last_track')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.trackId && TRACKS_INFO[parsed.trackId as TrackId]) {
          setLastTrack(parsed)
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Background customization
  const { currentBackground, getBackgroundStyle, getOverlayStyle } = useAgoraBackground()
  const bgStyle = getBackgroundStyle()
  const overlayStyle = getOverlayStyle(isDark)

  // Detect dark mode - ONLY check the app's theme class, NOT system preference
  // The app theme is controlled by the 'dark' class on documentElement
  // System preference (prefers-color-scheme) should NOT override user's app choice
  useEffect(() => {
    const check = () => {
      // Only check the actual class on the document, not system preference
      setIsDark(document.documentElement.classList.contains('dark'))
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

  // Convert data for Timeline components
  const timelineXpTransactions = useMemo(
    () =>
      xpTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        balanceAfter: 0, // Not available in this format
        sourceType: tx.source_type,
        description: tx.description,
        createdAt: tx.created_at,
      })),
    [xpTransactions]
  )

  const timelineDiaryEntries = useMemo(
    () =>
      diaryEntries.map((entry) => ({
        id: entry.id,
        content: entry.content,
        mood: entry.mood as 'great' | 'good' | 'neutral' | 'struggling',
        whatLearned: entry.what_learned || '',
        whatStruggled: entry.what_struggled || '',
        nextSteps: entry.next_steps || '',
        entryDate: entry.entry_date,
        createdAt: entry.created_at,
      })),
    [diaryEntries]
  )

  const timelineSessions = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        durationMinutes: session.duration_minutes,
        xpEarned: session.xp_earned,
        agentsUsed: [] as string[],
        status: session.status as 'active' | 'completed' | 'abandoned',
      })),
    [sessions]
  )

  const timelineBadges = useMemo(
    () =>
      badges.map((badge) => ({
        id: badge.id,
        type: badge.badge_id,
        name: badge.badge_name,
        description: badge.criteria,
        emoji: badgeEmojis[badge.badge_id] || '🏅',
        earnedAt: badge.created_at,
        criteria: badge.criteria,
      })),
    [badges]
  )

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

        {/* Header is now provided by the layout */}

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl my-4 shadow-xl">
          {/* Demo Banner */}
          {isDemoMode && (
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Modo Demo
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  • Dados salvos localmente
                </span>
              </div>
            </div>
          )}

          {/* Onboarding CTA - Prominent when not completed */}
          {!user.hasCompletedOnboarding && (
            <Link
              href={`/pt/agora/onboarding${isDemoMode ? '?demo=true' : ''}`}
              className="block mb-6 p-6 bg-emerald-600 dark:bg-emerald-700 rounded-2xl text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                  🚀
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Complete o Onboarding</h3>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/20">
                      RECOMENDADO
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-2">
                    Conheca a plataforma Agora através da apresentacao interativa.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Requisito para Trilhas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      +50 XP
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Hero Section - User Profile + Stats */}
          <div className="mb-8">
            <GlassCard className="overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              {/* Profile Content */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      fallbackName={user.name}
                      className="w-20 h-20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 shadow-md object-cover bg-slate-100 dark:bg-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-sm shadow-md">
                      {rankInfo.emoji}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold academy-text">
                      Olá, {user.name.split(' ')[0]}!
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        Level {user.currentLevel} • {rankInfo.name}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 academy-text">
                        {user.totalXp.toLocaleString()} XP
                      </span>
                      {nextRank && (
                        <span className="text-xs academy-text-muted">
                          {nextRank.minXp - user.totalXp} XP para {nextRank.name}
                        </span>
                      )}
                    </div>

                    {/* XP Progress */}
                    <div className="mt-3 max-w-sm">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats Mini - Now with unified colors */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 mx-auto rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-1.5">
                        <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-xl font-bold academy-text">{user.currentStreak}</p>
                      <p className="text-[10px] academy-text-muted uppercase tracking-wide">
                        Streak
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 mx-auto rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5">
                        <Clock className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-xl font-bold academy-text">
                        {Math.floor(user.totalTimeMinutes / 60)}h
                      </p>
                      <p className="text-[10px] academy-text-muted uppercase tracking-wide">
                        Estudo
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 mx-auto rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1.5">
                        <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-xl font-bold academy-text">{user.totalSessions}</p>
                      <p className="text-[10px] academy-text-muted uppercase tracking-wide">
                        Sessoes
                      </p>
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
              {/* Mentors Card - Santos-Dumont & Lina Bo Bardi */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium academy-text">Mentores IA</span>
                  </div>
                  <span className="text-xs academy-text-muted">2 disponiveis</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Santos-Dumont */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src="/agents/santos-dumont.png"
                          alt="Santos-Dumont"
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xs">
                          ✈️
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold academy-text text-sm">Santos-Dumont</h3>
                        <p className="text-xs academy-text-muted mb-2">Backend & Arquitetura</p>
                        <div className="flex flex-wrap gap-1">
                          {['Codigo', 'PRs', 'Arquitetura'].map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-200 dark:bg-slate-700 academy-text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/pt/agora/chat?agent=santos-dumont${isDemoMode ? '&demo=true' : ''}`
                        )
                      }
                      size="sm"
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Conversar
                    </Button>
                  </div>

                  {/* Lina Bo Bardi */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src="/agents/Lina_Bo_Bardi.jpg"
                          alt="Lina Bo Bardi"
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-xs">
                          🏛️
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold academy-text text-sm">Lina Bo Bardi</h3>
                        <p className="text-xs academy-text-muted mb-2">Design & Frontend</p>
                        <div className="flex flex-wrap gap-1">
                          {['Design', 'UX/UI', 'Cultura'].map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-200 dark:bg-slate-700 academy-text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/pt/agora/chat?agent=lina-bo-bardi${isDemoMode ? '&demo=true' : ''}`
                        )
                      }
                      size="sm"
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Conversar
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Continue Track Card - Shows last accessed track */}
              {lastTrack && TRACKS_INFO[lastTrack.trackId] && (
                <Link
                  href={`/pt/agora/trilhas/${lastTrack.trackId}/${lastTrack.moduleId}${isDemoMode ? '?demo=true' : ''}`}
                  className="block p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xl">
                      {TRACKS_INFO[lastTrack.trackId].icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-emerald-900 dark:text-emerald-100 text-sm">
                          Continuar Trilha
                        </h3>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300">
                          Em progresso
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        {TRACKS_INFO[lastTrack.trackId].name} - Modulo {lastTrack.moduleId}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}

              {/* Onboarding Card - Only visible when completed (for revisiting) */}
              {user.hasCompletedOnboarding && (
                <Link
                  href={`/pt/agora/onboarding?preview=true${isDemoMode ? '&demo=true' : ''}`}
                  className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">
                      📽️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium academy-text text-sm">Apresentacao Agora</h3>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          Concluido
                        </span>
                      </div>
                      <p className="text-xs academy-text-muted">Reveja a apresentacao do projeto</p>
                    </div>
                    <ChevronRight className="w-4 h-4 academy-text-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              )}

              {/* Contract Card - View signed contract */}
              <Link
                href="/pt/agora/contract"
                className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">
                    📜
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium academy-text text-sm">Termo de Compromisso</h3>
                      <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-200 dark:bg-slate-600 academy-text-muted">
                        LGPD
                      </span>
                    </div>
                    <p className="text-xs academy-text-muted">Reveja seu contrato e baixe o PDF</p>
                  </div>
                  <ChevronRight className="w-4 h-4 academy-text-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              {/* Quick Actions Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: Target,
                    label: 'Trilhas',
                    desc: 'Cursos',
                    href: '/pt/agora/trilhas',
                    external: false,
                  },
                  {
                    icon: Clock,
                    label: 'Diario',
                    desc: 'Agenda',
                    href: '/pt/agora/diario',
                    external: false,
                  },
                  {
                    icon: TrendingUp,
                    label: 'Atividades',
                    desc: 'Historico',
                    href: '/pt/agora/atividades',
                    external: false,
                  },
                  {
                    icon: Trophy,
                    label: 'Ranking',
                    desc: 'Posicao',
                    href: '/pt/agora/ranking',
                    external: false,
                  },
                  {
                    icon: Video,
                    label: 'Videos',
                    desc: 'Assistir',
                    href: '/pt/agora/videos',
                    external: false,
                  },
                  {
                    icon: BookOpen,
                    label: 'Leituras',
                    desc: 'Material',
                    href: '/pt/agora/leituras',
                    external: false,
                  },
                  {
                    icon: Users,
                    label: 'Perfil',
                    desc: 'Conta',
                    href: '/pt/agora/perfil',
                    external: false,
                  },
                  {
                    icon: MessageSquare,
                    label: 'Discord',
                    desc: 'Comunidade',
                    href: 'https://discord.gg/TCdNN6gZ',
                    external: true,
                  },
                ].map((action) =>
                  action.external ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <action.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium academy-text text-sm">{action.label}</p>
                        <p className="text-xs academy-text-muted">{action.desc}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 academy-text-muted group-hover:text-emerald-600 transition-colors" />
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={`${action.href}${isDemoMode ? '?demo=true' : ''}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <action.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium academy-text text-sm">{action.label}</p>
                        <p className="text-xs academy-text-muted">{action.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 academy-text-muted group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  )
                )}
              </div>

              {/* Certificate CTA */}
              <button
                onClick={() => setShowCertificateModal(true)}
                className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Certificado de Conclusao</h3>
                    <p className="text-emerald-100 text-xs">Baixe com QR Code verificavel</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Right Column - Timeline + Badges */}
            <div className="space-y-6 w-full">
              {/* Timeline Card - Real telemetry data */}
              <TimelineCard
                xpTransactions={timelineXpTransactions}
                diaryEntries={timelineDiaryEntries}
                sessions={timelineSessions}
                badges={timelineBadges}
                onOpenModal={() => setShowTimelineModal(true)}
              />

              {/* Gamification Card - Daily bonus and challenges */}
              <GamificationCard />

              {/* Badges - Clean Design */}
              <GlassCard className="overflow-hidden">
                <GlassCardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h3 className="font-medium academy-text text-sm">Badges</h3>
                    </div>
                    {badges.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 academy-text-muted">
                        {badges.length}
                      </span>
                    )}
                  </div>
                </GlassCardHeader>

                <GlassCardContent className="pt-2">
                  {badges.length > 0 ? (
                    <div className="space-y-2">
                      {badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg flex-shrink-0">
                            {badgeEmojis[badge.badge_id] || '🏅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs academy-text truncate">
                              {badge.badge_name}
                            </p>
                            <p className="text-[10px] academy-text-muted truncate">
                              {badge.criteria}
                            </p>
                          </div>
                        </div>
                      ))}
                      {badges.length > 3 && (
                        <p className="text-[10px] text-center academy-text-muted mt-1">
                          +{badges.length - 3} mais
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                        <Medal className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-medium academy-text">
                        Conquiste seu primeiro badge
                      </p>
                      <p className="text-[10px] academy-text-muted mt-0.5">
                        Complete sessoes e atividades
                      </p>
                    </div>
                  )}

                  {/* Locked badges preview - Compact */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] academy-text-muted uppercase tracking-wider mb-2">
                      Proximos
                    </p>
                    <div className="flex gap-1.5 justify-center">
                      {['🍜', '🚀', '⭐', '🎬', '🧭', '📚']
                        .filter((e) => !badges.some((b) => badgeEmojis[b.badge_id] === e))
                        .slice(0, 4)
                        .map((emoji, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm opacity-40 grayscale"
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
          <footer className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-xs academy-text-muted">Academy Cidadao.AI</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600">
                Formando desenvolvedores brasileiros
              </p>
            </div>
          </footer>
        </main>

        {/* Modals */}
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
        <LgpdConsentModal isOpen={showLgpdModal} onClose={() => setShowLgpdModal(false)} />
        <BackgroundSelector
          isOpen={showBackgroundSelector}
          onClose={() => setShowBackgroundSelector(false)}
        />
        <TimelineModal
          isOpen={showTimelineModal}
          onClose={() => setShowTimelineModal(false)}
          xpTransactions={timelineXpTransactions}
          diaryEntries={timelineDiaryEntries}
          sessions={timelineSessions}
          badges={timelineBadges}
          userName={user.name}
        />
      </div>
    </ErrorBoundary>
  )
}
