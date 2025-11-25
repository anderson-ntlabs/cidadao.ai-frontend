'use client'

import { OptimizedAgentImage } from '@/components/ui/optimized-agent-image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface AgentBadgeProps {
  agentId?: string
  agentName?: string
  agentRole?: string
  agentImage?: string
  showRole?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AgentBadge({
  agentId,
  agentName,
  agentRole,
  showRole = true,
  size = 'md',
  className,
}: AgentBadgeProps) {
  // Don't render if no agent info
  if (!agentName && !agentId) return null

  const sizeClasses = {
    sm: {
      container: 'gap-2 p-2',
      avatar: 'w-6 h-6',
      imageSize: 64 as const,
      name: 'text-xs',
      role: 'text-[10px]',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      container: 'gap-3 p-3',
      avatar: 'w-8 h-8',
      imageSize: 64 as const,
      name: 'text-sm',
      role: 'text-xs',
      badge: 'text-xs px-2 py-1',
    },
    lg: {
      container: 'gap-4 p-4',
      avatar: 'w-10 h-10',
      imageSize: 64 as const,
      name: 'text-base',
      role: 'text-sm',
      badge: 'text-sm px-3 py-1.5',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        sizes.container,
        className
      )}
    >
      {/* Agent Avatar */}
      <div className="flex-shrink-0 relative">
        {agentId ? (
          <OptimizedAgentImage
            agentId={agentId}
            alt={agentName || 'Agent'}
            size={sizes.imageSize}
            className={cn('ring-2 ring-blue-200 dark:ring-blue-700', sizes.avatar)}
          />
        ) : (
          <div
            className={cn(
              'bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center',
              sizes.avatar
            )}
          >
            <Bot
              className={cn(
                'text-blue-600 dark:text-blue-300',
                size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
              )}
            />
          </div>
        )}

        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
      </div>

      {/* Agent Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-blue-900 dark:text-blue-100 truncate', sizes.name)}>
          {agentName || 'Assistente IA'}
        </p>
        {showRole && agentRole && (
          <p className={cn('text-blue-700 dark:text-blue-300 truncate', sizes.role)}>{agentRole}</p>
        )}
      </div>

      {/* Optional Badge */}
      {showRole && agentRole && (
        <Badge
          variant="outline"
          className={cn(
            'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-medium',
            sizes.badge
          )}
        >
          IA
        </Badge>
      )}
    </div>
  )
}

// Compact version for inline display (minimal styling)
export function AgentBadgeInline({
  agentName,
  agentRole,
  className,
}: Pick<AgentBadgeProps, 'agentName' | 'agentRole' | 'className'>) {
  if (!agentName) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400',
        className
      )}
    >
      <Bot className="w-3 h-3" />
      <span className="font-medium">{agentName}</span>
      {agentRole && (
        <>
          <span>•</span>
          <span className="italic">{agentRole}</span>
        </>
      )}
    </span>
  )
}
