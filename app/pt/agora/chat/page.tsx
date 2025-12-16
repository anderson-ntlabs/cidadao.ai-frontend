'use client'

/**
 * Agora Academy Chat Page
 *
 * Educational chat interface using the same components as main app.
 * Features Santos-Dumont (Engineering) and Lina Bo Bardi (UI/UX) mentors.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 * @updated 2025-12-11 - Standardized loading state with PageLoading
 */

import { useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAgora } from '@/hooks/use-agora'
import { useAgoraChatStore } from '@/store/agora-chat-store'
import { getEducationalAgents, isEducationalAgent } from '@/data/agents'
import { PageLoading } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Send, Sparkles, MessageSquare, Plus, GraduationCap } from 'lucide-react'
import { trackMentorChat, trackStudySession } from '@/lib/analytics/agora-tracker'

// Import shared chat components
import { MessageBubble } from '@/components/chat/message-bubble'
import { StreamingStatus } from '@/components/chat/streaming-status'

// Lazy load heavy components with proper error handling
const AgoraAgentSelector = dynamic(
  () =>
    import('@/components/agora/agora-agent-selector').then((mod) => {
      if (!mod.AgoraAgentSelector) {
        throw new Error('AgoraAgentSelector not found in module')
      }
      return { default: mod.AgoraAgentSelector }
    }),
  {
    loading: () => <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
    ssr: false,
  }
)

// Voice components - wrapped with fallback to prevent crash if not available
const VoiceRecorderFallback = () => null
const VoiceRecorder = dynamic(
  () =>
    import('@/components/voice/voice-recorder')
      .then((mod) => {
        if (!mod.VoiceRecorder) {
          console.warn('VoiceRecorder not found, using fallback')
          return { default: VoiceRecorderFallback }
        }
        return { default: mod.VoiceRecorder }
      })
      .catch((err) => {
        console.error('Failed to load VoiceRecorder:', err)
        return { default: VoiceRecorderFallback }
      }),
  { loading: () => null, ssr: false }
)

const VoiceInputButtonFallback = () => null
const VoiceInputButton = dynamic(
  () =>
    import('@/components/voice/voice-input-button')
      .then((mod) => {
        if (!mod.VoiceInputButton) {
          console.warn('VoiceInputButton not found, using fallback')
          return { default: VoiceInputButtonFallback }
        }
        return { default: mod.VoiceInputButton }
      })
      .catch((err) => {
        console.error('Failed to load VoiceInputButton:', err)
        return { default: VoiceInputButtonFallback }
      }),
  { loading: () => null, ssr: false }
)

