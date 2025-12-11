/**
 * Report PDF Generator
 *
 * Generates detailed internship reports with full telemetry data.
 * Uses dynamic import to reduce initial bundle size (~180KB savings).
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import type { jsPDF } from 'jspdf'
import { PDF_COLORS, PDF_STYLES } from './constants'
import type {
  CertificateUser,
  PDFGenerationResult,
  DailyActivity,
  XPTransaction,
  DiaryEntry,
  ChartMetric,
} from './types'
import type { TelemetryData } from '../certificate-requirements'

/** RGB tuple type */
type RGBColor = readonly [number, number, number]

/** Helper to apply fill color from readonly tuple */
function setFill(doc: jsPDF, color: RGBColor) {
  doc.setFillColor(color[0], color[1], color[2])
}

/** Helper to apply text color from readonly tuple */
function setTextC(doc: jsPDF, color: RGBColor) {
  doc.setTextColor(color[0], color[1], color[2])
}

/** Helper to apply draw color from readonly tuple */
function setDraw(doc: jsPDF, color: RGBColor) {
  doc.setDrawColor(color[0], color[1], color[2])
}

interface ReportData {
  user: CertificateUser
  telemetry: TelemetryData
  xpTransactions: XPTransaction[]
  diaryEntries: DiaryEntry[]
  dailyActivity: DailyActivity[]
}

/**
 * Helper to check if we need a new page
 */
function createPageManager(doc: jsPDF, margin: number) {
  const pageHeight = doc.internal.pageSize.getHeight()
  let currentY = margin

  return {
    get y() {
      return currentY
    },
    set y(value: number) {
      currentY = value
    },
    addPage() {
      doc.addPage()
      currentY = margin
    },
    checkPageBreak(neededSpace: number) {
      if (currentY + neededSpace > pageHeight - margin) {
        this.addPage()
      }
    },
  }
}

/**
 * Draw cover page
 */
