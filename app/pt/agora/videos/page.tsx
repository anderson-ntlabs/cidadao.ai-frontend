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
 * Updated: 2025-12-11 - Standardized layout with PageHeader/PageContainer
 */

'use client'

import { useState, useEffect } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { cn } from '@/lib/utils'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader, PageLoading, PageContainer } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import Image from 'next/image'
import { Play, Video, Check, Clock, Star } from 'lucide-react'
import { trackVideoCompleted } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import { updateVideoProgress, getVideoProgress } from '../actions'

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

// Real YouTube videos - curated PT-BR educational content from Brazilian channels
const placeholderVideos: VideoItem[] = [
  // Onboarding - Required videos (PT-BR)
  {
    id: '1',
    title: 'O que é Inteligência Artificial?',
    description:
      'Filipe Deschamps explica IA de forma simples e divertida - essencial para começar',
    url: 'https://www.youtube.com/watch?v=Lhu2QZbLxBI',
    thumbnail_url: ytThumb('Lhu2QZbLxBI'),
    duration_seconds: 720,
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
    description: 'Rafaella Ballerini ensina controle de versão do zero - essencial para contribuir',
    url: 'https://www.youtube.com/watch?v=DqTITcMq68k',
    thumbnail_url: ytThumb('DqTITcMq68k'),
    duration_seconds: 2100,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 2,
    agent_name: '',
    is_required: true,
  },
  {
    id: '3',
    title: 'Python para Iniciantes - Curso Completo',
    description: 'Curso Em Vídeo - Gustavo Guanabara - A melhor introdução ao Python em português',
    url: 'https://www.youtube.com/watch?v=S9uPNppGsGo',
    thumbnail_url: ytThumb('S9uPNppGsGo'),
    duration_seconds: 7200,
    category: 'onboarding',
    track: 'all',
    difficulty: 'beginner',
    order_index: 3,
    agent_name: '',
    is_required: true,
  },
  // Backend (PT-BR)
  {
    id: '4',
    title: 'FastAPI do Zero - Curso Completo',
    description: 'Eduardo Mendes (Dunossauro) - O melhor curso de FastAPI em português',
    url: 'https://www.youtube.com/watch?v=MxlS5_MI_WY',
    thumbnail_url: ytThumb('MxlS5_MI_WY'),
    duration_seconds: 10800,
    category: 'backend',
    track: 'backend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '5',
    title: 'APIs REST - Melhores Práticas',
    description: 'Código Fonte TV - Como projetar APIs profissionais e escaláveis',
    url: 'https://www.youtube.com/watch?v=ghTrp1x_1As',
    thumbnail_url: ytThumb('ghTrp1x_1As'),
    duration_seconds: 900,
    category: 'backend',
    track: 'backend',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  // Frontend (PT-BR - Rocketseat)
  {
    id: '6',
    title: 'Next.js na Prática - Rocketseat',
    description: 'Rocketseat - App Router, Server Components e o Next.js moderno',
    url: 'https://www.youtube.com/watch?v=pUGjjVYBXkE',
    thumbnail_url: ytThumb('pUGjjVYBXkE'),
    duration_seconds: 5400,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '7',
    title: 'Tailwind CSS na Prática',
    description: 'Rocketseat - Domine o framework CSS mais popular da atualidade',
    url: 'https://www.youtube.com/watch?v=1eLaBow7Zbo',
    thumbnail_url: ytThumb('1eLaBow7Zbo'),
    duration_seconds: 3600,
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
    description: 'Rocketseat - Aprenda TypeScript e escreva código mais seguro',
    url: 'https://www.youtube.com/watch?v=mRixno_uE2o',
    thumbnail_url: ytThumb('mRixno_uE2o'),
    duration_seconds: 3000,
    category: 'frontend',
    track: 'frontend',
    difficulty: 'beginner',
    order_index: 3,
    agent_name: '',
    is_required: false,
  },
  // IA/ML (PT-BR)
  {
    id: '9',
    title: 'LangChain em Português - Criando Agentes',
    description: 'Sandeco - Como criar agentes inteligentes com LangChain e Python',
    url: 'https://www.youtube.com/watch?v=1dTq_g8YS2g',
    thumbnail_url: ytThumb('1dTq_g8YS2g'),
    duration_seconds: 4800,
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
    description: 'Código Fonte TV - Técnicas avançadas para trabalhar com ChatGPT e LLMs',
    url: 'https://www.youtube.com/watch?v=7kf3MfItXY0',
    thumbnail_url: ytThumb('7kf3MfItXY0'),
    duration_seconds: 1200,
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
    description: 'Programação Dinâmica - Como criar sistemas de IA com memória e documentos',
    url: 'https://www.youtube.com/watch?v=lhby7Ql7hbk',
    thumbnail_url: ytThumb('lhby7Ql7hbk'),
    duration_seconds: 2400,
    category: 'ia',
    track: 'ia',
    difficulty: 'advanced',
    order_index: 3,
    agent_name: '',
    is_required: false,
  },
  // DevOps (PT-BR)
  {
    id: '12',
    title: 'Docker - Curso Completo',
    description: 'LINUXtips - Containerização do zero ao deploy em produção',
    url: 'https://www.youtube.com/watch?v=MeFyp4VnNx0',
    thumbnail_url: ytThumb('MeFyp4VnNx0'),
    duration_seconds: 7200,
    category: 'devops',
    track: 'devops',
    difficulty: 'beginner',
    order_index: 1,
    agent_name: '',
    is_required: false,
  },
  {
    id: '13',
    title: 'GitHub Actions - CI/CD na Prática',
    description: 'Código Fonte TV - Automatize deploys e testes com GitHub Actions',
    url: 'https://www.youtube.com/watch?v=7-4yOo1CnV8',
    thumbnail_url: ytThumb('7-4yOo1CnV8'),
    duration_seconds: 1200,
    category: 'devops',
    track: 'devops',
    difficulty: 'intermediate',
    order_index: 2,
    agent_name: '',
    is_required: false,
  },
  // Agents (PT-BR)
  {
    id: '14',
    title: 'Sistemas Multi-Agentes com IA',
    description: 'Sandeco - Como criar sistemas de múltiplos agentes de IA com Python',
    url: 'https://www.youtube.com/watch?v=EAT2bWXMgQY',
    thumbnail_url: ytThumb('EAT2bWXMgQY'),
    duration_seconds: 3600,
    category: 'agents',
    track: 'all',
    difficulty: 'advanced',
    order_index: 1,
    agent_name: 'abaporu',
    is_required: false,
  },
  {
    id: '15',
    title: 'Detecção de Anomalias com Python',
    description: 'Programação Dinâmica - Técnicas para identificar padrões suspeitos em dados',
    url: 'https://www.youtube.com/watch?v=s3ypP6yRNhI',
    thumbnail_url: ytThumb('s3ypP6yRNhI'),
    duration_seconds: 2700,
    category: 'agents',
    track: 'ia',
    difficulty: 'advanced',
    order_index: 2,
    agent_name: 'zumbi',
    is_required: false,
  },
]

// Demo mode: video progress stored in localStorage
const VIDEO_PROGRESS_KEY = 'agora_demo_video_progress'

interface VideoProgress {
  video_id: string
  watched_seconds: number
  progress_percentage: number
  status: string
  completed_at: string | null
}

export default function AcademyVideosPage() {
  const { user, isLoading, addXp } = useAgora()

  const [videos] = useState<VideoItem[]>(placeholderVideos)
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load progress from Supabase (if authenticated) or localStorage (demo mode)
  useEffect(() => {
    async function loadProgress() {
      if (user) {
        // Load from Supabase for authenticated users
        const result = await getVideoProgress()
        if (result.success && result.data && Object.keys(result.data).length > 0) {
          setProgress(result.data)
          // Also save to localStorage as backup
          localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(result.data))
        }
      } else if (typeof window !== 'undefined') {
        // Demo mode: load from localStorage
        const saved = localStorage.getItem(VIDEO_PROGRESS_KEY)
        if (saved) {
          setProgress(JSON.parse(saved))
        }
      }
    }
    loadProgress()
  }, [user])

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

  const markAsWatched = async (video: VideoItem) => {
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

    const xpAmount = video.is_required ? 25 : 15

    if (user) {
      // Sync with Supabase for authenticated users (XP auto-awarded by server action)
      const result = await updateVideoProgress(
        video.id,
        video.duration_seconds,
        video.duration_seconds,
        true
      )
      if (result.success) {
        // Trigger celebration modal
        useCelebrationStore.getState().celebrateVideo(video.title, result.xpAwarded || xpAmount)
      } else {
        // Fallback to demo mode XP if server action fails
        addXp(xpAmount, 'video', `Video assistido: ${video.title}`)
        useCelebrationStore.getState().celebrateVideo(video.title, xpAmount)
      }
    } else {
      // Demo mode: use local XP
      addXp(xpAmount, 'video', `Video assistido: ${video.title}`)
      useCelebrationStore.getState().celebrateVideo(video.title, xpAmount)
    }

    // Track video completion in PostHog
    trackVideoCompleted(video.id, video.title, video.duration_seconds)
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
    return <PageLoading text="Carregando videos..." />
  }

  return (
    <PageContainer background="operarios" maxWidth="5xl" padding="none">
      {/* Page Header */}
      <PageHeader
        backUrl="/pt/agora"
        title="Videos do Programa"
        subtitle={`${completedCount} de ${videos.length} assistidos`}
        icon={Video}
        actions={
          <Badge variant="warning" size="default">
            <Star className="w-3 h-3" />
            {totalRequired} obrigatorios
          </Badge>
        }
      />

      <main className="px-4 pb-8 pt-6">
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
              <GlassCard
                key={video.id}
                className={cn(
                  'group overflow-hidden animate-fade-in cursor-pointer hover:shadow-lg transition-all duration-300',
                  isCompleted && 'ring-2 ring-green-500/50'
                )}
                onClick={() => handleVideoClick(video)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                  {video.thumbnail_url && (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
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
                <GlassCardContent className="p-4">
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
                </GlassCardContent>
              </GlassCard>
            )
          })}
        </div>

        {filteredVideos.length === 0 && (
          <GlassCard className="text-center">
            <GlassCardContent className="py-12">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📺</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum vídeo nesta categoria
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Os vídeos serão adicionados em breve
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </main>

      {/* Video Modal */}
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
    </PageContainer>
  )
}
