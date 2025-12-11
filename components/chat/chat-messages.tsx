/**
 * Chat Messages Component
 *
 * Renders the list of chat messages with avatars.
 * Used by both mobile and desktop layouts.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { MessageBubble } from '@/components/chat/message-bubble'
import { getAgentByIdOrNull } from '@/hooks/use-agent'
import type { StreamingState } from '@/store/chat-store'
import dynamic from 'next/dynamic'

const AgentAvatar = dynamic(
  () => import('@/components/chat/agent-avatar').then((mod) => ({ default: mod.AgentAvatar })),
  {
    loading: () => (
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    ),
  }
)

interface ChatMessage {
  id: string
  content: string | null
  role: 'user' | 'assistant' | 'system'
  agent_id?: string
  metadata?: {
    confidence?: number
    [key: string]: unknown
  }
}

interface User {
  name?: string
  avatar?: string
}

export interface ChatMessagesProps {
  messages: ChatMessage[]
  user: User | null
  isLoading: boolean
  streaming: StreamingState
  optimisticMessage: string | null
  onScrollToBottom?: () => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  variant?: 'mobile' | 'desktop'
}

export function ChatMessages({
  messages,
  user,
  isLoading,
  streaming,
  optimisticMessage,
  onScrollToBottom,
  messagesEndRef,
  variant = 'desktop',
}: ChatMessagesProps) {
  const isMobile = variant === 'mobile'
  const maxWidth = isMobile ? 'max-w-[85%]' : 'max-w-[85%] md:max-w-[75%]'
  const gap = isMobile ? 'gap-3' : 'gap-3 md:gap-4'
  const spacing = isMobile ? 'space-y-4' : 'space-y-4 md:space-y-6'

  return (
    <div className={cn(spacing, 'py-4')}>
      {/* Optimistic User Message */}
      {optimisticMessage && (
        <div
          className={cn(
            'flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300',
            gap
          )}
        >
          <div className={cn(maxWidth, 'order-first')}>
            <div className="rounded-2xl px-4 py-3 bg-gradient-green-blue text-white shadow-md opacity-70">
              <p className="whitespace-pre-wrap text-sm text-white">{optimisticMessage}</p>
            </div>
          </div>
          <UserAvatar user={user} opacity="opacity-70" />
        </div>
      )}

      {/* Message List */}
      {messages.map((message, index) => {
        const isLatest = index === messages.length - 1 && message.role === 'assistant' && isLoading
        const messageAgent = getAgentByIdOrNull(message.agent_id)

        return (
          <div
            key={message.id}
            className={cn(
              'flex animate-in fade-in slide-in-from-bottom-2 duration-300',
              gap,
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {/* Assistant Avatar */}
            {message.role === 'assistant' && (
              <AgentAvatar
                agentId={message.agent_id}
                agentImage={messageAgent?.image || '/agents/abaporu.png'}
                agentName={messageAgent?.name || 'Abaporu'}
                isThinking={isLatest && isLoading}
                showSparkle={index === 0}
              />
            )}

            {/* Message Bubble */}
            <div className={cn(maxWidth, message.role === 'user' ? 'order-first' : '')}>
              <MessageBubble
                content={message.content || ''}
                role={message.role === 'system' ? 'assistant' : message.role}
                agentName={messageAgent?.name}
                agentRole={messageAgent?.role.pt}
                agentId={message.agent_id}
                isLatest={isLatest}
                isLoading={isLoading}
                isStreaming={streaming.isStreaming && message.id === streaming.streamingMessageId}
                onComplete={() => {
                  if (isLatest && onScrollToBottom) onScrollToBottom()
                }}
                metadata={message.metadata}
              />
            </div>

            {/* User Avatar */}
            {message.role === 'user' && <UserAvatar user={user} />}
          </div>
        )
      })}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}

// Internal component for user avatar
function UserAvatar({ user, opacity }: { user: User | null; opacity?: string }) {
  const className = cn(
    'w-9 h-9 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-lg flex-shrink-0',
    opacity
  )

  if (user?.avatar) {
    return (
      <OptimizedImage
        src={user.avatar}
        alt={user.name || 'Usuário'}
        width={36}
        height={36}
        className={cn(className, 'object-cover')}
      />
    )
  }

  return (
    <div
      className={cn(
        className,
        'bg-gradient-green-blue flex items-center justify-center text-white font-semibold text-sm'
      )}
    >
      {user?.name?.charAt(0).toUpperCase() || 'U'}
    </div>
  )
}
