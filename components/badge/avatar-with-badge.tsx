'use client'

/**
 * Avatar With Badge Component
 *
 * Displays user avatar with a small badge overlay in the corner
 * Used in header and other places where compact badge display is needed
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-01
 */

import { useState } from 'react'
import Image from 'next/image'
import { Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBadgeStore } from '@/store/badge-store'
import { BADGES } from '@/data/badges'

interface AvatarWithBadgeProps {
  src?: string | null
  alt: string
  fallbackInitial?: string
  size?: 'sm' | 'md' | 'lg'
  locale?: 'pt' | 'en'
  showBadge?: boolean
  className?: string
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const avatarPixels = {
  sm: 32,
  md: 40,
  lg: 48,
}

const badgeSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const badgeIconSizes = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
}

const badgePositions = {
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-1 -right-1',
  lg: '-bottom-1 -right-1',
}

export function AvatarWithBadge({
  src,
  alt,
  fallbackInitial = 'U',
  size = 'md',
  locale = 'pt',
  showBadge = true,
  className,
}: AvatarWithBadgeProps) {
  const { badges } = useBadgeStore()
  const [isHovered, setIsHovered] = useState(false)

  // Check if user has the collaborator badge
  const hasCollaboratorBadge = badges.some((b) => b.badge_type === 'colaborador')
  const collaboratorInfo = BADGES.colaborador

  const shouldShowBadge = showBadge && hasCollaboratorBadge

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={avatarPixels[size]}
          height={avatarPixels[size]}
          className={cn(avatarSizes[size], 'rounded-full object-cover shadow-md')}
        />
      ) : (
        <div
          className={cn(
            avatarSizes[size],
            'rounded-full bg-gradient-to-br from-green-600 via-yellow-500 to-blue-600',
            'flex items-center justify-center text-white font-medium shadow-md'
          )}
        >
          {fallbackInitial.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Badge overlay - small in the corner */}
      {shouldShowBadge && (
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full',
            'bg-gradient-to-br from-amber-400 to-yellow-500',
            'shadow-sm ring-2 ring-white dark:ring-gray-900',
            'transition-transform duration-200',
            badgeSizes[size],
            badgePositions[size],
            isHovered && 'scale-110'
          )}
          aria-label={
            locale === 'pt'
              ? `Badge: ${collaboratorInfo.name_pt}`
              : `Badge: ${collaboratorInfo.name_en}`
          }
        >
          <Medal className={cn(badgeIconSizes[size], 'text-white')} />
        </div>
      )}

      {/* Tooltip - appears on hover */}
      {shouldShowBadge && isHovered && (
        <div
          className={cn(
            'absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          role="tooltip"
        >
          <div
            className={cn(
              'px-3 py-2 rounded-lg shadow-lg',
              'bg-gray-900 dark:bg-gray-800',
              'border border-gray-700',
              'whitespace-nowrap'
            )}
          >
            <p className="text-sm font-medium text-white">
              {locale === 'pt' ? collaboratorInfo.name_pt : collaboratorInfo.name_en}
            </p>
            <p className="text-xs text-gray-400 max-w-[200px]">
              {locale === 'pt' ? collaboratorInfo.description_pt : collaboratorInfo.description_en}
            </p>

            {/* Arrow */}
            <div
              className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 -mb-px',
                'border-4 border-transparent border-b-gray-900 dark:border-b-gray-800'
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
