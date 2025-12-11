/**
 * Kids Track Card Component
 *
 * Displays a learning track with video count and progress.
 * Now supports both database types and legacy hardcoded types.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-11 - Support database KidsTrack type
 */

'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { PlayCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { KidsTrack as DBKidsTrack } from '@/hooks/use-agora-tracks'
import { cn } from '@/lib/utils'

// Accept database type
interface KidsTrackCardProps {
  track: DBKidsTrack
  watchedCount: number
  className?: string
}

// Dynamic color mapping based on track.color field
const getTrackGradient = (color: string) => {
  const colorMap: Record<string, string> = {
    coral: 'from-kids-coral to-kids-orange',
    turquoise: 'from-kids-turquoise to-kids-green',
    purple: 'from-kids-purple to-kids-coral',
    green: 'from-kids-green to-kids-turquoise',
    orange: 'from-kids-orange to-kids-yellow',
  }
  return colorMap[color] || colorMap.coral
}

const getTrackBgColor = (color: string) => {
  const colorMap: Record<string, string> = {
    coral: 'bg-kids-coral/10 dark:bg-kids-coral/20',
    turquoise: 'bg-kids-turquoise/10 dark:bg-kids-turquoise/20',
    purple: 'bg-kids-purple/10 dark:bg-kids-purple/20',
    green: 'bg-kids-green/10 dark:bg-kids-green/20',
    orange: 'bg-kids-orange/10 dark:bg-kids-orange/20',
  }
  return colorMap[color] || colorMap.coral
}

export function KidsTrackCard({ track, watchedCount, className }: KidsTrackCardProps) {
  const totalVideos = track.videos.length
  const progress = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0
  const isComplete = progress >= 100

  return (
    <Link
      href={`/pt/agora/kids/videos?trilha=${track.id}`}
      className={cn('block group', className)}
    >
      <GlassCard
        className={cn(
          'overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]',
          getTrackBgColor(track.color)
        )}
      >
        <div className="p-6">
          {/* Header with emoji and progress */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg text-2xl',
                getTrackGradient(track.color)
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
                  getTrackGradient(track.color)
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
