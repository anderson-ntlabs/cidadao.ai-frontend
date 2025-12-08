'use client'

import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '@/lib/logger'
import type { ChatMessage } from '@/types/chat'

const logger = createLogger('ChatModeHistory')

/**
 * Chat Mode History Hook
 *
 * Manages separate chat history for different modes (Cidadão.AI vs Maritaca).
 * Uses localStorage for persistence, keeping histories separate.
 *
 * @example
 * ```tsx
 * const { messages, saveMessages, clearMessages, switchMode } = useChatModeHistory()
 * ```
 */

export type ChatMode = 'cidadao' | 'maritaca'

interface ChatModeHistoryState {
  cidadao: ChatMessage[]
  maritaca: ChatMessage[]
  currentMode: ChatMode
}

const STORAGE_KEY = 'chat_mode_history'
const MAX_MESSAGES_PER_MODE = 100

// Initial state
const initialState: ChatModeHistoryState = {
  cidadao: [],
  maritaca: [],
  currentMode: 'cidadao',
}

/**
 * Load history from localStorage
 */
function loadFromStorage(): ChatModeHistoryState {
  if (typeof window === 'undefined') {
    return initialState
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        cidadao: parsed.cidadao || [],
        maritaca: parsed.maritaca || [],
        currentMode: parsed.currentMode || 'cidadao',
      }
    }
  } catch (error) {
    logger.error('Failed to load chat history from storage', { error })
  }

  return initialState
}

/**
 * Save history to localStorage
 */
function saveToStorage(state: ChatModeHistoryState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Limit messages per mode to prevent storage bloat
    const toSave: ChatModeHistoryState = {
      cidadao: state.cidadao.slice(-MAX_MESSAGES_PER_MODE),
      maritaca: state.maritaca.slice(-MAX_MESSAGES_PER_MODE),
      currentMode: state.currentMode,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    logger.error('Failed to save chat history to storage', { error })
  }
}

export function useChatModeHistory() {
  const [state, setState] = useState<ChatModeHistoryState>(initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from storage on mount
  useEffect(() => {
    const loaded = loadFromStorage()
    setState(loaded)
    setIsLoaded(true)
  }, [])

  // Save to storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state)
    }
  }, [state, isLoaded])

  /**
   * Get messages for current mode
   */
  const currentMessages = state[state.currentMode]

  /**
   * Save messages for a specific mode
   */
  const saveMessages = useCallback((mode: ChatMode, messages: ChatMessage[]) => {
    setState((prev) => ({
      ...prev,
      [mode]: messages,
    }))
  }, [])

  /**
   * Add a message to current mode
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      [prev.currentMode]: [...prev[prev.currentMode], message],
    }))
  }, [])

  /**
   * Clear messages for a specific mode
   */
  const clearMessages = useCallback((mode: ChatMode) => {
    setState((prev) => ({
      ...prev,
      [mode]: [],
    }))
  }, [])

  /**
   * Clear all messages (both modes)
   */
  const clearAllMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cidadao: [],
      maritaca: [],
    }))
  }, [])

  /**
   * Switch to a different mode
   * Optionally preserve or clear the previous mode's history
   */
  const switchMode = useCallback((newMode: ChatMode, options?: { clearPrevious?: boolean }) => {
    setState((prev) => {
      const newState = {
        ...prev,
        currentMode: newMode,
      }

      // Optionally clear previous mode
      if (options?.clearPrevious) {
        newState[prev.currentMode] = []
      }

      return newState
    })
  }, [])

  /**
   * Get messages for a specific mode
   * Note: Returns a stable reference based on mode to avoid re-renders
   */
  const getMessagesForMode = useCallback(
    (mode: ChatMode): ChatMessage[] => {
      return state[mode]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cidadao, state.maritaca] // Only depend on the arrays, not the whole state
  )

  /**
   * Check if a mode has any messages
   */
  const hasModeMessages = useCallback(
    (mode: ChatMode): boolean => {
      return state[mode].length > 0
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cidadao.length, state.maritaca.length] // Only depend on lengths
  )

  /**
   * Get stats about the history
   */
  const getStats = useCallback(() => {
    return {
      cidadaoCount: state.cidadao.length,
      maritacaCount: state.maritaca.length,
      currentMode: state.currentMode,
      totalMessages: state.cidadao.length + state.maritaca.length,
    }
  }, [state.cidadao.length, state.maritaca.length, state.currentMode])

  /**
   * Export history as JSON
   */
  const exportHistory = useCallback(() => {
    return JSON.stringify(state, null, 2)
  }, [state.cidadao, state.maritaca, state.currentMode])

  /**
   * Import history from JSON
   */
  const importHistory = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json)
      if (parsed.cidadao && parsed.maritaca) {
        setState({
          cidadao: parsed.cidadao,
          maritaca: parsed.maritaca,
          currentMode: parsed.currentMode || 'cidadao',
        })
        return true
      }
    } catch (error) {
      logger.error('Failed to import chat history', { error })
    }
    return false
  }, [])

  return {
    // Current state
    currentMode: state.currentMode,
    currentMessages,
    isLoaded,

    // Mode-specific getters
    getMessagesForMode,
    hasModeMessages,

    // Actions
    saveMessages,
    addMessage,
    clearMessages,
    clearAllMessages,
    switchMode,

    // Utilities
    getStats,
    exportHistory,
    importHistory,
  }
}