// Empty state for chat
function ChatEmptyState({
  agentId,
  agentName,
  onSuggestionClick,
}: {
  agentId: string
  agentName: string
  onSuggestionClick: (suggestion: string) => void
}) {
  const agents = getEducationalAgents()
  const agent = agents.find((a) => a.id === agentId)

  const suggestions =
    agentId === 'santos-dumont'
      ? [
          'O que é o Cidadão.AI?',
          'Como funciona o sistema de agentes?',
          'Dicas para meu primeiro projeto',
          'Arquitetura de software escalável',
        ]
      : [
          'Como melhorar a acessibilidade?',
          'Princípios de design funcional',
          'Dicas de UI para mobile',
          'Design centrado no usuário',
        ]

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Agent Avatar */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-800">
          {agent && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Welcome Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Olá! Sou {agentName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {agent?.description.pt || 'Seu mentor na Academy Cidadão.AI'}
        </p>

        {/* Suggestions */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Experimente perguntar:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* XP Info */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>+5 XP a cada 5 mensagens</span>
        </div>
      </div>
    </div>
  )
}

function ChatContent() {
  const searchParams = useSearchParams()
  const { user, addXp, startSession, endSession, currentSession } = useAgora()

  // Chat store
  const {
    messages,
    selectedAgentId,
    isLoading,
    error,
    streaming,
    initializeChat,
    sendMessage,
    selectAgent,
    clearChat,
    clearError,
    setXpCallback,
  } = useAgoraChatStore()

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<string>('')

  // Get agent info
  const agents = getEducationalAgents()
  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0]

  // Initialize chat and XP callback
  useEffect(() => {
    initializeChat()
    setXpCallback((amount, type, description) => {
      void addXp(amount, type, description)
    })
  }, [initializeChat, setXpCallback, addXp])

  // Handle agent from URL params
  useEffect(() => {
    const agentParam = searchParams.get('agent')
    if (agentParam && isEducationalAgent(agentParam)) {
      selectAgent(agentParam)
    }
  }, [searchParams, selectAgent])

  // Start session on mount
  useEffect(() => {
    if (!currentSession) {
      void startSession()
    }
  }, [currentSession, startSession])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming.accumulatedContent])

  // Handle send message
  const handleSend = useCallback(async () => {
    const message = inputRef.current.trim()
    if (!message || isLoading) return

    inputRef.current = ''
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }

    await sendMessage(message)

    // Track in analytics
    trackMentorChat(selectedAgentId, messages.length + 1)
  }, [isLoading, sendMessage, selectedAgentId, messages.length])

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // Handle textarea input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    inputRef.current = e.target.value
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  // Handle new chat
  const handleNewChat = () => {
    if (currentSession && messages.length > 0) {
      const sessionDuration = Math.floor(
        (Date.now() - new Date(currentSession.startedAt).getTime()) / 60000
      )
      void endSession(messages.length, [selectedAgentId])
      trackStudySession({
        duration: sessionDuration,
        activities: ['chat', selectedAgentId],
        xpEarned: Math.floor(messages.filter((m) => m.role === 'user').length / 5) * 5,
      })
    }
    clearChat()
    void startSession()
  }

  // Handle agent change
  const handleAgentChange = (agentId: string) => {
    selectAgent(agentId)
    handleNewChat()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/pt/agora"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              {currentSession && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Sessão ativa
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Nova
              </Button>
            </div>
          </div>

          {/* Agent Selector */}
          <AgoraAgentSelector
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleAgentChange}
            disabled={isLoading || streaming.isStreaming}
          />
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-xs text-red-600 dark:text-red-500 underline"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Empty State or Messages */}
          {messages.length === 0 ? (
            <ChatEmptyState
              agentId={selectedAgentId}
              agentName={currentAgent.name}
              onSuggestionClick={(suggestion) => {
                inputRef.current = suggestion
                if (textareaRef.current) {
                  textareaRef.current.value = suggestion
                  textareaRef.current.focus()
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => {
                const isLatest =
                  index === messages.length - 1 &&
                  message.role === 'assistant' &&
                  streaming.isStreaming
                const agent = agents.find((a) => a.id === message.agentId)

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Agent Avatar */}
                    {message.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={agent?.image || currentAgent.image}
                          alt={agent?.name || currentAgent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn('max-w-[85%]', message.role === 'user' ? 'order-first' : '')}
                    >
                      <MessageBubble
                        content={message.content}
                        role={message.role}
                        agentName={agent?.name || currentAgent.name}
                        agentRole={agent?.role.pt || currentAgent.role.pt}
                        agentId={message.agentId}
                        isLatest={isLatest}
                        isLoading={isLoading}
                        isStreaming={isLatest && streaming.isStreaming}
                      />
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-900 shadow-lg flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Streaming Status */}
          {streaming.isStreaming && (
            <div className="mb-3">
              <StreamingStatus
                streaming={{
                  isStreaming: streaming.isStreaming,
                  phase: streaming.phase as any,
                  statusMessage: streaming.statusMessage,
                  currentAgentId: streaming.currentAgentId,
                  currentAgentName: streaming.currentAgentName,
                  streamingMessageId: null,
                  accumulatedContent: streaming.accumulatedContent,
                }}
              />
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2 sm:gap-3 items-end">
            {/* Voice Recorder */}
            <VoiceRecorder
              onTranscript={(transcript) => {
                inputRef.current = transcript
                if (textareaRef.current) {
                  textareaRef.current.value = transcript
                  textareaRef.current.focus()
                }
              }}
              disabled={isLoading || streaming.isStreaming}
              size="md"
              variant="default"
            />

            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(transcript) => {
                inputRef.current = inputRef.current + ' ' + transcript
                if (textareaRef.current) {
                  textareaRef.current.value = inputRef.current
                  textareaRef.current.focus()
                }
              }}
              disabled={isLoading || streaming.isStreaming}
              size="md"
              variant="secondary"
              lang="pt-BR"
              showTooltip={true}
              tooltipContent="Clique e fale"
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Converse com ${currentAgent.name.split(' ')[0]}...`}
              className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 dark:focus:border-green-500 transition-all text-base min-h-[52px] shadow-sm hover:shadow-md"
              rows={1}
              disabled={isLoading || streaming.isStreaming}
            />

            {/* Send Button */}
            <Button
              onClick={() => void handleSend()}
              disabled={isLoading || streaming.isStreaming}
              loading={isLoading && !streaming.isStreaming}
              className="px-5 py-3 h-auto rounded-2xl shadow-md hover:shadow-lg"
              leftIcon={<Send className="w-5 h-5" />}
            >
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>

          {/* XP Info */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
            <GraduationCap className="w-3 h-3" />
            Academy Cidadão.AI
            <span className="mx-1">•</span>
            <Sparkles className="w-3 h-3" />
            +5 XP a cada 5 mensagens
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function AgoraChatPage() {
  return (
    <Suspense fallback={<PageLoading text="Carregando chat..." icon={MessageSquare} />}>
      <ChatContent />
    </Suspense>
  )
}
