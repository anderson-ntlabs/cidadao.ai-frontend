'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  Bot,
  Zap,
  GraduationCap,
  Search,
} from 'lucide-react'

/**
 * Academy Chat Page
 *
 * Multi-agent chat interface with:
 * - Maritaca AI (direct LLM)
 * - 16 specialized agents
 * - Session tracking
 * - XP rewards
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */

const MARITACA_API_KEY = process.env.NEXT_PUBLIC_MARITACA_API_KEY

const allAgents = [
  {
    id: 'maritaca',
    name: 'Maritaca AI',
    role: 'Assistente IA',
    emoji: '🦜',
    description: 'LLM brasileiro - tire duvidas sobre qualquer tema',
    isMaritaca: true,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: 'Orquestrador',
    emoji: '🎭',
    description: 'Coordenacao geral do sistema multi-agente',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'zumbi',
    name: 'Zumbi',
    role: 'Detector de Anomalias',
    emoji: '🛡️',
    description: 'Seguranca, deteccao de fraudes e irregularidades',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'anita',
    name: 'Anita',
    role: 'Analista de Padroes',
    emoji: '📊',
    description: 'Analise estatistica e identificacao de padroes',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    emoji: '📜',
    description: 'Geracao de relatorios e documentacao',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'drummond',
    name: 'Drummond',
    role: 'Comunicador',
    emoji: '✍️',
    description: 'Comunicacao clara e acessivel',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'machado',
    name: 'Machado',
    role: 'Escritor',
    emoji: '📚',
    description: 'Narrativas e textos elaborados',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'senna',
    name: 'Ayrton Senna',
    role: 'Router',
    emoji: '🏎️',
    description: 'Roteamento inteligente de requisicoes',
    color: 'from-green-500 to-lime-500',
  },
  {
    id: 'nana',
    name: 'Nana',
    role: 'Memoria',
    emoji: '🌊',
    description: 'Gerenciamento de contexto e memoria',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    id: 'bonifacio',
    name: 'Jose Bonifacio',
    role: 'Jurista',
    emoji: '⚖️',
    description: 'Analise legal e normativa',
    color: 'from-gray-500 to-slate-500',
  },
  {
    id: 'dandara',
    name: 'Dandara',
    role: 'Defensora',
    emoji: '⚔️',
    description: 'Defesa de direitos e transparencia',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'ceuci',
    name: 'Ceuci',
    role: 'Guardia',
    emoji: '🌿',
    description: 'Protecao de dados e privacidade',
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'lampiao',
    name: 'Lampiao',
    role: 'Investigador',
    emoji: '🔍',
    description: 'Investigacao profunda de casos',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'oxossi',
    name: 'Oxossi',
    role: 'Cacador',
    emoji: '🏹',
    description: 'Busca e recuperacao de informacoes',
    color: 'from-lime-500 to-green-500',
  },
  {
    id: 'obaluaie',
    name: 'Obaluaie',
    role: 'Curador',
    emoji: '🌾',
    description: 'Validacao e qualidade de dados',
    color: 'from-amber-400 to-yellow-400',
  },
  {
    id: 'niemeyer',
    name: 'Oscar Niemeyer',
    role: 'Arquiteto',
    emoji: '🏛️',
    description: 'Design de solucoes e arquitetura',
    color: 'from-slate-500 to-gray-500',
  },
  {
    id: 'quiteria',
    name: 'Maria Quiteria',
    role: 'Estrategista',
    emoji: '🎖️',
    description: 'Estrategia e planejamento',
    color: 'from-violet-500 to-purple-500',
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
  const { user, isLoading, addXp, startSession, endSession, currentSession } = useAcademyDemo()

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const agentParam = searchParams.get('agent')
    if (agentParam && allAgents.find((a) => a.id === agentParam)) {
      setSelectedAgent(agentParam)
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedAgent && !currentSession) {
      startSession()
    }
  }, [selectedAgent, currentSession, startSession])

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
    setMessageCount((prev) => prev + 1)

    const currentAgentData = allAgents.find((a) => a.id === selectedAgent)
    const isMaritaca = currentAgentData?.isMaritaca

    try {
      let responseContent = ''

      if (isMaritaca && MARITACA_API_KEY) {
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
      } else if (isMaritaca && !MARITACA_API_KEY) {
        responseContent = `Ola! Sou a Maritaca AI em modo demo.

Para habilitar respostas reais, configure a variavel NEXT_PUBLIC_MARITACA_API_KEY.

Enquanto isso, posso simular uma resposta educacional sobre o que voce perguntou: "${userMessage.content}"

A Academy Cidadao.AI e um programa de estagio em parceria com IFSULDEMINAS, focado em desenvolvimento de software e inteligencia artificial.`
      } else {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'}/api/agents/${selectedAgent}/chat`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: userMessage.content }),
            }
          )

          if (response.ok) {
            const data = await response.json()
            responseContent =
              data.response || data.message || 'Desculpe, nao consegui processar sua mensagem.'
          } else {
            throw new Error('Backend not available')
          }
        } catch {
          responseContent = `Ola! Sou ${currentAgentData?.name}, ${currentAgentData?.role} do Cidadao.AI.

No momento estou em modo demonstracao. Minha especialidade e: ${currentAgentData?.description}.

Quando o sistema completo estiver disponivel, poderei ajuda-lo com tarefas reais relacionadas a ${currentAgentData?.description.toLowerCase()}.

Continue explorando a Academy para aprender mais sobre o projeto!`
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

      if ((messageCount + 1) % 5 === 0) {
        addXp(5, 'conversation', `Conversa com ${currentAgentData?.name}`)
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
    if (currentSession) {
      endSession(messageCount, [selectedAgent || ''])
    }
    setSelectedAgent(agentId)
    setMessages([])
    setMessageCount(0)
    router.push(`/pt/academy/chat?agent=${agentId}`)
  }

  const filteredAgents = allAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando chat...</p>
        </div>
      </div>
    )
  }

  const currentAgent = allAgents.find((a) => a.id === selectedAgent)

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <Link
            href="/pt/academy"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Chat</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {allAgents.length} agentes disponiveis
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar agente..."
              className="pl-9"
              inputSize="sm"
            />
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Maritaca AI - Featured */}
          {filteredAgents
            .filter((a) => a.isMaritaca)
            .map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                  'border-2 hover:shadow-md',
                  selectedAgent === agent.id
                    ? 'border-green-500 shadow-lg shadow-green-500/10'
                    : 'border-green-200/50 dark:border-green-700/30 hover:border-green-400'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-md',
                    agent.color
                  )}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                      {agent.name}
                    </p>
                    <Badge variant="success" size="sm">
                      <Zap className="w-3 h-3 mr-0.5" />
                      LLM
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {agent.description}
                  </p>
                </div>
              </button>
            ))}

          {/* Separator */}
          <div className="flex items-center gap-2 py-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 px-2">
              Agentes Especialistas
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Backend agents */}
          {filteredAgents
            .filter((a) => !a.isMaritaca)
            .map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  'hover:shadow-md group',
                  selectedAgent === agent.id
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50/50 dark:bg-gray-800/50 border-2 border-transparent hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br shadow-sm',
                    'group-hover:scale-105 transition-transform',
                    agent.color
                  )}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium truncate',
                      selectedAgent === agent.id
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.role}</p>
                </div>
              </button>
            ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {selectedAgent && currentAgent ? (
          <>
            {/* Chat Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg',
                    currentAgent.color
                  )}
                >
                  {currentAgent.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                      {currentAgent.name}
                    </h1>
                    {currentAgent.isMaritaca && (
                      <Badge variant="success" size="sm">
                        <Zap className="w-3 h-3 mr-0.5" />
                        LLM
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentAgent.description}
                  </p>
                </div>
                {currentSession && (
                  <Badge variant="success" className="animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Sessao ativa
                  </Badge>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div
                      className={cn(
                        'w-24 h-24 rounded-3xl flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl mx-auto mb-6',
                        currentAgent.color
                      )}
                    >
                      {currentAgent.emoji}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Ola! Sou {currentAgent.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {currentAgent.description}. Como posso ajudar voce hoje?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        'O que voce pode fazer?',
                        'Me explique sobre o projeto',
                        'Quero aprender algo novo',
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 animate-fade-in',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br flex-shrink-0',
                          currentAgent.color
                        )}
                      >
                        {currentAgent.emoji}
                      </div>
                    )}
                    <Card
                      variant={message.role === 'user' ? 'elevated' : 'outlined'}
                      padding="md"
                      className={cn(
                        'max-w-[70%]',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0'
                          : ''
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </Card>
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={user.avatar}
                          alt="You"
                          width={40}
                          height={40}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br',
                        currentAgent.color
                      )}
                    >
                      {currentAgent.emoji}
                    </div>
                    <Card variant="outlined" padding="md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">Pensando...</span>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 p-4">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={`Converse com ${currentAgent.name}...`}
                  inputSize="lg"
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  size="lg"
                  className="px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                <Sparkles className="w-3 h-3 inline mr-1" />
                +5 XP a cada 5 mensagens
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Escolha um agente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Selecione um agente professor na barra lateral para comecar a conversar
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <GraduationCap className="w-4 h-4" />
                <span>Dica: Comece pela Maritaca AI para duvidas gerais</span>
              </div>
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Carregando chat...</p>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
