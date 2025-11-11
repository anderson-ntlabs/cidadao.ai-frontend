/**
 * ContentCard Component
 *
 * Clickable card for landing page that opens modals with full content.
 * Features glass morphism design, hover effects, and smooth animations.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-06
 */

'use client'

import { cn } from '@/lib/utils'

interface ContentCardProps {
  icon: string // Emoji or icon
  title: string
  description: string
  onClick: () => void
  gradient?: string // Tailwind gradient classes
  className?: string
}

export function ContentCard({
  icon,
  title,
  description,
  onClick,
  gradient = 'from-green-500 to-blue-600',
  className,
}: ContentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles - Mobile optimized padding
        'group relative w-full',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
        'rounded-xl sm:rounded-2xl p-6 sm:p-8',
        'border border-gray-200/50 dark:border-gray-700/50',
        'shadow-lg hover:shadow-xl',
        // Transitions
        'transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'hover:-translate-y-1',
        // Focus - Touch friendly
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        // Touch target
        'min-h-[44px]',
        'touch-manipulation',
        className
      )}
      aria-label={`Abrir ${title}`}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10',
          'bg-gradient-to-br transition-opacity duration-300',
          gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
        {/* Icon - Mobile optimized size */}
        <div
          className={cn(
            'text-5xl sm:text-6xl mb-1 sm:mb-2',
            'transform transition-transform duration-300',
            'group-hover:scale-110 group-hover:rotate-3'
          )}
          role="img"
          aria-label={title}
        >
          {icon}
        </div>

        {/* Title - Mobile optimized size */}
        <h3
          className={cn(
            'text-xl sm:text-2xl font-bold',
            'bg-gradient-to-r bg-clip-text text-transparent',
            gradient,
            'group-hover:from-green-600 group-hover:to-blue-700',
            'transition-all duration-300'
          )}
        >
          {title}
        </h3>

        {/* Description - Mobile optimized */}
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
          {description}
        </p>

        {/* Click indicator - Hidden on mobile */}
        <div className="hidden sm:block mt-2 text-xs text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Clique para saber mais →
        </div>
      </div>
    </button>
  )
}
