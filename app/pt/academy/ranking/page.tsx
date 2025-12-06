/**
 * Academy Ranking Page
 *
 * Leaderboard with:
 * - XP ranking
 * - Time ranking
 * - Streak ranking
 *
 * Author: Anderson Henrique da Silva
 * Refactored: 2025-12-06 - Design System integration
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Trophy, Zap, Clock, Flame, Crown, Medal, Star, Sparkles } from 'lucide-react'

const ranks = {
  novato: {
    name: 'Novato',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    gradient: 'from-gray-400 to-gray-500',
  },
  aprendiz: {
    name: 'Aprendiz',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-400 to-emerald-500',
  },
  contribuidor: {
    name: 'Contribuidor',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-400 to-indigo-500',
  },
  mentor: {
    name: 'Mentor',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-400 to-violet-500',
  },
  arquiteto: {
    name: 'Arquiteto',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    gradient: 'from-yellow-400 to-amber-500',
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

const filterTabs = [
  { id: 'xp', icon: Zap, label: 'Por XP' },
  { id: 'time', icon: Clock, label: 'Por tempo' },
  { id: 'streak', icon: Flame, label: 'Por streak' },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return <span className="text-3xl">🥇</span>
    if (position === 2) return <span className="text-3xl">🥈</span>
    if (position === 3) return <span className="text-3xl">🥉</span>
    return (
      <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
        {position}
      </span>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pt/academy"
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Ranking da Academy
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Veja quem está liderando</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User position card */}
        {userRank > 0 && (
          <Card
            variant="filled"
            padding="md"
            className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 border-0 overflow-hidden relative"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-green-100 text-sm mb-1">Sua posição</p>
                  <p className="text-5xl font-bold">#{userRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm mb-1">Seus pontos</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <p className="text-3xl font-bold">{user.totalXp} XP</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filter tabs */}
        <Card variant="outlined" padding="sm" className="mb-6">
          <div className="flex gap-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as 'xp' | 'time' | 'streak')}
                  variant={filter === tab.id ? 'primary' : 'ghost'}
                  size="md"
                  className="flex-1"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLeaderboard.map((entry, index) => {
              const rankInfo = ranks[entry.current_rank as keyof typeof ranks] || ranks.novato
              const isCurrentUser = entry.user_id === user.id
              const position = index + 1

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-4 p-4 transition-colors',
                    isCurrentUser && 'bg-green-50 dark:bg-green-900/20',
                    position <= 3 &&
                      !isCurrentUser &&
                      'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  {/* Position */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getMedalIcon(position)}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        entry.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.full_name)}&background=16a34a&color=fff`
                      }
                      alt={entry.full_name}
                      className={cn(
                        'w-12 h-12 rounded-xl object-cover',
                        isCurrentUser &&
                          'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900'
                      )}
                    />
                    {position <= 3 && (
                      <div
                        className={cn(
                          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                          position === 1 && 'bg-yellow-400 text-yellow-900',
                          position === 2 && 'bg-gray-300 text-gray-700',
                          position === 3 && 'bg-amber-600 text-white'
                        )}
                      >
                        <Star className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'font-medium truncate',
                          isCurrentUser
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        {entry.full_name}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="success" size="sm">
                          Você
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          rankInfo.bg,
                          rankInfo.text
                        )}
                      >
                        Lv.{entry.current_level} {rankInfo.name}
                      </span>
                      {entry.current_streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                          <Flame className="w-3 h-3" />
                          {entry.current_streak}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {filter === 'xp' && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          {entry.total_xp}
                        </span>
                      )}
                      {filter === 'time' && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {Math.floor(entry.total_time_minutes / 60)}h
                        </span>
                      )}
                      {filter === 'streak' && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {entry.current_streak} dias
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {filter === 'xp' && 'XP'}
                      {filter === 'time' && 'Total'}
                      {filter === 'streak' && 'Streak'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          O ranking é atualizado em tempo real. Continue estudando para subir!
        </p>
      </main>
    </div>
  )
}
