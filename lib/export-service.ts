/**
 * Export Service with Lazy Loading
 *
 * jsPDF and html2canvas are loaded only when needed to reduce initial bundle size.
 * These libraries add ~500KB+ to the bundle, so lazy loading is essential for performance.
 */

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Lazy load heavy dependencies
const loadJsPDF = () => import('jspdf').then((m) => m.default)
const loadHtml2Canvas = () => import('html2canvas').then((m) => m.default)
const loadPapaparse = () => import('papaparse').then((m) => m.default)

interface ExportOptions {
  filename?: string
  title?: string
  subtitle?: string
  author?: string
  orientation?: 'portrait' | 'landscape'
  pageFormat?: 'a4' | 'letter'
}

interface TableData {
  headers: string[]
  rows: any[][]
}

interface ChartExportData {
  chartElement: HTMLElement
  title: string
  description?: string
}

export class ExportService {
  // Export data as CSV
  static async exportToCSV(data: any[], filename: string = 'export.csv') {
    const Papa = await loadPapaparse()
    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ',',
      quotes: true,
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  // Export dashboard as PDF with charts
  static async exportDashboardToPDF(
    charts: ChartExportData[],
    metrics: Record<string, any>,
    options: ExportOptions = {}
  ) {
    const [jsPDF, html2canvas] = await Promise.all([loadJsPDF(), loadHtml2Canvas()])

    const {
      filename = 'dashboard-cidadao-ai.pdf',
      title = 'Dashboard de Transparencia - Cidadao.AI',
      subtitle = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      author = 'Cidadao.AI',
      orientation = 'landscape',
      pageFormat = 'a4',
    } = options

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageFormat,
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Add header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(subtitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Add metrics section
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Metricas Principais', margin, yPosition)
    yPosition += 10

    const metricsData = Object.entries(metrics).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').trim(),
      String(value),
    ])

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Metrica', margin, yPosition)
    pdf.text('Valor', pageWidth - margin - 50, yPosition)

    yPosition += 10
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    metricsData.forEach((row) => {
      pdf.text(row[0], margin, yPosition)
      pdf.text(row[1], pageWidth - margin - 50, yPosition)
      yPosition += 8
    })

    yPosition += 15

    // Add charts
    for (const chartData of charts) {
      if (yPosition + 100 > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(chartData.title, margin, yPosition)
      yPosition += 5

      if (chartData.description) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(chartData.description, margin, yPosition)
        yPosition += 5
      }

      try {
        const canvas = await html2canvas(chartData.chartElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 10
      } catch (error) {
        console.error('Error capturing chart:', error)
      }
    }

    // Add footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Pagina ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      pdf.text(
        `Gerado por ${author} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        margin,
        pageHeight - 10
      )
    }

    pdf.save(filename)
  }

  // Export table data as PDF
  static async exportTableToPDF(tableData: TableData, options: ExportOptions = {}) {
    const jsPDF = await loadJsPDF()

    const {
      filename = 'relatorio-cidadao-ai.pdf',
      title = 'Relatorio de Transparencia',
      subtitle = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      orientation = 'portrait',
      pageFormat = 'a4',
    } = options

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageFormat,
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15

    // Add header
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageWidth / 2, margin, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(subtitle, pageWidth / 2, margin + 8, { align: 'center' })

    // Add table
    let yPosition = margin + 20
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')

    const cellWidth = (pageWidth - 2 * margin) / tableData.headers.length
    tableData.headers.forEach((header, i) => {
      pdf.text(header, margin + i * cellWidth, yPosition)
    })

    yPosition += 10
    pdf.setFont('helvetica', 'normal')
    tableData.rows.forEach((row) => {
      row.forEach((cell, i) => {
        pdf.text(String(cell), margin + i * cellWidth, yPosition)
      })
      yPosition += 8
    })

    // Add page numbers
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.text(
        `Pagina ${i} de ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    pdf.save(filename)
  }

  // Generate financial report
  static async generateFinancialReport(
    financialData: any,
    charts: ChartExportData[],
    options: ExportOptions = {}
  ) {
    const jsPDF = await loadJsPDF()

    const { totalInvestigated, totalSavings, suspiciousContracts, recoveryRate } = financialData

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = margin

    // Cover page
    pdf.setFillColor(16, 185, 129)
    pdf.rect(0, 0, pageWidth, 60, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Relatorio Financeiro', pageWidth / 2, 30, { align: 'center' })

    pdf.setFontSize(14)
    pdf.text('Sistema de Transparencia Cidadao.AI', pageWidth / 2, 40, { align: 'center' })

    pdf.setTextColor(0, 0, 0)
    yPosition = 80

    // Executive summary
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Resumo Executivo', margin, yPosition)
    yPosition += 15

    const summaryData = [
      ['Valor Total Investigado', this.formatCurrency(totalInvestigated)],
      ['Economia Identificada', this.formatCurrency(totalSavings)],
      ['Taxa de Recuperacao', `${recoveryRate}%`],
      ['Contratos Suspeitos', String(suspiciousContracts.length)],
    ]

    summaryData.forEach((row) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(row[0], margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(row[1], pageWidth - margin - 50, yPosition)
      yPosition += 8
    })

    pdf.save(options.filename || 'relatorio-financeiro-cidadao-ai.pdf')
  }

  // Helper method to format currency
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Export investigation details
  static async exportInvestigationReport(investigation: any, options: ExportOptions = {}) {
    const jsPDF = await loadJsPDF()

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    let yPosition = margin

    // Header with investigation status
    const statusColor: [number, number, number] =
      investigation.status === 'completed'
        ? [16, 185, 129]
        : investigation.status === 'in_progress'
          ? [245, 158, 11]
          : [239, 68, 68]

    pdf.setFillColor(...statusColor)
    pdf.rect(0, 0, pageWidth, 40, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Investigacao #${investigation.id}`, pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.text(investigation.title, pageWidth / 2, 30, { align: 'center' })

    pdf.setTextColor(0, 0, 0)
    yPosition = 50

    const details = [
      ['Status', investigation.status],
      ['Agente Responsavel', investigation.agent],
      ['Data de Inicio', format(new Date(investigation.startDate), 'dd/MM/yyyy HH:mm')],
      ['Ultima Atualizacao', format(new Date(investigation.lastUpdate), 'dd/MM/yyyy HH:mm')],
      ['Score de Anomalia', `${(investigation.anomalyScore * 100).toFixed(1)}%`],
      ['Categoria', investigation.category],
    ]

    details.forEach((row) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(row[0], margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(row[1], margin + 70, yPosition)
      yPosition += 8
    })

    pdf.save(options.filename || `investigacao-${investigation.id}.pdf`)
  }
}
