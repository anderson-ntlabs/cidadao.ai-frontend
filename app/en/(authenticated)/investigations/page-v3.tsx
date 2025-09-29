'use client'

import '@/styles/design-system/tokens/index.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, TrendingUp, AlertTriangle, FileSearch, 
  Calendar, ChevronRight, Download, Eye, Clock, 
  BarChart3, Shield, Zap, Target, Activity, Users,
  CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { BreadcrumbsV2 } from '@/components/breadcrumbs'

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

// Status das investigações
const statusConfig = {
  active: { 
    label: 'Em Andamento', 
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    icon: RefreshCw 
  },
  completed: { 
    label: 'Concluída', 
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle 
  },
  critical: { 
    label: 'Crítica', 
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    icon: XCircle 
  },
  pending: { 
    label: 'Pendente', 
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    icon: Clock 
  }
}

// Mock de dados de investigações
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

export default function InvestigacoesPageV3() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'confidence'>('date')
  const [investigations] = useState(mockInvestigations)
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar investigações
  const filteredInvestigations = investigations.filter(inv => {
    const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || inv.type === selectedType
    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Ordenar investigações
  const sortedInvestigations = [...filteredInvestigations].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.value - a.value
      case 'confidence':
        return b.confidence - a.confidence
      case 'date':
      default:
        return b.dateUpdated.getTime() - a.dateUpdated.getTime()
    }
  })

  // Estatísticas
  const stats = {
    total: investigations.length,
    critical: investigations.filter(i => i.status === 'critical').length,
    totalValue: investigations.reduce((sum, i) => sum + i.value, 0),
    avgConfidence: investigations.reduce((sum, i) => sum + i.confidence, 0) / investigations.length
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

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
        {/* Breadcrumbs */}
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home' },
            { label: 'Investigações', current: true }
          ]}
          className="mb-6"
        />
        
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
          <GlassCard variant="lighter">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Investigações</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <FileSearch className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="lighter">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Casos Críticos</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">{stats.critical}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="lighter">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total Investigado</p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    R$ {(stats.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="lighter">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confiança Média</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600">{stats.avgConfidence.toFixed(1)}%</p>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="value">Maior Valor</option>
                  <option value="confidence">Maior Confiança</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Investigations List */}
        <div className="space-y-4">
          {sortedInvestigations.map((investigation) => {
            const TypeIcon = investigationTypes[investigation.type as keyof typeof investigationTypes].icon
            const StatusIcon = statusConfig[investigation.status as keyof typeof statusConfig].icon

            return (
              <div
                key={investigation.id}
                onClick={() => router.push(`/pt/investigacoes/${investigation.id}`)}
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
                              {investigation.title}
                            </h3>
                            <span className="text-sm font-medium text-gray-500">
                              {investigation.id}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {investigation.description}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          investigationTypes[investigation.type as keyof typeof investigationTypes].color
                        )}>
                          <TypeIcon className="w-3 h-3" />
                          {investigationTypes[investigation.type as keyof typeof investigationTypes].label}
                        </span>
                        
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          statusConfig[investigation.status as keyof typeof statusConfig].color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[investigation.status as keyof typeof statusConfig].label}
                        </span>

                        {investigation.riskLevel === 'crítico' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            ⚠️ Risco Crítico
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Valor</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            R$ {(investigation.value / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Confiança</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {investigation.confidence}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Evidências</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {investigation.evidence} itens
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Atualizado</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {format(investigation.dateUpdated, 'dd/MM', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Department and Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{investigation.department}</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{investigation.location}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/pt/investigacoes/${investigation.id}`)
                          }}
                        >
                          Detalhes
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Download logic
                          }}
                        >
                          PDF
                        </Button>
                      </div>

                      {/* Agents */}
                      <div className="flex -space-x-2">
                        {investigation.agents.slice(0, 3).map((agent, idx) => (
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