'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'

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

// Mock leaderboard data for demo mode
const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    user_id: 'user-1',
    full_name: 'Ana Carolina Silva',
    avatar_url: 'https://ui-avatars.com/api/?name=Ana+Silva&background=16a34a&color=fff',
    total_xp: 2450,
    current_level: 25,
    current_rank: 'mentor',
    current_streak: 15,
    total_time_minutes: 1200,
  },
  {
    id: '2',
    user_id: 'user-2',
    full_name: 'Pedro Henrique Costa',
    avatar_url: 'https://ui-avatars.com/api/?name=Pedro+Costa&background=2563eb&color=fff',
    total_xp: 1890,
    current_level: 19,
    current_rank: 'contribuidor',
    current_streak: 12,
    total_time_minutes: 980,
  },
  {
    id: '3',
    user_id: 'user-3',
    full_name: 'Mariana Oliveira',
    avatar_url: 'https://ui-avatars.com/api/?name=Mariana+Oliveira&background=7c3aed&color=fff',
    total_xp: 1560,
    current_level: 16,
    current_rank: 'contribuidor',
    current_streak: 8,
    total_time_minutes: 750,
  },
  {
    id: '4',
    user_id: 'user-4',
    full_name: 'Lucas Santos',
    avatar_url: 'https://ui-avatars.com/api/?name=Lucas+Santos&background=dc2626&color=fff',
    total_xp: 1120,
    current_level: 12,
    current_rank: 'contribuidor',
    current_streak: 5,
    total_time_minutes: 620,
  },
  {
    id: '5',
    user_id: 'user-5',
    full_name: 'Julia Ferreira',
    avatar_url: 'https://ui-avatars.com/api/?name=Julia+Ferreira&background=ea580c&color=fff',
    total_xp: 890,
    current_level: 9,
    current_rank: 'contribuidor',
    current_streak: 3,
    total_time_minutes: 480,
  },
  {
    id: '6',
    user_id: 'user-6',
    full_name: 'Gabriel Rodrigues',
    avatar_url: 'https://ui-avatars.com/api/?name=Gabriel+Rodrigues&background=0891b2&color=fff',
    total_xp: 650,
    current_level: 7,
    current_rank: 'contribuidor',
    current_streak: 4,
    total_time_minutes: 320,
  },
  {
    id: '7',
    user_id: 'user-7',
    full_name: 'Beatriz Lima',
    avatar_url: 'https://ui-avatars.com/api/?name=Beatriz+Lima&background=db2777&color=fff',
    total_xp: 420,
    current_level: 5,
    current_rank: 'aprendiz',
    current_streak: 2,
    total_time_minutes: 210,
  },
  {
    id: '8',
    user_id: 'user-8',
    full_name: 'Rafael Almeida',
    avatar_url: 'https://ui-avatars.com/api/?name=Rafael+Almeida&background=4f46e5&color=fff',
    total_xp: 280,
    current_level: 3,
    current_rank: 'aprendiz',
    current_streak: 1,
    total_time_minutes: 140,
  },
]

export default function AcademyRankingPage() {
  const { user, isLoading } = useAcademyDemo()

  const [filter, setFilter] = useState<'xp' | 'time' | 'streak'>('xp')

  // Combine demo user with mock leaderboard
  const leaderboard = [...mockLeaderboard]

  // Add current demo user to leaderboard
  const demoUserEntry: LeaderboardEntry = {
    id: 'demo-user',
    user_id: user.id,
    full_name: user.name,
    avatar_url: user.avatar,
    total_xp: user.totalXp,
    current_level: user.currentLevel,
    current_rank: user.currentRank,
    current_streak: user.currentStreak,
    total_time_minutes: user.totalTimeMinutes,
  }

  // Check if demo user is already in the list (by similar XP)
  const existingIndex = leaderboard.findIndex(
    (e) => Math.abs(e.total_xp - user.totalXp) < 50 && e.user_id !== user.id
  )

  if (existingIndex === -1) {
    leaderboard.push(demoUserEntry)
  } else {
    // Replace a similar entry with demo user
    leaderboard[existingIndex] = demoUserEntry
  }

  // Sort based on filter
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (filter === 'xp') return b.total_xp - a.total_xp
    if (filter === 'time') return b.total_time_minutes - a.total_time_minutes
    return b.current_streak - a.current_streak
  })

  // Find user rank
  const userRank = sortedLeaderboard.findIndex((e) => e.user_id === user.id) + 1

  if (isLoading) {
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
        {userRank > 0 && (
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
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLeaderboard.map((entry, index) => {
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
        </div>
      </main>
    </div>
  )
}
