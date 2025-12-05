'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { createClient } from '@/lib/supabase/client'

interface Video {
  id: string
  title: string
  description: string
  url: string
  thumbnail_url: string
  duration_seconds: number
  category: string
  track: string
  difficulty: string
  order_index: number
  agent_name: string
  is_required: boolean
}

interface VideoProgress {
  video_id: string
  watched_seconds: number
  progress_percentage: number
  status: string
  completed_at: string | null
}

const categories = [
  { id: 'all', name: 'Todos', emoji: '📺' },
  { id: 'onboarding', name: 'Onboarding', emoji: '🚀' },
  { id: 'backend', name: 'Backend', emoji: '⚙️' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨' },
  { id: 'ia', name: 'IA/ML', emoji: '🤖' },
  { id: 'devops', name: 'DevOps', emoji: '🔧' },
  { id: 'agents', name: 'Agentes', emoji: '🎭' },
]

// Placeholder videos based on the playlist document
const placeholderVideos: Video[] = [
  {
    id: '1',
    title: 'Bem-vindo a Academy Cidadao.AI',
    description: 'Introducao ao programa de estagio',
    url: '',
    thumbnail_url: '',
    duration_seconds: 300,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: true,
  },
  {
    id: '2',
    title: 'Conhecendo o LabSoft e a Parceria',
    description: 'Historia e objetivos da parceria IFSULDEMINAS',
    url: '',
    thumbnail_url: '',
    duration_seconds: 420,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 2,
    agent_name: '',
    is_required: true,
  },
  {
    id: '3',
    title: 'Como Funciona a Gamificacao',
    description: 'XP, badges, ranking e recompensas',
    url: '',
    thumbnail_url: '',
    duration_seconds: 360,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 3,
    agent_name: '',
    is_required: true,
  },
  {
    id: '4',
    title: 'FastAPI - Fundamentos',
    description: 'Introducao ao framework FastAPI',
    url: '',
    thumbnail_url: '',
    duration_seconds: 600,
    category: 'backend',
    track: 'backend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '5',
    title: 'Arquitetura Multi-Agente',
    description: 'Como funciona o sistema de agentes',
    url: '',
    thumbnail_url: '',
    duration_seconds: 540,
    category: 'backend',
    track: 'backend',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  {
    id: '6',
    title: 'Next.js 15 - App Router',
    description: 'Novo sistema de rotas do Next.js',
    url: '',
    thumbnail_url: '',
    duration_seconds: 480,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '7',
    title: 'Tailwind CSS na Pratica',
    description: 'Estilizacao com Tailwind',
    url: '',
    thumbnail_url: '',
    duration_seconds: 420,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  {
    id: '8',
    title: 'LangChain Basico',
    description: 'Introducao ao LangChain',
    url: '',
    thumbnail_url: '',
    duration_seconds: 600,
    category: 'ia',
    track: 'ia',
    difficulty: 'intermediate',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '9',
    title: 'Agente Zumbi - Detector de Anomalias',
    description: 'Como funciona o Zumbi dos Palmares',
    url: '',
    thumbnail_url: '',
    duration_seconds: 480,
    category: 'agents',
    track: 'all',
    difficulty: 'intermediate',
    order_index: 1,
    agent_name: 'zumbi',
    is_required: false,
  },
  {
    id: '10',
    title: 'Docker para Desenvolvedores',
    description: 'Containerizacao basica',
    url: '',
    thumbnail_url: '',
    duration_seconds: 540,
    category: 'devops',
    track: 'devops',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
]

export default function AcademyVideosPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAcademyAuth()
  const supabase = createClient()

  const [videos, setVideos] = useState<Video[]>(placeholderVideos)
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      loadVideos()
      loadProgress()
    }
  }, [user])

  const loadVideos = async () => {
    const { data } = await supabase
      .from('academy_videos')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (data && data.length > 0) {
      setVideos(data)
    }
  }

  const loadProgress = async () => {
    if (!user) return

    const { data } = await supabase
      .from('academy_video_progress')
      .select('*')
      .eq('user_id', user.id)

    if (data) {
      const progressMap: Record<string, VideoProgress> = {}
      data.forEach((p) => {
        progressMap[p.video_id] = p
      })
      setProgress(progressMap)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredVideos =
    selectedCategory === 'all' ? videos : videos.filter((v) => v.category === selectedCategory)

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length
  const totalRequired = videos.filter((v) => v.is_required).length

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
        <div className="max-w-6xl mx-auto px-4 py-4">
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
                Videos do Programa
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount} de {videos.length} assistidos
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="text-sm text-green-700 dark:text-green-400">
                {totalRequired} obrigatorios
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const videoProgress = progress[video.id]
            const isCompleted = videoProgress?.status === 'completed'
            const progressPercent = videoProgress?.progress_percentage || 0

            return (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-green-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatDuration(video.duration_seconds)}
                  </div>
                  {/* Progress bar */}
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                  {/* Completed badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Required badge */}
                  {video.is_required && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                      Obrigatorio
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        video.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : video.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {video.difficulty === 'beginner'
                        ? 'Iniciante'
                        : video.difficulty === 'intermediate'
                          ? 'Intermediario'
                          : 'Avancado'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {categories.find((c) => c.id === video.category)?.name}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum video nesta categoria
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Os videos serao adicionados em breve</p>
          </div>
        )}
      </main>

      {/* Video modal placeholder */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full overflow-hidden">
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg">Video em breve</p>
                <p className="text-sm text-gray-400 mt-2">{selectedVideo.title}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedVideo.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
