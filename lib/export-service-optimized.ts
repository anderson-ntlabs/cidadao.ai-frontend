/**
 * Optimized Export Service with Lazy Loading
 *
 * Only loads heavy PDF libraries when actually needed.
 * Reduces initial bundle size by ~600KB.
 *
 * Performance optimization: Phase 1
 * Date: 2025-11-21
 */

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
  // Export data as CSV - lightweight, no heavy deps
  static exportToCSV(data: any[], filename: string = 'export.csv') {
    // Simple CSV export without Papa Parse
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  // Export dashboard as PDF with lazy loading
  static async exportDashboardToPDF(
    charts: ChartExportData[],
    options: ExportOptions = {}
  ): Promise<void> {
    // Lazy load heavy dependencies only when needed
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ])

    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageFormat || 'a4',
    })

    // Add header
    const title = options.title || 'Dashboard Export'
    const subtitle =
      options.subtitle || format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

    doc.setFontSize(20)
    doc.text(title, 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text(subtitle, 105, 30, { align: 'center' })

    let yPosition = 45

    // Process each chart
    for (const chart of charts) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // Add chart title
      doc.setFontSize(14)
      doc.text(chart.title, 20, yPosition)
      yPosition += 10

      // Convert chart to image
      const canvas = await html2canvas(chart.chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 15
    }

    // Save the PDF
    doc.save(options.filename || 'dashboard-export.pdf')
  }

  // Export table to PDF with lazy loading
  static async exportTableToPDF(tableData: TableData, options: ExportOptions = {}): Promise<void> {
    // Lazy load jsPDF only when needed
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageFormat || 'a4',
    })

    // Add header
    const title = options.title || 'Table Export'
    doc.setFontSize(16)
    doc.text(title, 105, 20, { align: 'center' })

    // Simple table rendering without jspdf-autotable
    let y = 40
    const cellWidth = 170 / tableData.headers.length

    // Headers
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    tableData.headers.forEach((header, i) => {
      doc.text(header, 20 + i * cellWidth, y)
    })

    // Rows
    doc.setFont('helvetica', 'normal')
    y += 10
    tableData.rows.forEach((row) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      row.forEach((cell, i) => {
        doc.text(String(cell), 20 + i * cellWidth, y)
      })
      y += 8
    })

    doc.save(options.filename || 'table-export.pdf')
  }

  // Export element as image
  static async exportElementAsImage(
    element: HTMLElement,
    filename: string = 'export.png'
  ): Promise<void> {
    // Lazy load html2canvas only when needed
    const { default: html2canvas } = await import('html2canvas')

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    })

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }
    })
  }
}
