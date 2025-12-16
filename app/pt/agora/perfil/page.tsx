'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAgora } from '@/hooks/use-agora'
import { cn } from '@/lib/utils'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader, PageLoading, PageContainer } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BadgeShowcase } from '@/components/agora'
import {
  User,
  Trophy,
  Flame,
  Clock,
  Target,
  BookOpen,
  Calendar,
  Github,
  Mail,
  Sparkles,
  TrendingUp,
  Zap,
  LogOut,
  GraduationCap,
} from 'lucide-react'

/**
 * Agora Profile Page
 *
 * Real auth only - no demo mode.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-11 - Standardized layout with PageHeader/PageContainer
 */

const ranks = {
  novato: {
    name: 'Novato',
    color: 'gray',
    gradient: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  aprendiz: {
    name: 'Aprendiz',
    color: 'green',
    gradient: 'from-green-400 to-emerald-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  contribuidor: {
    name: 'Contribuidor',
    color: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  mentor: {
    name: 'Mentor',
    color: 'purple',
    gradient: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  arquiteto: {
    name: 'Arquiteto',
    color: 'yellow',
    gradient: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
}

const tracks = {
  backend: { name: 'Backend', emoji: '⚙️', color: 'blue' },
  frontend: { name: 'Frontend', emoji: '🎨', color: 'purple' },
  ia: { name: 'IA/ML', emoji: '🤖', color: 'green' },
  devops: { name: 'DevOps', emoji: '🚀', color: 'orange' },
}

function LoadingFallback() {
  return <PageLoading text="Carregando perfil..." />
}

function ProfileContent() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    xpTransactions,
    diaryEntries,
    sessions,
    badges,
  } = useAgora()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/pt/agora/login')
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated || !user) {
    return <PageLoading text="Redirecionando para login..." />
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const userTracks = user.tracks || []
  const userTracksInfo =
    userTracks.length > 0
      ? userTracks.map((t: string) => tracks[t as keyof typeof tracks]).filter(Boolean)
      : [tracks.backend]
  const nextRankXp =
    user.currentRank === 'novato'
      ? 100
      : user.currentRank === 'aprendiz'
        ? 500
        : user.currentRank === 'contribuidor'
          ? 2000
          : user.currentRank === 'mentor'
            ? 5000
            : null

  const xpProgress = nextRankXp ? Math.min((user.totalXp / nextRankXp) * 100, 100) : 100

  return (
    <PageContainer background="operarios" maxWidth="5xl" padding="none">
      {/* Page Header */}
      <PageHeader
        backUrl="/pt/agora"
        title="Meu Perfil"
        subtitle={`Level ${user.currentLevel} - ${rankInfo.name}`}
        icon={User}
        actions={
          <Badge variant="success" size="default">
            <Sparkles className="w-3 h-3" />
            {user.totalXp} XP
          </Badge>
        }
      />

      <main className="px-4 py-6">
        {/* Profile Header Card */}
        <GlassCard className="mb-8 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-900 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/30 overflow-hidden relative">
          <GlassCardContent className="p-6 sm:p-8">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/10 to-green-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff`
                  }
                  alt={user.name}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-3xl shadow-xl ring-4 ring-white dark:ring-gray-800"
                  unoptimized
                />
                <div
                  className={cn(
                    'absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg',
                    `bg-gradient-to-br ${rankInfo.gradient}`
                  )}
                >
                  <span className="text-white font-bold text-sm">Lv.{user.currentLevel}</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  <Badge
                    variant="success"
                    size="default"
                    className={cn('bg-gradient-to-r text-white', rankInfo.gradient)}
                  >
                    <Trophy className="w-3 h-3" />
                    {rankInfo.name}
                  </Badge>
                  {userTracksInfo.map((trackInfo: { emoji: string; name: string }, idx: number) => (
                    <Badge key={idx} variant="outline" size="default">
                      <span>{trackInfo.emoji}</span>
                      {trackInfo.name}
                    </Badge>
                  ))}
                </div>

                {/* Contact info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  {user.githubUsername && (
                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      <Github className="w-4 h-4" />@{user.githubUsername}
                    </a>
                  )}
                  {user.enrolledAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Desde {new Date(user.enrolledAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* Academic info */}
                {(user.matricula || user.curso) && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {user.matricula && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        Matrícula: {user.matricula}
                      </span>
                    )}
                    {user.curso && (
                      <span className="flex items-center gap-1">
                        📚 {user.curso}
                        {user.periodo && ` - ${user.periodo}° período`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* XP Display */}
              <div className="text-center sm:text-right">
                <div className="flex items-center gap-2 justify-center sm:justify-end mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {user.totalXp}
                  </span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">XP</span>
                </div>
                {nextRankXp && (
                  <div className="w-32 sm:w-40">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          `bg-gradient-to-r ${rankInfo.gradient}`
                        )}
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {nextRankXp - user.totalXp} XP para próximo rank
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="bg-orange-50/80 dark:bg-orange-900/20">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dias seguidos</p>
                  {(user.longestStreak || 0) > user.currentStreak && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Recorde: {user.longestStreak}
                    </p>
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="bg-blue-50/80 dark:bg-blue-900/20">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.floor(user.totalTimeMinutes / 60)}h
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tempo de estudo</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {user.totalTimeMinutes % 60}min extras
                  </p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="bg-purple-50/80 dark:bg-purple-900/20">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {sessions.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sessões</p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="bg-green-50/80 dark:bg-green-900/20">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {diaryEntries.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Diários</p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Badges Section */}
          <BadgeShowcase badges={badges} showLocked={true} />

          {/* Recent Activity */}
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Atividade Recente
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              {xpTransactions.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {xpTransactions.slice(0, 10).map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl',
                        'bg-gray-50 dark:bg-gray-800/50',
                        'animate-fade-in'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        +{transaction.amount} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma atividade ainda. Comece a estudar!
                  </p>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Logout Section */}
        <GlassCard className="mt-8">
          <GlassCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Sair da conta</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Você será redirecionado para a página de login
                </p>
              </div>
              <Button
                variant="ghost"
                size="md"
                onClick={() => void handleLogout()}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      </main>
    </PageContainer>
  )
}

export default function AgoraProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileContent />
    </Suspense>
  )
}
