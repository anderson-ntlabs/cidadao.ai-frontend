'use client'

import { cn } from '@/lib/utils'

/**
 * Message Skeleton Component
 *
 * Renders a loading skeleton for chat messages to improve
 * perceived performance during loading states.
 *
 * Features:
 * - Realistic message bubble shapes
 * - Animated shimmer effect
 * - Supports both user and assistant messages
 * - Variable widths for natural appearance
 *
 * @example
 * ```tsx
 * <MessageSkeleton role="assistant" lines={3} />
 * <MessageSkeleton role="user" />
 * ```
 */

interface MessageSkeletonProps {
  /** Message role (affects alignment and style) */
  role?: 'user' | 'assistant'
  /** Number of text lines to show (default: random 1-3) */
  lines?: number
  /** Additional CSS classes */
  className?: string
  /** Show avatar skeleton */
  showAvatar?: boolean
}

export function MessageSkeleton({
  role = 'assistant',
  lines,
  className,
  showAvatar = true,
}: MessageSkeletonProps) {
  const isUser = role === 'user'
  const lineCount = lines ?? Math.floor(Math.random() * 3) + 1

  // Generate random widths for natural appearance
  const lineWidths = Array.from({ length: lineCount }, (_, i) => {
    if (i === lineCount - 1) {
      return `${40 + Math.random() * 30}%` // Last line shorter
    }
    return `${70 + Math.random() * 30}%`
  })

  return (
    <div
      className={cn(
        'flex gap-3 animate-pulse',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      role="status"
      aria-label="Carregando mensagem..."
    >
      {/* Avatar skeleton (assistant only, on left) */}
      {showAvatar && !isUser && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {/* Message bubble skeleton */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 space-y-2',
          isUser
            ? 'bg-gray-200 dark:bg-gray-700 max-w-[75%]'
            : 'bg-gray-100 dark:bg-gray-800 max-w-[85%]'
        )}
      >
        {lineWidths.map((width, index) => (
          <div key={index} className="h-4 rounded bg-gray-300 dark:bg-gray-600" style={{ width }} />
        ))}
      </div>

      {/* Avatar skeleton (user only, on right) */}
      {showAvatar && isUser && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      )}
    </div>
  )
}

/**
 * Message List Skeleton
 *
 * Renders multiple message skeletons for initial loading state.
 */
interface MessageListSkeletonProps {
  /** Number of skeleton messages to show */
  count?: number
  /** Additional CSS classes */
  className?: string
}

export function MessageListSkeleton({ count = 5, className }: MessageListSkeletonProps) {
  // Generate alternating user/assistant pattern
  const messages = Array.from({ length: count }, (_, i) => ({
    id: `skeleton_${i}`,
    role: i % 2 === 0 ? ('assistant' as const) : ('user' as const),
    lines: Math.floor(Math.random() * 3) + 1,
  }))

  return (
    <div className={cn('space-y-4 py-4', className)} aria-busy="true">
      {messages.map((msg) => (
        <MessageSkeleton key={msg.id} role={msg.role} lines={msg.lines} />
      ))}
    </div>
  )
}

/**
 * Typing Indicator Component
 *
 * Shows animated dots to indicate the agent is typing/thinking.
 */
interface TypingIndicatorProps {
  /** Agent name (optional) */
  agentName?: string
  /** Additional CSS classes */
  className?: string
}

export function TypingIndicator({ agentName, className }: TypingIndicatorProps) {
  return (
    <div
      className={cn('flex gap-3 justify-start', className)}
      role="status"
      aria-label={agentName ? `${agentName} está digitando...` : 'Digitando...'}
    >
      {/* Avatar placeholder */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Typing bubble with animated dots */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

/**
 * Thinking Indicator Component
 *
 * Shows a more detailed indicator when the AI is processing/thinking.
 */
interface ThinkingIndicatorProps {
  /** Current thinking message */
  message?: string
  /** Agent name */
  agentName?: string
  /** Additional CSS classes */
  className?: string
}

export function ThinkingIndicator({
  message = 'Pensando...',
  agentName,
  className,
}: ThinkingIndicatorProps) {
  return (
    <div
      className={cn('flex gap-3 justify-start items-start', className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Avatar with thinking animation */}
      <div className="flex-shrink-0 relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 animate-ping" />
      </div>

      {/* Thinking message */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 max-w-[85%]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {agentName && <strong className="mr-1">{agentName}:</strong>}
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}