function drawCoverPage(
  doc: jsPDF,
  user: CertificateUser,
  pageManager: ReturnType<typeof createPageManager>
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_STYLES.MARGIN

  // Elegant background with gradient effect
  setFill(doc, PDF_COLORS.LIGHT_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Decorative top border
  setFill(doc, PDF_COLORS.GREEN_800)
  doc.rect(0, 0, pageWidth, 8, 'F')
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.rect(0, 8, pageWidth, 4, 'F')

  // Decorative corner elements
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.line(margin, 25, margin + 30, 25)
  doc.line(margin, 25, margin, 55)
  doc.line(pageWidth - margin, 25, pageWidth - margin - 30, 25)
  doc.line(pageWidth - margin, 25, pageWidth - margin, 55)

  // Institution header
  setTextC(doc, PDF_COLORS.GREEN_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'normal')
  doc.text('NEURAL THINKER AI ENGINEERING', pageWidth / 2, 40, { align: 'center' })
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  setTextC(doc, PDF_COLORS.GRAY_500)
  doc.text('Programa de Capacitacao em Inteligencia Artificial', pageWidth / 2, 48, {
    align: 'center',
  })

  // Main title with elegant styling
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.roundedRect(margin + 10, 65, pageWidth - margin * 2 - 20, 35, 3, 3, 'F')

  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.HUGE)
  doc.setFont('helvetica', 'bold')
  doc.text('RELATORIO DE ESTAGIO', pageWidth / 2, 85, { align: 'center' })
  doc.setFontSize(PDF_STYLES.FONT_SIZE.HEADING)
  doc.setFont('helvetica', 'normal')
  doc.text('Academia Cidadao.AI', pageWidth / 2, 95, { align: 'center' })

  // Student info card with elegant border
  const cardY = 115
  setFill(doc, PDF_COLORS.WHITE)
  doc.roundedRect(margin, cardY, pageWidth - margin * 2, 75, 5, 5, 'F')
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.HEAVY)
  doc.roundedRect(margin, cardY, pageWidth - margin * 2, 75, 5, 5)

  // Green accent bar on left
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.roundedRect(margin, cardY, 5, 75, 2, 0, 'F')

  setTextC(doc, PDF_COLORS.GREEN_600)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'bold')
  doc.text('ESTAGIARIO(A)', margin + 15, cardY + 18)

  setTextC(doc, PDF_COLORS.GRAY_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.DISPLAY)
  doc.setFont('helvetica', 'bold')
  doc.text(user.name, margin + 15, cardY + 38)

  // Decorative line under name
  setDraw(doc, PDF_COLORS.GRAY_200)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.line(margin + 15, cardY + 45, pageWidth - margin - 15, cardY + 45)

  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'normal')
  setTextC(doc, PDF_COLORS.GRAY_500)
  doc.text(user.email, margin + 15, cardY + 60)

  // Summary stats with modern card design
  const hours = Math.floor(user.totalTimeMinutes / 60)
  const minutes = user.totalTimeMinutes % 60
  const statsY = 205

  const statWidth = (pageWidth - margin * 2 - 15) / 4
  const stats = [
    { label: 'Carga Horaria', value: `${hours}h ${minutes}min`, color: PDF_COLORS.GREEN_600 },
    { label: 'XP Total', value: user.totalXp.toLocaleString('pt-BR'), color: PDF_COLORS.BLUE_500 },
    { label: 'Nivel', value: `Lv.${user.currentLevel}`, color: PDF_COLORS.PURPLE_500 },
    {
      label: 'Rank',
      value: user.currentRank.charAt(0).toUpperCase() + user.currentRank.slice(1),
      color: PDF_COLORS.ORANGE_500,
    },
  ]

  stats.forEach((stat, index) => {
    const x = margin + statWidth * index + index * 5
    const cardWidth = statWidth

    // Card background
    doc.setFillColor(PDF_COLORS.GRAY_50[0], PDF_COLORS.GRAY_50[1], PDF_COLORS.GRAY_50[2])
    doc.roundedRect(x, statsY, cardWidth, 50, 3, 3, 'F')

    // Top accent
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2])
    doc.roundedRect(x, statsY, cardWidth, 4, 3, 0, 'F')

    // Value
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
    doc.setFontSize(PDF_STYLES.FONT_SIZE.TITLE)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x + cardWidth / 2, statsY + 28, { align: 'center' })

    // Label
    doc.setTextColor(PDF_COLORS.GRAY_500[0], PDF_COLORS.GRAY_500[1], PDF_COLORS.GRAY_500[2])
    doc.setFontSize(PDF_STYLES.FONT_SIZE.SMALL)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label, x + cardWidth / 2, statsY + 42, { align: 'center' })
  })

  // Date with elegant formatting
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Bottom decorative element
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.line(margin + 40, pageHeight - 45, pageWidth - margin - 40, pageHeight - 45)

  setTextC(doc, PDF_COLORS.GRAY_600)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'normal')
  doc.text(`Relatorio gerado em ${currentDate}`, pageWidth / 2, pageHeight - 35, {
    align: 'center',
  })

  // Bottom corner decoration
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.line(margin, pageHeight - 25, margin + 30, pageHeight - 25)
  doc.line(margin, pageHeight - 25, margin, pageHeight - 55)
  doc.line(pageWidth - margin, pageHeight - 25, pageWidth - margin - 30, pageHeight - 25)
  doc.line(pageWidth - margin, pageHeight - 25, pageWidth - margin, pageHeight - 55)
}

/**
 * Draw telemetry page with charts
 */
