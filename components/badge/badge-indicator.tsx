'use client'

/**
 * Badge Indicator Component
 *
 * Small badge indicator shown in header and other places
 * Displays user's badges with hover preview
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useState, useEffect } from 'react'
import { Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBadgeStore } from '@/store/badge-store'
import { BADGES } from '@/data/badges'
import type { BadgeType } from '@/types/badge'

interface BadgeIndicatorProps {
  locale?: 'pt' | 'en'
  showTooltip?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function BadgeIndicator({
  locale = 'pt',
  showTooltip = true,
  size = 'md',
  onClick,
}: BadgeIndicatorProps) {
  const { badges, isLoading, newBadgeAnimation, clearNewBadgeAnimation } = useBadgeStore()
  const [isHovered, setIsHovered] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Check if user has the collaborator badge
  const hasCollaboratorBadge = badges.some((b) => b.badge_type === 'colaborador')
  const collaboratorInfo = BADGES.colaborador

  // Check if we have a new badge animation
  const showAnimation = newBadgeAnimation === 'colaborador'

  // Play entrance animation when badge is new
  useEffect(() => {
    if (showAnimation && !hasAnimated) {
      setHasAnimated(true)
      const timer = setTimeout(() => {
        clearNewBadgeAnimation()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showAnimation, hasAnimated, clearNewBadgeAnimation])

  // Don't render if no badges
  if (!hasCollaboratorBadge && !isLoading) return null

  return (
    <div className="relative inline-flex">
      {/* Badge button */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={
          locale === 'pt'
            ? `Badge: ${collaboratorInfo.name_pt}`
            : `Badge: ${collaboratorInfo.name_en}`
        }
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'transition-all duration-300',
          sizeClasses[size],
          // Badge styling
          'bg-gradient-to-br from-amber-400 to-yellow-500',
          'shadow-md shadow-amber-500/20',
          // Interactive states
          onClick && 'cursor-pointer hover:scale-110 active:scale-95',
          !onClick && 'cursor-default',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
          // Animation
          showAnimation && 'animate-bounce'
        )}
      >
        <Medal className={cn(iconSizes[size], 'text-white')} />

        {/* Glow effect on new badge */}
        {showAnimation && (
          <span className="absolute inset-0 rounded-full bg-amber-400/50 animate-ping" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && isHovered && (
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
            <p className="text-xs text-gray-400">
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
