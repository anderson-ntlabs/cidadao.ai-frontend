'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { agents } from '@/data/agents'
import { getAgentById, getAgentByIdOrNull } from '@/hooks/use-agent'
import { useChatStore } from '@/store/chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { toast } from '@/hooks/use-toast'
import { Send, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { type ChatMode } from '@/components/chat/chat-mode-toggle'
import { type MaritacaModel } from '@/lib/chat'
import { logger } from '@/lib/utils/logger'
import { useAnnouncementHelpers } from '@/components/a11y'
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorBanner } from '@/components/ui/error-banner'
import { useChatModeHistory, type ChatMode as HistoryChatMode } from '@/hooks/use-chat-mode-history'

// Import MessageBubble directly (not lazy-loaded) to support client-side hooks
import { MessageBubble } from '@/components/chat/message-bubble'
import { ChatEmptyState } from '@/components/chat/empty-state'
import { StreamingStatus } from '@/components/chat/streaming-status'
import { AgentSelector } from '@/components/chat/agent-selector'

// Lazy load heavy components for better initial load performance
const ChatHistorySidebar = dynamic(
  () =>
    import('@/components/chat/chat-history-sidebar').then((mod) => ({
      default: mod.ChatHistorySidebar,
    })),
  {
    loading: () => null, // Sidebar doesn't need loading state
    ssr: false,
  }
)

const AgentAvatar = dynamic(
  () => import('@/components/chat/agent-avatar').then((mod) => ({ default: mod.AgentAvatar })),
  {
    loading: () => (
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    ),
  }
)

// Lazy load model selector and mode toggle (heavy UI components)
const MaritacaModelSelector = dynamic(
  () =>
    import('@/components/chat/maritaca-model-selector').then((mod) => ({
      default: mod.MaritacaModelSelector,
    })),
  {
    loading: () => (
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    ),
    ssr: false,
  }
)

