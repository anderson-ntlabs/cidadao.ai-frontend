'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingScreen } from '@/components/loading-screen'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { agents } from '@/data/agents'
import { useChat, useAgentStatus, useSuggestedActions } from '@/hooks/use-chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { TypingMessage } from '@/components/chat/typing-message'
import { toast } from '@/hooks/use-toast'
import { Send, Bot, Sparkles, AlertCircle, Brain, Search, FileText, Shield, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatHistorySidebar } from '@/components/chat/chat-history-sidebar'
import { StrategicTooltip } from '@/components/ui/tooltip'
import { useReportUXIssue } from '@/components/hints/adaptive-hints-provider'
import { ContrastToggle, ContrastChecker } from '@/components/ui/contrast-toggle'
import { useContrastCheck } from '@/hooks/use-contrast-check'
import { InteractiveTour } from '@/components/tour/lazy'
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function ChatPageV3() {
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { reportMissingElement, reportContrastIssue } = useReportUXIssue()
  
  // Check contrast issues automatically
  useContrastCheck()
  
  const {
    messages,
    session,
    isLoading,
    error,
    connectionStatus,
    canSendMessage,
    sendMessage,
    handleQuickAction,
    clearError,
    clearChat,
  } = useChat()
  
  const { activeAgents, hasActiveAgents } = useAgentStatus()
  const { suggestedActions } = useSuggestedActions()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    // Only scroll when a new assistant message is added
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      scrollToBottom()
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
    
    await sendMessage(message, { streaming: false })
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

  // Suggested questions
  const suggestedQuestions = [
    { icon: Search, text: "Quais contratos estão sendo analisados?" },
    { icon: Shield, text: "Detecte anomalias em licitações recentes" },
    { icon: FileText, text: "Mostre relatório de gastos públicos" },
    { icon: Brain, text: "Analise padrões suspeitos em contratos" }
  ]

  const drummondAgent = agents.find(a => a.id === 'drummond')
  
  // Handle session selection from history
  const handleSelectSession = async (sessionId: string) => {
    // For now, just close the sidebar
    // In future, we would load the session messages
    setIsHistoryOpen(false)
    toast.info('Histórico', 'Carregando conversa anterior...')
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Operários */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        <LoadingScreen />
        
        {/* Contrast Checker - Auto suggests high contrast mode */}
        <ContrastChecker />
        
        {/* Interactive Tour */}
        <InteractiveTour autoStart={true} mode="quick" />
        
        {/* Chat History Sidebar */}
        <ChatHistorySidebar 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectSession={handleSelectSession}
          currentSessionId={session?.session_id}
        />

        {/* Main Chat Container */}
        <GlassCard className="min-h-[80vh] flex flex-col">
          {/* Chat Header */}
          <GlassCardHeader className="border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                    Assistente de Transparência Pública
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Powered by Cidadão.AI Multi-Agent System
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {hasActiveAgents && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100/50 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {activeAgents.length} agentes investigando
                    </span>
                  </div>
                )}
                
                <div className="contrast-toggle">
                  <ContrastToggle />
                </div>
                
                <StrategicTooltip 
                  tooltipKey="chat-history"
                  content="Veja suas conversas anteriores e retome de onde parou"
                  position="bottom"
                  delay={1000}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsHistoryOpen(true)}
                    leftIcon={<History className="w-4 h-4" />}
                    className="chat-history-button"
                  >
                    Histórico
                  </Button>
                </StrategicTooltip>
              </div>
            </div>
          </GlassCardHeader>

          {/* Messages Area */}
          <GlassCardContent className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="mb-8">
                  <OptimizedImage 
                    src="/agents/abaporu.png" 
                    alt="Abaporu - Mestre Orquestrador" 
                    width={96}
                    height={96}
                    className="mx-auto rounded-full shadow-xl object-cover ring-4 ring-green-500/20"
                    priority
                  />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Olá, {user?.name?.split(' ')[0] || 'Cidadão'}! 👋
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                  Sou o assistente de transparência pública do Cidadão.AI. 
                  Como posso ajudar você a entender melhor os gastos públicos brasileiros hoje?
                </p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl suggested-questions">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question.text)}
                      className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all text-left"
                    >
                      <question.icon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                {messages.map((message, index) => {
                  // Only show typing animation for the very last assistant message and only if loading
                  const isLatest = index === messages.length - 1 && message.role === 'assistant' && isLoading
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <Image 
                            src="/agents/abaporu.png" 
                            alt="Abaporu" 
                            className="w-10 h-10 rounded-lg shadow-md object-cover"
                            width={40}
                            height={40}
                          />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[70%]",
                        message.role === 'user' ? 'order-first' : ''
                      )}>
                        <div
                          className={cn(
                            "rounded-2xl px-5 py-3",
                            message.role === 'user'
                              ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                              : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <TypingMessage 
                              content={message.content || ''} 
                              isLatest={isLatest}
                              onComplete={() => {
                                // Only scroll if it's really the latest message
                                if (isLatest) {
                                  scrollToBottom()
                                }
                              }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        {message.agent_name && message.agent_name !== 'Carlos Drummond de Andrade' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                            via {message.agent_name}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </GlassCardContent>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="flex gap-3 chat-input">
              <StrategicTooltip
                tooltipKey="first-chat"
                position="top"
                delay={2000}
                trigger={messages.length === 0 ? 'hover' : 'focus'}
              >
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua pergunta sobre transparência pública..."
                  className="flex-1 resize-none rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  rows={1}
                  disabled={!canSendMessage}
                />
              </StrategicTooltip>
              <StrategicTooltip
                tooltipKey="send-message"
                content="Pressione Enter para enviar rapidamente"
                position="top"
                delay={3000}
              >
                <Button
                  onClick={handleSendMessage}
                  disabled={!canSendMessage || !inputMessage.trim()}
                  className="px-6 send-button"
                  leftIcon={<Send className="w-5 h-5" />}
                >
                  Enviar
                </Button>
              </StrategicTooltip>
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Processando sua mensagem...</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}