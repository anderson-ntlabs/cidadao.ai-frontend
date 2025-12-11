/**
 * Agora Page Header Component
 *
 * Standardized header for all Agora pages with:
 * - Back button navigation
 * - Title and subtitle
 * - Icon indicator
 * - Optional action buttons
 * - Aprendiz/Kids theme variants
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import Link from 'next/link'
import { type LucideIcon, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  /** URL to navigate back to */
  backUrl: string
  /** Back button aria label for accessibility */
  backLabel?: string
  /** Page title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Icon component to display */
  icon: LucideIcon
  /** Optional action buttons on the right */
  actions?: React.ReactNode
  /** Theme variant */
  variant?: 'aprendiz' | 'kids'
  /** Additional className */
  className?: string
}

export function PageHeader({
  backUrl,
  backLabel = 'Voltar',
  title,
  subtitle,
  icon: Icon,
  actions,
  variant = 'aprendiz',
  className,
}: PageHeaderProps) {
  const isKids = variant === 'kids'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 backdrop-blur-xl border-b',
        isKids
          ? 'bg-white/90 dark:bg-gray-900/90 border-kids-turquoise/20'
          : 'bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50',
        className
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href={backUrl}
              aria-label={backLabel}
              className={cn(
                'w-10 h-10 flex items-center justify-center transition-colors',
                isKids
                  ? 'rounded-2xl bg-kids-turquoise/10 text-kids-turquoise hover:bg-kids-turquoise/20'
                  : 'rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Title Section */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'w-10 h-10 flex items-center justify-center',
                  isKids
                    ? 'rounded-2xl bg-gradient-to-br from-kids-coral to-kids-orange'
                    : 'rounded-xl bg-gradient-to-br from-green-500 to-blue-600'
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <div>
                <h1
                  className={cn(
                    'font-bold text-xl',
                    isKids ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                  )}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className={cn(
                      'text-sm',
                      isKids
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
