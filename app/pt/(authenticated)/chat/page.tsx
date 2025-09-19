'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { agents } from '@/data/agents'
import { useChat, useAgentStatus, useSuggestedActions } from '@/hooks/use-chat-store'
import { MarkdownMessage } from '@/components/markdown-message'
import { toast } from '@/hooks/use-toast'
import { Send, User, Bot, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Badge } from '@/components/ui'

export default function ChatPage() {
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
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LoadingScreen />
      {/* Professional Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs items={[
            { label: 'Assistente Virtual' }
          ]} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Assistente Virtual Cidadão.AI
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/pt/dashboard" 
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-4">
        {/* Investigation Status Banner */}
        {hasActiveAgents && (
          <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-ping absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full opacity-75"></div>
                <div className="relative w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
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
          </div>
        )}

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden ${hasActiveAgents ? 'mt-4' : 'mt-8'}`} style={{ minHeight: '500px' }}>
          {/* Agent Header - Featuring Drummond */}
          <div className="px-6 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={`/agents/${drummondAgent?.image || 'drummond.png'}`} 
                    alt="Carlos Drummond de Andrade"
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Carlos Drummond de Andrade</h3>
                  <p className="text-sm text-green-50">
                    Assistente Conversacional • Poeta Digital do Cidadão.AI
                  </p>
                </div>
              </div>
              <Badge variant="success" className="bg-white/20 hover:bg-white/30">
                <CheckCircle className="w-4 h-4 mr-1" />
                Online
              </Badge>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
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
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.action)}
                        className="group px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-green-500 hover:shadow-md transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                          {action.label}
                        </span>
                        <AlertCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                      </button>
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
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
                        className={`rounded-2xl px-5 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
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

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={!canSendMessage}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !canSendMessage}
                size="icon"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5" />
              </Button>
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
        </div>
      </div>
    </div>
  )
}