/**
 * Kids Chat Page
 *
 * Simplified chat interface for children to interact with
 * Monteiro Lobato and Tarsila do Amaral agents.
 * Uses Agora Design System with Kids theme.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Consolidated with Agora design system
 */

'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents, getAgentById } from '@/data/agents'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Loader2, ArrowLeft, Sparkles, Heart, ArrowRight } from 'lucide-react'
import { trackKidsChatMessage } from '@/lib/analytics/kids-tracker'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentId?: string
}

function KidsChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isReady, isLoading: modeLoading } = useRequireKidsMode()
  const { trackAgent, childName } = useKids()

  const agentId = searchParams.get('agent') || 'monteiro_lobato'
  const agent = getAgentById(agentId)
  const kidsAgents = getKidsAgents()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (agent && messages.length === 0) {
      const name = childName || 'amiguinho'
      const greeting =
        agent.id === 'monteiro_lobato'
          ? `Olá, ${name}! Sou o Monteiro Lobato, criador do Sítio do Picapau Amarelo. Quer ouvir uma história enquanto aprendemos sobre programação? Posso te ensinar de um jeito bem divertido! 📚✨`
          : `Oi, ${name}! Sou a Tarsila do Amaral, pintora do Abaporu. Vou te ensinar que programar é como pintar: você cria algo novo do zero! O que quer aprender hoje? 🎨🌟`

      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: greeting,
          agentId: agent.id,
        },
      ])
    }
  }, [agent, messages.length, childName])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !agent) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    trackAgent(agent.id)
    trackKidsChatMessage(agent.id, input.trim().length)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          agent_id: agent.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Hmm, não consegui entender. Pode repetir de outra forma?',
        agentId: agent.id,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          agent.id === 'monteiro_lobato'
            ? 'Que legal sua pergunta! Programar é como escrever histórias: você conta para o computador o que ele deve fazer, passo a passo. É mágico! ✨📖'
            : 'Que criativo você é! Sabia que programar usa muitas cores e formas? Podemos criar animações lindas com código! 🎨🖌️',
        agentId: agent.id,
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAgentChange = (newAgentId: string) => {
    router.push(`/pt/agora/kids/chat?agent=${newAgentId}`)
    setMessages([])
  }

  // Loading state
  if (modeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kids-turquoise to-kids-coral flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-kids-coral/20 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-kids-coral" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Modo Kids não está ativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Peça para seus pais configurarem a Área Kids!
          </p>
          <Link
            href="/pt/agora"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kids-coral text-white font-medium hover:bg-kids-coral/90 transition-colors"
          >
            Voltar para Ágora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-lg text-gray-600 dark:text-gray-400">Agente não encontrado.</p>
          <Link
            href="/pt/agora/kids/dashboard"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kids-turquoise text-white font-medium hover:bg-kids-turquoise/90 transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <GlassCard className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pt/agora/kids/dashboard"
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-3 border-kids-turquoise shadow-lg">
                  <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900 dark:text-white">{agent.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role.pt}</p>
                </div>
              </div>
            </div>

            {/* Agent Switcher */}
            <div className="flex gap-2">
              {kidsAgents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleAgentChange(a.id)}
                  className={`
                    relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all
                    ${
                      a.id === agentId
                        ? 'border-kids-turquoise scale-110 shadow-lg'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-200 dark:hover:border-gray-700'
                    }
                  `}
                >
                  <Image src={a.image} alt={a.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Messages */}
        <GlassCard className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-kids-turquoise shrink-0 shadow-md">
                    <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                  </div>
                )}
                <div
                  className={`
                    max-w-[80%] p-4 rounded-2xl shadow-sm
                    ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-kids-coral to-kids-orange text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-md'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-kids-turquoise shrink-0 shadow-md">
                  <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse text-kids-yellow" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </GlassCard>

        {/* Input */}
        <GlassCard className="p-4 mt-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              disabled={isLoading}
              className="flex-1 text-lg h-14 rounded-full px-6 border-2 border-gray-200 dark:border-gray-700 focus:border-kids-turquoise dark:focus:border-kids-turquoise"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-kids-coral to-kids-orange hover:from-kids-coral/90 hover:to-kids-orange/90 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Send className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Aperte Enter para enviar • Converse sobre programação! 🚀
          </p>
        </GlassCard>
      </div>
    </div>
  )
}

export default function KidsChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kids-turquoise to-kids-coral flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Carregando...</p>
          </div>
        </div>
      }
    >
      <KidsChatContent />
    </Suspense>
  )
}
