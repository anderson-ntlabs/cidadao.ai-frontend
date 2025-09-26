'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/loading-screen'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Activity, FileSearch, Users, DollarSign, Calendar,
  Filter, Download, RefreshCw, BarChart
} from 'lucide-react'
import { ButtonV2 } from '@/components/ui/button-v2'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { BreadcrumbsV2 } from '@/components/breadcrumbs-v2'

// Dynamic imports for charts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DashboardPageV3() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for charts
  const lineChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#10b981', '#3b82f6'],
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } }
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } }
    },
    legend: {
      labels: { colors: ['#9ca3af'] }
    },
    theme: { mode: 'dark' as const }
  }

  const lineChartSeries = [
    {
      name: 'Contratos Analisados',
      data: [120, 135, 125, 140, 155, 145, 160]
    },
    {
      name: 'Anomalias Detectadas',
      data: [3, 5, 4, 7, 5, 8, 6]
    }
  ]

  const donutChartOptions = {
    chart: {
      type: 'donut' as const,
      background: 'transparent'
    },
    labels: ['Normais', 'Suspeitas', 'Confirmadas', 'Em Análise'],
    colors: ['#10b981', '#eab308', '#ef4444', '#3b82f6'],
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#9ca3af'
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom' as const,
      labels: { colors: ['#9ca3af'] }
    },
    theme: { mode: 'dark' as const }
  }

  const donutChartSeries = [245, 52, 23, 28]

  const stats = [
    {
      title: 'Total Analisado',
      value: 'R$ 12.5M',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Contratos',
      value: '348',
      change: '+8.2%',
      trend: 'up',
      icon: FileSearch,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Anomalias',
      value: '23',
      change: '-12.5%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Agentes Ativos',
      value: '8/17',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/20'
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
        {/* Breadcrumbs */}
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home' },
            { label: 'Dashboard', current: true }
          ]}
          className="mb-6"
        />
        
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
              <ButtonV2 
                variant="ghost" 
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setIsLoading(true)}
              >
                Atualizar
              </ButtonV2>
              <ButtonV2 
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Exportar
              </ButtonV2>
              <ButtonV2
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filtros
              </ButtonV2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <GlassCard key={index} variant="lighter">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

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
              <div className="h-64">
                <Chart
                  options={lineChartOptions}
                  series={lineChartSeries}
                  type="area"
                  height="100%"
                />
              </div>
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
              <div className="h-64">
                <Chart
                  options={donutChartOptions}
                  series={donutChartSeries}
                  type="donut"
                  height="100%"
                />
              </div>
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
              <ButtonV2 variant="ghost" size="sm" onClick={() => {}}>
                Ver todas
              </ButtonV2>
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