/**
 * Academy Quick Action Card Component
 *
 * Reusable quick action button following the design system with:
 * - Icon and label
 * - Optional badge/notification
 * - Interactive hover effects
 * - Support for both Link and button behavior
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface QuickActionCardProps {
  icon: LucideIcon | string
  label: string
  description?: string
  href?: string
  onClick?: () => void
  badge?: string | number
  variant?: 'default' | 'primary' | 'gradient'
  className?: string
}

export function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  badge,
  variant = 'default',
  className,
}: QuickActionCardProps) {
  const variantClasses = {
    default: 'bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
    primary:
      'bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200/50 dark:border-green-700/30',
    gradient:
      'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 border border-green-200/50 dark:border-green-700/30',
  }

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl min-h-[72px]',
        'transition-all duration-200 group',
        variantClasses[variant],
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
          'transition-transform duration-200 group-hover:scale-110',
          variant === 'default'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'bg-white/80 dark:bg-gray-800/80'
        )}
      >
        {typeof Icon === 'string' ? (
          <span>{Icon}</span>
        ) : (
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
        )}
      </div>

      {/* Badge or Arrow */}
      {badge !== undefined ? (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {badge}
        </span>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}