const ChatModeToggle = dynamic(
  () =>
    import('@/components/chat/chat-mode-toggle').then((mod) => ({
      default: mod.ChatModeToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    ),
    ssr: false,
  }
)

const ChatModeDescription = dynamic(
  () =>
    import('@/components/chat/chat-mode-toggle').then((mod) => ({
      default: mod.ChatModeDescription,
    })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Lazy load voice recorder (heavy audio processing)
const VoiceRecorder = dynamic(
  () => import('@/components/voice').then((mod) => ({ default: mod.VoiceRecorder })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Lazy load voice input button (speech-to-text)
const VoiceInputButton = dynamic(
  () => import('@/components/voice').then((mod) => ({ default: mod.VoiceInputButton })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Lazy load mobile-specific components
const MobileChatContainer = dynamic(
  () =>
    import('@/components/mobile/mobile-chat-container').then((mod) => ({
      default: mod.MobileChatContainer,
    })),
  {
    loading: () => <div className="min-h-screen bg-white dark:bg-gray-900" />,
    ssr: false,
  }
)

const MobileChatHeader = dynamic(
  () =>
    import('@/components/mobile/mobile-chat-container').then((mod) => ({
      default: mod.MobileChatHeader,
    })),
  {
    loading: () => null,
    ssr: false,
  }
)

const MobileChatInput = dynamic(
  () =>
    import('@/components/mobile/mobile-chat-input').then((mod) => ({
      default: mod.MobileChatInput,
    })),
  {
    loading: () => (
      <div className="h-16 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" />
    ),
    ssr: false,
  }
)

const MobileChatSuggestions = dynamic(
  () =>
    import('@/components/mobile/mobile-chat-input').then((mod) => ({
      default: mod.MobileChatSuggestions,
    })),
  {
    loading: () => null,
    ssr: false,
  }
)

const SmartSuggestions = dynamic(
  () =>
    import('@/components/chat/smart-suggestions').then((mod) => ({
      default: mod.SmartSuggestions,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    ),
  }
)

// Import getContextualSuggestions separately since it's just a function
import { getContextualSuggestions } from '@/components/chat/smart-suggestions'

export default function ChatPage() {
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState<string>('abaporu')
  const [isInitialized, setIsInitialized] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('cidadao')
  const [selectedModel, setSelectedModel] = useState<MaritacaModel>('sabia-3')
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState<string>('')
  const [sendingProgress, setSendingProgress] = useState(0) // 0-100 for progress bar
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const userIsScrollingRef = useRef(false)
  const lastScrollTopRef = useRef(0)

  // Mobile keyboard detection (iOS/Android virtual keyboard)
  const { keyboardHeight, isKeyboardVisible } = useMobileKeyboard()

  // Mobile viewport detection
  const isMobile = useMobileDetection()

  // Accessibility announcements
  const { announceLoading, announceSuccess, announceError } = useAnnouncementHelpers()

  // Chat mode history management - preserves history when switching modes
  const {
    currentMode: historyMode,
    saveMessages: saveModeHistory,
    getMessagesForMode,
    switchMode: switchHistoryMode,
    hasModeMessages,
  } = useChatModeHistory()

  // Direct store access - no wrapper hook
  const messages = useChatStore((state) => state.messages)
  const session = useChatStore((state) => state.session)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const sendStreamingMessage = useChatStore((state) => state.sendStreamingMessage)
  const streaming = useChatStore((state) => state.streaming)
  const clearError = useChatStore((state) => state.clearError)
  const loadSession = useChatStore((state) => state.loadSession)
  const createNewSession = useChatStore((state) => state.createNewSession)
  const initializeChat = useChatStore((state) => state.initializeChat)
  const selectedAgentId = useChatStore((state) => state.selectedAgentId)
  const setSelectedAgent = useChatStore((state) => state.setSelectedAgent)

  const canSendMessage = !isLoading && error === null && !streaming.isStreaming

  // Initialize chat ONCE
  useEffect(() => {
    if (!isInitialized) {
      logger.debug('Initializing chat')
      initializeChat()
      setIsInitialized(true)
    }
  }, [isInitialized, initializeChat])

  // Check if user is near bottom of scroll (within threshold)
  const isNearBottom = (threshold = 150): boolean => {
    const container = messagesContainerRef.current
    if (!container) return true

    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    return scrollHeight - scrollTop - clientHeight < threshold
  }

  const scrollToBottom = (instant = false, force = false) => {
    // Don't auto-scroll if user is manually scrolling up (unless forced)
    if (!force && userIsScrollingRef.current && !isNearBottom()) {
      return
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: instant ? 'instant' : 'smooth',
        block: 'end',
      })
    }
  }

  // Handle scroll events to detect user manual scrolling
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const currentScrollTop = container.scrollTop

    // User is scrolling up (manually)
    if (currentScrollTop < lastScrollTopRef.current) {
      userIsScrollingRef.current = true
    }

    // User scrolled back to bottom - reset flag
    if (isNearBottom(50)) {
      userIsScrollingRef.current = false
    }

    lastScrollTopRef.current = currentScrollTop
  }

  // Scroll when new messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      scrollToBottom()
      // Update current agent based on last message
      if (lastMessage.agent_id) {
        setCurrentAgentId(lastMessage.agent_id)
      }
      // Announce response received for screen readers (only when complete)
      if (!streaming.isStreaming) {
        const agentName = getAgentById(lastMessage.agent_id).name
        announceSuccess(`${agentName} respondeu`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, announceSuccess, streaming.isStreaming])

  // Auto-scroll during streaming (as content updates)
  useEffect(() => {
    if (streaming.isStreaming && streaming.accumulatedContent) {
      scrollToBottom(true) // instant scroll during streaming
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming.isStreaming, streaming.accumulatedContent])

  useEffect(() => {
    if (error) {
      setShowErrorBanner(true)
      toast.error('Erro', error)
      announceError(error) // Screen reader announcement
      // Don't clear error immediately - let user dismiss banner
    }
  }, [error, announceError])

  // Handle mode switching with history preservation
  const handleModeChange = async (newMode: ChatMode) => {
    const currentMode = chatMode as HistoryChatMode
    const targetMode = newMode as HistoryChatMode

    // Save current messages to mode history before switching
    if (messages.length > 0) {
      saveModeHistory(currentMode, messages)
      logger.debug('Saved messages to mode history', {
        mode: currentMode,
        messageCount: messages.length,
      })
    }

    // Update mode immediately
    setChatMode(newMode)

    // Switch history mode
    switchHistoryMode(targetMode)

    // Check if target mode has existing messages
    const existingMessages = getMessagesForMode(targetMode)
    const hasExistingHistory = existingMessages.length > 0

    if (typeof window !== 'undefined') {
      // Create new session for the new mode
      await createNewSession()

      // Notify user about the mode switch
      const modeMessage =
        newMode === 'maritaca'
          ? hasExistingHistory
            ? 'Modo Maritaca ativado. Histórico anterior restaurado.'
            : 'Modo Maritaca ativado. Conversando diretamente com modelos base.'
          : hasExistingHistory
            ? 'Modo Cidadão.AI ativado. Histórico anterior restaurado.'
            : 'Modo Cidadão.AI ativado. Sistema multi-agente pronto.'

      // Show toast notification with history info
      toast.success(
        newMode === 'maritaca' ? 'Modo Maritaca Ativado' : 'Modo Cidadão.AI Ativado',
        hasExistingHistory
          ? `${existingMessages.length} mensagens restauradas do histórico`
          : newMode === 'maritaca'
            ? 'Conversando diretamente com os modelos base da Maritaca.AI'
            : 'Sistema multi-agente Cidadão.AI ativado'
      )

      // Screen reader announcement
      announceSuccess(modeMessage)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage) return

    const message = inputMessage
    setInputMessage('')
    setLastFailedMessage(message) // Store for retry

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Reset scroll flag when user sends a message - they want to see the response
    userIsScrollingRef.current = false

    // Optimistic UI: Show user message immediately
    setOptimisticMessage(message)

    // Progress simulation for better UX
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

    // Screen reader announcement - message sent
    announceLoading('resposta do agente')

    // Store the selected mode and model in localStorage for the chat service to use
    if (typeof window !== 'undefined') {
      if (chatMode === 'maritaca') {
        localStorage.setItem('maritaca_selected_model', selectedModel)
      } else {
        // Clear Maritaca model when in Cidadão.AI mode
        localStorage.removeItem('maritaca_selected_model')
      }
    }

    try {
      // Use streaming for Cidadao.AI mode, regular for Maritaca direct
      if (chatMode === 'cidadao') {
        // Clear optimistic message as streaming will handle the UI
        setOptimisticMessage(null)
        clearInterval(progressInterval)
        setSendingProgress(0)
        await sendStreamingMessage(message)
      } else {
        await sendMessage(message, false)
        // Success: Complete progress and clear optimistic message
        clearInterval(progressInterval)
        setSendingProgress(100)
        setTimeout(() => {
          setSendingProgress(0)
          setOptimisticMessage(null)
        }, 300)
      }
    } catch (error) {
      // Error: Reset progress and keep optimistic message for retry
      clearInterval(progressInterval)
      setSendingProgress(0)
      // Optimistic message will be cleared when error banner is dismissed
    }
  }

  const handleRetry = () => {
    if (!lastFailedMessage) return

    setShowErrorBanner(false)
    clearError()
    setInputMessage(lastFailedMessage)

    // Auto-send after brief delay
    setTimeout(async () => {
      await handleSendMessage()
    }, 100)
  }

  const handleDismissError = () => {
    setShowErrorBanner(false)
    clearError()
    setOptimisticMessage(null) // Clear optimistic message on error dismiss
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [])

  // Adjust textarea height whenever inputMessage changes
  // Using useLayoutEffect to prevent infinite loop and ensure synchronous DOM update
  useLayoutEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage, adjustTextareaHeight])

  const handleSelectSession = async (sessionId: string) => {
    setIsHistoryOpen(false)
    try {
      await loadSession(sessionId)
      toast.success('Sucesso', 'Conversa carregada!')
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error('Failed to load session'), {
        sessionId,
        userId: user?.id,
      })
      toast.error('Erro', 'Falha ao carregar conversa')
    }
  }

  // Get last assistant message agent for confidence
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant')
  const confidence = lastAssistantMessage?.metadata?.confidence || 0

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Inicializando chat...</p>
        </div>
      </div>
    )
  }

  // Mobile UI
  if (isMobile) {
    const currentAgent = getAgentById(currentAgentId)

    return (
      <MobileChatContainer autoScroll showScrollButton>
        {/* Mobile Header */}
        <MobileChatHeader
          agent={{
            name: chatMode === 'maritaca' ? 'Maritaca.AI Direto' : currentAgent.name,
            avatar: chatMode === 'maritaca' ? '/agents/abaporu.png' : currentAgent.image,
            status:
              chatMode === 'maritaca'
                ? `Modelo ${selectedModel === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'}`
                : currentAgent.role.pt,
          }}
          onBack={() => (window.location.href = '/pt/app/home')}
          onSettings={() => setIsHistoryOpen(true)}
        />

        {/* Chat History Sidebar */}
        <ChatHistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectSession}
          currentSessionId={session?.session_id}
        />

        {/* Error Banner - Mobile */}
        {showErrorBanner && error && (
          <div className="mx-4 mt-4 mb-2">
            <ErrorBanner
              error={error}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
              autoRetrySeconds={5}
            />
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          /* Empty State - Personalized per agent/mode */
          <ChatEmptyState
            userName={user?.name || 'Cidadão'}
            onSuggestionClick={(suggestion) => {
              setInputMessage(suggestion)
              // Auto-focus on input for better UX
              setTimeout(() => {
                const input = document.querySelector('textarea') as HTMLTextAreaElement
                input?.focus()
              }, 100)
            }}
            selectedAgentId={selectedAgentId}
            chatMode={chatMode}
            maritacaModel={selectedModel}
          />
        ) : (
          /* Messages List */
          <div className="space-y-4 py-4">
            {/* Optimistic User Message (shown immediately before server confirms) */}
            {optimisticMessage && (
              <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[85%] order-first">
                  <div className="rounded-2xl px-4 py-3 bg-gradient-green-blue text-white shadow-md opacity-70">
                    <p className="whitespace-pre-wrap text-sm text-white">{optimisticMessage}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isLatest =
                index === messages.length - 1 && message.role === 'assistant' && isLoading
              const messageAgent = getAgentByIdOrNull(message.agent_id)

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
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
                  <div className={cn('max-w-[85%]', message.role === 'user' ? 'order-first' : '')}>
                    <MessageBubble
                      content={message.content || ''}
                      role={message.role === 'system' ? 'assistant' : message.role}
                      agentName={messageAgent?.name}
                      agentRole={messageAgent?.role.pt}
                      agentId={message.agent_id}
                      isLatest={isLatest}
                      isLoading={isLoading}
                      isStreaming={
                        streaming.isStreaming && message.id === streaming.streamingMessageId
                      }
                      onComplete={() => {
                        if (isLatest) scrollToBottom()
                      }}
                      metadata={message.metadata}
                    />
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-green-blue flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-900 shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Mobile Input */}
        <div className="relative">
          {/* Progress Bar - Mobile */}
          {sendingProgress > 0 && sendingProgress < 100 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden z-50">
              <div
                className="h-full bg-gradient-green-blue transition-all duration-300 ease-out"
                style={{ width: `${sendingProgress}%` }}
                role="progressbar"
                aria-valuenow={sendingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Enviando mensagem"
              />
            </div>
          )}
          <MobileChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendMessage}
            loading={isLoading}
            placeholder="Digite sua mensagem..."
            maxLength={2000}
            disabled={!canSendMessage}
            showCharCount
            locale="pt"
          />
        </div>
      </MobileChatContainer>
    )
  }

  // Desktop UI
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Chat page error:', { error, errorInfo })
        toast.error('Erro no Chat', 'Ocorreu um erro inesperado. Por favor, recarregue a página.')
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* VLibras is now global in AuthLayout */}

        {/* Chat History Sidebar */}
        <ChatHistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectSession}
          currentSessionId={session?.session_id}
        />

        {/* Header - Minimal */}
        <div className="flex-shrink-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const selectedAgent = getAgentByIdOrNull(selectedAgentId)
                  const displayImage =
                    chatMode === 'maritaca'
                      ? '/agents/abaporu.png'
                      : selectedAgent?.image || '/agents/abaporu.png'
                  const displayName =
                    chatMode === 'maritaca'
                      ? 'Maritaca.AI Direto'
                      : selectedAgent?.name || 'Cidadão.AI'
                  const displaySubtitle =
                    chatMode === 'maritaca'
                      ? `Modelo ${selectedModel === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'}`
                      : selectedAgent?.role.pt || 'Sistema Multi-Agente'

                  return (
                    <>
                      <OptimizedImage
                        src={displayImage}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500/20"
                        priority
                      />
                      <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {displayName}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {displaySubtitle}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>

              <div className="flex items-center gap-2">
                <ChatModeToggle mode={chatMode} onModeChange={handleModeChange} />
                {chatMode === 'maritaca' ? (
                  <MaritacaModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                ) : (
                  <AgentSelector
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={setSelectedAgent}
                    disabled={streaming.isStreaming || isLoading}
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => createNewSession()}
                  leftIcon={<Plus className="w-4 h-4" />}
                  title="Nova conversa"
                >
                  Nova
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHistoryOpen(true)}
                  leftIcon={<History className="w-4 h-4" />}
                  title="Histórico"
                >
                  Histórico
                </Button>
              </div>
            </div>

            {/* Mode Description */}
            <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <ChatModeDescription mode={chatMode} />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0"
        >
          <div
            className="max-w-4xl mx-auto px-4 py-6 h-full"
            style={{
              paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0',
            }}
          >
            {/* Error Banner - Desktop */}
            {showErrorBanner && error && (
              <div className="mb-4">
                <ErrorBanner
                  error={error}
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                  autoRetrySeconds={5}
                />
              </div>
            )}

            {messages.length === 0 ? (
              /* Empty State - Personalized per agent/mode */
              <ChatEmptyState
                userName={user?.name || 'Cidadão'}
                onSuggestionClick={(suggestion) => {
                  setInputMessage(suggestion)
                  // Auto-focus on input for better UX
                  setTimeout(() => {
                    textareaRef.current?.focus()
                  }, 100)
                }}
                selectedAgentId={selectedAgentId}
                chatMode={chatMode}
                maritacaModel={selectedModel}
              />
            ) : (
              /* Messages List */
              <div className="space-y-4 md:space-y-6 py-4">
                {/* Optimistic User Message - Desktop (shown immediately before server confirms) */}
                {optimisticMessage && (
                  <div className="flex gap-3 md:gap-4 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="max-w-[75%] order-first">
                      <div className="rounded-2xl px-4 py-3 bg-gradient-green-blue text-white shadow-md opacity-70">
                        <p className="whitespace-pre-wrap text-sm text-white">
                          {optimisticMessage}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isLatest =
                    index === messages.length - 1 && message.role === 'assistant' && isLoading
                  const messageAgent = getAgentByIdOrNull(message.agent_id)

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
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
                      <div
                        className={cn(
                          'max-w-[85%] md:max-w-[75%]',
                          message.role === 'user' ? 'order-first' : ''
                        )}
                      >
                        <MessageBubble
                          content={message.content || ''}
                          role={message.role === 'system' ? 'assistant' : message.role}
                          agentName={messageAgent?.name}
                          agentRole={messageAgent?.role.pt}
                          agentId={message.agent_id}
                          isLatest={isLatest}
                          isLoading={isLoading}
                          isStreaming={
                            streaming.isStreaming && message.id === streaming.streamingMessageId
                          }
                          onComplete={() => {
                            if (isLatest) scrollToBottom()
                          }}
                          metadata={message.metadata}
                        />
                      </div>

                      {/* User Avatar */}
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-green-blue flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-900 shadow-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed Bottom */}
        <div className="flex-shrink-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-lg">
          {/* Progress Bar - Shows when sending message */}
          {sendingProgress > 0 && sendingProgress < 100 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-green-blue transition-all duration-300 ease-out"
                style={{ width: `${sendingProgress}%` }}
                role="progressbar"
                aria-valuenow={sendingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Enviando mensagem"
              />
            </div>
          )}
          <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
            <div className="flex gap-2 sm:gap-3 items-end">
              {/* Voice Recorder (Audio Recording) */}
              <VoiceRecorder
                onTranscript={(transcript) => {
                  setInputMessage(transcript)
                  if (textareaRef.current) {
                    textareaRef.current.focus()
                  }
                }}
                disabled={!canSendMessage}
                size="md"
                variant="default"
              />

              {/* Voice Input (Speech-to-Text) */}
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setInputMessage((prev) => prev + ' ' + transcript)
                  if (textareaRef.current) {
                    textareaRef.current.focus()
                  }
                }}
                onInterimTranscript={(transcript) => {
                  // Optional: Show interim results in a tooltip or indicator
                  console.log('Interim:', transcript)
                }}
                disabled={!canSendMessage}
                size="md"
                variant="secondary"
                lang="pt-BR"
                showTooltip={true}
                tooltipContent="Clique e fale (Speech-to-Text)"
              />

              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite ou fale sua pergunta..."
                className="flex-1 resize-none rounded-2xl px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 dark:focus:border-green-500 transition-all text-base min-h-[52px] shadow-sm hover:shadow-md"
                rows={1}
                disabled={!canSendMessage}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !inputMessage.trim()}
                loading={isLoading}
                className="px-5 sm:px-6 py-3 sm:py-4 h-auto rounded-2xl shadow-md hover:shadow-lg transition-all"
                leftIcon={<Send className="w-4 h-4 sm:w-5 sm:h-5" />}
              >
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </div>

            {/* Streaming Status Indicator */}
            {streaming.isStreaming && (
              <div className="mt-3">
                <StreamingStatus streaming={streaming} />
              </div>
            )}

            {isLoading && !streaming.isStreaming && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 animate-in fade-in duration-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Processando sua mensagem...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
