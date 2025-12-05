'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { createClient } from '@/lib/supabase/client'

// Maritaca AI - LLM brasileiro direto
const MARITACA_API_KEY = process.env.NEXT_PUBLIC_MARITACA_API_KEY

// All available agent teachers
const allAgents = [
  // Maritaca AI - Modo direto
  {
    id: 'maritaca',
    name: 'Maritaca AI',
    role: 'Assistente IA',
    emoji: '🦜',
    description: 'LLM brasileiro - tire duvidas sobre qualquer tema',
    isMaritaca: true,
  },
  // Agentes do sistema
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: 'Orquestrador',
    emoji: '🎭',
    description: 'Coordenacao geral do sistema multi-agente',
  },
  {
    id: 'zumbi',
    name: 'Zumbi',
    role: 'Detector de Anomalias',
    emoji: '🛡️',
    description: 'Seguranca, deteccao de fraudes e irregularidades',
  },
  {
    id: 'anita',
    name: 'Anita',
    role: 'Analista de Padroes',
    emoji: '📊',
    description: 'Analise estatistica e identificacao de padroes',
  },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    emoji: '📜',
    description: 'Geracao de relatorios e documentacao',
  },
  {
    id: 'drummond',
    name: 'Drummond',
    role: 'Comunicador',
    emoji: '✍️',
    description: 'Comunicacao clara e acessivel',
  },
  {
    id: 'machado',
    name: 'Machado',
    role: 'Escritor',
    emoji: '📚',
    description: 'Narrativas e textos elaborados',
  },
  {
    id: 'senna',
    name: 'Ayrton Senna',
    role: 'Router',
    emoji: '🏎️',
    description: 'Roteamento inteligente de requisicoes',
  },
  {
    id: 'nana',
    name: 'Nana',
    role: 'Memoria',
    emoji: '🌊',
    description: 'Gerenciamento de contexto e memoria',
  },
  {
    id: 'bonifacio',
    name: 'Jose Bonifacio',
    role: 'Jurista',
    emoji: '⚖️',
    description: 'Analise legal e normativa',
  },
  {
    id: 'dandara',
    name: 'Dandara',
    role: 'Defensora',
    emoji: '⚔️',
    description: 'Defesa de direitos e transparencia',
  },
  {
    id: 'ceuci',
    name: 'Ceuci',
    role: 'Guardia',
    emoji: '🌿',
    description: 'Protecao de dados e privacidade',
  },
  {
    id: 'lampiao',
    name: 'Lampiao',
    role: 'Investigador',
    emoji: '🔍',
    description: 'Investigacao profunda de casos',
  },
  {
    id: 'oxossi',
    name: 'Oxossi',
    role: 'Cacador',
    emoji: '🏹',
    description: 'Busca e recuperacao de informacoes',
  },
  {
    id: 'obaluaie',
    name: 'Obaluaie',
    role: 'Curador',
    emoji: '🌾',
    description: 'Validacao e qualidade de dados',
  },
  {
    id: 'niemeyer',
    name: 'Oscar Niemeyer',
    role: 'Arquiteto',
    emoji: '🏛️',
    description: 'Design de solucoes e arquitetura',
  },
  {
    id: 'quiteria',
    name: 'Maria Quiteria',
    role: 'Estrategista',
    emoji: '🎖️',
    description: 'Estrategia e planejamento',
  },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentId?: string
  timestamp: Date
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAcademyAuth()
  const supabase = createClient()

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get agent from URL params
  useEffect(() => {
    const agentParam = searchParams.get('agent')
    if (agentParam && allAgents.find((a) => a.id === agentParam)) {
      setSelectedAgent(agentParam)
    }
  }, [searchParams])

  // Auth check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start session when agent is selected
  useEffect(() => {
    if (selectedAgent && user && !sessionId) {
      startSession()
    }
  }, [selectedAgent, user])

  const startSession = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('academy_sessions')
      .insert({
        user_id: user.id,
        started_at: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single()

    if (data) {
      setSessionId(data.id)
      setSessionStartTime(new Date())
    }
  }

  const endSession = async () => {
    if (!sessionId || !user || !sessionStartTime) return

    const durationMinutes = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000)

    await supabase
      .from('academy_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        status: 'completed',
        conversations: JSON.stringify([
          { agent_name: selectedAgent, messages_count: messages.length },
        ]),
      })
      .eq('id', sessionId)

    // Update profile total time
    try {
      await supabase.rpc('increment_profile_time', {
        p_user_id: user.id,
        p_minutes: durationMinutes,
      })
    } catch {
      // Function might not exist yet
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    const currentAgentData = allAgents.find((a) => a.id === selectedAgent)
    const isMaritaca = currentAgentData?.isMaritaca

    try {
      let responseContent = ''

      if (isMaritaca) {
        // Maritaca AI - Direct LLM call
        const maritacaResponse = await fetch('https://chat.maritaca.ai/api/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Key ${MARITACA_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'sabia-3',
            messages: [
              {
                role: 'system',
                content: `Voce e um assistente educacional da Academy Cidadao.AI, um programa de estagio em parceria com IFSULDEMINAS.
Ajude os estudantes a aprender sobre desenvolvimento de software, inteligencia artificial, e o projeto Cidadao.AI.
Seja didatico, use exemplos praticos, e incentive o aprendizado.
Responda sempre em portugues brasileiro.`,
              },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMessage.content },
            ],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        })

        if (maritacaResponse.ok) {
          const data = await maritacaResponse.json()
          responseContent =
            data.choices?.[0]?.message?.content || 'Desculpe, nao consegui processar sua mensagem.'
        } else {
          responseContent =
            'Desculpe, houve um erro ao conectar com a Maritaca AI. Tente novamente.'
        }
      } else {
        // Backend agents
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'}/api/agents/${selectedAgent}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userMessage.content,
              session_id: sessionId,
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          responseContent =
            data.response || data.message || 'Desculpe, nao consegui processar sua mensagem.'
        } else {
          responseContent = `Ola! Sou ${currentAgentData?.name}. No momento estou em modo de demonstracao. Em breve poderei ajuda-lo com ${currentAgentData?.description.toLowerCase()}.`
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        agentId: selectedAgent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Award XP for conversation
      if (user && messages.length % 5 === 0) {
        await supabase.from('academy_xp_transactions').insert({
          user_id: user.id,
          amount: 5,
          balance_after: user.totalXp + 5,
          source_type: 'conversation',
          source_id: sessionId,
          description: `Conversa com ${currentAgentData?.name}`,
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        agentId: selectedAgent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectAgent = (agentId: string) => {
    if (sessionId) {
      endSession()
    }
    setSelectedAgent(agentId)
    setMessages([])
    setSessionId(null)
    router.push(`/pt/academy/chat?agent=${agentId}`)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const currentAgent = allAgents.find((a) => a.id === selectedAgent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar - Agent list */}
      <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/pt/academy"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Voltar ao dashboard
          </Link>
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Agentes Professores
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Escolha um agente para conversar
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Maritaca AI - Destacado */}
          {allAgents
            .filter((a) => a.isMaritaca)
            .map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selectedAgent === agent.id
                    ? 'bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-500'
                    : 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-500'
                }`}
              >
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium truncate ${
                        selectedAgent === agent.id
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {agent.name}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 bg-green-600 text-white rounded-full">
                      LLM
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {agent.description}
                  </p>
                </div>
              </button>
            ))}

          {/* Separator */}
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Agentes Especialistas</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Backend agents */}
          {allAgents
            .filter((a) => !a.isMaritaca)
            .map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selectedAgent === agent.id
                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      selectedAgent === agent.id
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.role}</p>
                </div>
              </button>
            ))}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {selectedAgent && currentAgent ? (
          <>
            {/* Chat header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl">
                  {currentAgent.emoji}
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-gray-100">
                    {currentAgent.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentAgent.description}
                  </p>
                </div>
                {sessionStartTime && (
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-green-700 dark:text-green-400">Sessao ativa</span>
                  </div>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{currentAgent.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Ola! Sou {currentAgent.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {currentAgent.description}. Como posso ajudar voce hoje?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{currentAgent.emoji}</span>
                        <span className="font-medium text-sm text-gray-600 dark:text-gray-400">
                          {currentAgent.name}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentAgent.emoji}</span>
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={`Converse com ${currentAgent.name}...`}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    input.trim() && !isSending
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👈</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Escolha um agente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecione um agente professor na barra lateral para comecar a conversar
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AcademyChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
