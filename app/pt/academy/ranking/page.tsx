'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { createClient } from '@/lib/supabase/client'

const ranks = {
  novato: {
    name: 'Novato',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
  aprendiz: {
    name: 'Aprendiz',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  },
  contribuidor: {
    name: 'Contribuidor',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  mentor: {
    name: 'Mentor',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
  arquiteto: {
    name: 'Arquiteto',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
}

interface LeaderboardEntry {
  id: string
  user_id: string
  full_name: string
  avatar_url: string
  total_xp: number
  current_level: number
  current_rank: string
  current_streak: number
  total_time_minutes: number
}

export default function AcademyRankingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAcademyAuth()
  const supabase = createClient()

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [filter, setFilter] = useState<'xp' | 'time' | 'streak'>('xp')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      loadLeaderboard()
    }
  }, [user, filter])

  const loadLeaderboard = async () => {
    const orderBy =
      filter === 'xp' ? 'total_xp' : filter === 'time' ? 'total_time_minutes' : 'current_streak'

    const { data } = await supabase
      .from('academy_profiles')
      .select(
        'id, user_id, full_name, avatar_url, total_xp, current_level, current_rank, current_streak, total_time_minutes'
      )
      .eq('is_active', true)
      .order(orderBy, { ascending: false })
      .limit(50)

    if (data) {
      setLeaderboard(data)
      if (user) {
        const position = data.findIndex((e) => e.user_id === user.id)
        setUserRank(position >= 0 ? position + 1 : null)
      }
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return `${position}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pt/academy"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Ranking da Academy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Veja quem esta liderando</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {userRank && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Sua posicao</p>
                <p className="text-4xl font-bold">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm mb-1">Seus pontos</p>
                <p className="text-2xl font-bold">{user.totalXp} XP</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { id: 'xp', icon: '⚡', label: 'Por XP' },
            { id: 'time', icon: '⏱️', label: 'Por tempo' },
            { id: 'streak', icon: '🔥', label: 'Por streak' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'xp' | 'time' | 'streak')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Ranking em construcao
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ainda nao ha participantes suficientes
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry, index) => {
                const rankInfo = ranks[entry.current_rank as keyof typeof ranks] || ranks.novato
                const isCurrentUser = entry.user_id === user.id

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index < 3
                          ? 'text-2xl'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {getMedalEmoji(index + 1)}
                    </div>

                    <img
                      src={
                        entry.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.full_name)}&background=16a34a&color=fff`
                      }
                      alt={entry.full_name}
                      className={`w-12 h-12 rounded-full ${isCurrentUser ? 'ring-2 ring-green-500' : ''}`}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${isCurrentUser ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                      >
                        {entry.full_name} {isCurrentUser && <span className="text-sm">(Voce)</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full ${rankInfo.bg} ${rankInfo.text}`}
                        >
                          Lv.{entry.current_level} {rankInfo.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {filter === 'xp' && `${entry.total_xp} XP`}
                        {filter === 'time' && `${Math.floor(entry.total_time_minutes / 60)}h`}
                        {filter === 'streak' && `${entry.current_streak} dias`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
