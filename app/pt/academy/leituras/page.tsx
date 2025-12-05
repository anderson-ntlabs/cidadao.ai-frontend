'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Reading {
  id: string
  title: string
  description: string
  url: string
  article_type: string
  track: string
  difficulty: string
  estimated_time_minutes: number
  week_number: number
  is_required: boolean
}

interface ReadingProgress {
  reading_id: string
  status: string
  confirmed_read: boolean
  completed_at: string | null
  notes: string | null
  rating: number | null
}

export default function AcademyReadingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAcademyAuth()
  const supabase = createClient()

  const [readings, setReadings] = useState<Reading[]>([])
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({})
  const [selectedTrack, setSelectedTrack] = useState<string>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      loadReadings()
      loadProgress()
    }
  }, [user])

  const loadReadings = async () => {
    const { data } = await supabase
      .from('academy_required_readings')
      .select('*')
      .eq('is_active', true)
      .order('week_number')

    if (data) {
      setReadings(data)
    }
  }

  const loadProgress = async () => {
    if (!user) return

    const { data } = await supabase
      .from('academy_reading_progress')
      .select('*')
      .eq('user_id', user.id)

    if (data) {
      const progressMap: Record<string, ReadingProgress> = {}
      data.forEach((p) => {
        progressMap[p.reading_id] = p
      })
      setProgress(progressMap)
    }
  }

  const handleConfirmRead = async (reading: Reading) => {
    if (!user) return

    setConfirmingId(reading.id)
    try {
      const existingProgress = progress[reading.id]

      if (existingProgress) {
        await supabase
          .from('academy_reading_progress')
          .update({
            status: 'completed',
            confirmed_read: true,
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('reading_id', reading.id)
      } else {
        await supabase.from('academy_reading_progress').insert({
          user_id: user.id,
          reading_id: reading.id,
          status: 'completed',
          confirmed_read: true,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          confirmation_date: new Date().toISOString(),
        })
      }

      // Award XP
      await supabase.from('academy_xp_transactions').insert({
        user_id: user.id,
        amount: reading.is_required ? 20 : 10,
        balance_after: user.totalXp + (reading.is_required ? 20 : 10),
        source_type: 'article',
        source_id: reading.id,
        description: `Leitura concluida: ${reading.title}`,
      })

      toast.success('Leitura confirmada!', `+${reading.is_required ? 20 : 10} XP`)
      loadProgress()
    } catch (error) {
      console.error('Error confirming read:', error)
      toast.error('Erro ao confirmar', 'Tente novamente')
    } finally {
      setConfirmingId(null)
    }
  }

  const tracks = [
    { id: 'all', name: 'Todas' },
    { id: 'backend', name: 'Backend' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'ia', name: 'IA/ML' },
    { id: 'devops', name: 'DevOps' },
  ]

  const filteredReadings =
    selectedTrack === 'all'
      ? readings
      : readings.filter((r) => r.track === selectedTrack || r.track === 'all')

  const completedCount = Object.values(progress).filter((p) => p.confirmed_read).length
  const requiredCount = readings.filter((r) => r.is_required).length

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
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
            <div className="flex-1">
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Leituras Obrigatorias
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount} de {readings.length} concluidas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress card */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Progresso de leitura</p>
              <p className="text-3xl font-bold">
                {Math.round((completedCount / Math.max(readings.length, 1)) * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm mb-1">Obrigatorias</p>
              <p className="text-xl font-bold">
                {
                  Object.values(progress).filter((p) => {
                    const reading = readings.find((r) => r.id === p.reading_id)
                    return p.confirmed_read && reading?.is_required
                  }).length
                }{' '}
                / {requiredCount}
              </p>
            </div>
          </div>
        </div>

        {/* Track filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedTrack === track.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>

        {/* Readings list */}
        <div className="space-y-4">
          {filteredReadings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma leitura disponivel
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                As leituras serao adicionadas em breve
              </p>
            </div>
          ) : (
            filteredReadings.map((reading) => {
              const readingProgress = progress[reading.id]
              const isConfirmed = readingProgress?.confirmed_read

              return (
                <div
                  key={reading.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border p-6 transition-all ${
                    isConfirmed
                      ? 'border-green-500 dark:border-green-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        isConfirmed
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {isConfirmed
                        ? '✅'
                        : reading.article_type === 'paper'
                          ? '📄'
                          : reading.article_type === 'tutorial'
                            ? '📖'
                            : '📑'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {reading.title}
                        </h3>
                        {reading.is_required && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                            Obrigatorio
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {reading.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          ⏱️ ~{reading.estimated_time_minutes} min
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          📅 Semana {reading.week_number}
                        </span>
                        {reading.track !== 'all' && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              reading.track === 'backend'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : reading.track === 'frontend'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : reading.track === 'ia'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {reading.track}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <a
                        href={reading.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium inline-flex items-center gap-2"
                      >
                        Abrir
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                      {!isConfirmed && (
                        <button
                          onClick={() => handleConfirmRead(reading)}
                          disabled={confirmingId === reading.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {confirmingId === reading.id ? 'Confirmando...' : 'Li este artigo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
