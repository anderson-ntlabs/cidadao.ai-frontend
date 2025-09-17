'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { agents } from '@/data/agents'
import { useChat, useAgentStatus, useSuggestedActions } from '@/hooks/use-chat-store'
import { MarkdownMessage } from '@/components/markdown-message'
import { toast } from '@/hooks/use-toast'
import { formatAgentName } from '@/lib/api/chat.service'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Use the new chat store hooks
  const {
    messages,
    session,
    isLoading,
    error,
    connectionStatus,
    connectionStatusText,
    agentTyping,
    currentInvestigation,
    canSendMessage,
    sendMessage,
    handleQuickAction,
    setTyping,
    clearError,
    clearChat,
  } = useChat()
  
  const { activeAgents, hasActiveAgents, activeAgentNames } = useAgentStatus()
  const { suggestedActions } = useSuggestedActions()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const isAuth = localStorage.getItem('isAuthenticated')
    
    if (!storedUser || isAuth !== 'true') {
      router.push('/pt/login')
      return
    }
    
    setUser(JSON.parse(storedUser))
    setIsAuthLoading(false)
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error('Erro', error)
      clearError()
    }
  }, [error, clearError])

  // Show investigation toast
  useEffect(() => {
    if (currentInvestigation && currentInvestigation.confidence_score > 0.8) {
      toast.warning('Anomalia Detectada!', 'Nossos agentes encontraram possíveis irregularidades')
    }
  }, [currentInvestigation])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage) return

    const message = inputMessage
    setInputMessage('')
    
    // Use streaming for better UX
    await sendMessage(message, { streaming: true })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <LoadingScreen />
      {/* Sub-header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs items={[
            { label: 'Chat com IAs' }
          ]} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Chat com IAs</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/pt/dashboard" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                📊 Dashboard
              </Link>
              
              <div className="flex items-center gap-3">
                {user && (
                  <>
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto w-full">
        {/* Active Agents Indicator */}
        {hasActiveAgents && (
          <div className="bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm border-b border-green-200/50 dark:border-green-700/50 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Investigação em andamento:
              </span>
              <div className="flex gap-2">
                {activeAgents.filter(agent => agent.status === 'busy').map(agent => {
                  const agentData = agents.find(a => a.id === agent.id)
                  return agentData ? (
                    <div key={agent.id} className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                      <img 
                        src={`/agents/${agentData.image}`} 
                        alt={agent.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs font-medium">{agent.name}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          {/* Agent Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/agents/abaporu.png" 
                  alt="Abaporu"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">Abaporu</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Orquestrador Central do Cidadão.AI
                  </p>
                </div>
              </div>
              {currentInvestigation && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Coordenando investigação...
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg px-6 py-4 max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-2">Olá! Sou o Abaporu 🌿</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sou o orquestrador central do Cidadão.AI. Estou aqui para ajudá-lo a navegar pelos dados de transparência pública. 
                    Posso responder suas perguntas e, quando necessário, coordenar nossos agentes especializados para investigações aprofundadas.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Como posso ajudar você hoje?
                  </p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-green-600/90 text-white backdrop-blur-sm'
                      : 'bg-gray-100/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm'
                  }`}
                >
                  {message.role === 'assistant' && message.agent_name && (
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={`/agents/${agents.find(a => a.name === message.agent_name)?.image || 'abaporu.png'}`} 
                        alt={message.agent_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {message.agent_name}
                      </span>
                    </div>
                  )}
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {(isLoading || agentTyping) && (
              <div className="flex justify-start">
                <div className="bg-gray-100/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">💭</div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {agentTyping ? 'Agente está digitando...' : 'Processando...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre transparência pública..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm dark:text-white"
                rows={2}
                disabled={!canSendMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !canSendMessage}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '⏳' : '📤'} Enviar
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </div>
            
            {/* Sugestões */}
            {suggestedActions.length > 0 && messages.length === 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sugestões de perguntas:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.slice(0, 4).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.action)}
                      className="px-3 py-1 text-sm bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors flex items-center gap-1"
                    >
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Connection Status */}
            <div className="mt-3 text-center">
              <span className={`text-xs ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'connecting' ? 'text-yellow-600' : 
                'text-gray-500'
              }`}>
                {connectionStatus === 'connected' && '🟢'} 
                {connectionStatus === 'connecting' && '🟡'} 
                {connectionStatus === 'disconnected' && '🔴'} 
                {connectionStatusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}