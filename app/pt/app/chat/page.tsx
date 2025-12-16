'use client'

import dynamic from 'next/dynamic'
import { getAgentById, getAgentByIdOrNull } from '@/hooks/use-agent'
import { useChatPage } from '@/hooks/use-chat-page'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Button } from '@/components/ui/button'
import { History, Plus } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorBanner } from '@/components/ui/error-banner'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/logger'

// Import core chat components
import { ChatEmptyState } from '@/components/chat/empty-state'
import { AgentSelector } from '@/components/chat/agent-selector'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInputArea } from '@/components/chat/chat-input-area'

// Lazy load heavy components
const ChatHistorySidebar = dynamic(
  () =>
    import('@/components/chat/chat-history-sidebar').then((mod) => ({
      default: mod.ChatHistorySidebar,
    })),
  { loading: () => null, ssr: false }
)

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
  { loading: () => null, ssr: false }
)

// Lazy load mobile components
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
  { loading: () => null, ssr: false }
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

const MobileAgentSelector = dynamic(
  () =>
    import('@/components/mobile/mobile-agent-selector').then((mod) => ({
      default: mod.MobileAgentSelector,
    })),
  { loading: () => null, ssr: false }
)

export default function ChatPage() {
  const {
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
    messagesEndRef,
    messagesContainerRef,
    textareaRef,
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
    setSelectedAgent,
    createNewSession,
  } = useChatPage()

  // Loading state
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
        <MobileChatHeader
          agent={{
            name:
              chatMode === 'maritaca'
                ? selectedModel === 'sabia-3'
                  ? 'Sabiá-3.1'
                  : 'Sabiazinho-3'
                : currentAgent.name,
            avatar:
              chatMode === 'maritaca'
                ? selectedModel === 'sabia-3'
                  ? '/sabia3.1.png'
                  : '/sabiazinho.png'
                : currentAgent.image,
            status: chatMode === 'maritaca' ? 'Maritaca.AI - Modelo Direto' : currentAgent.role.pt,
          }}
          user={{ name: user?.name, avatar: user?.avatar }}
          chatMode={chatMode}
          onBack={() => (window.location.href = '/pt/app/home')}
          onAgentClick={() => setIsAgentSelectorOpen(true)}
          onNewChat={() => createNewSession()}
          onSettings={() => setIsHistoryOpen(true)}
        />

        <MobileAgentSelector
          isOpen={isAgentSelectorOpen}
          onClose={() => setIsAgentSelectorOpen(false)}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agentId) => {
            setSelectedAgent(agentId)
          }}
          chatMode={chatMode}
          maritacaModel={selectedModel}
          onModeChange={handleModeChange}
          onMaritacaModelChange={setSelectedModel}
        />

        <ChatHistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectSession}
          currentSessionId={session?.session_id}
        />

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

        {messages.length === 0 ? (
          <ChatEmptyState
            userName={user?.name || 'Cidadão'}
            onSuggestionClick={(suggestion) => {
              setInputMessage(suggestion)
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
          <ChatMessages
            messages={messages}
            user={user}
            isLoading={isLoading}
            streaming={streaming}
            optimisticMessage={optimisticMessage}
            onScrollToBottom={() => scrollToBottom()}
            messagesEndRef={messagesEndRef}
            variant="mobile"
          />
        )}

        <div className="relative">
          {sendingProgress > 0 && sendingProgress < 100 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden z-[45]">
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
      onError={(err, errorInfo) => {
        logger.error('Chat page error:', { error: err, errorInfo })
        toast.error('Erro no Chat', 'Ocorreu um erro inesperado. Por favor, recarregue a página.')
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <ChatHistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectSession}
          currentSessionId={session?.session_id}
        />

        {/* Header */}
        <div className="flex-shrink-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const selectedAgent = getAgentByIdOrNull(selectedAgentId)
                  const displayImage =
                    chatMode === 'maritaca'
                      ? selectedModel === 'sabia-3'
                        ? '/sabia3.1.png'
                        : '/sabiazinho.png'
                      : selectedAgent?.image || '/agents/abaporu.webp'
                  const displayName =
                    chatMode === 'maritaca'
                      ? selectedModel === 'sabia-3'
                        ? 'Sabia-3.1'
                        : 'Sabiazinho-3'
                      : selectedAgent?.name || 'Cidadão.AI'
                  const displaySubtitle =
                    chatMode === 'maritaca'
                      ? 'Maritaca.AI - Modelo Direto'
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
              <ChatEmptyState
                userName={user?.name || 'Cidadão'}
                onSuggestionClick={(suggestion) => {
                  setInputMessage(suggestion)
                  setTimeout(() => {
                    textareaRef.current?.focus()
                  }, 100)
                }}
                selectedAgentId={selectedAgentId}
                chatMode={chatMode}
                maritacaModel={selectedModel}
              />
            ) : (
              <ChatMessages
                messages={messages}
                user={user}
                isLoading={isLoading}
                streaming={streaming}
                optimisticMessage={optimisticMessage}
                onScrollToBottom={() => scrollToBottom()}
                messagesEndRef={messagesEndRef}
                variant="desktop"
              />
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInputArea
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          canSendMessage={canSendMessage}
          streaming={streaming}
          sendingProgress={sendingProgress}
          textareaRef={textareaRef}
        />
      </div>
    </ErrorBoundary>
  )
}
