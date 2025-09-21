'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { 
  FileSearch, AlertTriangle, TrendingUp, Users, 
  Activity, DollarSign, Calendar, Filter,
  Download, RefreshCw
} from 'lucide-react'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ButtonV2 } from '@/components/ui/button-v2'
import { 
  CardV2, 
  CardV2Header, 
  CardV2Title, 
  CardV2Content, 
  CardV2Badge,
  CardV2Stat
} from '@/components/ui/card-v2'
import { Tabs, TabsList, TabsTrigger, TabsContent, Dropdown } from '@/components/ui'
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useExport } from '@/hooks/use-export'
import { useOnboarding } from '@/hooks/use-onboarding'
import { OnboardingFlow } from '@/components/onboarding'
import { GuidedTour } from '@/components/tour/guided-tour'

// Design system chart colors - using CSS variable values directly
const chartColors = {
  primary: '#16a34a',    // brand-green-600
  secondary: '#2563eb',  // brand-blue-600
  accent: '#ca8a04',     // brand-yellow-600
  danger: '#dc2626',     // brand-red-600
  success: '#22c55e',    // brand-green-500
  warning: '#eab308',    // brand-yellow-500
  purple: '#9333ea',     // brand-purple-600
  gray: '#4b5563'        // gray-600
}

// Mock data generators
const generateTimeSeriesData = (days: number) => {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i)
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      investigacoes: Math.floor(Math.random() * 20) + 10,
      anomalias: Math.floor(Math.random() * 10) + 2,
      relatorios: Math.floor(Math.random() * 15) + 5,
      alertas: Math.floor(Math.random() * 8) + 1
    })
  }
  
  return data
}

const generateCategoryData = () => [
  { name: 'Licitações', value: 234, anomalias: 12 },
  { name: 'Contratos', value: 189, anomalias: 8 },
  { name: 'Folha de Pagamento', value: 156, anomalias: 15 },
  { name: 'Despesas', value: 98, anomalias: 5 },
  { name: 'Convênios', value: 76, anomalias: 3 }
]

const generateAnomalyTypeData = () => [
  { name: 'Sobrepreço', value: 45, color: chartColors.danger },
  { name: 'Duplicação', value: 28, color: chartColors.warning },
  { name: 'Fracionamento', value: 22, color: chartColors.secondary },
  { name: 'Direcionamento', value: 18, color: chartColors.purple },
  { name: 'Outros', value: 12, color: chartColors.gray }
]

const generateAgentPerformanceData = () => [
  { agent: 'Zumbi dos Palmares', investigacoes: 89, precisao: 94 },
  { agent: 'Anita Garibaldi', investigacoes: 76, precisao: 91 },
  { agent: 'Machado de Assis', investigacoes: 65, precisao: 88 },
  { agent: 'Tiradentes', investigacoes: 54, precisao: 92 },
  { agent: 'Dandara', investigacoes: 43, precisao: 95 }
]

// Chart Card Component using CardV2
function ChartCard({ title, description, children, onRefresh, isLoading }: any) {
  return (
    <CardV2 variant="elevated" className="bg-white/90 dark:bg-gray-900/90">
      <CardV2Header>
        <div className="flex items-start justify-between">
          <div>
            <CardV2Title className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{title}</CardV2Title>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {onRefresh && (
            <ButtonV2
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </ButtonV2>
          )}
        </div>
      </CardV2Header>
      <CardV2Content>
        {children}
      </CardV2Content>
    </CardV2>
  )
}

