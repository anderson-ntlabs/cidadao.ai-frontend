'use client'

import { useMemo } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, Activity, BarChart3, Clock } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { useBackendInvestigations } from '@/hooks/use-backend-investigations'
import type { InvestigationStatusResponse } from '@/lib/api/investigation-adapter'

/**
 * Investigation Analytics Component
 *
 * Displays aggregated statistics and trends from all investigations
 * Real-time data from backend with auto-refresh
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface AnalyticsMetrics {
  total: number
  running: number
  completed: number
  failed: number
  totalAnomalies: number
  totalRecords: number
  avgProgress: number
  successRate: number
  avgAnomaliesPerInvestigation: number
  activeInvestigations: InvestigationStatusResponse[]
}

export function InvestigationAnalytics() {
  const { investigations, isLoading } = useBackendInvestigations({
    autoRefresh: true,
    refreshInterval: 5000
  })

  const metrics = useMemo((): AnalyticsMetrics => {
    const total = investigations.length
    const running = investigations.filter(i => i.status === 'running' || i.status === 'pending').length
    const completed = investigations.filter(i => i.status === 'completed').length
    const failed = investigations.filter(i => i.status === 'failed' || i.status === 'cancelled').length

    const totalAnomalies = investigations.reduce((sum, i) => sum + i.anomalies_detected, 0)
    const totalRecords = investigations.reduce((sum, i) => sum + i.records_processed, 0)

    const avgProgress = investigations.length > 0
      ? investigations.reduce((sum, i) => sum + i.progress, 0) / investigations.length * 100
      : 0

    const successRate = total > 0 ? (completed / total) * 100 : 0
    const avgAnomaliesPerInvestigation = completed > 0 ? totalAnomalies / completed : 0

    const activeInvestigations = investigations
      .filter(i => i.status === 'running' || i.status === 'pending')
      .sort((a, b) => b.progress - a.progress)

    return {
      total,
      running,
      completed,
      failed,
      totalAnomalies,
      totalRecords,
      avgProgress: Math.round(avgProgress),
      successRate: Math.round(successRate),
      avgAnomaliesPerInvestigation: Math.round(avgAnomaliesPerInvestigation),
      activeInvestigations
    }
  }, [investigations])

  if (isLoading && investigations.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investigations */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total de Investigações
                </p>
                <p className="text-3xl font-bold">{metrics.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {metrics.running} em andamento
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Total Anomalies */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Anomalias Detectadas
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {metrics.totalAnomalies}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Média: {metrics.avgAnomaliesPerInvestigation} por investigação
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Success Rate */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Taxa de Sucesso
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {metrics.successRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {metrics.completed} concluídas / {metrics.failed} falhas
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Records Processed */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Registros Analisados
                </p>
                <p className="text-3xl font-bold">
                  {metrics.totalRecords.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Processados com IA
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Active Investigations List */}
      {metrics.activeInvestigations.length > 0 && (
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">Investigações em Andamento</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                {metrics.activeInvestigations.length}
              </span>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="p-6">
            <div className="space-y-4">
              {metrics.activeInvestigations.slice(0, 5).map((inv) => {
                const invId = inv.investigation_id.slice(0, 8)
                const progress = Math.round(inv.progress * 100)

                return (
                  <div
                    key={inv.investigation_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                            {invId}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            inv.status === 'running'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}>
                            {inv.status === 'running' ? 'Em Andamento' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {inv.current_phase || 'Iniciando...'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{progress}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {inv.anomalies_detected} anomalias
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {metrics.activeInvestigations.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                + {metrics.activeInvestigations.length - 5} investigações adicionais
              </p>
            )}
          </GlassCardContent>
        </GlassCard>
      )}

      {/* Trends Chart Placeholder */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">Tendências</h3>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="p-6">
          <div className="space-y-3">
            {/* Anomaly Detection Rate */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Taxa de Detecção</span>
                <span className="font-medium">{metrics.avgAnomaliesPerInvestigation} anomalias/inv</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                  style={{ width: `${Math.min(metrics.avgAnomaliesPerInvestigation * 5, 100)}%` }}
                />
              </div>
            </div>

            {/* Average Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progresso Médio</span>
                <span className="font-medium">{metrics.avgProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${metrics.avgProgress}%` }}
                />
              </div>
            </div>

            {/* Success Rate Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Taxa de Sucesso</span>
                <span className="font-medium">{metrics.successRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${metrics.successRate}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
