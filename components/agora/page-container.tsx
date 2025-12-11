/**
 * Agora Page Container Component
 *
 * Standardized container for all Agora pages with:
 * - Consistent max-width options
 * - Background patterns (operarios, gradient, none)
 * - Padding options
 * - Aprendiz/Kids theme variants
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { cn } from '@/lib/utils'

export interface PageContainerProps {
  /** Container max width */
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  /** Padding size */
  padding?: 'none' | 'compact' | 'normal' | 'spacious'
  /** Background style */
  background?: 'none' | 'operarios' | 'gradient' | 'kids'
  /** Theme variant */
  variant?: 'aprendiz' | 'kids'
  /** Additional className for outer container */
  className?: string
  /** Additional className for inner content */
  contentClassName?: string
  /** Children */
  children: React.ReactNode
}

const maxWidthClasses = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

const paddingClasses = {
  none: '',
  compact: 'px-4 py-4',
  normal: 'px-4 py-6 sm:px-6 lg:px-8',
  spacious: 'px-4 py-8 sm:px-6 lg:px-8',
}

export function PageContainer({
  maxWidth = '5xl',
  padding = 'normal',
  background = 'none',
  variant = 'aprendiz',
  className,
  contentClassName,
  children,
}: PageContainerProps) {
  const isKids = variant === 'kids'
  const showOperarios = background === 'operarios'
  const showGradient = background === 'gradient' || background === 'operarios'
  const showKidsGradient = background === 'kids' || isKids

  return (
    <div className={cn('min-h-screen relative', className)}>
      {/* Operarios Background Image */}
      {showOperarios && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('/operarios.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.03,
          }}
        />
      )}

      {/* Gradient Overlay */}
      {showGradient && !showKidsGradient && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />
      )}

      {/* Kids Gradient */}
      {showKidsGradient && (
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-kids-cream to-white dark:from-gray-900 dark:to-gray-950" />
      )}

      {/* Content */}
      <div
        className={cn(
          'relative z-10 mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Simple wrapper for page content without background
 */
export interface ContentWrapperProps {
  /** Container max width */
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  /** Padding size */
  padding?: 'none' | 'compact' | 'normal' | 'spacious'
  /** Additional className */
  className?: string
  /** Children */
  children: React.ReactNode
}

export function ContentWrapper({
  maxWidth = '5xl',
  padding = 'normal',
  className,
  children,
}: ContentWrapperProps) {
  return (
    <div className={cn('mx-auto', maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
      {children}
    </div>
  )
}
