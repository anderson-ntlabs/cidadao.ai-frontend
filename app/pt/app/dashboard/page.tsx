'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  AlertTriangle,
  FileSearch,
  BarChart3,
  Shield,
  Activity,
  Users,
  Eye,
  DollarSign,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { StatCard, StatsGrid } from '@/components/stats'
import { useAuth } from '@/hooks/use-supabase-auth'
import { userProfileService, type UserActivity } from '@/lib/services/user-profile.service'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/utils/logger'
import { SwipeActions } from '@/components/mobile'
import { toast } from '@/hooks/use-toast'

// Lazy load heavy chart/visualization components
const InvestigationAnalytics = dynamic(
  () =>
    import('@/components/dashboard/investigation-analytics').then((mod) => ({
      default: mod.InvestigationAnalytics,
    })),
  {
    loading: () => (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
        </GlassCardContent>
      </GlassCard>
    ),
    ssr: false,
  }
)

const ActivityTimeline = dynamic(
  () => import('@/components/activity').then((mod) => ({ default: mod.ActivityTimeline })),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
)

const SwipeableCard = dynamic(
  () => import('@/components/mobile').then((mod) => ({ default: mod.SwipeableCard })),
  {
    loading: () => <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg" />,
    ssr: false,
  }
)

// Estatísticas principais
const statsCards = [
  {
    title: 'Investigações Ativas',
    value: '27',
    change: '+12%',
    trend: 'up',
    icon: FileSearch,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: 'Anomalias Detectadas',
    value: '142',
    change: '+23%',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    title: 'Valor Investigado',
    value: 'R$ 45.2M',
    change: '+8%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'Taxa de Precisão',
    value: '94.5%',
    change: '+2.3%',
    trend: 'up',
    icon: Shield,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
]

// Investigações recentes mock
const recentInvestigations = [
  {
    id: 'INV-001',
    title: 'Sobrepreço em Merenda Escolar',
    status: 'critical',
    value: 2340000,
    confidence: 94.5,
    date: new Date('2024-01-20'),
  },
  {
    id: 'INV-002',
    title: 'Irregularidades em Licitação de Obras',
    status: 'active',
    value: 8900000,
    confidence: 87.3,
    date: new Date('2024-01-19'),
  },
  {
    id: 'INV-003',
    title: 'Padrão Suspeito em Contratos',
    status: 'completed',
    value: 1200000,
    confidence: 91.8,
    date: new Date('2024-01-18'),
  },
]

// Atividades dos agentes mock
const agentActivity = [
  {
    agent: 'Zumbi dos Palmares',
    action: 'Detectou anomalia em licitação',
    time: new Date('2024-01-20T14:30:00'),
    type: 'anomaly',
  },
  {
    agent: 'Anita Garibaldi',
    action: 'Analisou padrões de contratos',
    time: new Date('2024-01-20T13:45:00'),
    type: 'analysis',
  },
  {
    agent: 'Tiradentes',
    action: 'Gerou relatório de investigação',
    time: new Date('2024-01-20T12:15:00'),
    type: 'report',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_messages: 0,
    total_investigations: 0,
    member_since: new Date().toISOString(),
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsLoadingActivities(true)

      // Load user stats and activities in parallel
      const [userStats, recentActivities] = await Promise.all([
        userProfileService.getStats(user.id),
        userProfileService.getRecentActivities(user.id, 10),
      ])

      setStats(userStats)
      setActivities(recentActivities)

      // Log dashboard view activity
      await userProfileService
        .logActivity(
          user.id,
          'settings_update',
          'Visualizou o dashboard',
          'Acesso ao painel de controle principal'
        )
        .catch((err) => logger.error('Failed to log dashboard activity', { error: err }))
    } catch (error) {
      logger.error('Failed to load dashboard data', { error })
    } finally {
      setIsLoadingActivities(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      active: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      completed: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      pending: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Handle swipe actions on investigation cards
  const handleArchiveInvestigation = async (id: string) => {
    // TODO: Implement actual archive logic with backend
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success('Investigação arquivada', `${id} foi movida para o arquivo`)
  }

  const handleDeleteInvestigation = async (id: string) => {
    // TODO: Implement actual delete logic with backend
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.error('Investigação excluída', `${id} foi removida permanentemente`)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard de Investigações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral das análises e monitoramento de transparência
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Investigation Analytics - Real Data */}
      <InvestigationAnalytics />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.trend === 'up'

          return (
            <GlassCard key={index} className="hover:shadow-lg transition-all duration-200">
              <GlassCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                    <Icon className={cn('w-6 h-6', stat.color)} />
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={cn('font-medium', isPositive ? 'text-green-600' : 'text-red-600')}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investigations */}
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Investigações Recentes
                </h2>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pt/app/investigacoes')}
              >
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            <div className="space-y-2">
              {recentInvestigations.map((inv) => (
                <SwipeableCard
                  key={inv.id}
                  onClick={() => router.push(`/pt/app/investigacoes/${inv.id}`)}
                  leftAction={SwipeActions.archive(() => handleArchiveInvestigation(inv.id))}
                  rightAction={SwipeActions.delete(() => handleDeleteInvestigation(inv.id))}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {inv.id}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(inv.status)
                          )}
                        >
                          {inv.status === 'critical'
                            ? 'Crítico'
                            : inv.status === 'active'
                              ? 'Ativo'
                              : 'Concluído'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {inv.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatValue(inv.value)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>{inv.confidence.toFixed(1)}%</span>
                      </div>
                    </div>

                    <span className="text-gray-500 dark:text-gray-400">
                      {format(inv.date, "d 'de' MMM", { locale: ptBR })}
                    </span>
                  </div>
                </SwipeableCard>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Atividades Recentes
                </h2>
              </div>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            <ActivityTimeline
              activities={activities}
              isLoading={isLoadingActivities}
              emptyMessage="Suas atividades aparecerão aqui"
              maxItems={5}
            />

            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => router.push('/pt/app/chat')}
            >
              <Users className="w-4 h-4 mr-2" />
              Conversar com Agentes
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <GlassCardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ações Rápidas</h2>
        </GlassCardHeader>

        <GlassCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              className="h-auto py-4 px-6 justify-start"
              onClick={() => router.push('/pt/app/chat')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Nova Investigação
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Iniciar análise com IAs
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="h-auto py-4 px-6 justify-start"
              onClick={() => router.push('/pt/app/investigacoes')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Ver Investigações
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acessar todas as análises
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="secondary"
              className="h-auto py-4 px-6 justify-start"
              onClick={() => router.push('/pt/agents')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Agentes IA</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conhecer especialistas</p>
                </div>
              </div>
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
