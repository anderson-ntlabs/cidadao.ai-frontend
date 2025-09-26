'use client'

import { useMemo } from 'react'
import { useSanitizer } from '@/hooks/use-sanitizer'
import { cn } from '@/lib/utils'

interface SecureMessageProps {
  content: string
  role: 'user' | 'assistant' | 'system'
  className?: string
  allowHtml?: boolean
}

export function SecureMessage({ content, role, className, allowHtml = false }: SecureMessageProps) {
  const { sanitizeChatMessage, escapeHtml } = useSanitizer()

  const processedContent = useMemo(() => {
    if (allowHtml && role === 'assistant') {
      // For assistant messages, allow some formatting
      return sanitizeChatMessage(content)
    } else {
      // For user messages, escape all HTML
      return escapeHtml(content)
    }
  }, [content, role, allowHtml, sanitizeChatMessage, escapeHtml])

  if (allowHtml && role === 'assistant') {
    return (
      <div 
        className={cn('prose prose-sm max-w-none', className)}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    )
  }

  return (
    <div className={cn('whitespace-pre-wrap', className)}>
      {processedContent}
    </div>
  )
}

// Message wrapper with proper styling
interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: string
  }
  className?: string
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-gray-100 dark:bg-gray-800' : 'bg-green-50 dark:bg-green-900/20',
        className
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold',
            isUser ? 'bg-blue-600' : 'bg-green-600'
          )}
        >
          {isUser ? 'U' : 'A'}
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'Você' : 'Assistente'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
        <SecureMessage
          content={message.content}
          role={message.role}
          allowHtml={!isUser}
          className="text-gray-700 dark:text-gray-300"
        />
      </div>
    </div>
  )
}