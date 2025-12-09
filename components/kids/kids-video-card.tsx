/**
 * Kids Video Card Component
 *
 * Displays YouTube videos in a child-friendly card format
 * with large thumbnails and playful design.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import Image from 'next/image'
import { Play, Clock, CheckCircle } from 'lucide-react'

export interface KidsVideo {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: string
  thumbnail: string
  order: number
  watched?: boolean
}

interface KidsVideoCardProps {
  video: KidsVideo
  lang?: 'pt' | 'en'
  onClick?: (video: KidsVideo) => void
  isWatched?: boolean
}

export function KidsVideoCard({
  video,
  lang = 'pt',
  onClick,
  isWatched = false,
}: KidsVideoCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(video)
    }
  }

  // Determine card color based on order for variety
  const colors = [
    { border: 'border-kids-coral', bg: 'bg-kids-coral' },
    { border: 'border-kids-turquoise', bg: 'bg-kids-turquoise' },
    { border: 'border-kids-yellow', bg: 'bg-kids-yellow' },
    { border: 'border-kids-purple', bg: 'bg-kids-purple' },
    { border: 'border-kids-green', bg: 'bg-kids-green' },
    { border: 'border-kids-orange', bg: 'bg-kids-orange' },
  ]
  const colorIndex = (video.order - 1) % colors.length
  const color = colors[colorIndex]

  return (
    <button
      onClick={handleClick}
      className={`
        kids-card w-full overflow-hidden text-left
        border-4 ${color.border}
        ${isWatched ? 'opacity-75' : ''}
        hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-primary/30
        transition-all duration-200
      `}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div
            className={`
            h-16 w-16 rounded-full ${color.bg}
            flex items-center justify-center
            shadow-lg
            transition-transform hover:scale-110
          `}
          >
            <Play className="h-8 w-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-white text-xs font-medium">
          <Clock className="h-3 w-3" />
          {video.duration}
        </div>

        {/* Watched Badge */}
        {isWatched && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-kids-green px-2 py-1 text-white text-xs font-bold">
            <CheckCircle className="h-3 w-3" />
            {lang === 'pt' ? 'Assistido!' : 'Watched!'}
          </div>
        )}

        {/* Order Badge */}
        <div
          className={`
          absolute top-2 left-2
          h-8 w-8 rounded-full ${color.bg}
          flex items-center justify-center
          text-white font-bold text-sm
          shadow-md
        `}
        >
          {video.order}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-foreground line-clamp-2">{video.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
      </div>
    </button>
  )
}

export default KidsVideoCard
