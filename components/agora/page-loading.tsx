/**
 * Agora Page Loading Component
 *
 * Standardized loading state for all Agora pages with:
 * - Animated icon
 * - Loading text
 * - Aprendiz/Kids theme variants
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { type LucideIcon, GraduationCap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageLoadingProps {
  /** Loading message */
  text?: string
  /** Theme variant */
  variant?: 'aprendiz' | 'kids'
  /** Custom icon (defaults to GraduationCap for aprendiz, Sparkles for kids) */
  icon?: LucideIcon
  /** Additional className for the container */
  className?: string
}

export function PageLoading({
  text = 'Carregando...',
  variant = 'aprendiz',
  icon,
  className,
}: PageLoadingProps) {
  const isKids = variant === 'kids'
  const Icon = icon || (isKids ? Sparkles : GraduationCap)

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center',
        isKids
          ? 'bg-gradient-to-b from-kids-cream to-white dark:from-gray-900 dark:to-gray-950'
          : 'bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        className
      )}
    >
      <div className="text-center">
        <div
          className={cn(
            'w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg',
            isKids
              ? 'rounded-2xl bg-gradient-to-br from-kids-turquoise to-kids-coral'
              : 'rounded-2xl bg-gradient-to-br from-green-500 to-blue-600'
          )}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <p
          className={cn(
            isKids ? 'text-gray-600 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

/**
 * Inline loading spinner for smaller areas
 */
export interface InlineLoadingProps {
  /** Loading message */
  text?: string
  /** Theme variant */
  variant?: 'aprendiz' | 'kids'
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
}

export function InlineLoading({
  text,
  variant = 'aprendiz',
  size = 'md',
  className,
}: InlineLoadingProps) {
  const isKids = variant === 'kids'

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          isKids
            ? 'border-kids-turquoise/30 border-t-kids-coral'
            : 'border-green-200 border-t-green-600'
        )}
      />
      {text && (
        <p
          className={cn(
            'text-sm',
            isKids ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}
