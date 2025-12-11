/**
 * Kids Videos Page
 *
 * Catalog of curated videos for children organized by learning tracks.
 * Now fetches data from Supabase database.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-11 - Standardized loading state with PageLoading variant='kids'
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRequireKidsMode, useKids } from '@/hooks/use-kids'
import useAgoraTracks, { KidsVideo as KidsVideoType } from '@/hooks/use-agora-tracks'
import { KidsTrackCard } from '@/components/kids'
import { GlassCard } from '@/components/ui/glass-card'
import { PageLoading } from '@/components/agora'
import Image from 'next/image'
import Link from 'next/link'
import {
  PlayCircle,
  ArrowLeft,
  Trophy,
  Star,
  Clock,
  Rocket,
  Heart,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react'
import {
  trackKidsVideoWatched,
  calculateKidsTelemetry,
  getWatchedVideoIds,
} from '@/lib/analytics/kids-tracker'
import { cn } from '@/lib/utils'

// Helper to generate YouTube thumbnail URL
function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function KidsVideosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isReady, isLoading: kidsLoading } = useRequireKidsMode()
  const { trackVideo } = useKids()
  const { kidsTracks, isLoading: tracksLoading, getKidsTrack } = useAgoraTracks()

  // Get selected track from URL params
  const selectedTrackId = searchParams.get('trilha')
  const selectedTrack = selectedTrackId ? getKidsTrack(selectedTrackId) : null

  // Calculate total videos count
  const totalKidsVideos = useMemo(() => {
    return kidsTracks.reduce((sum, track) => sum + track.videos.length, 0)
  }, [kidsTracks])

  const isLoading = kidsLoading || tracksLoading

  const [telemetry, setTelemetry] = useState(() => calculateKidsTelemetry())
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>(() => getWatchedVideoIds())

  useEffect(() => {
    setTelemetry(calculateKidsTelemetry())
    setWatchedVideoIds(getWatchedVideoIds())
  }, [])

  // Calculate watched videos per track
  const watchedByTrack = useMemo(() => {
    const result: Record<string, number> = {}

    for (const track of kidsTracks) {
      result[track.id] = track.videos.filter((v) => watchedVideoIds.includes(v.id)).length
    }

    return result
  }, [watchedVideoIds, kidsTracks])

  const handleVideoClick = (video: KidsVideoType) => {
    trackVideo(video.id)
    const [minutes, seconds] = video.duration.split(':').map(Number)
    const durationSeconds = (minutes || 0) * 60 + (seconds || 0)
    trackKidsVideoWatched(video.id, video.title, durationSeconds)
    setTimeout(() => {
      setTelemetry(calculateKidsTelemetry())
      setWatchedVideoIds(getWatchedVideoIds())
    }, 100)
    router.push(`/pt/agora/kids/videos/${video.id}`)
  }

  // Calculate total progress
  const totalProgress =
    totalKidsVideos > 0 ? Math.round((telemetry.videosWatched / totalKidsVideos) * 100) : 0

  // Loading state
  if (isLoading) {
    return <PageLoading text="Carregando videos..." variant="kids" icon={PlayCircle} />
  }

  // Not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-kids-coral/20 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-kids-coral" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Modo Kids nao esta ativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Peca para seus pais configurarem a Area Kids!
          </p>
          <Link
            href="/pt/agora"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kids-coral text-white font-medium hover:bg-kids-coral/90 transition-colors"
          >
            Voltar para Agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Show track selection if no track is selected
  if (!selectedTrack) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/pt/agora/kids/dashboard"
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kids-purple to-kids-coral flex items-center justify-center shadow-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Trilhas de Aprendizado
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha uma trilha para comecar!
              </p>
            </div>
          </div>
        </div>

        {/* Total Progress Card */}
        <GlassCard className="p-6 bg-gradient-to-br from-kids-coral/10 to-kids-yellow/10 dark:from-kids-coral/5 dark:to-kids-yellow/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kids-yellow to-kids-orange flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Progresso Total</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {telemetry.videosWatched} de {totalKidsVideos} videos
                </p>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {totalProgress}% completo
                </span>
                <div className="flex items-center gap-1 text-kids-orange">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{telemetry.videosWatched}</span>
                </div>
              </div>
              <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-kids-coral via-kids-orange to-kids-yellow rounded-full transition-all duration-700"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>

            {totalProgress >= 100 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-kids-green text-white font-medium">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completo!</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Track Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kidsTracks.map((track) => (
            <KidsTrackCard
              key={track.id}
              track={track}
              watchedCount={watchedByTrack[track.id] || 0}
            />
          ))}
        </div>

        {/* Encouragement Banner */}
        <GlassCard className="p-8 text-center bg-gradient-to-br from-kids-purple to-kids-turquoise text-white">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Rocket className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Escolha sua Aventura!</h3>
          </div>
          <p className="text-lg text-white/90 max-w-lg mx-auto">
            Cada trilha te ensina coisas incriveis sobre o mundo da tecnologia!
          </p>
        </GlassCard>
      </div>
    )
  }

  // Show videos for selected track
  const trackProgress =
    selectedTrack.videos.length > 0
      ? Math.round(((watchedByTrack[selectedTrack.id] || 0) / selectedTrack.videos.length) * 100)
      : 0

  // Get track color classes based on track.color
  const getTrackGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      coral: 'bg-gradient-to-br from-kids-coral to-kids-orange',
      turquoise: 'bg-gradient-to-br from-kids-turquoise to-kids-green',
      purple: 'bg-gradient-to-br from-kids-purple to-kids-coral',
      green: 'bg-gradient-to-br from-kids-green to-kids-turquoise',
      orange: 'bg-gradient-to-br from-kids-orange to-kids-yellow',
    }
    return colorMap[color] || colorMap.coral
  }

  const getTrackBgGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      coral: 'bg-gradient-to-br from-kids-coral/10 to-kids-orange/10',
      turquoise: 'bg-gradient-to-br from-kids-turquoise/10 to-kids-green/10',
      purple: 'bg-gradient-to-br from-kids-purple/10 to-kids-coral/10',
      green: 'bg-gradient-to-br from-kids-green/10 to-kids-turquoise/10',
      orange: 'bg-gradient-to-br from-kids-orange/10 to-kids-yellow/10',
    }
    return colorMap[color] || colorMap.coral
  }

  const getTrackBarGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      coral: 'from-kids-coral to-kids-orange',
      turquoise: 'from-kids-turquoise to-kids-green',
      purple: 'from-kids-purple to-kids-coral',
      green: 'from-kids-green to-kids-turquoise',
      orange: 'from-kids-orange to-kids-yellow',
    }
    return colorMap[color] || colorMap.coral
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pt/agora/kids/videos"
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-2xl',
                getTrackGradient(selectedTrack.color)
              )}
            >
              {selectedTrack.emoji}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTrack.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTrack.videos.length} videos incriveis para voce!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <GlassCard className={cn('p-6', getTrackBgGradient(selectedTrack.color))}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kids-yellow to-kids-orange flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Seu Progresso</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {watchedByTrack[selectedTrack.id]} de {selectedTrack.videos.length} videos
              </p>
            </div>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {trackProgress}% completo
              </span>
              <div className="flex items-center gap-1 text-kids-orange">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{watchedByTrack[selectedTrack.id]}</span>
              </div>
            </div>
            <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 bg-gradient-to-r',
                  getTrackBarGradient(selectedTrack.color)
                )}
                style={{ width: `${trackProgress}%` }}
              />
            </div>
          </div>

          {trackProgress >= 100 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-kids-green text-white font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Completo!</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {selectedTrack.videos.map((video, index) => {
          const isWatched = watchedVideoIds.includes(video.id)
          const thumbnailUrl = video.thumbnail || ytThumb(video.youtubeId)
          return (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className="group text-left"
            >
              <GlassCard className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge number */}
                  <div
                    className={cn(
                      'absolute top-3 left-3 w-8 h-8 rounded-full shadow-lg flex items-center justify-center',
                      isWatched ? 'bg-kids-green' : 'bg-white'
                    )}
                  >
                    {isWatched ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-kids-coral">#{index + 1}</span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-kids-coral shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-kids-coral transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </GlassCard>
            </button>
          )
        })}
      </div>

      {/* Encouragement Banner */}
      <GlassCard className="p-8 text-center bg-gradient-to-br from-kids-purple to-kids-turquoise text-white">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Rocket className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Continue Aprendendo!</h3>
        </div>
        <p className="text-lg text-white/90 max-w-lg mx-auto">
          Cada video que voce assistir te deixa mais perto de se tornar um programador incrivel!
        </p>
      </GlassCard>
    </div>
  )
}
