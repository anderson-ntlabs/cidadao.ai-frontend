/**
 * Lazy-loaded Export Service
 * Optimization: Load PDF/export libraries only when needed
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import Papa from 'papaparse' // CSV is lightweight, keep it
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

export class LazyExportService {
  // Export to CSV - no lazy loading needed (Papa is small)
  static exportToCSV(data: any[], filename: string = 'export.csv') {
    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ',',
      quotes: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  // Export to JSON - no external libs needed
  static exportToJSON(data: any, filename: string = 'export.json') {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  // Export to PDF - lazy load heavy libraries
  static async exportToPDF(
    data: TableData,
    options: ExportOptions = {}
  ): Promise<void> {
    // Dynamically import jsPDF only when needed
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const {
      filename = `export_${format(new Date(), 'yyyy-MM-dd', { locale: ptBR })}.pdf`,
      title = 'Relatório',
      subtitle = '',
      author = 'Cidadão.AI',
      orientation = 'portrait',
      pageFormat = 'a4'
    } = options

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageFormat
    })

    // Add metadata
    doc.setProperties({
      title,
      author,
      creator: 'Cidadão.AI Platform'
    })

    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 20)

    if (subtitle) {
      doc.setFontSize(12)
      doc.text(subtitle, 14, 28)
    }

    // Add table
    ;(doc as any).autoTable({
      head: [data.headers],
      body: data.rows,
      startY: subtitle ? 35 : 30,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    })

    // Save PDF
    doc.save(filename)
  }

  // Export chart as image - lazy load html2canvas
  static async exportChartAsImage(
    element: HTMLElement,
    filename: string = 'chart.png'
  ): Promise<void> {
    // Dynamically import html2canvas only when needed
    const { default: html2canvas } = await import('html2canvas')

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2 // Higher quality
    })

    // Convert to blob and download
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

  // Export full report with charts - lazy load everything
  static async exportFullReport(
    tableData: TableData,
    charts: ChartExportData[],
    options: ExportOptions = {}
  ): Promise<void> {
    // Dynamically import heavy libraries
    const [
      { default: jsPDF },
      { default: autoTable },
      { default: html2canvas }
    ] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
      import('html2canvas')
    ])

    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageFormat || 'a4'
    })

    // Add title page
    doc.setFontSize(24)
    doc.text(options.title || 'Relatório Completo', 14, 30)

    // Add table
    ;(doc as any).autoTable({
      head: [tableData.headers],
      body: tableData.rows,
      startY: 50,
      theme: 'grid'
    })

    // Add charts
    for (const chartData of charts) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text(chartData.title, 14, 20)

      if (chartData.description) {
        doc.setFontSize(12)
        doc.text(chartData.description, 14, 30)
      }

      // Convert chart to image
      const canvas = await html2canvas(chartData.chartElement, {
        backgroundColor: '#ffffff',
        scale: 2
      })

      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', 14, 40, 180, 100)
    }

    // Save PDF
    doc.save(
      options.filename ||
      `report_${format(new Date(), 'yyyy-MM-dd_HHmm', { locale: ptBR })}.pdf`
    )
  }
}