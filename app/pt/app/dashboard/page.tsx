'use client'

import '@/styles/design-system/tokens/index.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, AlertTriangle, FileSearch, BarChart3, Shield,
  Activity, Users, Eye, DollarSign, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Search, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Estatísticas principais
const statsCards = [
  {
    title: 'Investigações Ativas',
    value: '27',
    change: '+12%',
    trend: 'up',
    icon: FileSearch,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Anomalias Detectadas',
    value: '142',
    change: '+23%',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  {
    title: 'Valor Investigado',
    value: 'R$ 45.2M',
    change: '+8%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    title: 'Taxa de Precisão',
    value: '94.5%',
    change: '+2.3%',
    trend: 'up',
    icon: Shield,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  }
]

// Investigações recentes mock
const recentInvestigations = [
  {
    id: 'INV-001',
    title: 'Sobrepreço em Merenda Escolar',
    status: 'critical',
    value: 2340000,
    confidence: 94.5,
    date: new Date('2024-01-20')
  },
  {
    id: 'INV-002',
    title: 'Irregularidades em Licitação de Obras',
    status: 'active',
    value: 8900000,
    confidence: 87.3,
    date: new Date('2024-01-19')
  },
  {
    id: 'INV-003',
    title: 'Padrão Suspeito em Contratos',
    status: 'completed',
    value: 1200000,
    confidence: 91.8,
    date: new Date('2024-01-18')
  }
]

// Atividades dos agentes mock
const agentActivity = [
  {
    agent: 'Zumbi dos Palmares',
    action: 'Detectou anomalia em licitação',
    time: new Date('2024-01-20T14:30:00'),
    type: 'anomaly'
  },
  {
    agent: 'Anita Garibaldi',
    action: 'Analisou padrões de contratos',
    time: new Date('2024-01-20T13:45:00'),
    type: 'analysis'
  },
  {
    agent: 'Tiradentes',
    action: 'Gerou relatório de investigação',
    time: new Date('2024-01-20T12:15:00'),
    type: 'report'
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const getStatusColor = (status: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      active: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      completed: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      pending: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
                    <span className={cn(
                      'font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
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
            <div className="space-y-4">
              {recentInvestigations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/pt/app/investigacoes/${inv.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {inv.id}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(inv.status)
                        )}>
                          {inv.status === 'critical' ? 'Crítico' :
                           inv.status === 'active' ? 'Ativo' : 'Concluído'}
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
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Agent Activity */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Atividade dos Agentes
              </h2>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            <div className="space-y-4">
              {agentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      activity.type === 'anomaly' ? 'bg-red-100 dark:bg-red-900/30' :
                      activity.type === 'analysis' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    )}>
                      {activity.type === 'anomaly' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      ) : activity.type === 'analysis' ? (
                        <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FileSearch className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    {index < agentActivity.length - 1 && (
                      <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {activity.agent}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {format(activity.time, "HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ações Rápidas
          </h2>
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
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Agentes IA
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conhecer especialistas
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
