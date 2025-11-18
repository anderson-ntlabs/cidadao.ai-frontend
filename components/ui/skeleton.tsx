/**
 * Skeleton Component - Modern loading placeholders
 * Expanded with specialized components for better UX
 *
 * @see https://www.nngroup.com/articles/skeleton-screens/
 * @author Anderson Henrique da Silva
 * @date 2025-11-18
 */

import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pulse' | 'wave' | 'none'
  shape?: 'rectangle' | 'circle' | 'text'
}

function Skeleton({ className, variant = 'pulse', shape = 'rectangle', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        {
          'animate-pulse': variant === 'pulse',
          'animate-shimmer': variant === 'wave',
          'rounded-full': shape === 'circle',
          'rounded-md': shape === 'rectangle',
          'rounded h-4': shape === 'text',
        },
        className
      )}
      {...props}
    />
  )
}

/**
 * Specialized skeleton components
 */

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} shape="text" className={cn('h-4', i === lines - 1 && 'w-3/4')} />
      ))}
    </div>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className="flex items-start space-x-4">
        <Skeleton shape="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-2/5 h-4" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  )
}

function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Skeleton
      shape="circle"
      className={cn(`w-${size} h-${size}`, className)}
      style={{ width: size, height: size }}
    />
  )
}

function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <SkeletonAvatar size={36} />}
      <div
        className={cn(
          'max-w-[70%] space-y-2 rounded-2xl p-4',
          isUser
            ? 'bg-gray-100 dark:bg-gray-800'
            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
        )}
      >
        <Skeleton className="w-4/5 h-3" />
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-3/4 h-3" />
      </div>
      {isUser && <SkeletonAvatar size={36} />}
    </div>
  )
}

function SkeletonAgentCard() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="w-3/5 h-5" />
        <Skeleton className="w-2/5 h-3" />
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonMessage, SkeletonAgentCard }
