/**
 * Optimized Chat Selectors
 *
 * Provides memoized selectors for the chat store to prevent unnecessary re-renders.
 * Uses shallow equality for object/array comparisons.
 *
 * Performance benefits:
 * - Components only re-render when their specific data changes
 * - Reduces bundle of re-renders across chat components
 * - Uses Zustand's shallow equality comparator
 *
 * Usage:
 * ```tsx
 * const { messages, isLoading } = useChatSelectors(['messages', 'isLoading']);
 * // or
 * const messages = useChatMessages();
 * const status = useChatStatus();
 * ```
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { useShallow } from 'zustand/react/shallow'
import { useChatStore } from '@/store/chat-store'
import type { ChatMessage, AgentInfo, QuickAction } from '@/types/chat'

// =============================================================================
// Atomic Selectors (subscribe to single pieces of state)
// =============================================================================

/**
 * Select only messages array
 * Uses shallow comparison to prevent re-renders when message content is same
 */
export function useChatMessages(): ChatMessage[] {
  return useChatStore(useShallow((state) => state.messages))
}

/**
 * Select only the current session
 */
export function useChatSession() {
  return useChatStore((state) => state.session)
}

/**
 * Select loading state
 */
export function useChatLoading(): boolean {
  return useChatStore((state) => state.isLoading)
}

/**
 * Select error state
 */
export function useChatError(): string | null {
  return useChatStore((state) => state.error)
}

/**
 * Select connection status
 */
export function useChatConnectionStatus() {
  return useChatStore((state) => state.connectionStatus)
}

/**
 * Select active agents
 */
export function useChatAgents(): AgentInfo[] {
  return useChatStore(useShallow((state) => state.activeAgents))
}

/**
 * Select selected agent ID
 */
export function useChatSelectedAgent(): string | null {
  return useChatStore((state) => state.selectedAgentId)
}

/**
 * Select suggested actions
 */
export function useChatSuggestedActions(): QuickAction[] {
  return useChatStore(useShallow((state) => state.suggestedActions))
}

/**
 * Select typing states
 */
export function useChatTypingStates() {
  return useChatStore(
    useShallow((state) => ({
      isTyping: state.isTyping,
      agentTyping: state.agentTyping,
    }))
  )
}

/**
 * Select streaming state
 */
export function useChatStreaming() {
  return useChatStore(useShallow((state) => state.streaming))
}

/**
 * Select current investigation
 */
export function useChatInvestigation() {
  return useChatStore((state) => state.currentInvestigation)
}

// =============================================================================
// Composite Selectors (multiple related pieces of state)
// =============================================================================

/**
 * Select chat status (loading, error, connection)
 * Useful for status indicators
 */
export function useChatStatus() {
  return useChatStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      error: state.error,
      connectionStatus: state.connectionStatus,
    }))
  )
}

/**
 * Select UI state for chat input
 */
export function useChatInputState() {
  return useChatStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      isTyping: state.isTyping,
      agentTyping: state.agentTyping,
      isStreaming: state.streaming.isStreaming,
      error: state.error,
    }))
  )
}

/**
 * Select streaming UI state
 */
export function useChatStreamingUI() {
  return useChatStore(
    useShallow((state) => ({
      isStreaming: state.streaming.isStreaming,
      phase: state.streaming.phase,
      statusMessage: state.streaming.statusMessage,
      currentAgentName: state.streaming.currentAgentName,
      accumulatedContent: state.streaming.accumulatedContent,
    }))
  )
}

/**
 * Select agent selection state
 */
export function useChatAgentSelection() {
  return useChatStore(
    useShallow((state) => ({
      activeAgents: state.activeAgents,
      selectedAgentId: state.selectedAgentId,
    }))
  )
}

// =============================================================================
// Action Selectors (only actions, no state subscription)
// =============================================================================

/**
 * Select chat actions without subscribing to any state
 * Components using these won't re-render on state changes
 */
export function useChatActions() {
  return useChatStore(
    useShallow((state) => ({
      initializeChat: state.initializeChat,
      sendMessage: state.sendMessage,
      sendStreamingMessage: state.sendStreamingMessage,
      setSelectedAgent: state.setSelectedAgent,
      clearChat: state.clearChat,
      clearError: state.clearError,
      setTyping: state.setTyping,
      createNewSession: state.createNewSession,
      loadAgents: state.loadAgents,
      loadSuggestions: state.loadSuggestions,
      resetStreamingState: state.resetStreamingState,
    }))
  )
}

/**
 * Select message-related actions
 */
export function useChatMessageActions() {
  return useChatStore(
    useShallow((state) => ({
      addMessage: state.addMessage,
      updateMessage: state.updateMessage,
      loadChatHistory: state.loadChatHistory,
      loadMoreMessages: state.loadMoreMessages,
    }))
  )
}

/**
 * Select session-related actions
 */
export function useChatSessionActions() {
  return useChatStore(
    useShallow((state) => ({
      createNewSession: state.createNewSession,
      loadSession: state.loadSession,
      updateSession: state.updateSession,
    }))
  )
}

// =============================================================================
// Derived Selectors (computed values)
// =============================================================================

/**
 * Get the last message
 */
export function useChatLastMessage(): ChatMessage | undefined {
  return useChatStore((state) => state.messages[state.messages.length - 1])
}

/**
 * Get message count
 */
export function useChatMessageCount(): number {
  return useChatStore((state) => state.messages.length)
}

/**
 * Check if chat is active (has messages or session)
 */
export function useChatIsActive(): boolean {
  return useChatStore((state) => state.messages.length > 0 || state.session !== null)
}

/**
 * Check if chat can send messages
 */
export function useChatCanSend(): boolean {
  return useChatStore(
    (state) => !state.isLoading && !state.streaming.isStreaming && state.error === null
  )
}

/**
 * Get the current agent info (if one is selected)
 */
export function useChatCurrentAgent(): AgentInfo | undefined {
  return useChatStore((state) =>
    state.selectedAgentId
      ? state.activeAgents.find((a) => a.id === state.selectedAgentId)
      : undefined
  )
}

// =============================================================================
// Flexible Selector (for custom needs)
// =============================================================================

type ChatStoreState = ReturnType<typeof useChatStore.getState>
type ChatStoreKeys = keyof ChatStoreState

/**
 * Select multiple specific pieces of state
 *
 * @example
 * const { messages, isLoading, error } = useChatSelectors(['messages', 'isLoading', 'error']);
 */
export function useChatSelectors<K extends ChatStoreKeys>(keys: K[]): Pick<ChatStoreState, K> {
  return useChatStore(
    useShallow((state) => {
      const result = {} as Pick<ChatStoreState, K>
      for (const key of keys) {
        result[key] = state[key]
      }
      return result
    })
  )
}
