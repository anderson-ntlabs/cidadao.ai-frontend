/**
 * Kids Videos Page
 *
 * Catalog of curated videos for children learning programming.
 * Displays all available videos in a kid-friendly grid.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState } from 'react'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { KIDS_VIDEOS, TOTAL_KIDS_VIDEOS } from '@/data/kids-videos'
import { KidsVideoCard, KidsVideo } from '@/components/kids'
import { PlayCircle, Loader2, ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function KidsVideosPage() {
  const { isReady, isLoading } = useRequireKidsMode()
  const { trackVideo } = useKids()

  // In a real app, this would come from the store/API
  const [watchedVideos] = useState<string[]>([])

  const handleVideoClick = (video: KidsVideo) => {
    trackVideo(video.id)
    // Open YouTube video
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
  }

  const progress = Math.round((watchedVideos.length / TOTAL_KIDS_VIDEOS) * 100)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Carregando vídeos...</p>
        </div>
      </div>
    )
  }

  // Not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Modo Kids não está ativo.</p>
          <Link
            href="/pt/agora"
            className="kids-button bg-primary text-primary-foreground px-6 py-3 rounded-full inline-block"
          >
            Voltar para Ágora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pt/agora/kids"
            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-kids-coral flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vídeos para Aprender</h1>
              <p className="text-sm text-muted-foreground">{TOTAL_KIDS_VIDEOS} vídeos incríveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="kids-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-kids-yellow" />
            <span className="font-bold text-lg">Seu Progresso</span>
          </div>
          <span className="text-2xl font-bold text-kids-coral">{progress}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-kids-coral to-kids-turquoise transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {watchedVideos.length} de {TOTAL_KIDS_VIDEOS} vídeos assistidos
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {KIDS_VIDEOS.map((video) => (
          <KidsVideoCard
            key={video.id}
            video={video}
            lang="pt"
            onClick={handleVideoClick}
            isWatched={watchedVideos.includes(video.id)}
          />
        ))}
      </div>

      {/* Encouragement Banner */}
      <div className="kids-card p-8 text-center bg-gradient-to-br from-kids-purple to-kids-turquoise">
        <h3 className="text-2xl font-bold text-white mb-2">Continue Aprendendo!</h3>
        <p className="text-lg text-white/90 max-w-lg mx-auto">
          Cada vídeo que você assistir te deixa mais perto de se tornar um programador incrível!
        </p>
      </div>
    </div>
  )
}
