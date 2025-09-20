'use client'

import { useState, useEffect } from 'react'
import { 
  FileSearch, AlertTriangle, TrendingUp, Users, 
  Activity, DollarSign, Calendar, Filter,
  Download, RefreshCw
} from 'lucide-react'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Dropdown } from '@/components/ui'
import { StatCard, ChartCard } from '@/components/ui'
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useExport } from '@/hooks/use-export'
import { useOnboarding } from '@/hooks/use-onboarding'
import { OnboardingFlow } from '@/components/onboarding'
import { GuidedTour } from '@/components/tour'

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
  { name: 'Sobrepreço', value: 45, color: '#ef4444' },
  { name: 'Duplicação', value: 28, color: '#f59e0b' },
  { name: 'Fracionamento', value: 22, color: '#3b82f6' },
  { name: 'Direcionamento', value: 18, color: '#8b5cf6' },
  { name: 'Outros', value: 12, color: '#6b7280' }
]

const generateAgentPerformanceData = () => [
  { agent: 'Zumbi dos Palmares', investigacoes: 89, precisao: 94 },
  { agent: 'Anita Garibaldi', investigacoes: 76, precisao: 91 },
  { agent: 'Machado de Assis', investigacoes: 65, precisao: 88 },
  { agent: 'Tiradentes', investigacoes: 54, precisao: 92 },
  { agent: 'Dandara', investigacoes: 43, precisao: 95 }
]

export default function DashboardPage() {
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
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Breadcrumbs items={[{ label: 'Dashboard Analítico' }]} />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
                  Dashboard de Transparência
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                </select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Dropdown
                  trigger={
                    <Button disabled={isExporting} data-tour="export-button">
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exportando...' : 'Exportar'}
                    </Button>
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="dashboard-overview">
            <StatCard
              title="Investigações Totais"
              value={formatNumber(totalInvestigations)}
              change={12}
              icon={<FileSearch className="w-5 h-5 text-blue-600" />}
              description="no período selecionado"
            />
            
            <StatCard
              title="Anomalias Detectadas"
              value={formatNumber(totalAnomalies)}
              change={-8}
              changeType="negative"
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              description="redução é positiva"
            />
            
            <StatCard
              title="Economia Identificada"
              value={formatCurrency(4570000)}
              change={25}
              icon={<DollarSign className="w-5 h-5 text-green-600" />}
              description="em recursos públicos"
            />
            
            <StatCard
              title="Precisão do Sistema"
              value={`${averagePrecision}%`}
              change={2.3}
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              description="média dos agentes"
            />
          </div>

          {/* Main Charts */}
          <Tabs 
            defaultValue="overview" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
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
                      { dataKey: 'investigacoes', name: 'Investigações', color: '#3b82f6' },
                      { dataKey: 'anomalias', name: 'Anomalias', color: '#ef4444' },
                      { dataKey: 'relatorios', name: 'Relatórios', color: '#10b981' }
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
                      { dataKey: 'value', name: 'Investigações', color: '#3b82f6' },
                      { dataKey: 'anomalias', name: 'Anomalias', color: '#ef4444' }
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
                    { dataKey: 'alertas', name: 'Alertas Críticos', color: '#f59e0b' }
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
                      { dataKey: 'anomalias', name: 'Anomalias', color: '#ef4444' }
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
                      { dataKey: 'investigacoes', name: 'Investigações', color: '#10b981' },
                      { dataKey: 'precisao', name: 'Precisão (%)', color: '#8b5cf6' }
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
                      { dataKey: 'precisao', name: 'Precisão (%)', color: '#8b5cf6' }
                    ]}
                    xAxisKey="agent"
                    height={300}
                  />
                </ChartCard>
              </div>

              {/* Agent Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Agentes Ativos</p>
                        <p className="text-2xl font-bold">17</p>
                      </div>
                      <Badge variant="success">Operacional</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Em Investigação</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tempo Médio</p>
                        <p className="text-2xl font-bold">2.3h</p>
                      </div>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
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
                    { dataKey: 'economia', name: 'Economia Diária', color: '#10b981', stackId: 'stack' },
                    { dataKey: 'economiaAcumulada', name: 'Acumulado', color: '#059669' }
                  ]}
                  xAxisKey="date"
                  xAxisType="date"
                  yAxisFormatter={formatCurrency}
                  height={350}
                />
              </ChartCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Contratos Suspeitos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                        <Badge variant={
                          item.risco === 'alto' ? 'destructive' : 
                          item.risco === 'médio' ? 'warning' : 
                          'secondary'
                        }>
                          Risco {item.risco}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}