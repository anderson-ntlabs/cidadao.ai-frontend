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
  const [selectedAgent, setSelectedAgent] = useState('abaporu')
  const [isSending, setIsSending] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
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
        content: 'Olá! Sou o **Abaporu**, o agente coordenador do Cidadão.AI. 🌿\n\nPosso ajudá-lo a investigar dados públicos e conectar você com nossos agentes especializados. Como posso ajudar hoje?',
        timestamp: new Date(),
        agent: 'abaporu'
      }
    ])
    
    // Buscar sugestões
    loadSuggestions('abaporu')
  }, [router])
  
  const loadSuggestions = async (agentId: string) => {
    try {
      const suggs = await getSuggestions(agentId)
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
        agent_id: selectedAgent,
        session_id: user?.id || 'demo-session'
      })
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
        agent: selectedAgent
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Mostrar toast se foi uma investigação do Zumbi
      if (selectedAgent === 'zumbi' && data.confidence && data.confidence > 0.8) {
        toast.warning('Anomalia Detectada!', 'O Zumbi encontrou possíveis irregularidades')
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
        agent: selectedAgent
      }
      
      setMessages(prev => [...prev, errorMessage])
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

  const getCurrentAgent = () => {
    return agents.find(a => a.id === selectedAgent) || agents[0]
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
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Agentes */}
        <div className="w-80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Agentes Disponíveis</h2>
            <div className="space-y-2">
              {agents.slice(0, 8).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent.id)
                    loadSuggestions(agent.id)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedAgent === agent.id
                      ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={`/agents/${agent.image}`} 
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {agent.id === 'zumbi' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" 
                          title="Conectado ao Backend" 
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agent.role.pt}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Dica: Cada agente tem especialidades diferentes. Experimente conversar com vários!
              </p>
              {selectedAgent === 'zumbi' && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  ✅ Zumbi está conectado ao backend e pode fazer investigações reais!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          {/* Agent Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <img 
                src={`/agents/${getCurrentAgent().image}`} 
                alt={getCurrentAgent().name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">{getCurrentAgent().name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getCurrentAgent().role.pt}
                </p>
              </div>
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
                        src={`/agents/${message.agent === 'abaporu' ? 'abaporu.png' : getCurrentAgent().image}`} 
                        alt="Agent"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {message.agent === 'abaporu' ? 'Abaporu' : getCurrentAgent().name}
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
                      {getCurrentAgent().name} está analisando...
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