/**
 * Kids Chat Page
 *
 * Simplified chat interface for children to interact with
 * Monteiro Lobato and Tarsila do Amaral agents.
 * Uses SSE streaming for real-time responses.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-11 - Standardized loading state with PageLoading variant='kids'
 */

'use client'

import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents, getAgentById } from '@/data/agents'
import { GlassCard } from '@/components/ui/glass-card'
import { PageLoading } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Loader2, ArrowLeft, Sparkles, Heart, ArrowRight, MessageCircle } from 'lucide-react'
import { trackKidsChatMessage } from '@/lib/analytics/kids-tracker'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import dynamic from 'next/dynamic'

// Voice input button - wrapped with fallback to prevent crash if not available
const VoiceInputButtonFallback = () => null
const VoiceInputButton = dynamic(
  () =>
    import('@/components/voice/voice-input-button')
      .then((mod) => {
        if (!mod.VoiceInputButton) {
          console.warn('VoiceInputButton not found, using fallback')
          return { default: VoiceInputButtonFallback }
        }
        return { default: mod.VoiceInputButton }
      })
      .catch((err) => {
        console.error('Failed to load VoiceInputButton:', err)
        return { default: VoiceInputButtonFallback }
      }),
  { loading: () => null, ssr: false }
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentId?: string
  isStreaming?: boolean
}

// Conversation starters for each agent
const CONVERSATION_STARTERS: Record<string, { emoji: string; text: string }[]> = {
  monteiro_lobato: [
    { emoji: '📚', text: 'Me conta uma história sobre programação!' },
    { emoji: '🔮', text: 'O que são variáveis mágicas?' },
    { emoji: '🎭', text: 'Como a Emília aprenderia a programar?' },
    { emoji: '🌟', text: 'Me explica loops de um jeito divertido!' },
  ],
  tarsila: [
    { emoji: '🎨', text: 'Como posso criar arte com código?' },
    { emoji: '🌈', text: 'Me ensina sobre cores no computador!' },
    { emoji: '✨', text: 'O que é design de interface?' },
    { emoji: '🖼️', text: 'Como fazer animações bonitas?' },
  ],
}

// Thinking messages in Portuguese
const THINKING_MESSAGES: Record<string, string> = {
  default: 'Pensando...',
  'Analisando sua mensagem...': 'Analisando sua mensagem...',
  'Monteiro Lobato está consultando a base de conhecimento...':
    'Monteiro Lobato está consultando a base de conhecimento...',
  'Tarsila está consultando a base de conhecimento...':
    'Tarsila está consultando a base de conhecimento...',
}

// Per-agent message storage
type AgentMessages = Record<string, Message[]>

function KidsChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isReady, isLoading: modeLoading } = useRequireKidsMode()
  const { trackAgent, childName } = useKids()

  const agentId = searchParams.get('agent') || 'monteiro_lobato'
  const agent = getAgentById(agentId)
  const kidsAgents = getKidsAgents()

  // Per-agent message state - each agent has its own conversation
  const [agentMessages, setAgentMessages] = useState<AgentMessages>({})
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())

  // Chat persistence - saves conversations to database for reports
  const { saveUserMessage, saveAssistantMessage } = useChatPersistence({
    isKidsMode: true,
    agentId,
    agentName: agent?.name || 'Mentor',
    childName,
  })

  // Get messages for current agent
  const messages = agentMessages[agentId] || []

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingMessage])

  // Initialize greeting for each agent when first visited
  useEffect(() => {
    if (agent && !agentMessages[agentId]) {
      const name = childName || 'amiguinho'
      const greeting =
        agent.id === 'monteiro_lobato'
          ? `Olá, ${name}! Sou o Monteiro Lobato, criador do Sítio do Picapau Amarelo. Quer ouvir uma história enquanto aprendemos sobre programação? Posso te ensinar de um jeito bem divertido! 📚✨`
          : `Oi, ${name}! Sou a Tarsila do Amaral, pintora do Abaporu. Vou te ensinar que programar é como pintar: você cria algo novo do zero! O que quer aprender hoje? 🎨🌟`

      setAgentMessages((prev) => ({
        ...prev,
        [agentId]: [
          {
            id: `greeting-${agentId}`,
            role: 'assistant',
            content: greeting,
            agentId: agent.id,
          },
        ],
      }))
    }
  }, [agent, agentId, agentMessages, childName])

  // Send message with SSE streaming
  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = messageText || input.trim()
      if (!text || isLoading || !agent) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
      }

      // Add user message to current agent's messages
      setAgentMessages((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), userMessage],
      }))
      setInput('')
      setIsLoading(true)
      setThinkingMessage(null)
      trackAgent(agent.id)
      trackKidsChatMessage(agent.id, text.length)

      // Save user message to database (async, don't await)
      saveUserMessage(text).catch(() => {
        // Silent fail - don't block chat for persistence errors
      })

      // Create placeholder for assistant response
      const assistantMessageId = `assistant-${Date.now()}`

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            agent_id: agent.id,
            session_id: sessionIdRef.current,
          }),
        })

        if (!response.ok || !response.body) {
          throw new Error('Failed to get response')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let isFirstChunk = true

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.type) {
                  case 'thinking':
                    setThinkingMessage(data.message)
                    break

                  case 'chunk':
                    if (isFirstChunk) {
                      // Create message on first chunk
                      setAgentMessages((prev) => ({
                        ...prev,
                        [agentId]: [
                          ...(prev[agentId] || []),
                          {
                            id: assistantMessageId,
                            role: 'assistant',
                            content: data.content + ' ',
                            agentId: agent.id,
                            isStreaming: true,
                          },
                        ],
                      }))
                      fullContent = data.content + ' '
                      isFirstChunk = false
                      setThinkingMessage(null)
                    } else {
                      // Append to existing message
                      fullContent += data.content + ' '
                      setAgentMessages((prev) => ({
                        ...prev,
                        [agentId]: prev[agentId].map((msg) =>
                          msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
                        ),
                      }))
                    }
                    break

                  case 'complete':
                    // Mark message as complete (remove streaming flag)
                    setAgentMessages((prev) => ({
                      ...prev,
                      [agentId]: prev[agentId].map((msg) =>
                        msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
                      ),
                    }))
                    break
                }
              } catch {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        // Ensure message is marked complete and save to database
        if (fullContent) {
          const finalContent = fullContent.trim()
          setAgentMessages((prev) => ({
            ...prev,
            [agentId]: prev[agentId].map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: finalContent, isStreaming: false }
                : msg
            ),
          }))

          // Save assistant message to database (async, don't await)
          saveAssistantMessage(finalContent).catch(() => {
            // Silent fail - don't block chat for persistence errors
          })
        }
      } catch (error) {
        console.error('Chat error:', error)
        // Fallback message on error
        const fallbackContent =
          agent.id === 'monteiro_lobato'
            ? 'Que legal sua pergunta! Programar é como escrever histórias: você conta para o computador o que ele deve fazer, passo a passo. É mágico! ✨📖'
            : 'Que criativo você é! Sabia que programar usa muitas cores e formas? Podemos criar animações lindas com código! 🎨🖌️'

        setAgentMessages((prev) => ({
          ...prev,
          [agentId]: [
            ...(prev[agentId] || []),
            {
              id: assistantMessageId,
              role: 'assistant',
              content: fallbackContent,
              agentId: agent.id,
            },
          ],
        }))

        // Save fallback message to database
        saveAssistantMessage(fallbackContent).catch(() => {
          // Silent fail
        })
      } finally {
        setIsLoading(false)
        setThinkingMessage(null)
      }
    },
    [input, isLoading, agent, agentId, trackAgent, saveUserMessage, saveAssistantMessage]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle clicking on a conversation starter
  const handleStarterClick = (text: string) => {
    handleSend(text)
  }

  const handleAgentChange = (newAgentId: string) => {
    router.push(`/pt/agora/kids/chat?agent=${newAgentId}`)
    // Don't clear messages - each agent keeps its own conversation
  }

  // Loading state
  if (modeLoading) {
    return <PageLoading text="Carregando..." variant="kids" />
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-kids-turquoise animate-pulse rounded-sm" />
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {thinkingMessage && !messages.some((m) => m.isStreaming) && (
              <div className="flex gap-3 justify-start">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-kids-turquoise shrink-0 shadow-md">
                  <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse text-kids-yellow" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {THINKING_MESSAGES[thinkingMessage] || thinkingMessage}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation starters - show only after greeting */}
            {messages.length === 1 && !isLoading && (
              <div className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-kids-turquoise" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sugestões para começar:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONVERSATION_STARTERS[agentId]?.map((starter, index) => (
                    <button
                      key={index}
                      onClick={() => handleStarterClick(starter.text)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-kids-turquoise/10 to-kids-coral/10 hover:from-kids-turquoise/20 hover:to-kids-coral/20 border border-kids-turquoise/20 transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {starter.emoji}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {starter.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </GlassCard>

        {/* Input */}
        <GlassCard className="p-4 mt-4">
          <div className="flex gap-3 items-end">
            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(transcript) => {
                setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
              }}
              disabled={isLoading}
              size="lg"
              variant="secondary"
              lang="pt-BR"
              showTooltip={true}
              tooltipContent="Fale sua pergunta! 🎤"
              className="h-14 w-14 rounded-full border-2 border-kids-turquoise bg-white dark:bg-gray-800 hover:bg-kids-turquoise/10 shadow-md"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite ou fale sua pergunta..."
              disabled={isLoading}
              className="flex-1 text-lg h-14 rounded-full px-6 border-2 border-gray-200 dark:border-gray-700 focus:border-kids-turquoise dark:focus:border-kids-turquoise"
            />
            <Button
              onClick={() => handleSend()}
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
            Aperte Enter para enviar • Use o microfone para falar! 🎤🚀
          </p>
        </GlassCard>
      </div>
    </div>
  )
}

export default function KidsChatPage() {
  return (
    <Suspense fallback={<PageLoading text="Carregando..." variant="kids" />}>
      <KidsChatContent />
    </Suspense>
  )
}
