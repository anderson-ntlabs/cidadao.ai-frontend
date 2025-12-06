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
import { ArrowLeft, Send, Sparkles, MessageSquare, Zap, Plane } from 'lucide-react'

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

const MARITACA_API_KEY = process.env.NEXT_PUBLIC_MARITACA_API_KEY
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

type ChatMode = 'mentor' | 'maritaca'

const chatModes = {
  mentor: {
    id: 'santos-dumont',
    name: 'Alberto Santos-Dumont',
    role: 'Mentor da Academy',
    emoji: '✈️',
    avatar: '/agents/santos-dumont.png',
    description: 'Tire dúvidas sobre o projeto Cidadão.AI e receba orientação para seu aprendizado',
    color: 'from-green-500 to-emerald-600',
    systemPrompt: `Você é Alberto Santos-Dumont, mentor da Academy Cidadão.AI.
Você é apaixonado por inovação, engenharia criativa e educação.
Ajude os estudantes com dúvidas sobre:
- O projeto Cidadão.AI e sua arquitetura
- Boas práticas de desenvolvimento
- Carreira em tecnologia
- Motivação e persistência

Seja didático, incentivador e use analogias com aviação quando apropriado.
Responda sempre em português brasileiro.`,
  },
  maritaca: {
    id: 'maritaca',
    name: 'Maritaca AI',
    role: 'Assistente IA',
    emoji: '🦜',
    avatar: '/sabiazinho.png',
    description: 'LLM brasileiro - tire dúvidas sobre qualquer tema de programação',
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
  const { user, isLoading, addXp, startSession, endSession, currentSession } = useAcademyDemo()

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
    }
    setChatMode(mode)
    setMessages([])
    setMessageCount(0)
    router.push(`/pt/academy/chat?agent=${chatModes[mode].id}`)
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

      if (chatMode === 'maritaca') {
        // Direct Maritaca API call
        if (MARITACA_API_KEY) {
          const maritacaResponse = await fetch('https://chat.maritaca.ai/api/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Key ${MARITACA_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'sabia-3',
              messages: [
                { role: 'system', content: currentMode.systemPrompt },
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
              data.choices?.[0]?.message?.content ||
              'Desculpe, não consegui processar sua mensagem.'
          } else {
            responseContent =
              'Desculpe, houve um erro ao conectar com a Maritaca AI. Tente novamente.'
          }
        } else {
          // Demo mode
          responseContent = `Ola! Sou a Maritaca AI em modo demo.

Para habilitar respostas reais, configure a variavel NEXT_PUBLIC_MARITACA_API_KEY.

Enquanto isso, aqui vai uma dica sobre "${userMessage.content}":

A Academy Cidadao.AI e um programa de estagio focado em desenvolvimento de software e inteligencia artificial. Continue praticando e explorando!`
        }
      } else {
        // Santos Dumont - Backend agent with SSE streaming
        try {
          setIsStreaming(true)
          setStreamingContent('')

          const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage.content,
              agent_id: 'santos_dumont',
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
                      // Add space between chunks if needed (backend sends chunks without trailing spaces)
                      const needsSpace =
                        accumulatedContent.length > 0 &&
                        !accumulatedContent.endsWith(' ') &&
                        !accumulatedContent.endsWith('\n') &&
                        !data.content.startsWith(' ') &&
                        !data.content.startsWith('\n')
                      accumulatedContent += (needsSpace ? ' ' : '') + data.content
                      setStreamingContent(accumulatedContent)
                    } else if (data.type === 'complete') {
                      // Stream complete
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

          responseContent = accumulatedContent || 'Desculpe, não consegui processar sua mensagem.'
          setIsStreaming(false)
          setStreamingContent('')
        } catch {
          setIsStreaming(false)
          setStreamingContent('')

          // Fallback to Maritaca with Santos Dumont persona
          if (MARITACA_API_KEY) {
            const maritacaResponse = await fetch('https://chat.maritaca.ai/api/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Key ${MARITACA_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'sabia-3',
                messages: [
                  { role: 'system', content: currentMode.systemPrompt },
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
                data.choices?.[0]?.message?.content ||
                'Desculpe, não consegui processar sua mensagem.'
            } else {
              throw new Error('Maritaca fallback failed')
            }
          } else {
            // Demo mode fallback
            responseContent = `Olá, jovem inventor! Sou Alberto Santos-Dumont, seu mentor na Academy! ✈️

Sua pergunta sobre "${userMessage.content}" é muito interessante!

Assim como na aviação, o aprendizado requer persistência e criatividade. Cada linha de código é como um componente do seu 14-bis pessoal.

Algumas dicas para você:
• Experimente, erre e aprenda - é assim que a inovação acontece
• Documente suas descobertas no diário de aprendizado
• Não tenha medo de perguntar - a curiosidade é o motor do progresso

Continue voando alto! 🛫`
          }
        }
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
              href="/pt/academy"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>

            {currentSession && (
              <Badge variant="success" className="animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Sessao ativa
              </Badge>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleModeChange('mentor')}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-200',
                'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
                'border-2',
                chatMode === 'mentor'
                  ? 'border-green-500 ring-2 ring-green-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-400'
              )}
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                <Image
                  src={chatModes.mentor.avatar}
                  alt={chatModes.mentor.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                    Santos-Dumont
                  </p>
                  <Plane className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mentor • Duvidas do projeto
                </p>
              </div>
              {chatMode === 'mentor' && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              )}
            </button>

            <button
              onClick={() => handleModeChange('maritaca')}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-200',
                'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
                'border-2',
                chatMode === 'maritaca'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
              )}
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <span className="text-3xl">🦜</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">Maritaca AI</p>
                  <Badge variant="info" size="sm" className="flex-shrink-0">
                    <Zap className="w-3 h-3" />
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">LLM • Qualquer tema</p>
              </div>
              {chatMode === 'maritaca' && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div
                  className={cn(
                    'w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br shadow-2xl mx-auto mb-6',
                    currentMode.color
                  )}
                >
                  <Image
                    src={currentMode.avatar}
                    alt={currentMode.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Ola! Sou {currentMode.name.split(' ')[0]}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {currentMode.description}. Como posso ajudar voce hoje?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(chatMode === 'mentor'
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
                      className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
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
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={currentMode.avatar}
                        alt={currentMode.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
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
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </Card>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={user.avatar}
                        alt="Voce"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response */}
              {isStreaming && streamingContent && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={currentMode.avatar}
                      alt={currentMode.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Card variant="outlined" padding="md" className="max-w-[70%]">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {streamingContent}
                      <span className="inline-block w-2 h-4 ml-1 bg-green-500 animate-pulse" />
                    </p>
                  </Card>
                </div>
              )}

              {/* Loading indicator (before streaming starts) */}
              {isSending && !streamingContent && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={currentMode.avatar}
                      alt={currentMode.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
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
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
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
