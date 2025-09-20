import { useState } from 'react'
import { ExportService } from '@/lib/export-service'
import { toast } from '@/hooks/use-toast'

interface ExportHookOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useExport(options: ExportHookOptions = {}) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = async (data: any[], filename?: string) => {
    try {
      setIsExporting(true)
      
      // Ensure data is not empty
      if (!data || data.length === 0) {
        throw new Error('Não há dados para exportar')
      }

      ExportService.exportToCSV(data, filename)
      
      toast.success('Exportação concluída!', 'Arquivo CSV baixado com sucesso.')
      options.onSuccess?.()
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro na exportação', 'Não foi possível exportar os dados.')
      options.onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportDashboardToPDF = async (
    charts: HTMLElement[],
    metrics: Record<string, any>,
    exportOptions?: any
  ) => {
    try {
      setIsExporting(true)
      
      // Prepare chart data
      const chartData = charts.map((element, index) => ({
        chartElement: element,
        title: `Gráfico ${index + 1}`,
        description: ''
      }))

      await ExportService.exportDashboardToPDF(chartData, metrics, exportOptions)
      
      toast.success('PDF gerado!', 'Dashboard exportado com sucesso.')
      options.onSuccess?.()
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro na exportação', 'Não foi possível gerar o PDF.')
      options.onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportTableToPDF = async (
    headers: string[],
    rows: any[][],
    exportOptions?: any
  ) => {
    try {
      setIsExporting(true)
      
      ExportService.exportTableToPDF(
        { headers, rows },
        exportOptions
      )
      
      toast.success('PDF gerado!', 'Tabela exportada com sucesso.')
      options.onSuccess?.()
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro na exportação', 'Não foi possível gerar o PDF.')
      options.onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportFinancialReport = async (
    financialData: any,
    charts: HTMLElement[],
    exportOptions?: any
  ) => {
    try {
      setIsExporting(true)
      
      // Prepare chart data
      const chartData = charts.map((element, index) => ({
        chartElement: element,
        title: `Análise Financeira ${index + 1}`,
        description: ''
      }))

      ExportService.generateFinancialReport(
        financialData,
        chartData,
        exportOptions
      )
      
      toast.success('Relatório gerado!', 'Relatório financeiro exportado com sucesso.')
      options.onSuccess?.()
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro na exportação', 'Não foi possível gerar o relatório.')
      options.onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportInvestigationReport = async (
    investigation: any,
    exportOptions?: any
  ) => {
    try {
      setIsExporting(true)
      
      ExportService.exportInvestigationReport(investigation, exportOptions)
      
      toast.success('Relatório gerado!', 'Investigação exportada com sucesso.')
      options.onSuccess?.()
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro na exportação', 'Não foi possível gerar o relatório.')
      options.onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    isExporting,
    exportToCSV,
    exportDashboardToPDF,
    exportTableToPDF,
    exportFinancialReport,
    exportInvestigationReport
  }
}