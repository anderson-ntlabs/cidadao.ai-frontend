/**
 * Parental Dashboard Page
 *
 * Dashboard showing child's Kids mode activity, progress, and chat history.
 * Accessible only with valid parental verification code.
 *
 * IMPORTANT: This page does NOT use useKids() or useAgora() hooks
 * to avoid loading overhead from parent layout. Uses direct API calls instead.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-10 - Removed hook dependencies, uses API directly
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Clock,
  PlayCircle,
  MessageCircle,
  Calendar,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Lock,
  Baby,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ParentalAccess {
  userId: string
  kidsProfileId: string
  childName: string
  accessedAt: string
}

interface DailyStats {
  totalMinutes: number
  totalSessions: number
  videosWatched: string[]
  agentsUsed: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  agent_name?: string
}

interface ChatHistoryItem {
  id: string
  sessionId: string
  agentId: string
  agentName: string
  messageCount: number
  messages: ChatMessage[]
  startedAt: string
  childName: string
}

export default function ParentalDashboardPage() {
  const router = useRouter()

  const [access, setAccess] = useState<ParentalAccess | null>(null)
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [expandedChat, setExpandedChat] = useState<string | null>(null)

  // Check access on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('parental_access')
    if (!stored) {
      router.push('/pt/agora/pais')
      return
    }

    try {
      const parsed = JSON.parse(stored) as ParentalAccess
      setAccess(parsed)
      loadStats(parsed.kidsProfileId)
      loadChatHistory(parsed.kidsProfileId)
    } catch {
      router.push('/pt/agora/pais')
    }
  }, [router])

  const loadStats = async (kidsProfileId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/parental/stats?kidsProfileId=${kidsProfileId}`)
      const data = await response.json()

      if (data.success) {
        setTodayStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatHistory = async (kidsProfileId: string) => {
    setIsLoadingChats(true)
    try {
      const response = await fetch(
        `/api/parental/chat-history?kidsProfileId=${kidsProfileId}&limit=10`
      )
      const data = await response.json()

      if (data.success) {
        setChatHistory(data.chatHistory)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoadingChats(false)
    }
  }

  const handleDisableKidsMode = async () => {
    if (!access) return

    const confirmed = window.confirm(
      'Tem certeza que deseja desativar o Modo Kids? A criança não terá mais acesso à área infantil.'
    )

    if (confirmed) {
      try {
        const response = await fetch('/api/parental/disable-kids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kidsProfileId: access.kidsProfileId }),
        })

        if (response.ok) {
          sessionStorage.removeItem('parental_access')
          router.push('/pt/agora')
        }
      } catch (error) {
        console.error('Failed to disable kids mode:', error)
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('parental_access')
    router.push('/pt/agora/pais')
  }

  const handleRefresh = () => {
    if (access) {
      loadStats(access.kidsProfileId)
      loadChatHistory(access.kidsProfileId)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Loading state
  if (!access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pt/agora"
              className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-600" />
              <div>
                <h1 className="font-semibold text-foreground">Dashboard dos Pais</h1>
                <p className="text-xs text-muted-foreground">
                  Acompanhamento de {access.childName}
                </p>
              </div>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <Lock className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Child Profile Card */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center">
                <Baby className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{access.childName}</h2>
              <p className="text-sm text-muted-foreground">Modo Kids ativo</p>
            </div>
            <Button variant="secondary" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? '-' : todayStats?.totalMinutes || 0}
            </p>
            <p className="text-xs text-muted-foreground">minutos hoje</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? '-' : todayStats?.totalSessions || 0}
            </p>
            <p className="text-xs text-muted-foreground">sessões hoje</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? '-' : todayStats?.videosWatched?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">vídeos assistidos</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{chatHistory.length}</p>
            <p className="text-xs text-muted-foreground">conversas</p>
          </GlassCard>
        </div>

        {/* Chat History Section */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold">Histórico de Conversas</h3>
              </div>
              {isLoadingChats && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {chatHistory.length > 0 ? (
              <div className="space-y-4">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="border rounded-xl overflow-hidden dark:border-gray-700"
                  >
                    {/* Chat Header */}
                    <button
                      onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-kids-turquoise to-kids-coral flex items-center justify-center">
                          {chat.agentId === 'monteiro_lobato' || chat.agentId === 'tarsila' ? (
                            <Image
                              src={`/agents/${chat.agentId}.png`}
                              alt={chat.agentName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Bot className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{chat.agentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(chat.startedAt)} • {chat.messageCount} mensagens
                          </p>
                        </div>
                      </div>
                      {expandedChat === chat.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {/* Chat Messages */}
                    {expandedChat === chat.id && (
                      <div className="border-t dark:border-gray-700 p-4 bg-muted/30 max-h-96 overflow-y-auto space-y-3">
                        {chat.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.role === 'assistant' && (
                              <div className="w-6 h-6 rounded-full bg-kids-turquoise/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-3 w-3 text-kids-turquoise" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                msg.role === 'user'
                                  ? 'bg-kids-coral text-white rounded-br-sm'
                                  : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                            {msg.role === 'user' && (
                              <div className="w-6 h-6 rounded-full bg-kids-coral/20 flex items-center justify-center flex-shrink-0">
                                <User className="h-3 w-3 text-kids-coral" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {isLoadingChats ? 'Carregando conversas...' : 'Nenhuma conversa encontrada ainda'}
              </p>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Activity Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Videos Watched */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Vídeos Assistidos Hoje</h3>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {todayStats?.videosWatched?.length ? (
                <ul className="space-y-2">
                  {todayStats.videosWatched.map((videoId, index) => (
                    <li key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <span className="text-sm">{videoId}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum vídeo assistido hoje
                </p>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Agents Used */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold">Mentores Utilizados</h3>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {todayStats?.agentsUsed?.length ? (
                <ul className="space-y-2">
                  {todayStats.agentsUsed.map((agentId, index) => (
                    <li key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={`/agents/${agentId}.png`}
                          alt={agentId}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm capitalize">{agentId.replace('_', ' ')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum mentor utilizado hoje
                </p>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Danger Zone */}
        <GlassCard className="p-6 border-destructive/20">
          <h3 className="font-semibold mb-2 text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Desativar o Modo Kids remove o acesso da criança à área infantil
          </p>
          <Button onClick={handleDisableKidsMode} variant="destructive">
            Desativar Modo Kids
          </Button>
        </GlassCard>

        {/* Info Banner */}
        <GlassCard className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Segurança e Privacidade
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Todas as conversas são armazenadas de forma segura e só podem ser acessadas por
                você. Cada acesso ao dashboard requer verificação por email.
              </p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}
