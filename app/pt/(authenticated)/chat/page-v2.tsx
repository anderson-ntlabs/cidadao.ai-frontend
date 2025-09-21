'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { BreadcrumbsV2 } from '@/components/breadcrumbs-v2'
import { agents } from '@/data/agents'
import { useChat, useAgentStatus, useSuggestedActions } from '@/hooks/use-chat-store'
import { MarkdownMessage } from '@/components/markdown-message'
import { toast } from '@/hooks/use-toast'
import { Send, User, Bot, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { ButtonV2 } from '@/components/ui/button-v2'
import { CardV2, CardV2Content, CardV2Badge } from '@/components/ui/card-v2'

export default function ChatPageV2() {
  const [user, setUser] = useState<any>(null)
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
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

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


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage) return

    const message = inputMessage
    setInputMessage('')
    
    // Adjust textarea height
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

  // Get Drummond agent data
  const drummondAgent = agents.find(a => a.id === 'drummond')

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <LoadingScreen />
      
      {/* Background Image - Operários */}
      <div 
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
      {/* Clean Header with Brand Colors */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BreadcrumbsV2 items={[
            { label: 'Home', href: '/pt/home' },
            { label: 'Assistente Virtual', href: '/pt/chat' }
          ]} />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Assistente Virtual Cidadão.AI
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/pt/dashboard">
                <ButtonV2 
                  variant="secondary"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Dashboard
                </ButtonV2>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container - Fixed Height */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4 overflow-hidden">
        {/* Investigation Status Banner */}
        {hasActiveAgents && (
          <CardV2 variant="filled" className="mt-4 bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
            <CardV2Content className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="animate-pulse absolute inset-0 w-3 h-3 bg-green-400 rounded-full opacity-75"></div>
                  <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Investigação em andamento
                </span>
                <div className="flex gap-2 ml-auto">
                  {activeAgents.filter(agent => agent.status === 'busy').map(agent => {
                    const agentData = agents.find(a => a.id === agent.id)
                    return agentData ? (
                      <div key={agent.id} className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 px-3 py-1.5 rounded-full shadow-sm">
                        <img 
                          src={`/agents/${agentData.image}`} 
                          alt={agent.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{agent.name}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </CardV2Content>
          </CardV2>
        )}

        {/* Main Chat Area */}
        <CardV2 
          variant="elevated" 
          className={`flex-1 flex flex-col overflow-hidden bg-white/90 dark:bg-gray-900/90 ${hasActiveAgents ? 'mt-4' : 'mt-8'}`}
        >
          {/* Agent Header - Clean Design */}
          <div className="px-6 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={`/agents/${drummondAgent?.image || 'drummond.png'}`} 
                    alt="Carlos Drummond de Andrade"
                    className="w-14 h-14 rounded-full object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Carlos Drummond de Andrade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Assistente Conversacional • Poeta Digital do Cidadão.AI
                  </p>
                </div>
              </div>
              <CardV2Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Online
              </CardV2Badge>
            </div>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="mb-6">
                    <img 
                      src={`/agents/${drummondAgent?.image || 'drummond.png'}`} 
                      alt="Carlos Drummond de Andrade"
                      className="w-24 h-24 rounded-full mx-auto shadow-lg"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Olá! Sou Carlos Drummond de Andrade 🎭
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                    Poeta mineiro e seu assistente digital no Cidadão.AI. Como disse uma vez, 
                    <em className="italic">"No meio do caminho tinha uma pedra"</em>, mas aqui 
                    transformamos pedras em pontes para a transparência pública.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Posso conversar, esclarecer dúvidas e, quando necessário, acionar nossos 
                    agentes especializados para investigações profundas. Como posso ajudá-lo hoje?
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {suggestedActions.slice(0, 3).map((action) => (
                      <ButtonV2
                        key={action.id}
                        variant="secondary"
                        onClick={() => handleQuickAction(action.action)}
                        rightIcon={<AlertCircle className="w-4 h-4" />}
                        className="rounded-full"
                      >
                        {action.label}
                      </ButtonV2>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Messages */}
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <img 
                          src={`/agents/${message.agent_name === 'Carlos Drummond de Andrade' ? drummondAgent?.image : agents.find(a => a.name === message.agent_name)?.image || 'drummond.png'}`} 
                          alt={message.agent_name || 'Assistant'}
                          className="w-10 h-10 rounded-full shadow-md"
                        />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : ''}`}>
                      {message.role === 'assistant' && message.agent_name && (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-1">
                          {message.agent_name}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-5 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow'
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-md'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <MarkdownMessage content={message.content || ''} />
                        ) : (
                          <p className="leading-relaxed">{message.content || ''}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {(isLoading || agentTyping) && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <img 
                      src={`/agents/${drummondAgent?.image || 'drummond.png'}`}
                      alt="Carlos Drummond"
                      className="w-10 h-10 rounded-full shadow-md"
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {agentTyping ? 'Drummond está escrevendo...' : 'Processando...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreva sua mensagem..."
                  className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-400 transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={!canSendMessage}
                />
              </div>
              <ButtonV2
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !canSendMessage}
                variant="primary"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </ButtonV2>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Enter para enviar • Shift+Enter para nova linha</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`}></div>
                <span>{connectionStatusText}</span>
              </div>
            </div>
          </div>
        </CardV2>
      </div>
      </div> {/* Close relative z-10 wrapper */}
    </div>
  )
}