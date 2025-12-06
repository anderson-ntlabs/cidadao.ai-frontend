/**
 * Academy Readings Page
 *
 * Required readings library with:
 * - Track filtering
 * - Progress tracking
 * - XP rewards
 *
 * Author: Anderson Henrique da Silva
 * Refactored: 2025-12-06 - Design System integration
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAcademy } from '@/hooks/use-academy'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Sparkles,
  Star,
  ExternalLink,
  FileText,
  GraduationCap,
  Calendar,
} from 'lucide-react'
import { trackReadingCompleted } from '@/lib/analytics/academy-tracker'

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

// Demo mode: reading progress stored in localStorage
const READING_PROGRESS_KEY = 'academy_demo_reading_progress'

interface ReadingProgress {
  reading_id: string
  status: string
  confirmed_read: boolean
  completed_at: string | null
}

// Placeholder readings
const placeholderReadings: Reading[] = [
  {
    id: '1',
    title: 'Introdução ao FastAPI',
    description: 'Documentação oficial do FastAPI para iniciantes',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    article_type: 'tutorial',
    track: 'backend',
    difficulty: 'beginner',
    estimated_time_minutes: 30,
    week_number: 1,
    is_required: true,
  },
  {
    id: '2',
    title: 'React Hooks: useState e useEffect',
    description: 'Entendendo os hooks fundamentais do React',
    url: 'https://react.dev/learn/state-a-components-memory',
    article_type: 'tutorial',
    track: 'frontend',
    difficulty: 'beginner',
    estimated_time_minutes: 25,
    week_number: 1,
    is_required: true,
  },
  {
    id: '3',
    title: 'Introdução ao LangChain',
    description: 'Construindo aplicações com LLMs',
    url: 'https://python.langchain.com/docs/get_started/introduction',
    article_type: 'tutorial',
    track: 'ia',
    difficulty: 'intermediate',
    estimated_time_minutes: 45,
    week_number: 2,
    is_required: false,
  },
  {
    id: '4',
    title: 'Docker para Iniciantes',
    description: 'Conceitos básicos de containerização',
    url: 'https://docs.docker.com/get-started/',
    article_type: 'tutorial',
    track: 'devops',
    difficulty: 'beginner',
    estimated_time_minutes: 40,
    week_number: 2,
    is_required: true,
  },
  {
    id: '5',
    title: 'Arquitetura Multi-Agente',
    description: 'Paper sobre sistemas multi-agente com LLMs',
    url: 'https://arxiv.org/abs/2308.08155',
    article_type: 'paper',
    track: 'ia',
    difficulty: 'advanced',
    estimated_time_minutes: 60,
    week_number: 3,
    is_required: false,
  },
  {
    id: '6',
    title: 'Next.js App Router',
    description: 'Guia completo do novo sistema de rotas',
    url: 'https://nextjs.org/docs/app',
    article_type: 'tutorial',
    track: 'frontend',
    difficulty: 'intermediate',
    estimated_time_minutes: 35,
    week_number: 2,
    is_required: true,
  },
  {
    id: '7',
    title: 'Pydantic V2: Validação de Dados',
    description: 'Validação de dados com Pydantic no FastAPI',
    url: 'https://docs.pydantic.dev/latest/',
    article_type: 'tutorial',
    track: 'backend',
    difficulty: 'intermediate',
    estimated_time_minutes: 30,
    week_number: 3,
    is_required: false,
  },
  {
    id: '8',
    title: 'Tailwind CSS: Utility-First',
    description: 'Dominando Tailwind CSS na prática',
    url: 'https://tailwindcss.com/docs/utility-first',
    article_type: 'tutorial',
    track: 'frontend',
    difficulty: 'beginner',
    estimated_time_minutes: 20,
    week_number: 1,
    is_required: true,
  },
]

const tracks = [
  { id: 'all', name: 'Todas', icon: BookOpen },
  { id: 'backend', name: 'Backend', icon: FileText },
  { id: 'frontend', name: 'Frontend', icon: FileText },
  { id: 'ia', name: 'IA/ML', icon: FileText },
  { id: 'devops', name: 'DevOps', icon: FileText },
]

const trackColors: Record<string, { bg: string; text: string; border: string }> = {
  backend: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700/30',
  },
  frontend: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700/30',
  },
  ia: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-700/30',
  },
  devops: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-700/30',
  },
}

const articleTypeIcons: Record<string, string> = {
  tutorial: '📖',
  paper: '📄',
  documentation: '📑',
}

export default function AcademyReadingsPage() {
  const { isLoading, addXp } = useAcademy()

  const [readings] = useState<Reading[]>(placeholderReadings)
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({})
  const [selectedTrack, setSelectedTrack] = useState<string>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(READING_PROGRESS_KEY)
      if (saved) {
        setProgress(JSON.parse(saved))
      }
    }
  }, [])

  const saveProgress = (newProgress: Record<string, ReadingProgress>) => {
    setProgress(newProgress)
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(newProgress))
  }

  const handleConfirmRead = (reading: Reading) => {
    setConfirmingId(reading.id)

    setTimeout(() => {
      const newProgress = {
        ...progress,
        [reading.id]: {
          reading_id: reading.id,
          status: 'completed',
          confirmed_read: true,
          completed_at: new Date().toISOString(),
        },
      }
      saveProgress(newProgress)

      const xpAmount = reading.is_required ? 20 : 10
      addXp(xpAmount, 'article', `Leitura concluída: ${reading.title}`)

      // Track reading completion in PostHog
      trackReadingCompleted(reading.id, reading.title)

      toast.success('Leitura confirmada!', `+${xpAmount} XP`)
      setConfirmingId(null)
    }, 500)
  }

  const filteredReadings =
    selectedTrack === 'all'
      ? readings
      : readings.filter((r) => r.track === selectedTrack || r.track === 'all')

  const completedCount = Object.values(progress).filter((p) => p.confirmed_read).length
  const requiredCount = readings.filter((r) => r.is_required).length
  const requiredCompleted = Object.values(progress).filter((p) => {
    const reading = readings.find((r) => r.id === p.reading_id)
    return p.confirmed_read && reading?.is_required
  }).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando leituras...</p>
        </div>
      </div>
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Leituras Obrigatórias
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount} de {readings.length} concluídas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress card */}
        <Card
          variant="filled"
          padding="md"
          className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 border-0"
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Progresso de leitura</p>
                <p className="text-4xl font-bold">
                  {Math.round((completedCount / Math.max(readings.length, 1)) * 100)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm mb-1">Obrigatorias</p>
              <p className="text-2xl font-bold">
                {requiredCompleted} / {requiredCount}
              </p>
              <div className="w-24 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(requiredCompleted / Math.max(requiredCount, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Track filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tracks.map((track) => (
            <Button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              variant={selectedTrack === track.id ? 'primary' : 'secondary'}
              size="md"
              className="whitespace-nowrap"
            >
              {track.name}
            </Button>
          ))}
        </div>

        {/* Readings list */}
        <div className="space-y-4">
          {filteredReadings.length === 0 ? (
            <Card variant="outlined" padding="lg" className="text-center">
              <div className="py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma leitura disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  As leituras serão adicionadas em breve
                </p>
              </div>
            </Card>
          ) : (
            filteredReadings.map((reading, index) => {
              const readingProgress = progress[reading.id]
              const isConfirmed = readingProgress?.confirmed_read
              const colors = trackColors[reading.track] || trackColors.backend

              return (
                <Card
                  key={reading.id}
                  variant="elevated"
                  padding="md"
                  className={cn(
                    'group hover:shadow-lg transition-all animate-fade-in',
                    isConfirmed && 'ring-2 ring-green-500/50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110',
                        isConfirmed ? 'bg-green-100 dark:bg-green-900/30' : colors.bg
                      )}
                    >
                      {isConfirmed ? '✅' : articleTypeIcons[reading.article_type] || '📖'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {reading.title}
                        </h3>
                        {reading.is_required && (
                          <Badge variant="warning" size="sm">
                            <Star className="w-3 h-3" />
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {reading.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" size="sm">
                          <Clock className="w-3 h-3" />~{reading.estimated_time_minutes} min
                        </Badge>
                        <Badge variant="outline" size="sm">
                          <Calendar className="w-3 h-3" />
                          Semana {reading.week_number}
                        </Badge>
                        {reading.track !== 'all' && (
                          <Badge
                            variant={
                              reading.difficulty === 'beginner'
                                ? 'success'
                                : reading.difficulty === 'intermediate'
                                  ? 'warning'
                                  : 'destructive'
                            }
                            size="sm"
                          >
                            {reading.difficulty === 'beginner'
                              ? 'Iniciante'
                              : reading.difficulty === 'intermediate'
                                ? 'Intermediário'
                                : 'Avançado'}
                          </Badge>
                        )}
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            colors.bg,
                            colors.text
                          )}
                        >
                          {reading.track}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button asChild variant="secondary" size="sm">
                        <a href={reading.url} target="_blank" rel="noopener noreferrer">
                          Abrir
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                      {!isConfirmed && (
                        <Button
                          onClick={() => handleConfirmRead(reading)}
                          disabled={confirmingId === reading.id}
                          variant="primary"
                          size="sm"
                        >
                          {confirmingId === reading.id ? (
                            <>
                              <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              ...
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Li este artigo
                            </>
                          )}
                        </Button>
                      )}
                      {isConfirmed && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">
                            +{reading.is_required ? 20 : 10} XP
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
