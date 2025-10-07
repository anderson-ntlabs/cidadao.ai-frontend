'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/loading-screen'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Activity, FileSearch, Users, DollarSign, Calendar,
  Filter, Download, RefreshCw, BarChart, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { SkeletonStatsGrid, SkeletonChart } from '@/components/ui/skeleton-cards'
import { cn } from '@/lib/utils'
// Use lazy-loaded charts to reduce initial bundle size
import { AreaChart, PieChart } from '@/components/charts/lazy'
// BreadcrumbsV2 removed - handled by AuthLayout

export default function DashboardPageV3() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for charts - Recharts format
  const areaChartData = [
    { name: 'Seg', contratos: 120, anomalias: 3 },
    { name: 'Ter', contratos: 135, anomalias: 5 },
    { name: 'Qua', contratos: 125, anomalias: 4 },
    { name: 'Qui', contratos: 140, anomalias: 7 },
    { name: 'Sex', contratos: 155, anomalias: 5 },
    { name: 'Sáb', contratos: 145, anomalias: 8 },
    { name: 'Dom', contratos: 160, anomalias: 6 },
  ]

  const areaChartAreas = [
    { dataKey: 'contratos', name: 'Contratos Analisados', color: '#10b981' },
    { dataKey: 'anomalias', name: 'Anomalias Detectadas', color: '#3b82f6' },
  ]

  const pieChartData = [
    { name: 'Normais', value: 245, color: '#10b981' },
    { name: 'Suspeitas', value: 52, color: '#eab308' },
    { name: 'Confirmadas', value: 23, color: '#ef4444' },
    { name: 'Em Análise', value: 28, color: '#3b82f6' },
  ]

  const stats = [
    {
      title: 'Total Analisado',
      value: 'R$ 12.5M',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-500/20',
      tooltip: 'Soma total dos valores de contratos e licitações analisados pelos agentes de IA no período selecionado. Inclui contratos federais, estaduais e municipais.'
    },
    {
      title: 'Contratos',
      value: '348',
      change: '+8.2%',
      trend: 'up',
      icon: FileSearch,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/20',
      tooltip: 'Número de contratos públicos analisados automaticamente. Cada contrato passa por verificação de anomalias, análise de preços e checagem de conformidade legal.'
    },
    {
      title: 'Anomalias',
      value: '23',
      change: '-12.5%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/20',
      tooltip: 'Irregularidades detectadas pelos algoritmos de IA, incluindo superfaturamento, fracionamento ilegal, direcionamento e favorecimento. Cada anomalia tem score de confiança e requer validação.'
    },
    {
      title: 'Agentes Ativos',
      value: '8/17',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/20',
      tooltip: 'Agentes de IA atualmente processando investigações. O sistema conta com 17 agentes especializados (Abaporu, Zumbi, Anita, Tiradentes, etc.), cada um com funções específicas.'
    }
  ]

  const recentInvestigations = [
    {
      id: 1,
      title: 'Licitação Suspeita - Ministério da Saúde',
      status: 'Em Análise',
      statusColor: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      value: 'R$ 2.3M',
      date: 'Hoje, 14:32',
      agents: ['Zumbi dos Palmares', 'Anita Garibaldi']
    },
    {
      id: 2,
      title: 'Contrato de Merenda Escolar - SP',
      status: 'Anomalia Detectada',
      statusColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      value: 'R$ 850K',
      date: 'Hoje, 10:15',
      agents: ['Tiradentes']
    },
    {
      id: 3,
      title: 'Obras de Infraestrutura - RJ',
      status: 'Concluída',
      statusColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      value: 'R$ 5.2M',
      date: 'Ontem',
      agents: ['Machado de Assis', 'Niemeyer']
    }
  ]

  return (
    <div className="min-h-screen relative">
      <LoadingScreen />
      
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03
        }}
      />
      
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard de Transparência
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visão geral das investigações e análises em tempo real
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true)
                  // Simulate API call
                  setTimeout(() => setIsLoading(false), 2000)
                }}
              >
                Atualizar
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Exportar
              </Button>
              <Button
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          {['24h', '7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedPeriod === period
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
              )}
            >
              {period === '24h' && 'Hoje'}
              {period === '7d' && '7 dias'}
              {period === '30d' && '30 dias'}
              {period === '90d' && '3 meses'}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <SkeletonStatsGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
            <GlassCard key={index}>
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <Tooltip
                    content={stat.tooltip}
                    position="bottom"
                    delay={200}
                  >
                    <button
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      aria-label={`Informação sobre ${stat.title}`}
                    >
                      <Info className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </Tooltip>
                </div>
              </GlassCardContent>
            </GlassCard>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <GlassCard className="lg:col-span-2">
            <GlassCardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividade de Análise
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              {isLoading ? (
                <SkeletonChart height={256} />
              ) : (
                <AreaChart
                  data={areaChartData}
                  areas={areaChartAreas}
                  xAxisKey="name"
                  height={256}
                  className="w-full"
                />
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Donut Chart */}
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Status das Investigações
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              {isLoading ? (
                <SkeletonChart height={256} />
              ) : (
                <PieChart
                  data={pieChartData}
                  height={256}
                  innerRadius={60}
                  outerRadius={90}
                  showLabel={true}
                  showLegend={true}
                  className="w-full"
                />
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Recent Investigations */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Investigações Recentes
              </h3>
              <Button variant="ghost" size="sm" onClick={() => {}}>
                Ver todas
              </Button>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Investigação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Agentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {recentInvestigations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {inv.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          inv.statusColor
                        )}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                        {inv.value}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {inv.agents.slice(0, 3).map((agent, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
                              title={agent}
                            >
                              <span className="text-xs text-white font-bold">
                                {agent[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {inv.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}