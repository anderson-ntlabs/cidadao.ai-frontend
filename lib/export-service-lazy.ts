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
  // Simple JSON export without heavy dependencies
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
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
  metrics: Record<string, any> = {},
  options: any = {}
) => {
  const { ExportService } = await import('./export-service')
  return ExportService.exportDashboardToPDF(charts, metrics, options)
}

export const lazyExportChartToPNG = async (
  chartElement: HTMLElement,
  filename: string = 'chart.png'
) => {
  // Use html2canvas for chart export
  const html2canvas = (await import('html2canvas')).default

  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  })

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }
  }, 'image/png')
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
    metrics: Record<string, any> = {},
    options: any = {}
  ) => {
    return lazyExportDashboardToPDF(charts, metrics, options)
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
