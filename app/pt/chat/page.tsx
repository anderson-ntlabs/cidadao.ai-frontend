'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { agents } from '@/data/agents'
import { useChat } from '@/hooks/use-chat'
import { MarkdownMessage } from '@/components/markdown-message'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agent?: string
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeAgents, setActiveAgents] = useState<string[]>([])
  const [isInvestigating, setIsInvestigating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, getSuggestions } = useChat()

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
    setIsLoading(false)
    
    // Mensagem inicial
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou o **Abaporu**, o orquestrador central do Cidadão.AI. 🌿\n\nEstou aqui para ajudá-lo a navegar pelos dados de transparência pública. Posso responder suas perguntas e, quando necessário, coordenar nossos agentes especializados para investigações aprofundadas.\n\nComo posso ajudar você hoje?',
        timestamp: new Date(),
        agent: 'abaporu'
      }
    ])
    
    // Buscar sugestões
    loadSuggestions()
  }, [router])
  
  const loadSuggestions = async () => {
    try {
      const suggs = await getSuggestions('abaporu')
      setSuggestions(suggs.suggestions || [])
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsSending(true)

    try {
      const data = await sendMessage({
        message: inputMessage,
        agent_id: 'abaporu',
        session_id: user?.id || 'demo-session',
        activeAgents: activeAgents
      })
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
        agent: 'abaporu'
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Mostrar toast se foi uma investigação com anomalia
      if (data.confidence && data.confidence > 0.8) {
        toast.warning('Anomalia Detectada!', 'Nossos agentes encontraram possíveis irregularidades')
      }
      
      // Atualizar agentes ativos se houver
      if (data.activeAgents && data.activeAgents.length > 0) {
        setActiveAgents(data.activeAgents)
        setIsInvestigating(true)
      } else {
        setActiveAgents([])
        setIsInvestigating(false)
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
        agent: 'abaporu'
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      // Limpar agentes ativos em caso de erro
      setActiveAgents([])
      setIsInvestigating(false)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
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
        {activeAgents.length > 0 && (
          <div className="bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm border-b border-green-200/50 dark:border-green-700/50 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Investigação em andamento:
              </span>
              <div className="flex gap-2">
                {activeAgents.map(agentId => {
                  const agent = agents.find(a => a.id === agentId)
                  return agent ? (
                    <div key={agentId} className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                      <img 
                        src={`/agents/${agent.image}`} 
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
              {isInvestigating && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Coordenando investigação...
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={`/agents/${agents.find(a => a.id === message.agent)?.image || 'abaporu.png'}`} 
                        alt="Agent"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {agents.find(a => a.id === message.agent)?.name || 'Abaporu'}
                      </span>
                    </div>
                  )}
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">💭</div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Abaporu está analisando...
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
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? '⏳' : '📤'} Enviar
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </div>
            
            {/* Sugestões */}
            {suggestions.length > 0 && messages.length === 1 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sugestões de perguntas:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}