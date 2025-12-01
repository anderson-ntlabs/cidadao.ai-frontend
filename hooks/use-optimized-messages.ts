'use client'

import { useMemo, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'

/**
 * Optimized Messages Hook
 *
 * Provides optimized message handling for chat performance including:
 * - Memoized message grouping by date/agent
 * - Efficient message lookup
 * - Scroll position management
 * - Message batching for rendering
 *
 * @example
 * ```tsx
 * const { groupedMessages, getMessageById, shouldShowTimestamp } = useOptimizedMessages(messages)
 * ```
 */

export interface MessageGroup {
  id: string
  date: string
  messages: ChatMessage[]
  agentId?: string
  agentName?: string
}

interface UseOptimizedMessagesOptions {
  /** Group messages by agent (default: true) */
  groupByAgent?: boolean
  /** Maximum messages per group (default: 50) */
  maxPerGroup?: number
  /** Time threshold for grouping in minutes (default: 5) */
  groupTimeThreshold?: number
}

export function useOptimizedMessages(
  messages: ChatMessage[],
  options: UseOptimizedMessagesOptions = {}
) {
  const { groupByAgent = true, maxPerGroup = 50, groupTimeThreshold = 5 } = options

  // Message ID lookup map for O(1) access
  const messageMap = useMemo(() => {
    const map = new Map<string, ChatMessage>()
    messages.forEach((msg) => map.set(msg.id, msg))
    return map
  }, [messages])

  // Get message by ID with O(1) lookup
  const getMessageById = useCallback(
    (id: string): ChatMessage | undefined => {
      return messageMap.get(id)
    },
    [messageMap]
  )

  // Group messages by date and optionally by agent
  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = []
    let currentGroup: MessageGroup | null = null
    const thresholdMs = groupTimeThreshold * 60 * 1000

    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp)
      const dateKey = messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      // Check if we need a new group
      const needsNewGroup =
        !currentGroup ||
        currentGroup.date !== dateKey ||
        currentGroup.messages.length >= maxPerGroup ||
        (groupByAgent && message.role === 'assistant' && currentGroup.agentId !== message.agent_id)

      // Check time gap between messages
      const prevMessage = index > 0 ? messages[index - 1] : null
      const hasTimeGap =
        prevMessage &&
        messageDate.getTime() - new Date(prevMessage.timestamp).getTime() > thresholdMs

      if (needsNewGroup || hasTimeGap) {
        currentGroup = {
          id: `group_${dateKey}_${index}`,
          date: dateKey,
          messages: [],
          agentId: message.role === 'assistant' ? message.agent_id : undefined,
          agentName: message.role === 'assistant' ? message.agent_name : undefined,
        }
        groups.push(currentGroup)
      }

      currentGroup!.messages.push(message)
    })

    return groups
  }, [messages, groupByAgent, maxPerGroup, groupTimeThreshold])

  // Determine if timestamp should be shown for a message
  const shouldShowTimestamp = useCallback(
    (messageIndex: number): boolean => {
      if (messageIndex === 0) return true

      const currentMessage = messages[messageIndex]
      const prevMessage = messages[messageIndex - 1]

      if (!currentMessage || !prevMessage) return true

      const currentTime = new Date(currentMessage.timestamp).getTime()
      const prevTime = new Date(prevMessage.timestamp).getTime()
      const thresholdMs = groupTimeThreshold * 60 * 1000

      return currentTime - prevTime > thresholdMs
    },
    [messages, groupTimeThreshold]
  )

  // Get relative time for a message
  const getRelativeTime = useCallback((timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }, [])

  // Find message index for scroll position
  const findMessageIndex = useCallback(
    (messageId: string): number => {
      return messages.findIndex((m) => m.id === messageId)
    },
    [messages]
  )

  // Get messages around a specific message (for virtualization context)
  const getMessagesWindow = useCallback(
    (messageId: string, windowSize = 10): ChatMessage[] => {
      const index = findMessageIndex(messageId)
      if (index === -1) return []

      const start = Math.max(0, index - windowSize)
      const end = Math.min(messages.length, index + windowSize + 1)

      return messages.slice(start, end)
    },
    [messages, findMessageIndex]
  )

  // Statistics for debugging/monitoring
  const stats = useMemo(
    () => ({
      totalMessages: messages.length,
      totalGroups: groupedMessages.length,
      userMessages: messages.filter((m) => m.role === 'user').length,
      assistantMessages: messages.filter((m) => m.role === 'assistant').length,
      uniqueAgents: new Set(messages.map((m) => m.agent_id).filter(Boolean)).size,
    }),
    [messages, groupedMessages]
  )

  return {
    // Data
    groupedMessages,
    messageMap,
    stats,

    // Utilities
    getMessageById,
    shouldShowTimestamp,
    getRelativeTime,
    findMessageIndex,
    getMessagesWindow,
  }
}

/**
 * Hook for managing scroll position in chat
 */
export function useScrollPosition() {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const lastScrollTopRef = useRef(0)

  // Check if near bottom of scroll
  const isNearBottom = useCallback((threshold = 150): boolean => {
    const container = containerRef.current
    if (!container) return true

    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(
    (instant = false, force = false) => {
      if (!force && isUserScrollingRef.current && !isNearBottom()) {
        return
      }

      if (endRef.current) {
        endRef.current.scrollIntoView({
          behavior: instant ? 'instant' : 'smooth',
          block: 'end',
        })
      }
    },
    [isNearBottom]
  )

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const currentScrollTop = container.scrollTop

    // Detect if user is scrolling up
    if (currentScrollTop < lastScrollTopRef.current) {
      isUserScrollingRef.current = true
    }

    // Reset if scrolled back to bottom
    if (isNearBottom(50)) {
      isUserScrollingRef.current = false
    }

    lastScrollTopRef.current = currentScrollTop
  }, [isNearBottom])

  // Reset scroll tracking (e.g., when user sends message)
  const resetScrollTracking = useCallback(() => {
    isUserScrollingRef.current = false
  }, [])

  return {
    containerRef,
    endRef,
    isNearBottom,
    scrollToBottom,
    handleScroll,
    resetScrollTracking,
    isUserScrolling: isUserScrollingRef.current,
  }
}
