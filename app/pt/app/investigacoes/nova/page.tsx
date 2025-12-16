'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, CheckCircle, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateBackendInvestigation } from '@/hooks/use-backend-investigations'
import type { DataSource, AnomalyType } from '@/lib/api/investigation-adapter'

/**
 * Create Investigation Page
 *
 * Dedicated page for creating new investigations
 * Full-page experience with better UX than modal
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

const dataSourceOptions: Array<{
  value: DataSource
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'contracts',
    label: 'Contratos',
    description: 'Contratos públicos e licitações',
    icon: '📄',
  },
  {
    value: 'expenses',
    label: 'Despesas',
    description: 'Despesas e pagamentos governamentais',
    icon: '💰',
  },
  {
    value: 'agreements',
    label: 'Convênios',
    description: 'Convênios e acordos administrativos',
    icon: '🤝',
  },
  { value: 'biddings', label: 'Licitações', description: 'Processos licitatórios', icon: '⚖️' },
  {
    value: 'servants',
    label: 'Servidores',
    description: 'Folha de pagamento e servidores',
    icon: '👥',
  },
]

const anomalyTypeOptions: Array<{
  value: AnomalyType
  label: string
  description: string
  icon: string
}> = [
  { value: 'price', label: 'Preço', description: 'Superfaturamento e subvalorização', icon: '💵' },
  {
    value: 'vendor',
    label: 'Fornecedor',
    description: 'Padrões suspeitos em fornecedores',
    icon: '🏢',
  },
  {
    value: 'temporal',
    label: 'Temporal',
    description: 'Anomalias em períodos de tempo',
    icon: '⏰',
  },
  {
    value: 'payment',
    label: 'Pagamento',
    description: 'Irregularidades em pagamentos',
    icon: '💳',
  },
  {
    value: 'duplicate',
    label: 'Duplicação',
    description: 'Registros duplicados ou similares',
    icon: '📋',
  },
  { value: 'pattern', label: 'Padrão', description: 'Padrões estatísticos anormais', icon: '📊' },
]

export default function NovaInvestigacaoPage() {
  const router = useRouter()
  const { createAndTrack, investigation, isCreating, isPolling, error } =
    useCreateBackendInvestigation()

  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState<DataSource>('contracts')
  const [selectedAnomalyTypes, setSelectedAnomalyTypes] = useState<AnomalyType[]>([
    'price',
    'vendor',
    'temporal',
  ])
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
          end_date: endDate || undefined,
        },
        include_explanations: includeExplanations,
        stream_results: false,
      })

      // Success - redirect to investigation detail
      if (investigation?.investigation_id) {
        router.push(`/pt/app/investigacoes/${investigation.investigation_id}`)
      }
    } catch (err) {
      console.error('Failed to create investigation:', err)
    }
  }

  const toggleAnomalyType = (type: AnomalyType) => {
    setSelectedAnomalyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Success state
  if (investigation && !isPolling && !isCreating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Investigação Criada com Sucesso!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sua investigação foi criada e está sendo processada por nossos agentes de IA.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => router.push('/pt/app/investigacoes')}>
              Ver Todas
            </Button>
            <Button
              onClick={() => {
                if (investigation?.investigation_id) {
                  router.push(`/pt/app/investigacoes/${investigation.investigation_id}`)
                }
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/pt/app/investigacoes')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Investigações
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Nova Investigação</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Crie uma investigação com IA para detectar anomalias em dados públicos
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        {/* Query Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">O que você quer investigar?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Detectar anomalias em contratos de merenda escolar em São Paulo nos últimos 2 anos"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-lg"
              rows={4}
              required
              disabled={isCreating || isPolling}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            💡 Dica: Seja específico! Mencione período, localização e tipo de irregularidade que
            busca.
          </p>
        </div>

        {/* Data Source Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Fonte de Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSourceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDataSource(option.value)}
                disabled={isCreating || isPolling}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  dataSource === option.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                } disabled:opacity-50`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="font-semibold text-lg mb-1">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Anomaly Types Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Tipos de Anomalia a Detectar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {anomalyTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAnomalyType(option.value)}
                disabled={isCreating || isPolling}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAnomalyTypes.includes(option.value)
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } disabled:opacity-50`}
                title={option.description}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Selecione um ou mais tipos. Quanto mais específico, mais precisa a análise.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Filtros Opcionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium mb-2">Organização</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Ex: Secretaria de Educação"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isCreating || isPolling}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isCreating || isPolling}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isCreating || isPolling}
              />
            </div>
          </div>

          {/* Include Explanations */}
          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="include-explanations"
              checked={includeExplanations}
              onChange={(e) => setIncludeExplanations(e.target.checked)}
              disabled={isCreating || isPolling}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="include-explanations"
              className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Incluir explicações detalhadas das anomalias (recomendado)
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Erro ao criar investigação
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {(isCreating || isPolling) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  {isCreating ? 'Criando investigação...' : 'Processando...'}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Nossos agentes de IA estão trabalhando na sua solicitação
                </p>
              </div>
            </div>
            {investigation && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                  <span>{investigation.current_phase || 'Iniciando análise'}</span>
                  <span className="font-medium">{Math.round(investigation.progress * 100)}%</span>
                </div>
                <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                    style={{ width: `${investigation.progress * 100}%` }}
                  />
                </div>
                {investigation.anomalies_detected > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {investigation.anomalies_detected} anomalias detectadas até agora
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/pt/app/investigacoes')}
            disabled={isCreating || isPolling}
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!query.trim() || selectedAnomalyTypes.length === 0 || isCreating || isPolling}
            size="lg"
            className="flex-1"
          >
            {isCreating || isPolling ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isCreating ? 'Criando...' : 'Processando...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Criar Investigação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
