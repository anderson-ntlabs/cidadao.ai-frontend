/**
 * Parental Dashboard Page
 *
 * Dashboard showing child's Kids mode activity and progress.
 * Accessible only with valid parental access code.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useKids } from '@/hooks/use-kids'
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
  Download,
  Lock,
  Baby,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ParentalAccess {
  code: string
  childName: string
  accessedAt: string
}

interface DailyStats {
  date: string
  totalMinutes: number
  totalSessions: number
  videosWatched: string[]
  agentsUsed: string[]
}

export default function ParentalDashboardPage() {
  const router = useRouter()
  const { getTodayStats, disableKidsMode, generateAccessCode } = useKids()

  const [access, setAccess] = useState<ParentalAccess | null>(null)
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)

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
      loadStats()
    } catch {
      router.push('/pt/agora/pais')
    }
  }, [router])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const stats = await getTodayStats()
      if (stats) {
        setTodayStats({
          date: new Date().toISOString().split('T')[0],
          ...stats,
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateNewCode = async () => {
    setIsGeneratingCode(true)
    try {
      const code = await generateAccessCode()
      if (code) {
        setNewCode(code)
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleDisableKidsMode = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja desativar o Modo Kids? A criança não terá mais acesso à área infantil.'
    )
    if (confirmed) {
      await disableKidsMode()
      sessionStorage.removeItem('parental_access')
      router.push('/pt/agora')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('parental_access')
    router.push('/pt/agora/pais')
  }

  // Loading state
  if (!access || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando dados...</p>
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
            <Button variant="secondary" onClick={loadStats} className="gap-2">
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
            <p className="text-3xl font-bold text-foreground">{todayStats?.totalMinutes || 0}</p>
            <p className="text-xs text-muted-foreground">minutos hoje</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{todayStats?.totalSessions || 0}</p>
            <p className="text-xs text-muted-foreground">sessões hoje</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {todayStats?.videosWatched?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">videos assistidos</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {todayStats?.agentsUsed?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">mentores usados</p>
          </GlassCard>
        </div>

        {/* Activity Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Videos Watched */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Videos Assistidos Hoje</h3>
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
                  Nenhum video assistido hoje
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
                      <span className="text-sm capitalize">{agentId.replace('-', ' ')}</span>
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

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Generate New Code */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-2">Novo Codigo de Acesso</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gere um novo codigo para acessar este dashboard de outro dispositivo
            </p>

            {newCode ? (
              <div className="p-4 bg-muted rounded-xl text-center mb-4">
                <p className="text-3xl font-mono font-bold tracking-widest">{newCode}</p>
                <p className="text-xs text-muted-foreground mt-2">Valido por 24 horas</p>
              </div>
            ) : null}

            <Button
              onClick={handleGenerateNewCode}
              disabled={isGeneratingCode}
              className="w-full"
              variant="secondary"
            >
              {isGeneratingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Novo Codigo
                </>
              )}
            </Button>
          </GlassCard>

          {/* Disable Kids Mode */}
          <GlassCard className="p-6 border-destructive/20">
            <h3 className="font-semibold mb-2 text-destructive">Desativar Modo Kids</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Isso remove o acesso da criança à área Kids e todos os dados de sessão
            </p>
            <Button onClick={handleDisableKidsMode} variant="destructive" className="w-full">
              Desativar Modo Kids
            </Button>
          </GlassCard>
        </div>

        {/* Info Banner */}
        <GlassCard className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Relatórios Diários
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Você receberá um resumo diário por email com as atividades do seu filho. Configure
                suas preferencias de notificacao no painel principal da Agora.
              </p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}
