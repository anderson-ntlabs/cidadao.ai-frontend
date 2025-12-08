'use client'

import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

/**
 * Loading Component - Consistent loading states
 *
 * @example
 * // Inline loading
 * <Loading size="sm" />
 *
 * // With text
 * <Loading text="Carregando dados..." />
 *
 * // Full screen overlay
 * <Loading fullScreen text="Processando..." />
 */

const loadingVariants = cva(
  'animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700',
  {
    variants: {
      size: {
        xs: 'w-4 h-4',
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
      },
      color: {
        primary: 'border-t-primary',
        green: 'border-t-green-600 dark:border-t-green-500',
        blue: 'border-t-blue-600 dark:border-t-blue-500',
        white: 'border-t-white',
        muted: 'border-t-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'green',
    },
  }
)

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  /** Loading text */
  text?: string
  /** Show as full screen overlay */
  fullScreen?: boolean
  /** Additional CSS classes */
  className?: string
  /** Center the loading indicator */
  centered?: boolean
}

export function Loading({
  size,
  color,
  text,
  fullScreen = false,
  centered = false,
  className,
}: LoadingProps) {
  const spinner = (
    <div
      className={cn(loadingVariants({ size, color }), className)}
      role="status"
      aria-label={text || 'Carregando...'}
    >
      <span className="sr-only">{text || 'Carregando...'}</span>
    </div>
  )

  const content = text ? (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  ) : (
    spinner
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  if (centered) {
    return <div className="flex items-center justify-center w-full py-8">{content}</div>
  }

  return content
}

/**
 * Loading Dots - Alternative loading indicator
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
    </div>
  )
}

/**
 * Loading Bar - Linear progress indicator
 */
export function LoadingBar({
  progress,
  className,
  showPercent = false,
}: {
  progress?: number
  className?: string
  showPercent?: boolean
}) {
  const isIndeterminate = progress === undefined

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {isIndeterminate ? (
          <div className="h-full w-1/3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" />
        ) : (
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        )}
      </div>
      {showPercent && progress !== undefined && (
        <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(progress)}%</p>
      )}
    </div>
  )
}

/**
 * Button Loading State - For use inside buttons
 */
export function ButtonLoading({ className }: { className?: string }) {
  return <Loading size="xs" color="white" className={className} />
}
