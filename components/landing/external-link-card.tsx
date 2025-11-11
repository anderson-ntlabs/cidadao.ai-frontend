/**
 * ExternalLinkCard Component
 *
 * Card component for external links (GitHub, Docs, API) with
 * visual feedback and external link icon.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-06
 */

'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExternalLinkCardProps {
  icon: string // Emoji
  title: string
  description: string
  href: string
  className?: string
}

export function ExternalLinkCard({
  icon,
  title,
  description,
  href,
  className,
}: ExternalLinkCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // Base styles - Mobile optimized
        'group relative block w-full',
        'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'rounded-lg sm:rounded-xl p-5 sm:p-6',
        'border border-gray-200/50 dark:border-gray-700/50',
        'shadow hover:shadow-lg',
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
      aria-label={`${title} - Abrir em nova aba`}
    >
      {/* Content */}
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
        {/* Icon - Mobile optimized */}
        <div
          className={cn(
            'text-3xl sm:text-4xl mb-1',
            'transform transition-transform duration-300',
            'group-hover:scale-110'
          )}
          role="img"
          aria-label={title}
        >
          {icon}
        </div>

        {/* Title with external link icon */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {title}
          </h3>
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0" />
        </div>

        {/* Description - Mobile optimized */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
