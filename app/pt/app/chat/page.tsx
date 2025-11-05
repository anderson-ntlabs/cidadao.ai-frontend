'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { agents } from '@/data/agents'
import { useChatStore } from '@/store/chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { toast } from '@/hooks/use-toast'
import { Send, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { MaritacaModelSelector } from '@/components/chat/maritaca-model-selector'
import {
  ChatModeToggle,
  ChatModeDescription,
  type ChatMode,
} from '@/components/chat/chat-mode-toggle'
import { type MaritacaModel } from '@/lib/chat'
import { logger } from '@/lib/utils/logger'
import { useAnnouncementHelpers } from '@/components/a11y'
import { VoiceRecorder } from '@/components/voice'
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard'
import { PullToRefresh } from '@/components/mobile'
import { useMobileDetection } from '@/lib/utils/mobile-detection'
import { MobileChatContainer, MobileChatHeader } from '@/components/mobile/mobile-chat-container'
import { MobileChatInput, MobileChatSuggestions } from '@/components/mobile/mobile-chat-input'

// Import MessageBubble directly (not lazy-loaded) to support client-side hooks
import { MessageBubble } from '@/components/chat/message-bubble'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mobile keyboard detection (iOS/Android virtual keyboard)
  const { keyboardHeight, isKeyboardVisible } = useMobileKeyboard()

  // Mobile viewport detection
  const isMobile = useMobileDetection()

  // Accessibility announcements
  const { announceLoading, announceSuccess, announceError } = useAnnouncementHelpers()

  // Direct store access - no wrapper hook
  const messages = useChatStore((state) => state.messages)
  const session = useChatStore((state) => state.session)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const clearError = useChatStore((state) => state.clearError)
  const loadSession = useChatStore((state) => state.loadSession)
  const createNewSession = useChatStore((state) => state.createNewSession)
  const initializeChat = useChatStore((state) => state.initializeChat)

  const canSendMessage = !isLoading && error === null

  // Initialize chat ONCE
  useEffect(() => {
    if (!isInitialized) {
      logger.debug('Initializing chat')
      initializeChat()
      setIsInitialized(true)
    }
  }, [isInitialized, initializeChat])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      scrollToBottom()
      // Update current agent based on last message
      if (lastMessage.agent_id) {
        setCurrentAgentId(lastMessage.agent_id)
      }
      // Announce response received for screen readers
      const agentName = agents.find((a) => a.id === lastMessage.agent_id)?.name || 'Agente'
      announceSuccess(`${agentName} respondeu`)
    }
  }, [messages, scrollToBottom, announceSuccess])

  useEffect(() => {
    if (error) {
      toast.error('Erro', error)
      announceError(error) // Screen reader announcement
      clearError()
    }
  }, [error, clearError, announceError])

  // Clear messages when switching modes
  const handleModeChange = async (newMode: ChatMode) => {
    // Update mode immediately
    setChatMode(newMode)

    // Clear chat history when switching modes
    if (typeof window !== 'undefined') {
      // Create new session for the new mode (this clears messages)
      await createNewSession()

      const modeMessage =
        newMode === 'maritaca'
          ? 'Modo Maritaca ativado. Conversando diretamente com modelos base.'
          : 'Modo Cidadão.AI ativado. Sistema multi-agente pronto.'

      // Show toast notification
      toast.success(
        newMode === 'maritaca' ? 'Modo Maritaca Ativado' : 'Modo Cidadão.AI Ativado',
        newMode === 'maritaca'
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

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

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

    await sendMessage(message, false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

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

  // Pull-to-refresh handler (load older messages)
  const handleRefresh = async () => {
    // Simulate loading older messages
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In future: load older messages from session history
    // For now, just show a notification
    if (messages.length > 0) {
      toast.success('Atualizado', 'Conversa atualizada com sucesso!')
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
    const currentAgent = agents.find((a) => a.id === currentAgentId) || agents[0]

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

        {/* Messages */}
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-6">
              <OptimizedImage
                src="/agents/abaporu.png"
                alt="Abaporu"
                width={80}
                height={80}
                className="mx-auto rounded-full shadow-xl object-cover ring-4 ring-green-500/20"
                priority
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Olá, {user?.name?.split(' ')[0] || 'Cidadão'}! 👋
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Como posso ajudar você a entender melhor os gastos públicos brasileiros?
            </p>

            {/* Mobile Suggestions */}
            <MobileChatSuggestions
              suggestions={getContextualSuggestions(0).map((s) => s.text)}
              onSelect={setInputMessage}
            />
          </div>
        ) : (
          /* Messages List */
          <div className="space-y-4 py-4">
            {messages.map((message, index) => {
              const isLatest =
                index === messages.length - 1 && message.role === 'assistant' && isLoading
              const messageAgent = message.agent_id
                ? agents.find((a) => a.id === message.agent_id)
                : null

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
                      onComplete={() => {
                        if (isLatest) scrollToBottom()
                      }}
                      metadata={message.metadata}
                    />
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-900 shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Mobile Input */}
        <MobileChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          loading={isLoading}
          placeholder="Digite sua mensagem..."
          maxLength={2000}
          disabled={!canSendMessage}
          showCharCount
        />
      </MobileChatContainer>
    )
  }

  // Desktop UI
  return (
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
              <OptimizedImage
                src="/agents/abaporu.png"
                alt="Cidadão.AI"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500/20"
                priority
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {chatMode === 'maritaca' ? 'Maritaca.AI Direto' : 'Cidadão.AI'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {chatMode === 'maritaca'
                    ? `Modelo ${selectedModel === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'}`
                    : 'Transparência Pública'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChatModeToggle mode={chatMode} onModeChange={handleModeChange} />
              {chatMode === 'maritaca' && (
                <MaritacaModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
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
      <PullToRefresh
        onRefresh={handleRefresh}
        threshold={80}
        className="flex-1 overflow-y-auto min-h-0"
        disabled={messages.length === 0}
      >
        <div
          className="max-w-4xl mx-auto px-4 py-6 h-full"
          style={{
            paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0',
          }}
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="mb-6">
                <OptimizedImage
                  src="/agents/abaporu.png"
                  alt="Abaporu"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full shadow-xl object-cover ring-4 ring-green-500/20"
                  priority
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Olá, {user?.name?.split(' ')[0] || 'Cidadão'}! 👋
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                Como posso ajudar você a entender melhor os gastos públicos brasileiros?
              </p>

              {/* Smart Suggestions */}
              <div className="max-w-2xl">
                <SmartSuggestions
                  suggestions={getContextualSuggestions(0)}
                  onSelect={setInputMessage}
                  variant="default"
                />
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-4 md:space-y-6 py-4">
              {messages.map((message, index) => {
                const isLatest =
                  index === messages.length - 1 && message.role === 'assistant' && isLoading
                const messageAgent = message.agent_id
                  ? agents.find((a) => a.id === message.agent_id)
                  : null

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
                        onComplete={() => {
                          if (isLatest) scrollToBottom()
                        }}
                        metadata={message.metadata}
                      />
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-900 shadow-lg">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Input Area - Fixed Bottom */}
      <div className="flex-shrink-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex gap-2 sm:gap-3 items-end">
            {/* Voice Recorder */}
            <VoiceRecorder
              onTranscript={(transcript) => {
                setInputMessage(transcript)
                if (textareaRef.current) {
                  textareaRef.current.focus()
                  adjustTextareaHeight()
                }
              }}
              disabled={!canSendMessage}
              size="md"
              variant="default"
            />

            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                adjustTextareaHeight()
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

          {isLoading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400 animate-in fade-in duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Processando sua mensagem...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
