'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { createClient } from '@/lib/supabase/client'

// Rank configuration
const ranks = {
  novato: { name: 'Novato', color: 'gray', minXp: 0 },
  aprendiz: { name: 'Aprendiz', color: 'green', minXp: 100 },
  contribuidor: { name: 'Contribuidor', color: 'blue', minXp: 500 },
  mentor: { name: 'Mentor', color: 'purple', minXp: 2000 },
  arquiteto: { name: 'Arquiteto', color: 'yellow', minXp: 5000 },
}

// Agent teachers available for chat
const agentTeachers = [
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: 'Orquestrador',
    emoji: '🎭',
    specialty: 'Coordenacao geral',
  },
  { id: 'zumbi', name: 'Zumbi', role: 'Detector', emoji: '🛡️', specialty: 'Seguranca e anomalias' },
  { id: 'anita', name: 'Anita', role: 'Analista', emoji: '📊', specialty: 'Analise de dados' },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    emoji: '📜',
    specialty: 'Documentacao',
  },
  { id: 'drummond', name: 'Drummond', role: 'Comunicador', emoji: '✍️', specialty: 'Comunicacao' },
  {
    id: 'machado',
    name: 'Machado',
    role: 'Escritor',
    emoji: '📚',
    specialty: 'Textos e narrativas',
  },
]

interface DashboardStats {
  totalSessions: number
  totalTimeMinutes: number
  currentStreak: number
  longestStreak: number
  todayMinutes: number
  weeklyMinutes: number
}

export default function AcademyDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAcademyAuth()
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!user) return

    // Check if user needs to complete onboarding
    if (!user.hasAcceptedLgpd || !user.matricula) {
      router.replace('/pt/academy/onboarding')
      return
    }

    // Load stats
    const loadStats = async () => {
      const { data: profile } = await supabase
        .from('academy_profiles')
        .select('total_sessions, total_time_minutes, current_streak, longest_streak')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setStats({
          totalSessions: profile.total_sessions || 0,
          totalTimeMinutes: profile.total_time_minutes || 0,
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          todayMinutes: 0, // TODO: Calculate from sessions
          weeklyMinutes: 0, // TODO: Calculate from sessions
        })
      }
    }

    // Load recent XP transactions
    const loadActivities = async () => {
      const { data: transactions } = await supabase
        .from('academy_xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactions) {
        setRecentActivities(transactions)
      }
    }

    loadStats()
    loadActivities()
  }, [user, supabase, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpForNextRank = nextRank ? nextRank.minXp - user.totalXp : 0
  const progressToNextRank = nextRank
    ? ((user.totalXp - rankInfo.minXp) / (nextRank.minXp - rankInfo.minXp)) * 100
    : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100">Academy</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cidadao.AI</p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <span className="text-lg">⚡</span>
                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                  {user.totalXp} XP
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-green-500"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{rankInfo.name}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Sair"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ola, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pronto para mais uma sessao de aprendizado?
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Lv.{user.currentLevel}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{rankInfo.name}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{user.totalXp} XP</span>
                <span>{nextRank ? `${nextRank.minXp} XP` : 'MAX'}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(progressToNextRank, 100)}%` }}
                />
              </div>
              {nextRank && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Faltam {xpForNextRank} XP para {nextRank.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
                🔥
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.currentStreak || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dias seguidos</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor((stats?.totalTimeMinutes || 0) / 60)}h
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de estudo</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.totalSessions || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sessoes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Agent teachers */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Agentes Professores
              </h3>
              <Link
                href="/pt/academy/chat"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {agentTeachers.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/pt/academy/chat?agent=${agent.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {agent.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {agent.specialty}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12H14.625M12 8.625V14.625M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Acoes rapidas</h3>
              <div className="space-y-2">
                <Link
                  href="/pt/academy/diario"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">📝</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Escrever no diario
                  </span>
                </Link>
                <Link
                  href="/pt/academy/videos"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">🎬</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Assistir videos
                  </span>
                </Link>
                <Link
                  href="/pt/academy/leituras"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">📚</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Leituras obrigatorias
                  </span>
                </Link>
                <Link
                  href="/pt/academy/ranking"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">🏅</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Ver ranking
                  </span>
                </Link>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Atividade recente</h3>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        +{activity.amount} XP
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {activity.description}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhuma atividade ainda.
                  <br />
                  Comece conversando com um agente!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
