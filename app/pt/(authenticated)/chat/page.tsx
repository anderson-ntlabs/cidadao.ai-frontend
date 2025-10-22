'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { agents } from '@/data/agents'
import { useChatStore } from '@/store/chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { TypingMessage } from '@/components/chat/typing-message'
import { AgentThinkingIndicator } from '@/components/chat/agent-thinking-indicator'
import { toast } from '@/hooks/use-toast'
import { Send, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatHistorySidebar } from '@/components/chat/chat-history-sidebar'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { VLibrasWidget } from '@/components/a11y'

export default function ChatPage() {
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState<string>('abaporu')
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      console.log('🚀 Initializing chat...')
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
    }
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (error) {
      toast.error('Erro', error)
      clearError()
    }
  }, [error, clearError])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage) return

    const message = inputMessage
    setInputMessage('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
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
      console.error('Failed to load session:', error)
      toast.error('Erro', 'Falha ao carregar conversa')
    }
  }

  // Get last assistant message agent for confidence
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Agent Thinking Indicator */}
      <AgentThinkingIndicator
        currentAgentId={currentAgentId}
        isThinking={isLoading}
        confidence={confidence}
      />

      {/* VLibras Widget for Authenticated Area */}
      <VLibrasWidget locale="pt" forceOnload />

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={session?.session_id}
      />

      {/* Header - Minimal */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
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
                  Cidadão.AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Transparência Pública
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
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

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {[
                  'Investigar contratos suspeitos',
                  'Analisar anomalias em licitações',
                  'Relatório de gastos públicos',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all text-sm text-gray-700 dark:text-gray-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-6 py-4">
              {messages.map((message, index) => {
                const isLatest = index === messages.length - 1 && message.role === 'assistant' && isLoading
                const messageAgent = message.agent_id
                  ? agents.find(a => a.id === message.agent_id)
                  : null

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Assistant Avatar */}
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <OptimizedImage
                          src={messageAgent?.image || '/agents/abaporu.png'}
                          alt={messageAgent?.name || 'Abaporu'}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                        />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={cn(
                      "max-w-[75%]",
                      message.role === 'user' ? 'order-first' : ''
                    )}>
                      {/* Agent name for assistant messages */}
                      {message.role === 'assistant' && messageAgent && (
                        <div className="mb-1 px-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {messageAgent.name}
                          </span>
                        </div>
                      )}

                      {/* Message content */}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          message.role === 'user'
                            ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <TypingMessage
                            content={message.content || ''}
                            isLatest={isLatest}
                            onComplete={() => {
                              if (isLatest) scrollToBottom()
                            }}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
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
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              className="flex-1 resize-none rounded-2xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all text-sm"
              rows={1}
              disabled={!canSendMessage}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!canSendMessage || !inputMessage.trim()}
              loading={isLoading}
              className="px-6 py-3 h-auto"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Enviar
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Processando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
