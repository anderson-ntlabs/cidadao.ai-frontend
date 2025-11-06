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
        // Base styles
        'group relative w-full',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
        'rounded-2xl p-8',
        'border border-gray-200/50 dark:border-gray-700/50',
        'shadow-lg hover:shadow-xl',
        // Transitions
        'transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'hover:-translate-y-1',
        // Focus
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        className
      )}
      aria-label={`Abrir ${title}`}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10',
          'bg-gradient-to-br transition-opacity duration-300',
          gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'text-6xl mb-2',
            'transform transition-transform duration-300',
            'group-hover:scale-110 group-hover:rotate-3'
          )}
          role="img"
          aria-label={title}
        >
          {icon}
        </div>

        {/* Title */}
        <h3
          className={cn(
            'text-2xl font-bold',
            'bg-gradient-to-r bg-clip-text text-transparent',
            gradient,
            'group-hover:from-green-600 group-hover:to-blue-700',
            'transition-all duration-300'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>

        {/* Click indicator */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Clique para saber mais →
        </div>
      </div>
    </button>
  )
}
