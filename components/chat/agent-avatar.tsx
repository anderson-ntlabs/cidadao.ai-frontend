/**
 * Agent Avatar Component
 *
 * Animated agent avatar with thinking indicator and smooth transitions
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { Brain, Sparkles } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { cn } from '@/lib/utils'
import { getAgentRingClass } from '@/lib/utils/agent-colors'

export interface AgentAvatarProps {
  agentId?: string
  agentImage: string
  agentName: string
  size?: 'sm' | 'md' | 'lg'
  isThinking?: boolean
  showSparkle?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-12 h-12'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function AgentAvatar({
  agentId,
  agentImage,
  agentName,
  size = 'md',
  isThinking = false,
  showSparkle = false,
  className
}: AgentAvatarProps) {
  return (
    <div className={cn("flex-shrink-0 relative", className)}>
      {/* Thinking indicator */}
      {isThinking && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            {/* Pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-blue-500 rounded-full animate-ping opacity-75" />
            {/* Brain icon */}
            <div className="relative bg-white dark:bg-gray-900 rounded-full p-0.5">
              <Brain className={cn(
                iconSizes[size],
                "text-emerald-500 animate-pulse"
              )} />
            </div>
          </div>
        </div>
      )}

      {/* Sparkle indicator for new/special messages */}
      {showSparkle && (
        <div className="absolute -top-1 -left-1 z-10">
          <Sparkles className={cn(
            iconSizes[size],
            "text-yellow-500 animate-bounce"
          )} />
        </div>
      )}

      {/* Avatar image with smooth transitions */}
      <div className={cn(
        "relative overflow-hidden rounded-full",
        sizeClasses[size],
        "transition-all duration-300 ease-in-out",
        isThinking && "scale-110 animate-pulse"
      )}>
        <OptimizedImage
          src={agentImage}
          alt={agentName}
          width={size === 'sm' ? 32 : size === 'md' ? 36 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 36 : 48}
          className={cn(
            "w-full h-full object-cover",
            getAgentRingClass(agentId),
            "ring-2",
            isThinking && "ring-4 ring-emerald-500/30"
          )}
        />

        {/* Gradient overlay when thinking */}
        {isThinking && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 animate-pulse" />
        )}
      </div>

      {/* Animated ring effect when thinking */}
      {isThinking && (
        <>
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-emerald-500/30",
            "animate-ping"
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-blue-500/20",
            "animate-pulse"
          )} />
        </>
      )}
    </div>
  )
}

/**
 * Agent Avatar Group
 *
 * Shows multiple agent avatars in a stack
 */
interface AgentAvatarGroupProps {
  agents: Array<{
    id?: string
    image: string
    name: string
  }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AgentAvatarGroup({
  agents,
  max = 3,
  size = 'sm',
  className
}: AgentAvatarGroupProps) {
  const displayedAgents = agents.slice(0, max)
  const remainingCount = Math.max(0, agents.length - max)

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {displayedAgents.map((agent, index) => (
          <div
            key={agent.id || index}
            className="relative"
            style={{ zIndex: displayedAgents.length - index }}
          >
            <AgentAvatar
              agentId={agent.id}
              agentImage={agent.image}
              agentName={agent.name}
              size={size}
              className="ring-2 ring-white dark:ring-gray-900"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className={cn(
            "flex items-center justify-center rounded-full",
            "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
            "font-medium text-xs ring-2 ring-white dark:ring-gray-900",
            sizeClasses[size]
          )}>
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