function drawTelemetryPage(
  doc: jsPDF,
  telemetry: TelemetryData,
  xpTransactions: XPTransaction[],
  pageManager: ReturnType<typeof createPageManager>
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = PDF_STYLES.MARGIN

  // Elegant header with decorative elements
  setFill(doc, PDF_COLORS.GREEN_800)
  doc.rect(0, 0, pageWidth, 8, 'F')
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.rect(0, 8, pageWidth, 32, 'F')

  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.LARGE_TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('TELEMETRIA DE ATIVIDADES', pageWidth / 2, 28, { align: 'center' })

  pageManager.y = 55

  // Section description
  setTextC(doc, PDF_COLORS.GRAY_500)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Metricas coletadas automaticamente durante o periodo de estagio',
    pageWidth / 2,
    pageManager.y,
    { align: 'center' }
  )
  pageManager.y += 15

  // Bar chart for metrics with improved styling
  const chartMetrics: ChartMetric[] = [
    {
      label: 'Videos Assistidos',
      value: telemetry.videosCompleted,
      max: telemetry.totalVideos,
      color: PDF_COLORS.GREEN_500,
      icon: '>',
    },
    {
      label: 'Leituras Concluidas',
      value: telemetry.readingsCompleted,
      max: telemetry.totalReadings,
      color: PDF_COLORS.BLUE_500,
      icon: 'B',
    },
    {
      label: 'Entradas no Diario',
      value: telemetry.diaryEntries,
      max: Math.max(telemetry.diaryEntries, 10),
      color: PDF_COLORS.PURPLE_500,
      icon: 'D',
    },
    {
      label: 'Sessoes de Estudo',
      value: telemetry.totalSessions,
      max: Math.max(telemetry.totalSessions, 20),
      color: PDF_COLORS.ORANGE_500,
      icon: 'S',
    },
    {
      label: 'Interacoes com Mentor',
      value: telemetry.chatMessages,
      max: Math.max(telemetry.chatMessages, 50),
      color: PDF_COLORS.PINK_500,
      icon: 'M',
    },
  ]

  const maxBarWidth = pageWidth - margin * 2 - 80

  chartMetrics.forEach((metric, index) => {
    const y = pageManager.y + index * PDF_STYLES.BAR_SPACING

    // Card background for each metric
    setFill(doc, PDF_COLORS.GRAY_50)
    doc.roundedRect(
      margin - 5,
      y - 8,
      pageWidth - margin * 2 + 10,
      PDF_STYLES.BAR_SPACING - 5,
      3,
      3,
      'F'
    )

    // Label with icon
    doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
    doc.setFont('helvetica', 'bold')
    setTextC(doc, PDF_COLORS.GRAY_700)
    doc.text(`${metric.label}`, margin, y)

    // Background bar with shadow effect
    setFill(doc, PDF_COLORS.GRAY_200)
    doc.roundedRect(margin, y + 5, maxBarWidth, PDF_STYLES.BAR_HEIGHT, 4, 4, 'F')

    // Value bar with gradient-like effect
    const barWidth = Math.max((metric.value / metric.max) * maxBarWidth, 8)
    setFill(doc, metric.color)
    doc.roundedRect(margin, y + 5, barWidth, PDF_STYLES.BAR_HEIGHT, 4, 4, 'F')

    // Percentage indicator inside bar
    const percentage = Math.round((metric.value / metric.max) * 100)
    if (barWidth > 30) {
      setTextC(doc, PDF_COLORS.WHITE)
      doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
      doc.setFont('helvetica', 'bold')
      doc.text(`${percentage}%`, margin + barWidth - 15, y + 16)
    }

    // Value text with styling
    doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
    doc.setFont('helvetica', 'bold')
    setTextC(doc, metric.color)
    doc.text(`${metric.value}`, margin + maxBarWidth + 10, y + 12)
    doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
    setTextC(doc, PDF_COLORS.GRAY_400)
    doc.text(`/ ${metric.max}`, margin + maxBarWidth + 25, y + 12)
  })

  pageManager.y += chartMetrics.length * PDF_STYLES.BAR_SPACING + 15

  // XP Breakdown section with improved design
  pageManager.checkPageBreak(100)

  // Section header
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 25, 3, 3, 'F')
  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.HEADING)
  doc.setFont('helvetica', 'bold')
  doc.text('HISTORICO DE XP', margin + 10, pageManager.y + 16)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  doc.setFont('helvetica', 'normal')
  doc.text('(Ultimas 10 transacoes)', pageWidth - margin - 10, pageManager.y + 16, {
    align: 'right',
  })
  pageManager.y += 30

  // Table header with modern styling
  setFill(doc, PDF_COLORS.GREEN_50)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 14, 2, 2, 'F')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  doc.setFont('helvetica', 'bold')
  setTextC(doc, PDF_COLORS.GREEN_800)
  doc.text('DATA', margin + 8, pageManager.y + 10)
  doc.text('ATIVIDADE', margin + 45, pageManager.y + 10)
  doc.text('XP GANHO', pageWidth - margin - 8, pageManager.y + 10, { align: 'right' })
  pageManager.y += 18

  // Last 10 XP transactions with alternating row colors
  const recentXp = xpTransactions.slice(-10).reverse()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)

  if (recentXp.length === 0) {
    setTextC(doc, PDF_COLORS.GRAY_400)
    doc.setFont('helvetica', 'italic')
    doc.text('Nenhuma transacao de XP registrada ainda', pageWidth / 2, pageManager.y + 10, {
      align: 'center',
    })
    pageManager.y += 20
  } else {
    recentXp.forEach((tx, index) => {
      // Alternating row background
      if (index % 2 === 0) {
        setFill(doc, PDF_COLORS.GRAY_50)
        doc.rect(margin, pageManager.y, pageWidth - margin * 2, 12, 'F')
      }

      const date = new Date(tx.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      setTextC(doc, PDF_COLORS.GRAY_500)
      doc.text(date, margin + 8, pageManager.y + 8)
      setTextC(doc, PDF_COLORS.GRAY_700)
      const description =
        tx.description.length > 45 ? tx.description.slice(0, 42) + '...' : tx.description
      doc.text(description, margin + 45, pageManager.y + 8)
      setTextC(doc, PDF_COLORS.GREEN_600)
      doc.setFont('helvetica', 'bold')
      doc.text(`+${tx.amount}`, pageWidth - margin - 8, pageManager.y + 8, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      pageManager.y += 12
    })
  }
}

/**
 * Draw daily activity chart page
 */
function drawDailyActivityPage(
  doc: jsPDF,
  dailyActivity: DailyActivity[],
  pageManager: ReturnType<typeof createPageManager>
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_STYLES.MARGIN

  // Elegant header
  setFill(doc, PDF_COLORS.BLUE_800)
  doc.rect(0, 0, pageWidth, 8, 'F')
  setFill(doc, PDF_COLORS.BLUE_500)
  doc.rect(0, 8, pageWidth, 32, 'F')

  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.LARGE_TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('ATIVIDADE DIARIA', pageWidth / 2, 28, { align: 'center' })

  pageManager.y = 55

  // Chart title with styling
  setFill(doc, PDF_COLORS.BLUE_50)
  doc.roundedRect(margin, pageManager.y - 5, pageWidth - margin * 2, 22, 3, 3, 'F')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'bold')
  setTextC(doc, PDF_COLORS.BLUE_800)
  doc.text('Tempo de estudo por dia (ultimos 30 dias)', margin + 10, pageManager.y + 8)
  pageManager.y += 25

  // Calculate chart dimensions
  const chartWidth = pageWidth - margin * 2
  const chartHeight = 90
  const maxMinutes = Math.max(...dailyActivity.map((d) => d.minutes), 60) // Min 60 for scale
  const chartBarWidth = Math.max((chartWidth - 30) / dailyActivity.length - 2, 6)

  // Draw chart background with grid
  setFill(doc, PDF_COLORS.GRAY_50)
  doc.roundedRect(margin, pageManager.y, chartWidth, chartHeight + 25, 5, 5, 'F')

  // Horizontal grid lines
  setDraw(doc, PDF_COLORS.GRAY_200)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THIN)
  for (let i = 0; i <= 4; i++) {
    const gridY = pageManager.y + 5 + (chartHeight / 4) * i
    doc.line(margin + 25, gridY, margin + chartWidth - 10, gridY)
  }

  // Draw bars with hover effect simulation
  dailyActivity.forEach((day, index) => {
    const x = margin + 30 + index * (chartBarWidth + 2)
    const dayBarHeight = Math.max((day.minutes / maxMinutes) * chartHeight, 2)
    const y = pageManager.y + chartHeight - dayBarHeight + 5

    // Bar shadow
    setFill(doc, PDF_COLORS.GRAY_300)
    doc.roundedRect(x + 1, y + 1, chartBarWidth, dayBarHeight, 2, 2, 'F')

    // Main bar with color based on activity level
    const intensity = day.minutes / maxMinutes
    if (intensity > 0.7) {
      setFill(doc, PDF_COLORS.GREEN_500)
    } else if (intensity > 0.3) {
      setFill(doc, PDF_COLORS.BLUE_500)
    } else {
      setFill(doc, PDF_COLORS.BLUE_300)
    }
    doc.roundedRect(x, y, chartBarWidth, dayBarHeight, 2, 2, 'F')

    // Date label (only show some to avoid crowding)
    if (index % Math.ceil(dailyActivity.length / 8) === 0 || index === dailyActivity.length - 1) {
      doc.setFontSize(PDF_STYLES.FONT_SIZE.TINY)
      setTextC(doc, PDF_COLORS.GRAY_500)
      const dateStr = new Date(day.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      doc.text(dateStr, x + chartBarWidth / 2, pageManager.y + chartHeight + 18, {
        align: 'center',
      })
    }
  })

  // Y-axis labels with units
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SMALL)
  doc.setFont('helvetica', 'normal')
  setTextC(doc, PDF_COLORS.GRAY_500)
  doc.text(`${maxMinutes}min`, margin + 2, pageManager.y + 8)
  doc.text(`${Math.round(maxMinutes / 2)}min`, margin + 2, pageManager.y + chartHeight / 2 + 5)
  doc.text('0min', margin + 2, pageManager.y + chartHeight + 5)

  pageManager.y += chartHeight + 35

  // Daily summary table with improved design
  setFill(doc, PDF_COLORS.BLUE_500)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 22, 3, 3, 'F')
  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento por Dia', margin + 10, pageManager.y + 14)
  pageManager.y += 28

  // Table header
  setFill(doc, PDF_COLORS.BLUE_50)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 14, 2, 2, 'F')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  doc.setFont('helvetica', 'bold')
  setTextC(doc, PDF_COLORS.BLUE_800)
  doc.text('DATA', margin + 8, pageManager.y + 10)
  doc.text('TEMPO', margin + 55, pageManager.y + 10)
  doc.text('SESSOES', margin + 100, pageManager.y + 10)
  doc.text('XP GANHO', pageWidth - margin - 8, pageManager.y + 10, { align: 'right' })
  pageManager.y += 18

  // Show last 10 days with alternating colors
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  const recentDays = dailyActivity.slice(-10).reverse()

  recentDays.forEach((day, index) => {
    if (pageManager.y > pageHeight - 30) return

    // Alternating row background
    if (index % 2 === 0) {
      setFill(doc, PDF_COLORS.GRAY_50)
      doc.rect(margin, pageManager.y, pageWidth - margin * 2, 12, 'F')
    }

    const dateStr = new Date(day.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const dayHours = Math.floor(day.minutes / 60)
    const dayMins = day.minutes % 60
    const timeStr = dayHours > 0 ? `${dayHours}h ${dayMins}min` : `${dayMins}min`

    setTextC(doc, PDF_COLORS.GRAY_500)
    doc.text(dateStr, margin + 8, pageManager.y + 8)
    setTextC(doc, PDF_COLORS.BLUE_500)
    doc.setFont('helvetica', 'bold')
    doc.text(timeStr, margin + 55, pageManager.y + 8)
    doc.setFont('helvetica', 'normal')
    setTextC(doc, PDF_COLORS.GRAY_700)
    doc.text(day.sessions.toString(), margin + 100, pageManager.y + 8)
    setTextC(doc, PDF_COLORS.GREEN_600)
    doc.setFont('helvetica', 'bold')
    doc.text(`+${day.xp}`, pageWidth - margin - 8, pageManager.y + 8, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    pageManager.y += 12
  })
}

/**
 * Draw diary entries page
 */
function drawDiaryPage(
  doc: jsPDF,
  diaryEntries: DiaryEntry[],
  pageManager: ReturnType<typeof createPageManager>
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_STYLES.MARGIN

  // Elegant purple header
  setFill(doc, PDF_COLORS.PURPLE_800)
  doc.rect(0, 0, pageWidth, 8, 'F')
  setFill(doc, PDF_COLORS.PURPLE_500)
  doc.rect(0, 8, pageWidth, 32, 'F')

  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.LARGE_TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('DIARIO DE BORDO', pageWidth / 2, 28, { align: 'center' })

  pageManager.y = 55

  if (diaryEntries.length === 0) {
    // Empty state
    setFill(doc, PDF_COLORS.PURPLE_50)
    doc.roundedRect(margin + 20, pageManager.y + 25, pageWidth - margin * 2 - 40, 60, 5, 5, 'F')

    setTextC(doc, PDF_COLORS.GRAY_500)
    doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
    doc.setFont('helvetica', 'normal')
    doc.text('Nenhuma entrada no diario registrada', pageWidth / 2, pageManager.y + 55, {
      align: 'center',
    })

    doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'O diario de bordo e uma ferramenta importante para reflexao e aprendizado.',
      pageWidth / 2,
      pageManager.y + 75,
      { align: 'center' }
    )
    return
  }

  // Section description
  setFill(doc, PDF_COLORS.PURPLE_50)
  doc.roundedRect(margin, pageManager.y - 5, pageWidth - margin * 2, 28, 3, 3, 'F')
  setTextC(doc, PDF_COLORS.PURPLE_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Reflexoes e aprendizados registrados durante o periodo de estagio',
    pageWidth / 2,
    pageManager.y + 5,
    { align: 'center' }
  )
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  doc.setFont('helvetica', 'normal')
  setTextC(doc, PDF_COLORS.GRAY_400)
  doc.text(
    `Total de ${diaryEntries.length} entrada${diaryEntries.length !== 1 ? 's' : ''} no diario`,
    pageWidth / 2,
    pageManager.y + 16,
    { align: 'center' }
  )
  pageManager.y += 35

  // Show ALL diary entries with full content
  diaryEntries.forEach((entry, entryIndex) => {
    const date = new Date(entry.entryDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    // Calculate content height for this entry
    const contentLines = doc.splitTextToSize(entry.content, pageWidth - margin * 2 - 20)
    const entryHeight = Math.max(55, 30 + contentLines.length * 5 + 15)

    // Check if we need a new page
    if (pageManager.y + entryHeight > pageHeight - 30) {
      pageManager.addPage()
      // Continue header on new page
      setFill(doc, PDF_COLORS.PURPLE_50)
      doc.roundedRect(margin, margin, pageWidth - margin * 2, 18, 2, 2, 'F')
      setTextC(doc, PDF_COLORS.PURPLE_500)
      doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
      doc.setFont('helvetica', 'bold')
      doc.text('DIARIO DE BORDO (continuacao)', margin + 10, margin + 12)
      pageManager.y = margin + 28
    }

    // Entry card with elegant design
    setFill(doc, PDF_COLORS.WHITE)
    doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, entryHeight, 4, 4, 'F')

    // Left accent bar (purple gradient effect)
    setFill(doc, PDF_COLORS.PURPLE_500)
    doc.roundedRect(margin, pageManager.y, 4, entryHeight, 2, 0, 'F')

    // Entry number badge
    setFill(doc, PDF_COLORS.PURPLE_500)
    doc.circle(margin + 15, pageManager.y + 12, 8, 'F')
    setTextC(doc, PDF_COLORS.WHITE)
    doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
    doc.setFont('helvetica', 'bold')
    doc.text(`${entryIndex + 1}`, margin + 15, pageManager.y + 15, { align: 'center' })

    // Date header
    setTextC(doc, PDF_COLORS.PURPLE_500)
    doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
    doc.setFont('helvetica', 'bold')
    doc.text(date.charAt(0).toUpperCase() + date.slice(1), margin + 28, pageManager.y + 15)

    // Decorative line
    setDraw(doc, PDF_COLORS.PURPLE_200)
    doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
    doc.line(margin + 10, pageManager.y + 22, pageWidth - margin - 10, pageManager.y + 22)

    // Full content with proper wrapping
    doc.setFont('helvetica', 'normal')
    setTextC(doc, PDF_COLORS.GRAY_700)
    doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)

    let contentY = pageManager.y + 32
    contentLines.forEach((line: string) => {
      if (contentY < pageManager.y + entryHeight - 8) {
        doc.text(line, margin + 12, contentY)
        contentY += 5
      }
    })

    // Shadow effect (subtle)
    setDraw(doc, PDF_COLORS.GRAY_200)
    doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THIN)
    doc.line(
      margin + 2,
      pageManager.y + entryHeight,
      pageWidth - margin - 2,
      pageManager.y + entryHeight
    )

    pageManager.y += entryHeight + 8
  })

  // Summary box at the end of diary section
  pageManager.checkPageBreak(40)
  setFill(doc, PDF_COLORS.PURPLE_50)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 35, 3, 3, 'F')
  setDraw(doc, PDF_COLORS.PURPLE_500)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THICK)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 35, 3, 3)

  setTextC(doc, PDF_COLORS.PURPLE_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo do Diario de Bordo', margin + 10, pageManager.y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  setTextC(doc, PDF_COLORS.GRAY_600)

  const firstEntryDate =
    diaryEntries.length > 0
      ? new Date(diaryEntries[0].entryDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'N/A'
  const lastEntryDate =
    diaryEntries.length > 0
      ? new Date(diaryEntries[diaryEntries.length - 1].entryDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'N/A'
  const avgLength =
    diaryEntries.length > 0
      ? Math.round(diaryEntries.reduce((sum, e) => sum + e.content.length, 0) / diaryEntries.length)
      : 0

  doc.text(`Primeira entrada: ${firstEntryDate}`, margin + 10, pageManager.y + 24)
  doc.text(`Ultima entrada: ${lastEntryDate}`, margin + 80, pageManager.y + 24)
  doc.text(`Media de caracteres: ${avgLength}`, pageWidth - margin - 10, pageManager.y + 24, {
    align: 'right',
  })

  pageManager.y += 45
}

/**
 * Draw final executive summary page
 */
function drawSummaryPage(
  doc: jsPDF,
  user: CertificateUser,
  telemetry: TelemetryData,
  pageManager: ReturnType<typeof createPageManager>
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = PDF_STYLES.MARGIN

  // Elegant background
  setFill(doc, PDF_COLORS.LIGHT_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Decorative top border
  setFill(doc, PDF_COLORS.GREEN_800)
  doc.rect(0, 0, pageWidth, 8, 'F')
  setFill(doc, PDF_COLORS.GREEN_600)
  doc.rect(0, 8, pageWidth, 32, 'F')

  setTextC(doc, PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.LARGE_TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMO EXECUTIVO', pageWidth / 2, 28, { align: 'center' })

  pageManager.y = 55

  // Executive summary card
  setFill(doc, PDF_COLORS.WHITE)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 100, 5, 5, 'F')
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THICK)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 100, 5, 5)

  // Summary content
  setTextC(doc, PDF_COLORS.GREEN_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'bold')
  doc.text('Desempenho Geral do Estagiario', margin + 10, pageManager.y + 15)

  setDraw(doc, PDF_COLORS.GRAY_200)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THIN)
  doc.line(margin + 10, pageManager.y + 20, pageWidth - margin - 10, pageManager.y + 20)

  doc.setFont('helvetica', 'normal')
  setTextC(doc, PDF_COLORS.GRAY_700)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)

  const hours = Math.floor(user.totalTimeMinutes / 60)
  const minutes = user.totalTimeMinutes % 60

  const summaryLines = [
    `- Nome: ${user.name}`,
    `- Carga horaria total: ${hours}h ${minutes}min de estudo`,
    `- Experiencia acumulada: ${user.totalXp.toLocaleString('pt-BR')} XP`,
    `- Nivel alcancado: ${user.currentLevel} (${user.currentRank})`,
    `- Videos assistidos: ${telemetry.videosCompleted} de ${telemetry.totalVideos}`,
    `- Leituras concluidas: ${telemetry.readingsCompleted} de ${telemetry.totalReadings}`,
    `- Entradas no diario: ${telemetry.diaryEntries}`,
    `- Sessoes de estudo: ${telemetry.totalSessions}`,
  ]

  let summaryY = pageManager.y + 32
  summaryLines.forEach((line) => {
    doc.text(line, margin + 15, summaryY)
    summaryY += 9
  })

  pageManager.y += 115

  // Conclusion box
  setFill(doc, PDF_COLORS.GREEN_50)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 45, 5, 5, 'F')

  setTextC(doc, PDF_COLORS.GREEN_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'bold')
  doc.text('Conclusao', margin + 10, pageManager.y + 15)

  doc.setFont('helvetica', 'normal')
  setTextC(doc, PDF_COLORS.GRAY_700)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.CAPTION)
  const conclusionText = `Este relatorio documenta as atividades realizadas por ${user.name} durante o periodo de capacitacao na Academia Cidadao.AI. Os dados foram coletados automaticamente pelo sistema de telemetria e representam fielmente o progresso do estagiario.`
  const conclusionLines = doc.splitTextToSize(conclusionText, pageWidth - margin * 2 - 20)
  doc.text(conclusionLines, margin + 10, pageManager.y + 27)

  pageManager.y += 60

  // Signature section
  setFill(doc, PDF_COLORS.WHITE)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 70, 5, 5, 'F')
  setDraw(doc, PDF_COLORS.GRAY_400)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.roundedRect(margin, pageManager.y, pageWidth - margin * 2, 70, 5, 5)

  setTextC(doc, PDF_COLORS.GRAY_600)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Este relatorio foi gerado automaticamente pelo sistema',
    pageWidth / 2,
    pageManager.y + 15,
    {
      align: 'center',
    }
  )
  doc.text(
    'Academia Cidadao.AI com base nas atividades registradas.',
    pageWidth / 2,
    pageManager.y + 25,
    {
      align: 'center',
    }
  )

  // Signature line
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.MEDIUM)
  doc.line(pageWidth / 2 - 50, pageManager.y + 48, pageWidth / 2 + 50, pageManager.y + 48)

  setTextC(doc, PDF_COLORS.GREEN_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'bold')
  doc.text('Coordenacao Cidadao.AI Academy', pageWidth / 2, pageManager.y + 58, { align: 'center' })

  // Report ID and footer
  const reportId = `REP-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  // Bottom decorative element
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.line(margin + 40, pageHeight - 35, pageWidth - margin - 40, pageHeight - 35)

  doc.setFontSize(PDF_STYLES.FONT_SIZE.SMALL)
  setTextC(doc, PDF_COLORS.GRAY_400)
  doc.text(`ID do Relatorio: ${reportId}`, margin, pageHeight - 22)
  doc.text('Neural Thinker AI Engineering', pageWidth - margin, pageHeight - 22, {
    align: 'right',
  })

  const generationDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Gerado em: ${generationDate}`, pageWidth / 2, pageHeight - 12, { align: 'center' })

  // Bottom corner decoration
  setDraw(doc, PDF_COLORS.GREEN_600)
  doc.line(margin, pageHeight - 5, margin + 20, pageHeight - 5)
  doc.line(margin, pageHeight - 5, margin, pageHeight - 25)
  doc.line(pageWidth - margin, pageHeight - 5, pageWidth - margin - 20, pageHeight - 5)
  doc.line(pageWidth - margin, pageHeight - 5, pageWidth - margin, pageHeight - 25)

  return reportId
}

