/**
 * Chat Page Hook
 *
 * Consolidates all state and logic for the chat page.
 * Reduces complexity from 17 hooks to a single composite hook.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useChatStore, type StreamingState } from '@/store/chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/logger'
import { useAnnouncementHelpers } from '@/components/a11y'
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { useChatModeHistory, type ChatMode as HistoryChatMode } from '@/hooks/use-chat-mode-history'
import { getAgentById } from '@/hooks/use-agent'
import { type ChatMode } from '@/components/chat/chat-mode-toggle'
import { type MaritacaModel } from '@/lib/chat'

export interface UseChatPageReturn {
  // Auth
  user: ReturnType<typeof useAuth>['user']

  // UI State
  inputMessage: string
  setInputMessage: (value: string) => void
  isHistoryOpen: boolean
  setIsHistoryOpen: (value: boolean) => void
  isAgentSelectorOpen: boolean
  setIsAgentSelectorOpen: (value: boolean) => void
  currentAgentId: string
  isInitialized: boolean
  chatMode: ChatMode
  selectedModel: MaritacaModel
  setSelectedModel: (model: MaritacaModel) => void
  showErrorBanner: boolean
  sendingProgress: number
  optimisticMessage: string | null

  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement>
  messagesContainerRef: React.RefObject<HTMLDivElement>
  textareaRef: React.RefObject<HTMLTextAreaElement>

  // Mobile
  keyboardHeight: number
  isKeyboardVisible: boolean
  isMobile: boolean

  // Chat Store State
  messages: Array<{
    id: string
    content: string | null
    role: 'user' | 'assistant' | 'system'
    agent_id?: string
    metadata?: { confidence?: number; [key: string]: unknown }
  }>
  session: { session_id: string; title?: string } | null
  isLoading: boolean
  error: string | null
  streaming: StreamingState
  selectedAgentId: string | null
  canSendMessage: boolean

  // Actions
  handleSendMessage: () => Promise<void>
  handleRetry: () => void
  handleDismissError: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleModeChange: (newMode: ChatMode) => Promise<void>
  handleSelectSession: (sessionId: string) => Promise<void>
  handleScroll: () => void
  scrollToBottom: (instant?: boolean, force?: boolean) => void
  adjustTextareaHeight: () => void
  setSelectedAgent: (agentId: string | null) => void
  createNewSession: () => Promise<void>

  // Mode history
  hasModeMessages: (mode: HistoryChatMode) => boolean
}

export function useChatPage(): UseChatPageReturn {
  const { user } = useAuth()

  // UI State
  const [inputMessage, setInputMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState<string>('abaporu')
  const [isInitialized, setIsInitialized] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('cidadao')
  const [selectedModel, setSelectedModel] = useState<MaritacaModel>('sabia-4')
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState<string>('')
  const [sendingProgress, setSendingProgress] = useState(0)
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const userIsScrollingRef = useRef(false)
  const lastScrollTopRef = useRef(0)

  // External hooks
  const { keyboardHeight, isKeyboardVisible } = useMobileKeyboard()
  const isMobile = useMobileDetection()
  const { announceLoading, announceSuccess, announceError } = useAnnouncementHelpers()
  const {
    saveMessages: saveModeHistory,
    getMessagesForMode,
    switchMode: switchHistoryMode,
    hasModeMessages,
  } = useChatModeHistory()

  // Chat store
  const messages = useChatStore((state) => state.messages)
  const session = useChatStore((state) => state.session)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const sendStreamingMessage = useChatStore((state) => state.sendStreamingMessage)
  const streaming = useChatStore((state) => state.streaming)
  const clearError = useChatStore((state) => state.clearError)
  const loadSession = useChatStore((state) => state.loadSession)
  const createNewSessionStore = useChatStore((state) => state.createNewSession)
  const initializeChat = useChatStore((state) => state.initializeChat)
  const selectedAgentId = useChatStore((state) => state.selectedAgentId)
  const setSelectedAgentStore = useChatStore((state) => state.setSelectedAgent)

  const canSendMessage = !isLoading && error === null && !streaming.isStreaming

  // Initialize chat ONCE
  useEffect(() => {
    if (!isInitialized) {
      logger.debug('Initializing chat')
      initializeChat()
      setIsInitialized(true)
    }
  }, [isInitialized, initializeChat])

  // Scroll helpers
  const isNearBottom = useCallback((threshold = 150): boolean => {
    const container = messagesContainerRef.current
    if (!container) return true
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback(
    (instant = false, force = false) => {
      if (!force && userIsScrollingRef.current && !isNearBottom()) {
        return
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: instant ? 'instant' : 'smooth',
          block: 'end',
        })
      }
    },
    [isNearBottom]
  )

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const currentScrollTop = container.scrollTop
    if (currentScrollTop < lastScrollTopRef.current) {
      userIsScrollingRef.current = true
    }
    if (isNearBottom(50)) {
      userIsScrollingRef.current = false
    }
    lastScrollTopRef.current = currentScrollTop
  }, [isNearBottom])

  // Scroll when new messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      scrollToBottom()
      if (lastMessage.agent_id) {
        setCurrentAgentId(lastMessage.agent_id)
      }
      if (!streaming.isStreaming) {
        const agentName = getAgentById(lastMessage.agent_id).name
        announceSuccess(`${agentName} respondeu`)
      }
    }
  }, [messages, announceSuccess, streaming.isStreaming, scrollToBottom])

  // Auto-scroll during streaming
  useEffect(() => {
    if (streaming.isStreaming && streaming.accumulatedContent) {
      scrollToBottom(true)
    }
  }, [streaming.isStreaming, streaming.accumulatedContent, scrollToBottom])

  // Error handling
  useEffect(() => {
    if (error) {
      setShowErrorBanner(true)
      toast.error('Erro', error)
      announceError(error)
    }
  }, [error, announceError])

  // Textarea height adjustment
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [])

  useLayoutEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage, adjustTextareaHeight])

  // Mode change handler
  const handleModeChange = useCallback(
    async (newMode: ChatMode) => {
      const currentMode = chatMode as HistoryChatMode
      const targetMode = newMode as HistoryChatMode

      if (messages.length > 0) {
        saveModeHistory(currentMode, messages)
      }

      setChatMode(newMode)
      switchHistoryMode(targetMode)

      const existingMessages = getMessagesForMode(targetMode)
      const hasExistingHistory = existingMessages.length > 0

      if (typeof window !== 'undefined') {
        await createNewSessionStore()

        toast.success(
          newMode === 'maritaca' ? 'Modo Maritaca Ativado' : 'Modo Cidadão.AI Ativado',
          hasExistingHistory
            ? `${existingMessages.length} mensagens restauradas do histórico`
            : newMode === 'maritaca'
              ? 'Conversando diretamente com os modelos base da Maritaca.AI'
              : 'Sistema multi-agente Cidadão.AI ativado'
        )

        announceSuccess(
          newMode === 'maritaca' ? 'Modo Maritaca ativado' : 'Modo Cidadão.AI ativado'
        )
      }
    },
    [
      chatMode,
      messages,
      saveModeHistory,
      switchHistoryMode,
      getMessagesForMode,
      createNewSessionStore,
      announceSuccess,
    ]
  )

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !canSendMessage) return

    const message = inputMessage
    setInputMessage('')
    setLastFailedMessage(message)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    userIsScrollingRef.current = false
    setOptimisticMessage(message)

    setSendingProgress(10)
    const progressInterval = setInterval(() => {
      setSendingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    announceLoading('resposta do agente')

    if (typeof window !== 'undefined') {
      if (chatMode === 'maritaca') {
        localStorage.setItem('maritaca_selected_model', selectedModel)
      } else {
        localStorage.removeItem('maritaca_selected_model')
      }
    }

    try {
      if (chatMode === 'cidadao') {
        setOptimisticMessage(null)
        clearInterval(progressInterval)
        setSendingProgress(0)
        await sendStreamingMessage(message)
      } else {
        await sendMessage(message, false)
        clearInterval(progressInterval)
        setSendingProgress(100)
        setTimeout(() => {
          setSendingProgress(0)
          setOptimisticMessage(null)
        }, 300)
      }
    } catch {
      clearInterval(progressInterval)
      setSendingProgress(0)
    }
  }, [
    inputMessage,
    canSendMessage,
    chatMode,
    selectedModel,
    sendStreamingMessage,
    sendMessage,
    announceLoading,
  ])

  // Retry handler
  const handleRetry = useCallback(() => {
    if (!lastFailedMessage) return
    setShowErrorBanner(false)
    clearError()
    setInputMessage(lastFailedMessage)
    setTimeout(async () => {
      await handleSendMessage()
    }, 100)
  }, [lastFailedMessage, clearError, handleSendMessage])

  // Dismiss error handler
  const handleDismissError = useCallback(() => {
    setShowErrorBanner(false)
    clearError()
    setOptimisticMessage(null)
  }, [clearError])

  // Key down handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  // Select session handler
  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setIsHistoryOpen(false)
      try {
        await loadSession(sessionId)
        toast.success('Sucesso', 'Conversa carregada!')
      } catch (err) {
        logger.error(err instanceof Error ? err : new Error('Failed to load session'), {
          sessionId,
          userId: user?.id,
        })
        toast.error('Erro', 'Falha ao carregar conversa')
      }
    },
    [loadSession, user?.id]
  )

  // Set selected agent
  const setSelectedAgent = useCallback(
    (agentId: string | null) => {
      setSelectedAgentStore(agentId)
      if (agentId) {
        setCurrentAgentId(agentId)
      }
    },
    [setSelectedAgentStore]
  )

  // Create new session
  const createNewSession = useCallback(async () => {
    await createNewSessionStore()
  }, [createNewSessionStore])

  return {
    // Auth
    user,

    // UI State
    inputMessage,
    setInputMessage,
    isHistoryOpen,
    setIsHistoryOpen,
    isAgentSelectorOpen,
    setIsAgentSelectorOpen,
    currentAgentId,
    isInitialized,
    chatMode,
    selectedModel,
    setSelectedModel,
    showErrorBanner,
    sendingProgress,
    optimisticMessage,

    // Refs
    messagesEndRef: messagesEndRef as React.RefObject<HTMLDivElement>,
    messagesContainerRef: messagesContainerRef as React.RefObject<HTMLDivElement>,
    textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>,

    // Mobile
    keyboardHeight,
    isKeyboardVisible,
    isMobile,

    // Chat Store State
    messages,
    session,
    isLoading,
    error,
    streaming,
    selectedAgentId,
    canSendMessage,

    // Actions
    handleSendMessage,
    handleRetry,
    handleDismissError,
    handleKeyDown,
    handleModeChange,
    handleSelectSession,
    handleScroll,
    scrollToBottom,
    adjustTextareaHeight,
    setSelectedAgent,
    createNewSession,

    // Mode history
    hasModeMessages,
  }
}
