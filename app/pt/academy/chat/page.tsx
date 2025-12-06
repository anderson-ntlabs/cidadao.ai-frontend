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
    description: 'Tire duvidas sobre o projeto Cidadao.AI e receba orientacao para seu aprendizado',
    color: 'from-green-500 to-emerald-600',
    systemPrompt: `Voce e Alberto Santos-Dumont, mentor da Academy Cidadao.AI.
Voce e apaixonado por inovacao, engenharia criativa e educacao.
Ajude os estagiarios com duvidas sobre:
- O projeto Cidadao.AI e sua arquitetura
- Boas praticas de desenvolvimento
- Carreira em tecnologia
- Motivacao e persistencia

Seja didatico, incentivador e use analogias com aviacao quando apropriado.
Responda sempre em portugues brasileiro.`,
  },
  maritaca: {
    id: 'maritaca',
    name: 'Maritaca AI',
    role: 'Assistente IA',
    emoji: '🦜',
    avatar: '/sabiazinho.png',
    description: 'LLM brasileiro - tire duvidas sobre qualquer tema de programacao',
    color: 'from-blue-500 to-cyan-500',
    systemPrompt: `Voce e um assistente educacional da Academy Cidadao.AI, um programa de estagio em parceria com IFSULDEMINAS.
Ajude os estudantes a aprender sobre desenvolvimento de software, inteligencia artificial, e tecnologia em geral.
Seja didatico, use exemplos praticos, e incentive o aprendizado.
Responda sempre em portugues brasileiro.`,
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
              'Desculpe, nao consegui processar sua mensagem.'
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
        // Santos Dumont - Backend agent
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/santos_dumont/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage.content }),
          })

          if (response.ok) {
            const data = await response.json()
            responseContent =
              data.response || data.message || 'Desculpe, nao consegui processar sua mensagem.'
          } else {
            throw new Error('Backend not available')
          }
        } catch {
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
                'Desculpe, nao consegui processar sua mensagem.'
            } else {
              throw new Error('Maritaca fallback failed')
            }
          } else {
            // Demo mode fallback
            responseContent = `Ola, jovem inventor! Sou Alberto Santos-Dumont, seu mentor na Academy! ✈️

Sua pergunta sobre "${userMessage.content}" e muito interessante!

Assim como na aviacao, o aprendizado requer persistencia e criatividade. Cada linha de codigo e como um componente do seu 14-bis pessoal.

Algumas dicas para voce:
• Experimente, erre e aprenda - e assim que a inovacao acontece
• Documente suas descobertas no diario de aprendizado
• Nao tenha medo de perguntar - a curiosidade e o motor do progresso

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
          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange('mentor')}
              className={cn(
                'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
                chatMode === 'mentor'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <Image
                  src={chatModes.mentor.avatar}
                  alt={chatModes.mentor.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {chatModes.mentor.name}
                  </p>
                  <Plane className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duvidas sobre o projeto</p>
              </div>
            </button>

            <button
              onClick={() => handleModeChange('maritaca')}
              className={cn(
                'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
                chatMode === 'maritaca'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                <Image
                  src={chatModes.maritaca.avatar}
                  alt={chatModes.maritaca.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {chatModes.maritaca.name}
                  </p>
                  <Badge variant="info" size="sm">
                    <Zap className="w-3 h-3 mr-0.5" />
                    LLM
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qualquer tema de programacao
                </p>
              </div>
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

              {isSending && (
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