export default function DashboardPageV2() {
  const [user, setUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('7days')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState('overview')
  
  const { isExporting, exportToCSV, exportDashboardToPDF, exportFinancialReport } = useExport()
  const { 
    shouldShowOnboarding, 
    shouldShowTour, 
    completeOnboarding, 
    completeTour, 
    startTour 
  } = useOnboarding()
  
  // Generate mock data
  const timeSeriesData = generateTimeSeriesData(timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90)
  const categoryData = generateCategoryData()
  const anomalyTypeData = generateAnomalyTypeData()
  const agentPerformanceData = generateAgentPerformanceData()

  // Calculate statistics
  const totalInvestigations = timeSeriesData.reduce((sum, day) => sum + day.investigacoes, 0)
  const totalAnomalies = timeSeriesData.reduce((sum, day) => sum + day.anomalias, 0)
  const totalReports = timeSeriesData.reduce((sum, day) => sum + day.relatorios, 0)
  const averagePrecision = 91.8

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLastUpdate(new Date())
    setIsLoading(false)
  }

  const handleExportCSV = () => {
    const dataMap: Record<string, any[]> = {
      overview: [...timeSeriesData],
      anomalies: [...anomalyTypeData],
      agents: [...agentPerformanceData],
      financial: timeSeriesData.map((day, index) => ({
        ...day,
        economia: Math.floor(Math.random() * 500000) + 100000,
        economiaAcumulada: (index + 1) * 150000
      }))
    }

    const currentData = dataMap[selectedTab] || timeSeriesData
    exportToCSV(currentData, `dashboard-${selectedTab}-${format(new Date(), 'yyyy-MM-dd')}.csv`)
  }

  const handleExportPDF = async () => {
    // Get all chart elements
    const chartElements = document.querySelectorAll('.recharts-wrapper')
    const charts = Array.from(chartElements).map(el => el.parentElement as HTMLElement).filter(Boolean)

    const metrics = {
      'Investigações Totais': formatNumber(totalInvestigations),
      'Anomalias Detectadas': formatNumber(totalAnomalies),
      'Economia Identificada': formatCurrency(4570000),
      'Precisão do Sistema': `${averagePrecision}%`,
      'Período': timeRange === '7days' ? 'Últimos 7 dias' : timeRange === '30days' ? 'Últimos 30 dias' : 'Últimos 90 dias'
    }

    await exportDashboardToPDF(charts, metrics, {
      filename: `dashboard-cidadao-ai-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      title: 'Dashboard de Transparência - Cidadão.AI',
      subtitle: `Relatório gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
    })
  }

  const handleExportFinancial = async () => {
    const financialData = {
      totalInvestigated: 45700000,
      totalSavings: 4570000,
      recoveryRate: 19.5,
      suspiciousContracts: [
        { id: 'CTR-2024-001', value: 2340000, risk: 'alto', date: new Date() },
        { id: 'CTR-2024-045', value: 1890000, risk: 'alto', date: new Date() },
        { id: 'CTR-2024-089', value: 980000, risk: 'médio', date: new Date() }
      ],
      monthlyData: timeSeriesData
    }

    const chartElements = document.querySelectorAll('.recharts-wrapper')
    const charts = Array.from(chartElements).map(el => el.parentElement as HTMLElement).filter(Boolean)

    await exportFinancialReport(financialData, charts, {
      filename: `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <>
      <LoadingScreen />
      
      {shouldShowOnboarding && (
        <OnboardingFlow 
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
      )}
      
      {shouldShowTour && (
        <GuidedTour 
          isOpen={shouldShowTour}
          onClose={completeTour}
        />
      )}
      
      <div className="min-h-screen relative">
        {/* Background Image - Operários */}
        <div 
          className="fixed inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `url('/operarios.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Content wrapper */}
        <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Breadcrumbs items={[{ label: 'Dashboard Analítico' }]} />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent mt-2">
                  Dashboard de Transparência
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-sm"
                >
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                </select>
                
                <ButtonV2
                  variant="secondary"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </ButtonV2>
                
                <Dropdown
                  trigger={
                    <ButtonV2 disabled={isExporting} data-tour="export-button">
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exportando...' : 'Exportar'}
                    </ButtonV2>
                  }
                >
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    Exportar como CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Dashboard (PDF)
                  </button>
                  {selectedTab === 'financial' && (
                    <button
                      onClick={handleExportFinancial}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Relatório Financeiro (PDF)
                    </button>
                  )}
                </Dropdown>
              </div>
            </div>
            
            {/* Last Update */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Última atualização: {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Key Metrics - Using CardV2Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="dashboard-overview">
            <CardV2Stat
              title="Investigações Totais"
              value={formatNumber(totalInvestigations)}
              description="no período selecionado"
              trend={{ value: 12, isPositive: true }}
              icon={<FileSearch className="w-5 h-5 text-blue-600" />}
            />
            
            <CardV2Stat
              title="Anomalias Detectadas"
              value={formatNumber(totalAnomalies)}
              description="redução é positiva"
              trend={{ value: 8, isPositive: false }}
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            />
            
            <CardV2Stat
              title="Economia Identificada"
              value={formatCurrency(4570000)}
              description="em recursos públicos"
              trend={{ value: 25, isPositive: true }}
              icon={<DollarSign className="w-5 h-5 text-green-600" />}
            />
            
            <CardV2Stat
              title="Precisão do Sistema"
              value={`${averagePrecision}%`}
              description="média dos agentes"
              trend={{ value: 2.3, isPositive: true }}
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            />
          </div>

          {/* Main Charts */}
          <Tabs 
            defaultValue="overview" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
              <TabsTrigger value="agents">Agentes</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Atividade ao Longo do Tempo"
                  description="Investigações, anomalias e relatórios"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <AreaChart
                    data={timeSeriesData}
                    areas={[
                      { dataKey: 'investigacoes', name: 'Investigações', color: chartColors.primary },
                      { dataKey: 'anomalias', name: 'Anomalias', color: chartColors.danger },
                      { dataKey: 'relatorios', name: 'Relatórios', color: chartColors.success }
                    ]}
                    xAxisKey="date"
                    xAxisType="date"
                    height={300}
                  />
                </ChartCard>

                <ChartCard
                  title="Investigações por Categoria"
                  description="Distribuição por tipo de processo"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <BarChart
                    data={categoryData}
                    bars={[
                      { dataKey: 'value', name: 'Investigações', color: chartColors.secondary },
                      { dataKey: 'anomalias', name: 'Anomalias', color: chartColors.danger }
                    ]}
                    xAxisKey="name"
                    height={300}
                  />
                </ChartCard>
              </div>

              <ChartCard
                title="Tendência de Alertas"
                description="Evolução dos alertas críticos ao longo do período"
                onRefresh={handleRefresh}
                isLoading={isLoading}
              >
                <LineChart
                  data={timeSeriesData}
                  lines={[
                    { dataKey: 'alertas', name: 'Alertas Críticos', color: chartColors.warning }
                  ]}
                  xAxisKey="date"
                  xAxisType="date"
                  height={250}
                />
              </ChartCard>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Tipos de Anomalias"
                  description="Distribuição por categoria"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <PieChart
                    data={anomalyTypeData}
                    height={300}
                    innerRadius={60}
                  />
                </ChartCard>

                <ChartCard
                  title="Anomalias por Órgão"
                  description="Top 5 órgãos com mais anomalias"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <BarChart
                    data={[
                      { orgao: 'Sec. Saúde', anomalias: 23 },
                      { orgao: 'Sec. Educação', anomalias: 18 },
                      { orgao: 'Sec. Obras', anomalias: 15 },
                      { orgao: 'Sec. Transportes', anomalias: 12 },
                      { orgao: 'Sec. Cultura', anomalias: 8 }
                    ]}
                    bars={[
                      { dataKey: 'anomalias', name: 'Anomalias', color: chartColors.danger }
                    ]}
                    xAxisKey="orgao"
                    orientation="horizontal"
                    height={300}
                  />
                </ChartCard>
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-6" data-tour="agents-section">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Performance dos Agentes"
                  description="Investigações concluídas por agente"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <BarChart
                    data={agentPerformanceData}
                    bars={[
                      { dataKey: 'investigacoes', name: 'Investigações', color: chartColors.success },
                      { dataKey: 'precisao', name: 'Precisão (%)', color: chartColors.purple }
                    ]}
                    xAxisKey="agent"
                    height={300}
                  />
                </ChartCard>

                <ChartCard
                  title="Taxa de Precisão por Agente"
                  description="Percentual de acerto nas análises"
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                >
                  <LineChart
                    data={agentPerformanceData}
                    lines={[
                      { dataKey: 'precisao', name: 'Precisão (%)', color: chartColors.purple }
                    ]}
                    xAxisKey="agent"
                    height={300}
                  />
                </ChartCard>
              </div>

              {/* Agent Status Cards - Using CardV2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardV2>
                  <CardV2Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Agentes Ativos</p>
                        <p className="text-2xl font-bold">17</p>
                      </div>
                      <CardV2Badge variant="success">Operacional</CardV2Badge>
                    </div>
                  </CardV2Content>
                </CardV2>
                
                <CardV2>
                  <CardV2Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Em Investigação</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <div className="animate-pulse w-3 h-3 bg-brand-yellow-500 rounded-full"></div>
                    </div>
                  </CardV2Content>
                </CardV2>
                
                <CardV2>
                  <CardV2Content className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tempo Médio</p>
                        <p className="text-2xl font-bold">2.3h</p>
                      </div>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardV2Content>
                </CardV2>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <ChartCard
                title="Economia Acumulada"
                description="Recursos públicos economizados através das investigações"
                onRefresh={handleRefresh}
                isLoading={isLoading}
              >
                <AreaChart
                  data={timeSeriesData.map((day, index) => ({
                    ...day,
                    economia: Math.floor(Math.random() * 500000) + 100000,
                    economiaAcumulada: (index + 1) * 150000
                  }))}
                  areas={[
                    { dataKey: 'economia', name: 'Economia Diária', color: chartColors.success, stackId: 'stack' },
                    { dataKey: 'economiaAcumulada', name: 'Acumulado', color: chartColors.primary }
                  ]}
                  xAxisKey="date"
                  xAxisType="date"
                  yAxisFormatter={formatCurrency}
                  height={350}
                />
              </ChartCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardV2 className="bg-white/90 dark:bg-gray-900/90">
                  <CardV2Header>
                    <CardV2Title>Top 5 Contratos Suspeitos</CardV2Title>
                  </CardV2Header>
                  <CardV2Content className="space-y-3">
                    {[
                      { contrato: 'CTR-2024-001', valor: 2340000, risco: 'alto' },
                      { contrato: 'CTR-2024-045', valor: 1890000, risco: 'alto' },
                      { contrato: 'CTR-2024-089', valor: 980000, risco: 'médio' },
                      { contrato: 'CTR-2024-123', valor: 670000, risco: 'médio' },
                      { contrato: 'CTR-2024-156', valor: 450000, risco: 'baixo' }
                    ].map((item) => (
                      <div key={item.contrato} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.contrato}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.valor)}</p>
                        </div>
                        <CardV2Badge variant={
                          item.risco === 'alto' ? 'danger' : 
                          item.risco === 'médio' ? 'warning' : 
                          'info'
                        }>
                          Risco {item.risco}
                        </CardV2Badge>
                      </div>
                    ))}
                  </CardV2Content>
                </CardV2>

                <CardV2 className="bg-white/90 dark:bg-gray-900/90">
                  <CardV2Header>
                    <CardV2Title>Resumo Financeiro</CardV2Title>
                  </CardV2Header>
                  <CardV2Content className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor Total Investigado</span>
                      <span className="font-semibold">{formatCurrency(45700000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Anomalias Financeiras</span>
                      <span className="font-semibold">{formatCurrency(8900000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taxa de Recuperação</span>
                      <span className="font-semibold">19.5%</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-medium">Economia Total</span>
                      <span className="font-bold text-green-600">{formatCurrency(4570000)}</span>
                    </div>
                  </CardV2Content>
                </CardV2>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </div> {/* Close content wrapper */}
      </div>
    </>
  )
}