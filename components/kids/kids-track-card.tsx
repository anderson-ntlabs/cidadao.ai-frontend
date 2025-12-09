/**
 * Kids Track Card Component
 *
 * Displays a learning track with video count and progress.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { PlayCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { KidsTrack, KidsTrackId } from '@/data/kids-videos'
import { cn } from '@/lib/utils'

interface KidsTrackCardProps {
  track: KidsTrack
  watchedCount: number
  className?: string
}

const trackColors: Record<KidsTrackId, string> = {
  programacao: 'from-kids-coral to-kids-orange',
  'porque-programar': 'from-kids-turquoise to-kids-green',
  'historia-computacao': 'from-kids-purple to-kids-coral',
}

const trackBgColors: Record<KidsTrackId, string> = {
  programacao: 'bg-kids-coral/10 dark:bg-kids-coral/20',
  'porque-programar': 'bg-kids-turquoise/10 dark:bg-kids-turquoise/20',
  'historia-computacao': 'bg-kids-purple/10 dark:bg-kids-purple/20',
}

export function KidsTrackCard({ track, watchedCount, className }: KidsTrackCardProps) {
  const totalVideos = track.videos.length
  const progress = Math.round((watchedCount / totalVideos) * 100)
  const isComplete = progress >= 100

  return (
    <Link
      href={`/pt/agora/kids/videos?trilha=${track.id}`}
      className={cn('block group', className)}
    >
      <GlassCard
        className={cn(
          'overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]',
          trackBgColors[track.id]
        )}
      >
        <div className="p-6">
          {/* Header with emoji and progress */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg text-2xl',
                trackColors[track.id]
              )}
            >
              {track.emoji}
            </div>
            {isComplete ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-kids-green text-white text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completa!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <PlayCircle className="w-4 h-4" />
                <span>
                  {watchedCount}/{totalVideos}
                </span>
              </div>
            )}
          </div>

          {/* Track info */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-kids-coral transition-colors">
            {track.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {track.description}
          </p>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="h-2 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                  trackColors[track.id]
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Video count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{totalVideos} vídeos</span>
            <span className="flex items-center gap-1 text-kids-coral font-medium group-hover:gap-2 transition-all">
              {isComplete ? 'Rever trilha' : 'Começar'}
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

export default KidsTrackCard
