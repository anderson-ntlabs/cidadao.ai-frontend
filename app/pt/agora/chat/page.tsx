'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useAgora } from '@/hooks/use-agora'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowLeft, Send, Sparkles, MessageSquare, Settings } from 'lucide-react'
import { trackMentorChat, trackStudySession } from '@/lib/analytics/agora-tracker'

// Lazy load voice components (same as main app)
const VoiceRecorder = dynamic(
  () => import('@/components/voice').then((mod) => ({ default: mod.VoiceRecorder })),
  {
    loading: () => null,
    ssr: false,
  }
)

const VoiceInputButton = dynamic(
  () => import('@/components/voice').then((mod) => ({ default: mod.VoiceInputButton })),
  {
    loading: () => null,
    ssr: false,
  }
)

/**
 * Academy Chat Page - Simplified
 *
 * Two-mode chat interface:
 * - Santos Dumont: Academy mentor for project questions
 * - Maritaca Direct: LLM for general questions
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

type ChatMode = 'mentor' | 'lina' | 'maritaca'

const chatModes = {
  mentor: {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    role: 'Mentor de Engenharia',
    emoji: '✈️',
    avatar: '/agents/santos-dumont.png',
    description: 'Inovacao, engenharia criativa e arquitetura do Cidadao.AI',
    color: 'from-green-500 to-emerald-600',
    systemPrompt: `Voce e Santos-Dumont, mentor da Academy Cidadao.AI.
Voce e apaixonado por inovacao, engenharia criativa e educacao.
IMPORTANTE: Seu nome e Santos-Dumont, NAO Alberto. Nunca se apresente como Alberto.
Ajude os estudantes com duvidas sobre:
- O projeto Cidadao.AI e sua arquitetura
- Boas praticas de desenvolvimento
- Carreira em tecnologia
- Motivacao e persistencia

Seja didatico, incentivador e use analogias com aviacao quando apropriado.
Responda sempre em portugues brasileiro.`,
  },
  lina: {
    id: 'bobardi',
    name: 'Lina Bo Bardi',
    role: 'Mentora de UI/UX',
    emoji: '🏛️',
    avatar: '/agents/Lina_Bo_Bardi.jpg',
    description: 'Design funcional, acessibilidade e interfaces elegantes',
    color: 'from-amber-500 to-orange-600',
    systemPrompt: `Voce e Lina Bo Bardi, arquiteta modernista e mentora de UI/UX da Academy Cidadao.AI.
Voce criou o MASP e e apaixonada por design funcional e acessivel.
Ajude os estudantes com duvidas sobre:
- Design de interfaces e experiencia do usuario
- Acessibilidade e design inclusivo
- Principios de design: simplicidade, funcionalidade e beleza
- CSS, Tailwind, componentes React
- Boas praticas de frontend

Use analogias com arquitetura quando apropriado. Valorize a funcao sobre a forma excessiva.
Responda sempre em portugues brasileiro com carinho e sabedoria.`,
  },
  maritaca: {
    id: 'maritaca',
    name: 'Maritaca AI',
    role: 'Assistente IA',
    emoji: '🦜',
    avatar: '/sabiazinho.png',
    description: 'LLM brasileiro - duvidas gerais de programacao',
    color: 'from-blue-500 to-cyan-500',
    systemPrompt: `Você é um assistente educacional da Academy Cidadão.AI, uma plataforma aberta de aprendizado.
Ajude os estudantes a aprender sobre desenvolvimento de software, inteligência artificial, e tecnologia em geral.
Seja didático, use exemplos práticos, e incentive o aprendizado.
Responda sempre em português brasileiro.`,
  },
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, addXp, startSession, endSession, currentSession, mode, isRealAuth } =
    useAgora()

  const [chatMode, setChatMode] = useState<ChatMode>('mentor')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const agentParam = searchParams.get('agent')
    if (agentParam === 'santos-dumont') {
      setChatMode('mentor')
    } else if (agentParam === 'bobardi' || agentParam === 'lina') {
      setChatMode('lina')
    } else if (agentParam === 'maritaca') {
      setChatMode('maritaca')
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!currentSession) {
      startSession()
    }
  }, [currentSession, startSession])

  const handleModeChange = (mode: ChatMode) => {
    if (currentSession && messageCount > 0) {
      endSession(messageCount, [chatModes[chatMode].id])

      // Track study session completion in PostHog
      const sessionDuration = Math.floor(
        (Date.now() - new Date(currentSession.startedAt).getTime()) / 60000
      )
      trackStudySession({
        duration: sessionDuration,
        activities: ['chat', chatModes[chatMode].id],
        xpEarned: Math.floor(messageCount / 5) * 5,
      })
    }
    setChatMode(mode)
    setMessages([])
    setMessageCount(0)
    router.push(`/pt/agora/chat?agent=${chatModes[mode].id}`)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return

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

    const currentMode = chatModes[chatMode]

    try {
      let responseContent = ''

      // All modes use streaming endpoint with appropriate agent
      // - mentor: santos_dumont (engineering mentor)
      // - lina: bobardi (UI/UX mentor)
      // - maritaca: abaporu (general purpose agent)
      const backendAgentId =
        chatMode === 'lina' ? 'bobardi' : chatMode === 'maritaca' ? 'abaporu' : 'santos_dumont'

      try {
        setIsStreaming(true)
        setStreamingContent('')

        const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            agent_id: backendAgentId,
          }),
        })

        if (!response.ok) {
          throw new Error('Backend not available')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'chunk' && data.content) {
                    // Add space between chunks if needed
                    const needsSpace =
                      accumulatedContent.length > 0 &&
                      !accumulatedContent.endsWith(' ') &&
                      !accumulatedContent.endsWith('\n') &&
                      !data.content.startsWith(' ') &&
                      !data.content.startsWith('\n')
                    accumulatedContent += (needsSpace ? ' ' : '') + data.content
                    setStreamingContent(accumulatedContent)
                  } else if (data.type === 'complete') {
                    break
                  } else if (data.type === 'error') {
                    throw new Error(data.message || 'Erro no streaming')
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        }

        responseContent = accumulatedContent || 'Desculpe, nao consegui processar sua mensagem.'
        setIsStreaming(false)
        setStreamingContent('')
      } catch {
        setIsStreaming(false)
        setStreamingContent('')

        // Offline fallback with generic helpful response
        responseContent = `Ola! Sou ${currentMode.name}, seu mentor na Academy! ${currentMode.emoji}

Parece que estou com dificuldade de conexao no momento.

Enquanto isso, aqui vao algumas dicas gerais:
• A Academy Cidadao.AI e um programa focado em desenvolvimento de software e IA
• Explore as trilhas de aprendizado disponiveis
• Use o diario de bordo para registrar seu progresso
• Cada conversa e sessao de estudo gera XP!

Tente novamente em alguns instantes. Continue aprendendo! 🚀`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Award XP every 5 messages
      if ((messageCount + 1) % 5 === 0) {
        addXp(5, 'conversation', `Conversa com ${currentMode.name}`)
      }

      // Track chat interaction in PostHog
      trackMentorChat(currentMode.id, messageCount + 1)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

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

  const currentMode = chatModes[chatMode]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/pt/agora"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              {currentSession && (
                <Badge variant="success" className="animate-pulse">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Sessao ativa
                </Badge>
              )}
              <Link
                href="/pt/agora/configuracoes"
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Configuracoes"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-3 gap-3">
            {/* Santos-Dumont */}
            <button
              onClick={() => handleModeChange('mentor')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
                'border-2',
                chatMode === 'mentor'
                  ? 'border-green-500 ring-2 ring-green-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-400'
              )}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={chatModes.mentor.avatar}
                  alt={chatModes.mentor.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Santos-Dumont</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Engenharia</p>
              </div>
              {chatMode === 'mentor' && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Lina Bo Bardi */}
            <button
              onClick={() => handleModeChange('lina')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
                'border-2',
                chatMode === 'lina'
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-amber-400'
              )}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={chatModes.lina.avatar}
                  alt={chatModes.lina.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Lina Bo Bardi</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">UI/UX</p>
              </div>
              {chatMode === 'lina' && (
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Maritaca AI */}
            <button
              onClick={() => handleModeChange('maritaca')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
                'border-2',
                chatMode === 'maritaca'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
              )}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <span className="text-2xl">🦜</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Maritaca AI</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">LLM Geral</p>
              </div>
              {chatMode === 'maritaca' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl mx-auto mb-6 ring-4 ring-white dark:ring-gray-800">
                  <Image
                    src={currentMode.avatar}
                    alt={currentMode.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {currentMode.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {currentMode.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(chatMode === 'lina'
                    ? [
                        'Como melhorar a acessibilidade?',
                        'Principios de design funcional',
                        'Dicas de UI para mobile',
                      ]
                    : chatMode === 'mentor'
                      ? [
                          'O que e o Cidadao.AI?',
                          'Como funciona o sistema de agentes?',
                          'Dicas para o estagio',
                        ]
                      : ['Me explique sobre React', 'O que e TypeScript?', 'Como funciona uma API?']
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  {message.role === 'user' ? (
                    /* User message - right aligned, subtle */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] flex items-start gap-3">
                        <div className="py-2 px-4 rounded-2xl bg-green-600 text-white">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant message - full width, clean */
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                        <Image
                          src={currentMode.avatar}
                          alt={currentMode.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {currentMode.name}
                        </p>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap m-0">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response with typing animation */}
              {isStreaming && streamingContent && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                    <Image
                      src={currentMode.avatar}
                      alt={currentMode.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {currentMode.name}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap m-0">
                        {streamingContent}
                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-green-500 animate-pulse align-middle" />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isSending && !streamingContent && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                    <Image
                      src={currentMode.avatar}
                      alt={currentMode.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {currentMode.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input with Voice Features (same as main app) */}
      <footer className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 p-4">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-end">
          {/* Voice Recorder (Audio Recording) */}
          <VoiceRecorder
            onTranscript={(transcript) => {
              setInput(transcript)
            }}
            disabled={isSending}
            size="md"
            variant="default"
          />

          {/* Voice Input (Speech-to-Text) */}
          <VoiceInputButton
            onTranscript={(transcript) => {
              setInput((prev) => prev + ' ' + transcript)
            }}
            disabled={isSending}
            size="md"
            variant="secondary"
            lang="pt-BR"
            showTooltip={true}
            tooltipContent="Clique e fale (Speech-to-Text)"
          />

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={`Converse com ${currentMode.name.split(' ')[0]}...`}
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
      </footer>
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
