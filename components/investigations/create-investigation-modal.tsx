'use client'

import { useState } from 'react'
import { X, Search, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateBackendInvestigation } from '@/hooks/use-backend-investigations'
import { useRouter } from 'next/navigation'
import type { DataSource, AnomalyType } from '@/lib/api/investigation-adapter'

/**
 * Create Investigation Modal
 *
 * Modal form to create new investigations with backend integration
 * Supports query input, data source selection, and anomaly type filtering
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface CreateInvestigationModalProps {
  isOpen: boolean
  onClose: () => void
}

const dataSourceOptions: Array<{ value: DataSource; label: string; description: string }> = [
  { value: 'contracts', label: 'Contratos', description: 'Contratos públicos e licitações' },
  { value: 'expenses', label: 'Despesas', description: 'Despesas e pagamentos governamentais' },
  { value: 'agreements', label: 'Convênios', description: 'Convênios e acordos administrativos' },
  { value: 'biddings', label: 'Licitações', description: 'Processos licitatórios' },
  { value: 'servants', label: 'Servidores', description: 'Folha de pagamento e servidores' }
]

const anomalyTypeOptions: Array<{ value: AnomalyType; label: string; description: string }> = [
  { value: 'price', label: 'Preço', description: 'Superfaturamento e subvalorização' },
  { value: 'vendor', label: 'Fornecedor', description: 'Padrões suspeitos em fornecedores' },
  { value: 'temporal', label: 'Temporal', description: 'Anomalias em períodos de tempo' },
  { value: 'payment', label: 'Pagamento', description: 'Irregularidades em pagamentos' },
  { value: 'duplicate', label: 'Duplicação', description: 'Registros duplicados ou similares' },
  { value: 'pattern', label: 'Padrão', description: 'Padrões estatísticos anormais' }
]

export function CreateInvestigationModal({ isOpen, onClose }: CreateInvestigationModalProps) {
  const router = useRouter()
  const { createAndTrack, investigation, isCreating, isPolling, error } = useCreateBackendInvestigation()

  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState<DataSource>('contracts')
  const [selectedAnomalyTypes, setSelectedAnomalyTypes] = useState<AnomalyType[]>(['price', 'vendor', 'temporal'])
  const [organization, setOrganization] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeExplanations, setIncludeExplanations] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      return
    }

    try {
      await createAndTrack({
        query: query.trim(),
        data_source: dataSource,
        anomaly_types: selectedAnomalyTypes,
        filters: {
          organization: organization || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        },
        include_explanations: includeExplanations,
        stream_results: false
      })

      // Success - redirect to investigation detail
      if (investigation?.investigation_id) {
        router.push(`/pt/app/investigacoes/${investigation.investigation_id}`)
        onClose()
      }
    } catch (err) {
      console.error('Failed to create investigation:', err)
    }
  }

  const toggleAnomalyType = (type: AnomalyType) => {
    setSelectedAnomalyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (!isOpen) return null

  // Success state
  if (investigation && !isPolling && !isCreating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Investigação Criada!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sua investigação foi criada e está sendo processada.
            </p>
            <Button
              onClick={() => {
                if (investigation?.investigation_id) {
                  router.push(`/pt/app/investigacoes/${investigation.investigation_id}`)
                }
                onClose()
              }}
            >
              Ver Investigação
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Nova Investigação</h2>
          <button
            onClick={onClose}
            disabled={isCreating || isPolling}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              O que você quer investigar? *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Detectar anomalias em contratos de merenda escolar em São Paulo"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                required
                disabled={isCreating || isPolling}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Descreva em linguagem natural o que você deseja investigar
            </p>
          </div>

          {/* Data Source Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fonte de Dados *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dataSourceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDataSource(option.value)}
                  disabled={isCreating || isPolling}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    dataSource === option.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } disabled:opacity-50`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Anomaly Types */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipos de Anomalia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {anomalyTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAnomalyType(option.value)}
                  disabled={isCreating || isPolling}
                  className={`p-3 border rounded-lg text-sm transition-all ${
                    selectedAnomalyTypes.includes(option.value)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } disabled:opacity-50`}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Selecione os tipos de anomalias que deseja detectar
            </p>
          </div>

          {/* Filters */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-3">Filtros Opcionais</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organization */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Organização
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Ex: Secretaria de Educação"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isCreating || isPolling}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isCreating || isPolling}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isCreating || isPolling}
                />
              </div>
            </div>
          </div>

          {/* Include Explanations */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include-explanations"
              checked={includeExplanations}
              onChange={(e) => setIncludeExplanations(e.target.checked)}
              disabled={isCreating || isPolling}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="include-explanations" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Incluir explicações detalhadas das anomalias
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erro ao criar investigação
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {/* Progress Display */}
          {(isCreating || isPolling) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {isCreating ? 'Criando investigação...' : 'Processando...'}
                </p>
              </div>
              {investigation && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
                    <span>{investigation.current_phase || 'Iniciando'}</span>
                    <span>{Math.round(investigation.progress * 100)}%</span>
                  </div>
                  <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${investigation.progress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isCreating || isPolling}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!query.trim() || isCreating || isPolling}
              className="flex-1"
            >
              {isCreating || isPolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Criar Investigação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
