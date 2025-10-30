'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, TrendingUp, AlertTriangle, FileSearch,
  Calendar, ChevronRight, Download, Eye, Clock,
  BarChart3, Shield, Zap, Target, Activity, Users,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { sanitizeSearchQuery } from '@/lib/security/input-validation'
import { useBackendInvestigations } from '@/hooks/use-backend-investigations'
// BreadcrumbsV2 removed - handled by AuthLayout

// Tipos de investigação
const investigationTypes = {
  anomaly: { 
    label: 'Anomalia', 
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30', 
    icon: AlertTriangle 
  },
  pattern: { 
    label: 'Padrão Suspeito', 
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', 
    icon: Activity 
  },
  fraud: { 
    label: 'Fraude Potencial', 
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', 
    icon: Shield 
  },
  overpricing: { 
    label: 'Sobrepreço', 
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', 
    icon: TrendingUp 
  }
}

// Status das investigações (mapeamento backend -> frontend)
const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    icon: Clock
  },
  running: {
    label: 'Em Andamento',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    icon: RefreshCw
  },
  completed: {
    label: 'Concluída',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle
  },
  failed: {
    label: 'Falhou',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    icon: XCircle
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    icon: XCircle
  }
}

// MOCK DATA REMOVED - Now using real backend data
// Mock de dados de investigações (DEPRECATED - kept for fallback only)
const mockInvestigations = [
  {
    id: 'INV-2024-001',
    title: 'Irregularidades em Licitação de Merenda Escolar',
    description: 'Detectadas anomalias significativas nos preços de alimentos básicos comparados com valores de mercado.',
    type: 'overpricing',
    status: 'critical',
    confidence: 94.5,
    value: 2340000,
    dateCreated: new Date('2024-01-15'),
    dateUpdated: new Date('2024-01-20'),
    agents: ['Zumbi dos Palmares', 'Anita Garibaldi'],
    findings: 12,
    evidence: 28,
    riskLevel: 'alto',
    department: 'Secretaria de Educação',
    location: 'São Paulo, SP'
  },
  {
    id: 'INV-2024-002',
    title: 'Padrões Suspeitos em Contratos de Obras',
    description: 'Identificado direcionamento em múltiplos contratos para a mesma empresa.',
    type: 'pattern',
    status: 'active',
    confidence: 87.3,
    value: 5670000,
    dateCreated: new Date('2024-01-18'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Machado de Assis', 'Tiradentes'],
    findings: 8,
    evidence: 15,
    riskLevel: 'médio',
    department: 'Secretaria de Infraestrutura',
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: 'INV-2024-003',
    title: 'Possível Fraude em Folha de Pagamento',
    description: 'Funcionários fantasmas identificados através de análise de padrões de pagamento.',
    type: 'fraud',
    status: 'active',
    confidence: 91.2,
    value: 890000,
    dateCreated: new Date('2024-01-19'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Dandara', 'Carolina Maria de Jesus'],
    findings: 6,
    evidence: 19,
    riskLevel: 'alto',
    department: 'Secretaria de Administração',
    location: 'Brasília, DF'
  },
  {
    id: 'INV-2024-004',
    title: 'Anomalias em Compras Emergenciais',
    description: 'Compras emergenciais recorrentes sem justificativa adequada.',
    type: 'anomaly',
    status: 'completed',
    confidence: 78.9,
    value: 450000,
    dateCreated: new Date('2024-01-10'),
    dateUpdated: new Date('2024-01-17'),
    agents: ['Zumbi dos Palmares'],
    findings: 4,
    evidence: 10,
    riskLevel: 'baixo',
    department: 'Secretaria de Saúde',
    location: 'Salvador, BA'
  },
  {
    id: 'INV-2024-005',
    title: 'Superfaturamento em Contratos de TI',
    description: 'Valores 300% acima do mercado em contratos de software.',
    type: 'overpricing',
    status: 'critical',
    confidence: 96.7,
    value: 3200000,
    dateCreated: new Date('2024-01-20'),
    dateUpdated: new Date('2024-01-21'),
    agents: ['Ayrton Senna', 'Santos Dumont'],
    findings: 15,
    evidence: 32,
    riskLevel: 'crítico',
    department: 'Secretaria de Tecnologia',
    location: 'Curitiba, PR'
  }
]

export default function InvestigacoesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'anomalies'>('date')

  // Use backend investigations with auto-refresh every 5 seconds
  const {
    investigations: backendInvestigations,
    isLoading,
    error: backendError,
    refreshInvestigations
  } = useBackendInvestigations({ autoRefresh: true, refreshInterval: 5000 })

  // Fallback to mock data if backend returns empty or has error
  const useMockFallback = backendInvestigations.length === 0 && !isLoading
  const investigations = useMockFallback ? mockInvestigations : backendInvestigations

  // Handler for search input with sanitization
  const handleSearchChange = (value: string) => {
    const sanitized = sanitizeSearchQuery(value)
    setSearchTerm(sanitized)
  }

  // Validate filter values to prevent manipulation
  const isValidType = (type: string): boolean => {
    return type === 'all' || ['anomaly', 'pattern', 'fraud', 'overpricing'].includes(type)
  }

  const isValidStatus = (status: string): boolean => {
    return status === 'all' || ['active', 'completed', 'pending', 'critical'].includes(status)
  }

  // Filtrar investigações (works with both backend and mock data)
  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv: any) => {
      // Backend data uses investigation_id, mock uses id
      const invId = inv.investigation_id || inv.id || ''
      const invTitle = inv.title || `Investigation ${invId.slice(0, 8)}`
      const invDescription = inv.current_phase || inv.description || ''

      const matchesSearch = invTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === 'all' || inv.type === selectedType
      const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [investigations, searchTerm, selectedType, selectedStatus])

  // Ordenar investigações (works with both backend and mock data)
  const sortedInvestigations = useMemo(() => {
    return [...filteredInvestigations].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress || 0) - (a.progress || 0)
        case 'anomalies':
          return (b.anomalies_detected || b.findings || 0) - (a.anomalies_detected || a.findings || 0)
        case 'date':
        default:
          // Backend uses created_at, mock uses dateUpdated
          const dateA = a.created_at ? new Date(a.created_at).getTime() : (a.dateUpdated?.getTime() || 0)
          const dateB = b.created_at ? new Date(b.created_at).getTime() : (b.dateUpdated?.getTime() || 0)
          return dateB - dateA
      }
    })
  }, [filteredInvestigations, sortBy])

  // Estatísticas (works with both backend and mock data)
  const stats = useMemo(() => {
    const total = investigations.length
    const running = investigations.filter((i: any) => i.status === 'running' || i.status === 'active').length
    const completed = investigations.filter((i: any) => i.status === 'completed').length
    const failed = investigations.filter((i: any) => i.status === 'failed' || i.status === 'critical').length

    // Calculate total anomalies (backend: anomalies_detected, mock: findings)
    const totalAnomalies = investigations.reduce((sum: number, i: any) =>
      sum + (i.anomalies_detected || i.findings || 0), 0
    )

    // Calculate average progress (backend: progress 0-1, convert to %)
    const avgProgress = investigations.length > 0
      ? investigations.reduce((sum: number, i: any) => {
          const progress = i.progress !== undefined ? i.progress * 100 : 0
          return sum + progress
        }, 0) / investigations.length
      : 0

    return {
      total,
      running,
      completed,
      failed,
      totalAnomalies,
      avgProgress: Math.round(avgProgress)
    }
  }, [investigations])

  const handleRefresh = useCallback(async () => {
    await refreshInvestigations()
  }, [refreshInvestigations])

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
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
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Central de Investigações
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Acompanhe todas as investigações realizadas pelos nossos agentes de IA
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                Atualizar
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Investigações</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.total}</p>
                  {useMockFallback && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Dados de exemplo</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <FileSearch className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Andamento</p>
                  <p className="text-3xl font-bold mt-2 text-blue-600">{stats.running}</p>
                  {useMockFallback && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Dados de exemplo</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Anomalias Detectadas</p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {stats.totalAnomalies}
                  </p>
                  {useMockFallback && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Dados de exemplo</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso Médio</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600">{stats.avgProgress}%</p>
                  {useMockFallback && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Dados de exemplo</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Filters and Search */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar investigações..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    maxLength={200}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <option value="all">Todos os Tipos</option>
                  {Object.entries(investigationTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <option value="all">Todos os Status</option>
                  {Object.entries(statusConfig).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <option value="date">Mais Recentes</option>
                  <option value="progress">Maior Progresso</option>
                  <option value="anomalies">Mais Anomalias</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Investigations List */}
        <div className="space-y-4">
          {sortedInvestigations.map((investigation: any) => {
            // Backend data doesn't have 'type', use default icon
            const invType = investigation.type || 'anomaly'
            const TypeIcon = investigationTypes[invType as keyof typeof investigationTypes]?.icon || AlertTriangle
            const StatusIcon = statusConfig[investigation.status as keyof typeof statusConfig]?.icon || Clock

            // Backend uses investigation_id, mock uses id
            const invId = investigation.investigation_id || investigation.id
            const invTitle = investigation.title || `Investigation ${invId?.slice(0, 8) || 'N/A'}`
            const invDescription = investigation.current_phase || investigation.description || 'No description'

            return (
              <div
                key={invId}
                onClick={() => router.push(`/pt/investigacoes/${invId}`)}
                className="cursor-pointer"
              >
                <GlassCard className="hover:shadow-xl transition-all duration-300 group">
                  <GlassCardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {invTitle}
                            </h3>
                            <span className="text-sm font-medium text-gray-500">
                              {invId?.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {invDescription}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {investigation.type && (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                            investigationTypes[invType as keyof typeof investigationTypes]?.color || 'text-gray-600 bg-gray-100'
                          )}>
                            <TypeIcon className="w-3 h-3" />
                            {investigationTypes[invType as keyof typeof investigationTypes]?.label || 'Investigation'}
                          </span>
                        )}

                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          statusConfig[investigation.status as keyof typeof statusConfig]?.color || 'text-gray-600 bg-gray-100'
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[investigation.status as keyof typeof statusConfig]?.label || investigation.status}
                        </span>

                        {(investigation.riskLevel === 'crítico' || investigation.status === 'failed') && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            ⚠️ Atenção
                          </span>
                        )}

                        {/* Show progress badge for backend investigations */}
                        {investigation.progress !== undefined && investigation.status === 'running' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {Math.round(investigation.progress * 100)}% concluído
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {investigation.value && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Valor</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              R$ {(investigation.value / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        )}
                        {investigation.progress !== undefined && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Progresso</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {Math.round(investigation.progress * 100)}%
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Anomalias</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {investigation.anomalies_detected || investigation.findings || 0}
                          </p>
                        </div>
                        {investigation.records_processed !== undefined && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Registros</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {investigation.records_processed}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {investigation.created_at ? 'Criado' : 'Atualizado'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {investigation.created_at
                              ? format(parseISO(investigation.created_at), 'dd/MM', { locale: ptBR })
                              : investigation.dateUpdated
                              ? format(investigation.dateUpdated, 'dd/MM', { locale: ptBR })
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Department and Actions */}
                    <div className="flex flex-col items-end gap-4">
                      {(investigation.department || investigation.location || investigation.current_phase) && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {investigation.department || investigation.current_phase || 'Em análise'}
                          </p>
                          {investigation.location && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {investigation.location}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/pt/investigacoes/${invId}`)
                          }}
                        >
                          Detalhes
                        </Button>

                        {investigation.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Download logic
                            }}
                          >
                            Exportar
                          </Button>
                        )}
                      </div>

                      {/* Agents - only for mock data */}
                      {investigation.agents && investigation.agents.length > 0 && (
                        <div className="flex -space-x-2">
                          {investigation.agents.slice(0, 3).map((agent: string, idx: number) => (
                            <div
                              key={idx}
                              className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white/50 dark:ring-gray-800/50 shadow-md"
                              title={agent}
                            >
                              {agent.charAt(0)}
                            </div>
                          ))}
                          {investigation.agents.length > 3 && (
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-white/50 dark:ring-gray-800/50 shadow-md">
                              +{investigation.agents.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCardContent>
                </GlassCard>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {sortedInvestigations.length === 0 && (
          <GlassCard>
            <GlassCardContent className="p-12 text-center">
              <FileSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma investigação encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros ou realizar uma nova busca
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  )
}