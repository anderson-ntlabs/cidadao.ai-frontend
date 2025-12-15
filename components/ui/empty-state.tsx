'use client'

import { type LucideIcon, Search, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * Empty State Component
 *
 * Displays a friendly message when there's no content to show.
 * Used across the application for consistent empty state UX.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages yet"
 *   description="Start a conversation to see messages here"
 *   action={{ label: "Start Chat", onClick: () => {} }}
 * />
 * ```
 */

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: LucideIcon
}

export interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon
  /** Main title */
  title: string
  /** Description text */
  description?: string
  /** Primary action button */
  action?: EmptyStateAction
  /** Secondary action button */
  secondaryAction?: EmptyStateAction
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Visual variant */
  variant?: 'default' | 'muted' | 'success' | 'warning' | 'error'
}

const sizeConfig = {
  sm: {
    icon: 'w-10 h-10',
    iconContainer: 'w-16 h-16',
    title: 'text-base',
    description: 'text-sm',
    spacing: 'gap-3',
    padding: 'py-6',
  },
  md: {
    icon: 'w-12 h-12',
    iconContainer: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'gap-4',
    padding: 'py-8',
  },
  lg: {
    icon: 'w-16 h-16',
    iconContainer: 'w-24 h-24',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'gap-5',
    padding: 'py-12',
  },
}

const variantConfig = {
  default: {
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-400 dark:text-gray-500',
    titleColor: 'text-gray-900 dark:text-gray-100',
    descColor: 'text-gray-500 dark:text-gray-400',
  },
  muted: {
    iconBg: 'bg-gray-50 dark:bg-gray-900',
    iconColor: 'text-gray-300 dark:text-gray-600',
    titleColor: 'text-gray-600 dark:text-gray-400',
    descColor: 'text-gray-400 dark:text-gray-500',
  },
  success: {
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-500 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
    descColor: 'text-green-600 dark:text-green-400',
  },
  warning: {
    iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
    descColor: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
    descColor: 'text-red-600 dark:text-red-400',
  },
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizeStyles = sizeConfig[size]
  const variantStyles = variantConfig[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeStyles.spacing,
        sizeStyles.padding,
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon Container */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          sizeStyles.iconContainer,
          variantStyles.iconBg
        )}
      >
        <Icon className={cn(sizeStyles.icon, variantStyles.iconColor)} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold', sizeStyles.title, variantStyles.titleColor)}>{title}</h3>

      {/* Description */}
      {description && (
        <p className={cn('max-w-sm', sizeStyles.description, variantStyles.descColor)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              leftIcon={action.icon ? <action.icon className="w-4 h-4" /> : undefined}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'ghost'}
              onClick={secondaryAction.onClick}
              leftIcon={
                secondaryAction.icon ? <secondaryAction.icon className="w-4 h-4" /> : undefined
              }
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Specialized empty states for common scenarios
 */

export function EmptyStateSearch({
  searchTerm,
  onClear,
  className,
}: {
  searchTerm?: string
  onClear?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description={
        searchTerm
          ? `Não encontramos resultados para "${searchTerm}". Tente ajustar sua busca.`
          : 'Tente ajustar os filtros ou termos de busca.'
      }
      action={
        onClear ? { label: 'Limpar busca', onClick: onClear, variant: 'secondary' } : undefined
      }
      className={className}
    />
  )
}

export function EmptyStateError({
  onRetry,
  message,
  className,
}: {
  onRetry?: () => void
  message?: string
  className?: string
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Algo deu errado"
      description={message || 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.'}
      action={
        onRetry ? { label: 'Tentar novamente', onClick: onRetry, icon: RefreshCw } : undefined
      }
      variant="error"
      className={className}
    />
  )
}
