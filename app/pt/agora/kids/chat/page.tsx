/**
 * Kids Chat Page
 *
 * Simplified chat interface for children to interact with
 * Monteiro Lobato and Tarsila do Amaral agents.
 * Integrates with Kids tracker for parent reports.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Added telemetry integration
 */

'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents, getAgentById } from '@/data/agents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Send, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
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
  const { trackAgent } = useKids()

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
      const greeting =
        agent.id === 'monteiro_lobato'
          ? 'Olá, amiguinho! Sou o Monteiro Lobato, criador do Sítio do Picapau Amarelo. Quer ouvir uma história enquanto aprendemos sobre programação? Posso te ensinar de um jeito bem divertido!'
          : 'Oi! Sou a Tarsila do Amaral, pintora do Abaporu. Vou te ensinar que programar é como pintar: você cria algo novo do zero! O que quer aprender hoje?'

      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: greeting,
          agentId: agent.id,
        },
      ])
    }
  }, [agent, messages.length])

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

    // Track chat message for parent report
    trackKidsChatMessage(agent.id, input.trim().length)

    try {
      // Call the backend API
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
    } catch (error) {
      // Fallback response
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          agent.id === 'monteiro_lobato'
            ? 'Que legal sua pergunta! Programar é como escrever histórias: você conta para o computador o que ele deve fazer, passo a passo. É mágico!'
            : 'Que criativo você é! Sabia que programar usa muitas cores e formas? Podemos criar animações lindas com código!',
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Modo Kids não está ativo.</p>
          <Link
            href="/pt/agora"
            className="kids-button bg-primary text-primary-foreground px-6 py-3 rounded-full inline-block"
          >
            Voltar para Ágora
          </Link>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">Agente não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/pt/agora/kids"
            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-3 border-primary">
              <Image src={agent.image} alt={agent.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">{agent.role.pt}</p>
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
                relative h-10 w-10 rounded-full overflow-hidden border-2 transition-all
                ${a.id === agentId ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
            >
              <Image src={a.image} alt={a.name} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary shrink-0">
                <Image src={agent.image} alt={agent.name} fill className="object-cover" />
              </div>
            )}
            <div
              className={`
                max-w-[80%] p-4 rounded-2xl
                ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'kids-card rounded-bl-sm'
                }
              `}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary shrink-0">
              <Image src={agent.image} alt={agent.name} fill className="object-cover" />
            </div>
            <div className="kids-card p-4 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse text-kids-yellow" />
                <span className="text-sm text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1 text-lg h-14 rounded-full px-6"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Aperte Enter para enviar</p>
      </div>
    </div>
  )
}

export default function KidsChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <KidsChatContent />
    </Suspense>
  )
}
