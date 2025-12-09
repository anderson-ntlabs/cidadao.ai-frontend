/**
 * Kids Videos Page
 *
 * Catalog of curated videos for children learning programming.
 * Uses Agora Design System with Kids theme.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Consolidated with Agora design system
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireKidsMode, useKids } from '@/hooks/use-kids'
import { KIDS_VIDEOS, TOTAL_KIDS_VIDEOS } from '@/data/kids-videos'
import { KidsVideo } from '@/components/kids'
import { GlassCard } from '@/components/ui/glass-card'
import Image from 'next/image'
import Link from 'next/link'
import {
  PlayCircle,
  Loader2,
  ArrowLeft,
  Trophy,
  Star,
  Clock,
  Rocket,
  Heart,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { trackKidsVideoWatched, calculateKidsTelemetry } from '@/lib/analytics/kids-tracker'

export default function KidsVideosPage() {
  const router = useRouter()
  const { isReady, isLoading } = useRequireKidsMode()
  const { trackVideo } = useKids()

  const [telemetry, setTelemetry] = useState(() => calculateKidsTelemetry())

  useEffect(() => {
    setTelemetry(calculateKidsTelemetry())
  }, [])

  const handleVideoClick = (video: KidsVideo) => {
    trackVideo(video.id)
    const [minutes, seconds] = video.duration.split(':').map(Number)
    const durationSeconds = (minutes || 0) * 60 + (seconds || 0)
    trackKidsVideoWatched(video.id, video.title, durationSeconds)
    setTimeout(() => setTelemetry(calculateKidsTelemetry()), 100)
    // Navigate to video player page instead of opening new tab
    router.push(`/pt/agora/kids/videos/${video.id}`)
  }

  const progress = Math.round((telemetry.videosWatched / TOTAL_KIDS_VIDEOS) * 100)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kids-coral to-kids-yellow flex items-center justify-center animate-pulse">
            <PlayCircle className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Carregando vídeos...
          </p>
        </div>
      </div>
    )
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
            Modo Kids não está ativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Peça para seus pais configurarem a Área Kids!
          </p>
          <Link
            href="/pt/agora"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kids-coral text-white font-medium hover:bg-kids-coral/90 transition-colors"
          >
            Voltar para Ágora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pt/agora/kids/dashboard"
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kids-coral to-kids-yellow flex items-center justify-center shadow-lg">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Trilha de Programação
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {TOTAL_KIDS_VIDEOS} vídeos incríveis para você!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-kids-coral/10 to-kids-yellow/10 dark:from-kids-coral/5 dark:to-kids-yellow/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kids-yellow to-kids-orange flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Seu Progresso</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {telemetry.videosWatched} de {TOTAL_KIDS_VIDEOS} vídeos
              </p>
            </div>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {progress}% completo
              </span>
              <div className="flex items-center gap-1 text-kids-orange">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{telemetry.videosWatched}</span>
              </div>
            </div>
            <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-kids-coral via-kids-orange to-kids-yellow rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {progress >= 100 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-kids-green text-white font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Completo!</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {KIDS_VIDEOS.map((video, index) => (
          <button
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className="group text-left"
          >
            <GlassCard className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badge number */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-kids-coral">#{index + 1}</span>
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
        ))}
      </div>

      {/* Encouragement Banner */}
      <GlassCard className="p-8 text-center bg-gradient-to-br from-kids-purple to-kids-turquoise text-white">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Rocket className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Continue Aprendendo!</h3>
        </div>
        <p className="text-lg text-white/90 max-w-lg mx-auto">
          Cada vídeo que você assistir te deixa mais perto de se tornar um programador incrível! 🌟
        </p>
      </GlassCard>
    </div>
  )
}
