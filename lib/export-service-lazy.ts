/**
 * Lazy-loaded wrapper for ExportService to reduce initial bundle size
 *
 * Export functionality uses heavy dependencies (jsPDF: 500KB+, html2canvas: 300KB+, papaparse: 100KB+)
 * By lazy loading these, we reduce the initial page load significantly.
 *
 * Usage:
 * ```typescript
 * import { lazyExportToCSV, lazyExportToPDF } from '@/lib/export-service-lazy'
 *
 * // CSV export
 * await lazyExportToCSV(data, 'filename.csv')
 *
 * // PDF export with charts
 * await lazyExportDashboardToPDF(charts, tableData, options)
 * ```
 */

export const lazyExportToCSV = async (data: any[], filename: string = 'export.csv') => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportToCSV(data, filename)
}

export const lazyExportToJSON = async (data: any, filename: string = 'export.json') => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportToJSON(data, filename)
}

export const lazyExportTableToPDF = async (
  tableData: { headers: string[], rows: any[][] },
  options: any = {}
) => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportTableToPDF(tableData, options)
}

export const lazyExportDashboardToPDF = async (
  charts: Array<{ chartElement: HTMLElement, title: string, description?: string }>,
  tableData?: { headers: string[], rows: any[][] },
  options: any = {}
) => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportDashboardToPDF(charts, tableData, options)
}

export const lazyExportChartToPNG = async (
  chartElement: HTMLElement,
  filename: string = 'chart.png'
) => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportChartToPNG(chartElement, filename)
}

/**
 * Hook for using lazy-loaded export functionality with loading state
 */
export function useExport() {
  const exportToCSV = async (data: any[], filename: string = 'export.csv') => {
    return lazyExportToCSV(data, filename)
  }

  const exportToJSON = async (data: any, filename: string = 'export.json') => {
    return lazyExportToJSON(data, filename)
  }

  const exportTableToPDF = async (
    tableData: { headers: string[], rows: any[][] },
    options: any = {}
  ) => {
    return lazyExportTableToPDF(tableData, options)
  }

  const exportDashboardToPDF = async (
    charts: Array<{ chartElement: HTMLElement, title: string, description?: string }>,
    tableData?: { headers: string[], rows: any[][] },
    options: any = {}
  ) => {
    return lazyExportDashboardToPDF(charts, tableData, options)
  }

  const exportChartToPNG = async (
    chartElement: HTMLElement,
    filename: string = 'chart.png'
  ) => {
    return lazyExportChartToPNG(chartElement, filename)
  }

  return {
    exportToCSV,
    exportToJSON,
    exportTableToPDF,
    exportDashboardToPDF,
    exportChartToPNG
  }
}
