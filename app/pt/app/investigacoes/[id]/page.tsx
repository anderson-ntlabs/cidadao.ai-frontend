'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  Share2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useBackendInvestigation } from '@/hooks/use-backend-investigations'
import { mockInvestigations, type MockInvestigation } from '@/data/investigations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnomalyChart } from '@/components/investigations/anomaly-chart'
import { ShareModal } from '@/components/investigations/share-modal'

/**
 * Investigation Detail Page
 *
 * Displays detailed information about a specific investigation
 * Integrates with Railway backend for real-time data
 * Falls back to mock data when backend returns empty
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface AnomalyResult {
  anomaly_id: string
  type: string
  severity: 'high' | 'medium' | 'low'
  confidence: number
  description: string
  explanation: string
  affected_records: Array<{
    id: string
    data: Record<string, any>
  }>
  suggested_actions: string[]
}

export default function InvestigationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const investigationId = params?.id as string

  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv' | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Try to fetch from backend
  const {
    investigation: backendInvestigation,
    results: backendResults,
    isLoading,
    refresh,
  } = useBackendInvestigation({
    investigationId,
    autoPoll: true,
    pollInterval: 2000,
  })

  // Find mock investigation as fallback
  const mockInvestigation = useMemo(() => {
    return mockInvestigations.find((inv: MockInvestigation) => inv.id === investigationId)
  }, [investigationId])

  // Use backend data or fallback to mock
  const useMockFallback = !backendInvestigation && !isLoading
  const investigation = backendInvestigation || mockInvestigation

  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Pendente',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: Clock,
    },
    running: {
      label: 'Em Andamento',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: RefreshCw,
    },
    active: {
      label: 'Em Andamento',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: RefreshCw,
    },
    completed: {
      label: 'Concluída',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      icon: CheckCircle,
    },
    failed: {
      label: 'Falhou',
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: XCircle,
    },
    cancelled: {
      label: 'Cancelada',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: XCircle,
    },
  }

  // Severity configuration
  const severityConfig = {
    high: {
      label: 'Alta',
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Média',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      icon: AlertTriangle,
    },
    low: {
      label: 'Baixa',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: AlertTriangle,
    },
  }

  // Handle export
  const handleExport = (format: 'pdf' | 'json' | 'csv') => {
    setExportFormat(format)

    try {
      if (format === 'json') {
        const data = JSON.stringify(
          {
            investigation,
            results: backendResults,
          },
          null,
          2
        )

        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `investigation-${investigationId}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Simple CSV export for anomalies
        const anomalies = backendResults?.results || []
        const csvRows = [
          ['ID', 'Type', 'Severity', 'Confidence', 'Description'].join(','),
          ...anomalies.map((a: AnomalyResult) =>
            [a.anomaly_id, a.type, a.severity, a.confidence, `"${a.description}"`].join(',')
          ),
        ]

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `investigation-${investigationId}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'pdf') {
        // PDF export would require a library like jsPDF
        // For now, just print to PDF
        window.print()
      }
    } finally {
      setExportFormat(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!investigation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Investigação não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            A investigação com ID {investigationId} não foi encontrada.
          </p>
          <Button onClick={() => router.push('/pt/app/investigacoes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Investigações
          </Button>
        </div>
      </div>
    )
  }

  // Extract data with fallbacks
  const invId = (investigation as any).investigation_id || (investigation as any).id
  const invTitle = (investigation as any).title || `Investigação ${invId?.slice(0, 8) || 'N/A'}`
  const invDescription =
    (investigation as any).current_phase || (investigation as any).description || 'Sem descrição'
  const invStatus = (investigation as any).status || 'pending'
  const invProgress =
    (investigation as any).progress !== undefined
      ? Math.round((investigation as any).progress * 100)
      : 0
  const invAnomalies =
    (investigation as any).anomalies_detected || (investigation as any).findings || 0
  const invRecords = (investigation as any).records_processed || 0
  const invCreatedAt = (investigation as any).created_at || (investigation as any).dateCreated
  const invCompletedAt = (investigation as any).completed_at || null

  const StatusIcon = statusConfig[invStatus as keyof typeof statusConfig]?.icon || Clock

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/pt/app/investigacoes')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={exportFormat !== null}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button variant="primary" size="sm" onClick={() => setIsShareModalOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Mock fallback indicator */}
        {useMockFallback && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Dados de exemplo</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Exibindo dados mockados. O backend não retornou investigações reais ainda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Investigation Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{invTitle}</h1>
              <p className="text-gray-600 dark:text-gray-400">{invDescription}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge className={statusConfig[invStatus as keyof typeof statusConfig]?.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[invStatus as keyof typeof statusConfig]?.label}
              </Badge>

              {invProgress > 0 && invProgress < 100 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {invProgress}% concluído
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {invProgress > 0 && invProgress < 100 && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${invProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                <Activity className="w-4 h-4" />
                Registros
              </div>
              <p className="text-xl font-semibold">{invRecords.toLocaleString('pt-BR')}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Anomalias
              </div>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">{invAnomalies}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Iniciada
              </div>
              <p className="text-sm font-medium">
                {invCreatedAt
                  ? format(
                      typeof invCreatedAt === 'string' ? parseISO(invCreatedAt) : invCreatedAt,
                      "dd 'de' MMM, yyyy",
                      { locale: ptBR }
                    )
                  : 'N/A'}
              </p>
            </div>

            {invCompletedAt && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Concluída
                </div>
                <p className="text-sm font-medium">
                  {format(parseISO(invCompletedAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Anomalies Section */}
        {backendResults?.results && backendResults.results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Anomalias Detectadas
            </h2>

            <div className="space-y-4">
              {backendResults.results.map((anomaly: AnomalyResult) => {
                const SeverityIcon = severityConfig[anomaly.severity]?.icon || AlertTriangle

                return (
                  <div
                    key={anomaly.anomaly_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityConfig[anomaly.severity]?.color}>
                            <SeverityIcon className="w-3 h-3 mr-1" />
                            {severityConfig[anomaly.severity]?.label}
                          </Badge>
                          <Badge variant="outline">{anomaly.type}</Badge>
                          <span className="text-sm text-gray-500">
                            Confiança: {Math.round(anomaly.confidence * 100)}%
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{anomaly.description}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {anomaly.explanation}
                        </p>
                      </div>
                    </div>

                    {anomaly.suggested_actions && anomaly.suggested_actions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium mb-2">Ações Sugeridas:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {anomaly.suggested_actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {anomaly.affected_records && anomaly.affected_records.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium mb-2">
                          Registros Afetados: {anomaly.affected_records.length}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Anomaly Visualizations */}
            {backendResults.results.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-6">Análise Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <AnomalyChart anomalies={backendResults.results} type="severity" />
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <AnomalyChart anomalies={backendResults.results} type="type" />
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <AnomalyChart anomalies={backendResults.results} type="confidence" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mock findings for fallback */}
        {useMockFallback && mockInvestigation && (mockInvestigation as any).findings > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Descobertas
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Esta investigação encontrou {(mockInvestigation as any).findings} possíveis
              irregularidades. Detalhes completos estarão disponíveis quando a análise for concluída
              pelo backend.
            </p>
          </div>
        )}

        {/* Summary Section */}
        {backendResults?.summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Resumo da Análise
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {backendResults.summary}
            </p>

            {backendResults.confidence_score !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Índice de Confiança
                  </span>
                  <span className="text-lg font-semibold">
                    {Math.round(backendResults.confidence_score * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${backendResults.confidence_score * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        investigationId={investigationId}
      />
    </div>
  )
}
