import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'darker' | 'lighter'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
}

export function GlassCard({ 
  children, 
  className,
  variant = 'default',
  blur = 'md'
}: GlassCardProps) {
  const variants = {
    default: 'bg-white/70 dark:bg-gray-900/70 border-white/30 dark:border-gray-700/30',
    darker: 'bg-white/50 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/40',
    lighter: 'bg-white/80 dark:bg-gray-900/60 border-white/40 dark:border-gray-700/20'
  }

  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  return (
    <div className={cn(
      'rounded-lg border shadow-lg transition-all duration-300 hover:shadow-xl',
      variants[variant],
      blurs[blur],
      className
    )}>
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-b border-gray-200/20 dark:border-gray-700/20', className)}>
      {children}
    </div>
  )
}

export function GlassCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

export function GlassCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-t border-gray-200/20 dark:border-gray-700/20', className)}>
      {children}
    </div>
  )
}