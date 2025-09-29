'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { BreadcrumbsV2 } from '@/components/breadcrumbs'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { agents } from '@/data/agents'
import { useChat, useAgentStatus, useSuggestedActions } from '@/hooks/use-chat-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { TypingMessage } from '@/components/chat/typing-message'
import { chatSessionService } from '@/lib/services/chat-session.service'
import { toast } from '@/hooks/use-toast'
import { 
  Send, Bot, Sparkles, AlertCircle, Brain, Search, FileText, 
  Shield, Plus, MessageSquare, X, Clock, Trash2, MoreVertical 
} from 'lucide-react'
import { ButtonV2 } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ChatSession } from '@/types/supabase'

export default function ChatPageV4() {
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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
    clearChat
  } = useChat()
  
  const { activeAgents, hasActiveAgents } = useAgentStatus()
  const { suggestedActions } = useSuggestedActions()

  // Load user sessions
  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-delete old sessions (keep only last 10)
  useEffect(() => {
    if (sessions.length > 10) {
      const sessionsToDelete = sessions.slice(10)
      sessionsToDelete.forEach(async (session) => {
        await chatSessionService.deleteSession(session.id)
      })
      setSessions(sessions.slice(0, 10))
    }
  }, [sessions])

  const loadSessions = async () => {
    setIsLoadingSessions(true)
    try {
      const userSessions = await chatSessionService.getUserSessions(10)
      setSessions(userSessions)
      
      // Don't load any session automatically - always start fresh
      if (!currentSessionId) {
        clearChat()
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Erro ao carregar conversas', 'Tente novamente mais tarde')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const loadSession = async (sessionId: string) => {
    const sessionData = await chatSessionService.getSession(sessionId)
    if (sessionData) {
      setCurrentSessionId(sessionId)
      // Clear current chat
      clearChat()
      
      // Load messages from the session into the chat
      if (sessionData.messages && sessionData.messages.length > 0) {
        // Wait a bit for the chat to clear
        setTimeout(() => {
          sessionData.messages.forEach((msg: any) => {
            // Add messages to the chat store
            // This is a workaround since we don't have a loadMessages function
            // In a real implementation, we would load messages directly into the store
          })
        }, 100)
      }
    }
  }

  const createNewSession = async () => {
    try {
      const defaultAgent = agents.find(a => a.id === 'drummond')
      if (!defaultAgent) return null

      const newSession = await chatSessionService.createSession({
        agent_id: defaultAgent.id,
        metadata: {
          title: 'Nova conversa',
          created_at: new Date().toISOString()
        }
      })

      if (newSession) {
        await loadSessions()
        setCurrentSessionId(newSession.id)
        clearChat()
        return newSession
      }
      return null
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Erro ao criar nova conversa', 'Tente novamente')
      return null
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await chatSessionService.deleteSession(sessionId)
      await loadSessions()
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        clearChat()
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Erro ao deletar conversa', 'Tente novamente')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Only scroll to bottom if we have messages and it's not the initial load
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  // Save assistant messages to Supabase
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && currentSessionId) {
      chatSessionService.addMessage(currentSessionId, {
        role: 'assistant',
        content: lastMessage.content || '',
        metadata: {
          agent_id: lastMessage.agent_id || 'drummond',
          agent_name: lastMessage.agent_name || 'Carlos Drummond de Andrade'
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

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
    
    // Create session if none exists
    let sessionId = currentSessionId
    if (!sessionId) {
      const newSession = await createNewSession()
      if (!newSession) return
      sessionId = newSession.id
    }
    
    // Send message
    await sendMessage(message, { streaming: false })
    
    // Save message to Supabase
    if (sessionId) {
      await chatSessionService.addMessage(sessionId, {
        role: 'user',
        content: message,
        metadata: {
          agent_id: 'drummond',
          agent_name: 'Carlos Drummond de Andrade'
        }
      })
      
      // Update session title with first message if it's still "Nova conversa"
      const currentSession = sessions.find(s => s.id === sessionId)
      if (currentSession?.session_metadata?.title === 'Nova conversa') {
        await chatSessionService.updateSessionMetadata(sessionId, {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          updated_at: new Date().toISOString()
        })
        await loadSessions()
      }
    }
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

  const getSessionTitle = (session: ChatSession) => {
    return session.session_metadata?.title || 'Conversa sem título'
  }

  const getSessionDate = (session: ChatSession) => {
    return format(new Date(session.created_at), "dd 'de' MMM", { locale: ptBR })
  }

  return (
    <div className="h-screen flex flex-col relative">
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
      
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <LoadingScreen />
        
        {/* Sidebar with Sessions */}
        <div className="w-80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <ButtonV2
              onClick={createNewSession}
              className="w-full"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Nova conversa
            </ButtonV2>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Nenhuma conversa ainda
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer transition-all",
                    currentSessionId === session.id
                      ? "bg-green-100/50 dark:bg-green-900/30 border border-green-300/50 dark:border-green-700/50"
                      : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {getSessionTitle(session)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getSessionDate(session)}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSessionMenu(showSessionMenu === session.id ? null : session.id)
                        }}
                        className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showSessionMenu === session.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                              setShowSessionMenu(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Últimas 10 conversas são salvas
            </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200/20 dark:border-gray-700/20">
            <BreadcrumbsV2 items={[
              { label: 'Home', href: '/pt/home' },
              { label: 'Assistente IA', href: '/pt/chat' }
            ]} />
          </div>

          {/* Chat Container with Fixed Height */}
          <div className="flex-1 px-6 pb-6 flex flex-col max-h-full">
            <GlassCard className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <GlassCardHeader className="border-b-0 flex-shrink-0">
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
                  
                  {hasActiveAgents && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100/50 dark:bg-green-900/30 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {activeAgents.length} agentes investigando
                      </span>
                    </div>
                  )}
                </div>
              </GlassCardHeader>

              {/* Messages Area with Fixed Height */}
              <GlassCardContent className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="mb-8">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                        <Bot className="w-14 h-14 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      Olá, {user?.name?.split(' ')[0] || 'Cidadão'}! 👋
                    </h2>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                      Sou o assistente de transparência pública do Cidadão.AI. 
                      Como posso ajudar você a entender melhor os gastos públicos brasileiros hoje?
                    </p>

                    {/* Suggested Questions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
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
                      const isLatest = index === messages.length - 1 && message.role === 'assistant'
                      
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
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <Bot className="w-6 h-6 text-white" />
                              </div>
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
                                  onComplete={scrollToBottom}
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
              <div className="p-6 border-t border-gray-200/20 dark:border-gray-700/20 flex-shrink-0">
                <div className="flex gap-3">
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
                  <ButtonV2
                    onClick={handleSendMessage}
                    disabled={!canSendMessage || !inputMessage.trim()}
                    className="px-6"
                    leftIcon={<Send className="w-5 h-5" />}
                  >
                    Enviar
                  </ButtonV2>
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
      </div>
    </div>
  )
}