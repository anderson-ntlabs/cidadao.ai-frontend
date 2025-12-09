/**
 * Kids Video Player Page
 *
 * Embedded YouTube player for Kids videos.
 * Reuses Agora's video player pattern with Kids theme.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useKids } from '@/hooks/use-kids'
import { getKidsVideoById, getNextKidsVideo, getPreviousKidsVideo } from '@/data/kids-videos'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  Youtube,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export default function KidsVideoPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { trackVideo } = useKids()

  const videoId = params.videoId as string
  const video = getKidsVideoById(videoId)
  const nextVideo = getNextKidsVideo(videoId)
  const prevVideo = getPreviousKidsVideo(videoId)

  // Track video view
  if (video) {
    trackVideo(video.id)
  }

  // Video not found
  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard className="max-w-md">
          <GlassCardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-kids-coral/20 flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-8 h-8 text-kids-coral" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Video nao encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Este video nao existe ou foi removido.
            </p>
            <Link href="/pt/agora/kids/videos">
              <Button className="bg-kids-coral hover:bg-kids-coral/90">Voltar aos videos</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kids-cream to-white dark:from-gray-900 dark:to-gray-950 pb-8">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/pt/agora/kids/videos"
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-xs text-kids-coral uppercase tracking-wide font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Trilha Kids • Video {video.order}/12
                </p>
                <h1 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                  {video.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Video Player - YouTube Embed */}
        <GlassCard className="overflow-hidden">
          <div className="aspect-video bg-black relative">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <GlassCardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{video.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{video.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Duracao: {video.duration}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    <Youtube className="w-4 h-4" />
                    Ver no YouTube
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-kids-green">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Video registrado!</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevVideo ? (
            <Button
              onClick={() => router.push(`/pt/agora/kids/videos/${prevVideo.id}`)}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {prevVideo.title.length > 20
                ? prevVideo.title.substring(0, 20) + '...'
                : prevVideo.title}
            </Button>
          ) : (
            <div />
          )}

          {nextVideo ? (
            <Button
              onClick={() => router.push(`/pt/agora/kids/videos/${nextVideo.id}`)}
              className="bg-kids-coral hover:bg-kids-coral/90"
            >
              Proximo video
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/pt/agora/kids/dashboard')}
              className="bg-kids-green hover:bg-kids-green/90"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Voltar ao Dashboard
            </Button>
          )}
        </div>

        {/* Back to all videos */}
        <div className="text-center">
          <Link
            href="/pt/agora/kids/videos"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-kids-coral transition-colors"
          >
            Ver todos os videos da trilha
          </Link>
        </div>
      </main>
    </div>
  )
}