/**
 * Generate a detailed internship report PDF
 *
 * @param data - Report data including user, telemetry, transactions, entries
 * @returns PDF document and report ID
 */
export async function generateReportPDF(data: ReportData): Promise<PDFGenerationResult> {
  // Lazy load jsPDF only when generating PDF
  const { jsPDF } = await import('jspdf')
  const { user, telemetry, xpTransactions, diaryEntries, dailyActivity } = data
  const doc = new jsPDF('portrait')
  const margin = PDF_STYLES.MARGIN

  const pageManager = createPageManager(doc, margin)

  // Page 1: Cover
  drawCoverPage(doc, user, pageManager)

  // Page 2: Telemetry
  pageManager.addPage()
  drawTelemetryPage(doc, telemetry, xpTransactions, pageManager)

  // Page 3: Daily Activity (if data exists)
  if (dailyActivity.length > 0) {
    pageManager.addPage()
    drawDailyActivityPage(doc, dailyActivity, pageManager)
  }

  // Page 4: Diary Entries
  pageManager.addPage()
  drawDiaryPage(doc, diaryEntries, pageManager)

  // Final Page: Executive Summary
  pageManager.addPage()
  const reportId = drawSummaryPage(doc, user, telemetry, pageManager)

  return { pdf: doc, id: reportId }
}
