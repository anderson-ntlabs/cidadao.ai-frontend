/**
 * StreamingStatus Component
 *
 * Shows the current status of streaming response:
 * - Detecting intent
 * - Agent selected
 * - Responding (typing indicator)
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Brain, User, MessageSquare } from 'lucide-react'
import type { StreamingState } from '@/store/chat-store'

interface StreamingStatusProps {
  streaming: StreamingState
  className?: string
}

function StreamingStatusComponent({ streaming, className }: StreamingStatusProps) {
  if (!streaming.isStreaming && streaming.phase === 'idle') {
    return null
  }

  const getStatusIcon = () => {
    switch (streaming.phase) {
      case 'detecting':
        return <Brain className="w-4 h-4 animate-pulse" />
      case 'intent':
        return <Brain className="w-4 h-4 text-blue-500" />
      case 'agent_selected':
        return <User className="w-4 h-4 text-green-500" />
      case 'responding':
        return <MessageSquare className="w-4 h-4 text-green-500" />
      case 'complete':
        return null
      case 'error':
        return <span className="w-4 h-4 text-red-500">!</span>
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (streaming.phase) {
      case 'detecting':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'intent':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'agent_selected':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'responding':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  // Don't show status during responding phase (let the typing show in message)
  if (streaming.phase === 'responding' || streaming.phase === 'complete') {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-300',
        getStatusColor(),
        className
      )}
    >
      {getStatusIcon()}
      <span className="text-gray-700 dark:text-gray-300">
        {streaming.statusMessage || 'Processando...'}
      </span>
      {streaming.phase !== 'error' && (
        <div className="flex gap-1 ml-2">
          <span
            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}
    </div>
  )
}

export const StreamingStatus = memo(StreamingStatusComponent)
