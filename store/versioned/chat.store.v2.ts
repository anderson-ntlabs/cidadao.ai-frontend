/**
 * Versioned Chat Store v2
 * Chat store with migrations and validation
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { create } from 'zustand'
import { createVersionedStore } from './base.store'
import { ChatStoreSchema, type ChatStoreState } from '../schemas/chat.schema'
import type { ChatMessage, ChatSession } from '../schemas/chat.schema'

// Store version and migrations
const STORE_VERSION = 2

const migrations = {
  // v1 → v2: Add settings object
  2: (state: any) => ({
    ...state,
    settings: state.settings || {
      enableSound: true,
      enableNotifications: true,
      messageLimit: 100,
      autoSave: true,
      theme: 'auto'
    }
  })
}

// Store actions interface
interface ChatStoreActions {
  // Message actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void

  // Session actions
  setSession: (session: ChatSession | null) => void
  updateSession: (updates: Partial<ChatSession>) => void

  // UI state actions
  setTyping: (isTyping: boolean) => void
  setAgentTyping: (isTyping: boolean) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void

  // Settings actions
  updateSettings: (settings: Partial<ChatStoreState['settings']>) => void

  // Reset action
  reset: () => void
}

// Complete store type
export type ChatStore = ChatStoreState & ChatStoreActions

// Initial state
const initialState: ChatStoreState = {
  messages: [],
  session: null,
  connectionStatus: 'disconnected',
  isTyping: false,
  agentTyping: false,
  activeAgents: [],
  suggestedActions: [],
  currentInvestigation: null,
  error: null,
  isLoading: false,
  settings: {
    enableSound: true,
    enableNotifications: true,
    messageLimit: 100,
    autoSave: true,
    theme: 'auto'
  }
}

// Create the versioned store
export const useChatStore = create<ChatStore>(
  createVersionedStore<ChatStore>(
    (set, get) => ({
      ...initialState,

      // Message actions
      addMessage: (message) =>
        set((state) => {
          // Validate message before adding
          const result = ChatStoreSchema.shape.messages.element.safeParse(message)
          if (!result.success) {
            console.error('Invalid message:', result.error)
            return state
          }

          // Limit messages based on settings
          const limit = state.settings?.messageLimit || 100
          const messages = [...state.messages, message].slice(-limit)

          return { messages }
        }),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates, edited: true, editedAt: new Date().toISOString() } : msg
          )
        })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id)
        })),

      clearMessages: () => set({ messages: [] }),

      // Session actions
      setSession: (session) => set({ session }),

      updateSession: (updates) =>
        set((state) => ({
          session: state.session ? { ...state.session, ...updates } : null
        })),

      // UI state actions
      setTyping: (isTyping) => set({ isTyping }),
      setAgentTyping: (agentTyping) => set({ agentTyping }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Settings actions
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings }
        })),

      // Reset action
      reset: () => set(initialState)
    }),
    {
      name: 'chat',
      version: STORE_VERSION,
      schema: ChatStoreSchema,
      migrations,
      debug: process.env.NODE_ENV === 'development'
    }
  )
)

// Selector hooks for performance
export const useChatMessages = () => useChatStore((state) => state.messages)
export const useChatSession = () => useChatStore((state) => state.session)
export const useChatSettings = () => useChatStore((state) => state.settings)
export const useChatLoading = () => useChatStore((state) => state.isLoading)
export const useChatError = () => useChatStore((state) => state.error)

// Action hooks
export const useChatActions = () => {
  const store = useChatStore()
  return {
    addMessage: store.addMessage,
    updateMessage: store.updateMessage,
    deleteMessage: store.deleteMessage,
    clearMessages: store.clearMessages,
    setSession: store.setSession,
    updateSession: store.updateSession,
    setTyping: store.setTyping,
    setAgentTyping: store.setAgentTyping,
    setError: store.setError,
    setLoading: store.setLoading,
    updateSettings: store.updateSettings,
    reset: store.reset
  }
}