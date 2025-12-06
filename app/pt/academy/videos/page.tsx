/**
 * Academy Videos Page
 *
 * Video learning library with:
 * - Category filtering
 * - Progress tracking
 * - XP rewards
 *
 * Author: Anderson Henrique da Silva
 * Refactored: 2025-12-06 - Design System integration
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { ArrowLeft, Play, Video, Check, Clock, Sparkles, Star, X, ExternalLink } from 'lucide-react'

interface VideoItem {
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

const categories = [
  { id: 'all', name: 'Todos', emoji: '📺' },
  { id: 'onboarding', name: 'Onboarding', emoji: '🚀' },
  { id: 'backend', name: 'Backend', emoji: '⚙️' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨' },
  { id: 'ia', name: 'IA/ML', emoji: '🤖' },
  { id: 'devops', name: 'DevOps', emoji: '🔧' },
  { id: 'agents', name: 'Agentes', emoji: '🎭' },
]

// YouTube thumbnail helper
const ytThumb = (videoId: string) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

// Real YouTube videos - curated educational content
const placeholderVideos: VideoItem[] = [
  // Onboarding - Required videos
  {
    id: '1',
    title: 'O que é Inteligência Artificial?',
    description: 'Introdução aos conceitos fundamentais de IA - curso completo para iniciantes',
    url: 'https://www.youtube.com/watch?v=Lj2YjLW0OGI',
    thumbnail_url: ytThumb('Lj2YjLW0OGI'),
    duration_seconds: 1080,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: true,
  },
  {
    id: '2',
    title: 'Git e GitHub para Iniciantes',
    description: 'Aprenda controle de versão do zero - essencial para contribuir no projeto',
    url: 'https://www.youtube.com/watch?v=UBAX-13g8OM',
    thumbnail_url: ytThumb('UBAX-13g8OM'),
    duration_seconds: 2700,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 2,
    agent_name: '',
    is_required: true,
  },
  {
    id: '3',
    title: 'Python para Iniciantes',
    description: 'Curso completo de Python - a linguagem base do nosso backend',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    thumbnail_url: ytThumb('_uQrJ0TkZlc'),
    duration_seconds: 21600,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 3,
    agent_name: '',
    is_required: true,
  },
  // Backend
  {
    id: '4',
    title: 'FastAPI - Curso Completo',
    description: 'Aprenda FastAPI do zero ao deploy - o framework do Cidadão.AI',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    thumbnail_url: ytThumb('0sOvCWFmrtA'),
    duration_seconds: 18000,
    category: 'backend',
    track: 'backend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '5',
    title: 'REST API Design - Melhores Práticas',
    description: 'Como projetar APIs profissionais e escaláveis',
    url: 'https://www.youtube.com/watch?v=7YcW25PHnAA',
    thumbnail_url: ytThumb('7YcW25PHnAA'),
    duration_seconds: 1200,
    category: 'backend',
    track: 'backend',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  // Frontend
  {
    id: '6',
    title: 'Next.js 14 - Curso Completo',
    description: 'App Router, Server Components e tudo sobre o Next.js moderno',
    url: 'https://www.youtube.com/watch?v=Zq5fmkzDdkk',
    thumbnail_url: ytThumb('Zq5fmkzDdkk'),
    duration_seconds: 28800,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '7',
    title: 'Tailwind CSS - Do Zero ao Avançado',
    description: 'Domine o framework CSS mais popular da atualidade',
    url: 'https://www.youtube.com/watch?v=ft30zcMlFao',
    thumbnail_url: ytThumb('ft30zcMlFao'),
    duration_seconds: 12600,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  {
    id: '8',
    title: 'TypeScript para Iniciantes',
    description: 'Aprenda TypeScript e escreva código mais seguro',
    url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    thumbnail_url: ytThumb('BwuLxPH8IDs'),
    duration_seconds: 3600,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 3,
    agent_name: '',
    is_required: false,
  },
  // IA/ML
  {
    id: '9',
    title: 'LangChain - Criando Agentes de IA',
    description: 'Como criar agentes inteligentes com LangChain e Python',
    url: 'https://www.youtube.com/watch?v=aywZrzNaKjs',
    thumbnail_url: ytThumb('aywZrzNaKjs'),
    duration_seconds: 7200,
    category: 'ia',
    track: 'ia',
    difficulty: 'intermediate',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '10',
    title: 'Prompt Engineering - Guia Completo',
    description: 'Técnicas avançadas para trabalhar com LLMs',
    url: 'https://www.youtube.com/watch?v=_ZvnD96BrwY',
    thumbnail_url: ytThumb('_ZvnD96BrwY'),
    duration_seconds: 5400,
    category: 'ia',
    track: 'ia',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  {
    id: '11',
    title: 'RAG - Retrieval Augmented Generation',
    description: 'Como criar sistemas de IA com memória e documentos',
    url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
    thumbnail_url: ytThumb('T-D1OfcDW1M'),
    duration_seconds: 3600,
    category: 'ia',
    track: 'ia',
    difficulty: 'advanced',
    order_index: 3,
    agent_name: '',
    is_required: false,
  },
  // DevOps
  {
    id: '12',
    title: 'Docker - Curso Completo',
    description: 'Containerização do zero ao deploy em produção',
    url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI',
    thumbnail_url: ytThumb('pTFZFxd4hOI'),
    duration_seconds: 10800,
    category: 'devops',
    track: 'devops',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '13',
    title: 'GitHub Actions - CI/CD',
    description: 'Automatize deploys e testes com GitHub Actions',
    url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    thumbnail_url: ytThumb('R8_veQiYBjI'),
    duration_seconds: 7200,
    category: 'devops',
    track: 'devops',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  // Agents
  {
    id: '14',
    title: 'Multi-Agent Systems com CrewAI',
    description: 'Como criar sistemas de múltiplos agentes de IA',
    url: 'https://www.youtube.com/watch?v=tnejrr-0a94',
    thumbnail_url: ytThumb('tnejrr-0a94'),
    duration_seconds: 5400,
    category: 'agents',
    track: 'all',
    difficulty: 'advanced',
    order_index: 1,
    agent_name: 'abaporu',
    is_required: false,
  },
  {
    id: '15',
    title: 'Detecção de Anomalias com Machine Learning',
    description: 'Técnicas para identificar padrões suspeitos em dados',
    url: 'https://www.youtube.com/watch?v=5p8B2Ikcw-k',
    thumbnail_url: ytThumb('5p8B2Ikcw-k'),
    duration_seconds: 4800,
    category: 'agents',
    track: 'ia',
    difficulty: 'advanced',
    order_index: 2,
    agent_name: 'zumbi',
    is_required: false,
  },
]

// Demo mode: video progress stored in localStorage
const VIDEO_PROGRESS_KEY = 'academy_demo_video_progress'

interface VideoProgress {
  video_id: string
  watched_seconds: number
  progress_percentage: number
  status: string
  completed_at: string | null
}

export default function AcademyVideosPage() {
  const { user, isLoading, addXp } = useAcademyDemo()

  const [videos] = useState<VideoItem[]>(placeholderVideos)
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIDEO_PROGRESS_KEY)
      if (saved) {
        setProgress(JSON.parse(saved))
      }
    }
  }, [])

  // Handle modal close events
  useEffect(() => {
    const handleModalClose = () => {
      setIsModalOpen(false)
      setSelectedVideo(null)
    }
    window.addEventListener('modal-close', handleModalClose)
    return () => window.removeEventListener('modal-close', handleModalClose)
  }, [])

  const saveProgress = (newProgress: Record<string, VideoProgress>) => {
    setProgress(newProgress)
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(newProgress))
  }

  const markAsWatched = (video: VideoItem) => {
    const newProgress = {
      ...progress,
      [video.id]: {
        video_id: video.id,
        watched_seconds: video.duration_seconds,
        progress_percentage: 100,
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
    }
    saveProgress(newProgress)
    addXp(video.is_required ? 25 : 15, 'video', `Video assistido: ${video.title}`)
    toast.success('Vídeo concluído!', `+${video.is_required ? 25 : 15} XP`)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const filteredVideos =
    selectedCategory === 'all' ? videos : videos.filter((v) => v.category === selectedCategory)

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length
  const totalRequired = videos.filter((v) => v.is_required).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando vídeos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pt/academy"
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Vídeos do Programa
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount} de {videos.length} assistidos
              </p>
            </div>
            <Badge variant="warning" size="default">
              <Star className="w-3 h-3" />
              {totalRequired} obrigatórios
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
              size="md"
              className="whitespace-nowrap"
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => {
            const videoProgress = progress[video.id]
            const isCompleted = videoProgress?.status === 'completed'
            const progressPercent = videoProgress?.progress_percentage || 0

            return (
              <Card
                key={video.id}
                variant="elevated"
                padding="none"
                interactive
                onClick={() => handleVideoClick(video)}
                className={cn(
                  'group overflow-hidden animate-fade-in',
                  isCompleted && 'ring-2 ring-green-500/50'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-16 h-16 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-8 h-8 text-green-600 ml-1" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration_seconds)}
                  </div>

                  {/* Progress bar */}
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/50 dark:bg-gray-600/50">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  {/* Completed badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Required badge */}
                  {video.is_required && (
                    <Badge variant="warning" size="sm" className="absolute top-2 left-2">
                      Obrigatório
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        video.difficulty === 'beginner'
                          ? 'success'
                          : video.difficulty === 'intermediate'
                            ? 'warning'
                            : 'destructive'
                      }
                      size="sm"
                    >
                      {video.difficulty === 'beginner'
                        ? 'Iniciante'
                        : video.difficulty === 'intermediate'
                          ? 'Intermediário'
                          : 'Avançado'}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {categories.find((c) => c.id === video.category)?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredVideos.length === 0 && (
          <Card variant="outlined" padding="lg" className="text-center">
            <div className="py-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📺</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum vídeo nesta categoria
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Os vídeos serão adicionados em breve
              </p>
            </div>
          </Card>
        )}
      </main>

      {/* Video modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent size="xl" className="bg-white dark:bg-gray-900">
          {selectedVideo && (
            <>
              {/* YouTube Video Player */}
              <div className="relative aspect-video bg-gray-900 rounded-t-lg -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 overflow-hidden">
                {selectedVideo.url ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.url.split('v=')[1]?.split('&')[0]}?rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-5xl">🎬</span>
                      </div>
                      <p className="text-lg font-medium">Vídeo em breve</p>
                      <p className="text-sm text-gray-400 mt-2">{selectedVideo.title}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <ModalHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-8">
                      <ModalTitle className="text-xl">{selectedVideo.title}</ModalTitle>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {selectedVideo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge
                      variant={
                        selectedVideo.difficulty === 'beginner'
                          ? 'success'
                          : selectedVideo.difficulty === 'intermediate'
                            ? 'warning'
                            : 'destructive'
                      }
                      size="sm"
                    >
                      {selectedVideo.difficulty === 'beginner'
                        ? 'Iniciante'
                        : selectedVideo.difficulty === 'intermediate'
                          ? 'Intermediário'
                          : 'Avançado'}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      <Clock className="w-3 h-3" />
                      {formatDuration(selectedVideo.duration_seconds)}
                    </Badge>
                    {selectedVideo.is_required && (
                      <Badge variant="warning" size="sm">
                        <Star className="w-3 h-3" />
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                </ModalHeader>

                <ModalFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!progress[selectedVideo.id]?.status ? (
                    <Button
                      onClick={() => {
                        markAsWatched(selectedVideo)
                        setIsModalOpen(false)
                        setSelectedVideo(null)
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Check className="w-5 h-5" />
                      Marcar como assistido (+{selectedVideo.is_required ? 25 : 15} XP)
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl">
                      <Check className="w-5 h-5" />
                      Vídeo já assistido
                    </div>
                  )}
                </ModalFooter>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
