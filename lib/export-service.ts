import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable' // Removed for optimization
import html2canvas from 'html2canvas'
// @ts-ignore - papaparse types were removed
import Papa from 'papaparse'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  static exportToCSV(data: any[], filename: string = 'export.csv') {
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
    const {
      filename = 'dashboard-cidadao-ai.pdf',
      title = 'Dashboard de Transparência - Cidadão.AI',
      subtitle = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      author = 'Cidadão.AI',
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
    pdf.text('Métricas Principais', margin, yPosition)
    yPosition += 10

    const metricsData = Object.entries(metrics).map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').trim(),
      String(value),
    ])

    // autoTable functionality removed - using manual table rendering instead
    // Simple table rendering
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Métrica', margin, yPosition)
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
      // Check if we need a new page
      if (yPosition + 100 > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      // Add chart title
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

      // Capture chart as image
      try {
        const canvas = await html2canvas(chartData.chartElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Check if image fits on current page
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
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      pdf.text(
        `Gerado por ${author} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        margin,
        pageHeight - 10
      )
    }

    pdf.save(filename)
  }

  // Export table data as PDF
  static exportTableToPDF(tableData: TableData, options: ExportOptions = {}) {
    const {
      filename = 'relatorio-cidadao-ai.pdf',
      title = 'Relatório de Transparência',
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

    // Add table - autoTable removed, using simple rendering
    // Simple table rendering
    let yPosition = margin + 20
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')

    // Headers
    const cellWidth = (pageWidth - 2 * margin) / tableData.headers.length
    tableData.headers.forEach((header, i) => {
      pdf.text(header, margin + i * cellWidth, yPosition)
    })

    // Rows
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
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    pdf.save(filename)
  }

  // Generate financial report
  static generateFinancialReport(
    financialData: any,
    charts: ChartExportData[],
    options: ExportOptions = {}
  ) {
    const { totalInvestigated, totalSavings, suspiciousContracts, recoveryRate, monthlyData } =
      financialData

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Cover page
    pdf.setFillColor(16, 185, 129)
    pdf.rect(0, 0, pageWidth, 60, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Relatório Financeiro', pageWidth / 2, 30, { align: 'center' })

    pdf.setFontSize(14)
    pdf.text('Sistema de Transparência Cidadão.AI', pageWidth / 2, 40, { align: 'center' })

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
      ['Taxa de Recuperação', `${recoveryRate}%`],
      ['Contratos Suspeitos', String(suspiciousContracts.length)],
    ]

    // Simple table rendering instead of autoTable
    summaryData.forEach((row) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(row[0], margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(row[1], pageWidth - margin - 50, yPosition)
      yPosition += 8
    })

    yPosition += 20

    // Suspicious contracts
    if (suspiciousContracts.length > 0) {
      pdf.addPage()
      yPosition = margin

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Contratos Suspeitos', margin, yPosition)
      yPosition += 15

      const contractsData = suspiciousContracts.map((contract: any) => [
        contract.id,
        contract.description || '-',
        this.formatCurrency(contract.value),
        contract.risk,
        format(new Date(contract.date), 'dd/MM/yyyy'),
      ])

      // Simple table rendering instead of autoTable
      // Removed autoTable block - using simple rendering
    }

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
  static exportInvestigationReport(investigation: any, options: ExportOptions = {}) {
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
        ? [16, 185, 129] // green
        : investigation.status === 'in_progress'
          ? [245, 158, 11] // yellow
          : [239, 68, 68] // red

    pdf.setFillColor(...statusColor)
    pdf.rect(0, 0, pageWidth, 40, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Investigação #${investigation.id}`, pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.text(investigation.title, pageWidth / 2, 30, { align: 'center' })

    pdf.setTextColor(0, 0, 0)
    yPosition = 50

    // Investigation details
    const details = [
      ['Status', investigation.status],
      ['Agente Responsável', investigation.agent],
      ['Data de Início', format(new Date(investigation.startDate), 'dd/MM/yyyy HH:mm')],
      ['Última Atualização', format(new Date(investigation.lastUpdate), 'dd/MM/yyyy HH:mm')],
      ['Score de Anomalia', `${(investigation.anomalyScore * 100).toFixed(1)}%`],
      ['Categoria', investigation.category],
    ]

    // Simple table rendering instead of autoTable
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
