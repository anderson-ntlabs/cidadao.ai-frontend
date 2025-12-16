/**
 * Academy Videos Page
 *
 * Video learning library with:
 * - Category filtering
 * - Progress tracking
 * - XP rewards
 * - Database-driven content (no hardcoded videos)
 *
 * Author: Anderson Henrique da Silva
 * Refactored: 2025-12-06 - Design System integration
 * Updated: 2025-12-11 - Standardized layout with PageHeader/PageContainer
 * Updated: 2025-12-16 - Migrated to database-driven videos
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { cn } from '@/lib/utils'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader, PageLoading, PageContainer } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import Image from 'next/image'
import { Play, Video, Check, Clock, Star, RefreshCw, Database, Users } from 'lucide-react'
import { trackVideoCompleted } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import { updateVideoProgress, getVideoProgress } from '../actions'
import { fetchVideos, demoVideos, type VideoItem } from '@/lib/agora/videos'

const categories = [
  { id: 'all', name: 'Todos', emoji: '📺' },
  { id: 'onboarding', name: 'Onboarding', emoji: '🚀' },
  { id: 'backend', name: 'Backend', emoji: '⚙️' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨' },
  { id: 'ia', name: 'IA/ML', emoji: '🤖' },
  { id: 'devops', name: 'DevOps', emoji: '🔧' },
  { id: 'agents', name: 'Agentes', emoji: '🎭' },
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
  const { user, isLoading: userLoading, addXp } = useAgora()

  const [videos, setVideos] = useState<VideoItem[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch videos from database
  const loadVideos = useCallback(async () => {
    setIsLoadingVideos(true)

    const { data, error } = await fetchVideos()

    if (data && data.length > 0 && !error) {
      setVideos(data)
      setIsUsingSupabase(true)
    } else {
      // Fallback to demo videos
      setVideos(demoVideos)
      setIsUsingSupabase(false)
    }

    setIsLoadingVideos(false)
  }, [])

  // Load videos on mount
  useEffect(() => {
    void loadVideos()
  }, [loadVideos])

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadVideos()
    setIsRefreshing(false)
  }

  const isLoading = userLoading || isLoadingVideos
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
    void loadProgress()
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
        void addXp(xpAmount, 'video', `Video assistido: ${video.title}`)
        useCelebrationStore.getState().celebrateVideo(video.title, xpAmount)
      }
    } else {
      // Demo mode: use local XP
      void addXp(xpAmount, 'video', `Video assistido: ${video.title}`)
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
          <div className="flex items-center gap-2">
            {isUsingSupabase ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Ao vivo
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Demo
              </Badge>
            )}
            <Badge variant="warning" size="default">
              <Star className="w-3 h-3" />
              {totalRequired} obrigatorios
            </Badge>
            <Button
              onClick={() => void handleRefresh()}
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
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
                {selectedVideo.youtube_id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?rel=0&modestbranding=1`}
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
                        void markAsWatched(selectedVideo)
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
