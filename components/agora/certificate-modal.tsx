'use client'

import { useState, useEffect } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { jsPDF } from 'jspdf'
import { getTelemetryData, saveCertificate, getDailyActivityData } from '@/app/pt/agora/actions'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  Download,
  Video,
  BookOpen,
  FileText,
  MessageSquare,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ScrollText,
  ShieldAlert,
  Lock,
  Unlock,
} from 'lucide-react'
import { trackCertificateDownload, trackReportDownload } from '@/lib/analytics/agora-tracker'
import {
  validateCertificateRequirements,
  verifyTelemetryConsistency,
  determineCertificateType,
  formatCertificateType,
  type TelemetryData,
  type CertificateRequirement,
} from '@/lib/agora/certificate-requirements'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
}

const VIDEO_PROGRESS_KEY = 'agora_demo_video_progress'
const READING_PROGRESS_KEY = 'agora_demo_reading_progress'

// Video durations in seconds (from videos page)
const REQUIRED_VIDEO_DURATIONS = [720, 2100, 7200] // 3 required videos
const TOTAL_VIDEO_DURATIONS = [
  720, 2100, 7200, 2400, 3000, 1800, 2400, 4500, 3000, 2400, 2400, 7200, 1200, 3600, 2700,
]

export function CertificateModal({ isOpen, onClose }: CertificateModalProps) {
  const { user, xpTransactions, diaryEntries, sessions, isAuthenticated } = useAgora()
  const [isGenerating, setIsGenerating] = useState(false)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    videosCompleted: 0,
    totalVideos: 15,
    requiredVideosCompleted: 0,
    totalRequiredVideos: 3,
    totalVideoWatchTimeSeconds: 0,
    requiredVideoWatchTimeSeconds: REQUIRED_VIDEO_DURATIONS.reduce((a, b) => a + b, 0),
    readingsCompleted: 0,
    totalReadings: 8,
    requiredReadingsCompleted: 0,
    totalRequiredReadings: 2,
    totalXp: 0,
    totalTimeMinutes: 0,
    totalSessions: 0,
    diaryEntries: 0,
    chatMessages: 0,
    currentStreak: 0,
  })
  const [validation, setValidation] = useState<ReturnType<
    typeof validateCertificateRequirements
  > | null>(null)
  const [consistency, setConsistency] = useState<ReturnType<
    typeof verifyTelemetryConsistency
  > | null>(null)
  const [dailyActivity, setDailyActivity] = useState<
    Array<{
      date: string
      minutes: number
      xp: number
      sessions: number
    }>
  >([])

  useEffect(() => {
    if (isOpen && user) {
      loadTelemetryData()
    }
  }, [isOpen, user, xpTransactions, diaryEntries, sessions, isAuthenticated])

  const loadTelemetryData = async () => {
    // Skip if user not available
    if (!user) return

    // If authenticated with real auth (Supabase), load real data
    if (isAuthenticated) {
      const [telemetryResult, activityResult] = await Promise.all([
        getTelemetryData(),
        getDailyActivityData(),
      ])

      if (telemetryResult.success && telemetryResult.data) {
        setTelemetry(telemetryResult.data as TelemetryData)
        setValidation(validateCertificateRequirements(telemetryResult.data as TelemetryData))
        setConsistency(verifyTelemetryConsistency(telemetryResult.data as TelemetryData))
      }

      if (activityResult.success && activityResult.data) {
        setDailyActivity(activityResult.data)
      }

      if (telemetryResult.success) return
    }

    // Fallback to localStorage (demo mode)
    const videoProgress = localStorage.getItem(VIDEO_PROGRESS_KEY)
    const readingProgress = localStorage.getItem(READING_PROGRESS_KEY)

    // Parse video progress with watch time
    let videosCompleted = 0
    let requiredVideosCompleted = 0
    let totalVideoWatchTimeSeconds = 0

    if (videoProgress) {
      const parsed = JSON.parse(videoProgress) as Record<
        string,
        { status?: string; watched_seconds?: number; video_id?: string }
      >
      Object.entries(parsed).forEach(([id, v]) => {
        if (v.status === 'completed') {
          videosCompleted++
          // Check if required video (IDs 1, 2, 3 are required)
          if (['1', '2', '3'].includes(id)) {
            requiredVideosCompleted++
          }
        }
        totalVideoWatchTimeSeconds += v.watched_seconds || 0
      })
    }

    // Parse reading progress
    let readingsCompleted = 0
    let requiredReadingsCompleted = 0

    if (readingProgress) {
      const parsed = JSON.parse(readingProgress) as Record<
        string,
        { status?: string; reading_id?: string }
      >
      Object.entries(parsed).forEach(([id, r]) => {
        if (r.status === 'completed') {
          readingsCompleted++
          // Check if required reading (IDs 1, 2 are required)
          if (['1', '2'].includes(id)) {
            requiredReadingsCompleted++
          }
        }
      })
    }

    // Count chat messages from XP transactions
    const chatXpTransactions = xpTransactions.filter(
      (t) => t.sourceType === 'chat' || t.sourceType === 'agent_chat'
    )
    const chatMessages = chatXpTransactions.length * 5 // Each transaction = 5 messages

    const newTelemetry: TelemetryData = {
      videosCompleted,
      totalVideos: 15,
      requiredVideosCompleted,
      totalRequiredVideos: 3,
      totalVideoWatchTimeSeconds,
      requiredVideoWatchTimeSeconds: REQUIRED_VIDEO_DURATIONS.reduce((a, b) => a + b, 0),
      readingsCompleted,
      totalReadings: 8,
      requiredReadingsCompleted,
      totalRequiredReadings: 2,
      totalXp: user.totalXp,
      totalTimeMinutes: user.totalTimeMinutes,
      totalSessions: sessions.length,
      diaryEntries: diaryEntries.length,
      chatMessages,
      currentStreak: user.currentStreak,
    }

    setTelemetry(newTelemetry)
    setValidation(validateCertificateRequirements(newTelemetry))
    setConsistency(verifyTelemetryConsistency(newTelemetry))
  }

  // Generate simplified certificate (only total hours)
  const generateCertificatePDF = () => {
    if (!user) throw new Error('User is required to generate certificate')
    const doc = new jsPDF('landscape')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Elegant background
    doc.setFillColor(250, 252, 255)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Decorative corner elements (subtle)
    doc.setFillColor(240, 253, 244)
    doc.circle(-20, -20, 60, 'F')
    doc.circle(pageWidth + 20, pageHeight + 20, 60, 'F')

    // Outer border with elegant styling
    doc.setDrawColor(22, 101, 52) // green-800
    doc.setLineWidth(3)
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
    doc.setDrawColor(22, 163, 74) // green-600
    doc.setLineWidth(1)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)
    doc.setDrawColor(187, 247, 208) // green-200
    doc.setLineWidth(0.5)
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32)

    // Header decoration with gradient effect
    doc.setFillColor(22, 101, 52)
    doc.rect(12, 12, pageWidth - 24, 8, 'F')
    doc.setFillColor(22, 163, 74)
    doc.rect(12, 20, pageWidth - 24, 22, 'F')

    // Title with proper accents
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 36, { align: 'center' })

    // Academy emblem area
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, 58, 16, 'F')
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(2)
    doc.circle(pageWidth / 2, 58, 16)
    doc.setLineWidth(1)
    doc.circle(pageWidth / 2, 58, 12)

    // Academy name with accents
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Academia Cidadão.AI', pageWidth / 2, 82, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Capacitação em Inteligência Artificial para Cidadania', pageWidth / 2, 92, {
      align: 'center',
    })

    // Decorative line
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 60, 98, pageWidth / 2 + 60, 98)

    // Certificate text with proper accents
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(13)
    doc.text('Certificamos que', pageWidth / 2, 112, { align: 'center' })

    // Student name with elegant styling
    doc.setFontSize(30)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52)
    doc.text(user.name.toUpperCase(), pageWidth / 2, 132, { align: 'center' })

    // Decorative line under name
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.8)
    const nameWidth = doc.getTextWidth(user.name.toUpperCase())
    doc.line(pageWidth / 2 - nameWidth / 2 - 15, 138, pageWidth / 2 + nameWidth / 2 + 15, 138)

    // Completion text with proper accents
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const hoursText = hours > 0 ? `${hours} hora${hours !== 1 ? 's' : ''}` : ''
    const minutesText = minutes > 0 ? `${minutes} minuto${minutes !== 1 ? 's' : ''}` : ''
    const timeText = [hoursText, minutesText].filter(Boolean).join(' e ')

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    doc.text('concluiu com êxito o programa de capacitação', pageWidth / 2, 152, {
      align: 'center',
    })
    doc.text('com carga horária total de', pageWidth / 2, 163, { align: 'center' })

    // Highlight hours with badge effect
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(pageWidth / 2 - 50, 170, 100, 18, 3, 3, 'F')
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(timeText || '0 horas', pageWidth / 2, 183, { align: 'center' })

    // Footer area
    const footerY = pageHeight - 40

    // Date with proper formatting
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    doc.text(`Emitido em ${currentDate}`, pageWidth / 2, footerY - 18, { align: 'center' })

    // Signature line with elegant styling
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.8)
    doc.line(pageWidth / 2 - 60, footerY, pageWidth / 2 + 60, footerY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52)
    doc.text('Coordenação Cidadão.AI Academy', pageWidth / 2, footerY + 10, { align: 'center' })

    // Certificate ID
    const certId = `CERT-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text(`ID: ${certId}`, pageWidth - margin - 8, pageHeight - 16, { align: 'right' })

    // Partners text
    doc.text('Neural Thinker AI Engineering', margin + 8, pageHeight - 16)

    return { pdf: doc, certId }
  }

  // Generate detailed internship report with full telemetry
  const generateReportPDF = () => {
    if (!user) throw new Error('User is required to generate report')
    const doc = new jsPDF('portrait')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let currentY = margin

    const addNewPage = () => {
      doc.addPage()
      currentY = margin
    }

    const checkPageBreak = (neededSpace: number) => {
      if (currentY + neededSpace > pageHeight - margin) {
        addNewPage()
      }
    }

    // ===== COVER PAGE =====
    // Elegant background with gradient effect
    doc.setFillColor(250, 252, 255)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Decorative top border
    doc.setFillColor(22, 101, 52) // green-800
    doc.rect(0, 0, pageWidth, 8, 'F')
    doc.setFillColor(22, 163, 74) // green-600
    doc.rect(0, 8, pageWidth, 4, 'F')

    // Decorative corner elements
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    doc.line(margin, 25, margin + 30, 25)
    doc.line(margin, 25, margin, 55)
    doc.line(pageWidth - margin, 25, pageWidth - margin - 30, 25)
    doc.line(pageWidth - margin, 25, pageWidth - margin, 55)

    // Institution header
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('NEURAL THINKER AI ENGINEERING', pageWidth / 2, 40, { align: 'center' })
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text('Programa de Capacitação em Inteligência Artificial', pageWidth / 2, 48, {
      align: 'center',
    })

    // Main title with elegant styling
    doc.setFillColor(22, 163, 74)
    doc.roundedRect(margin + 10, 65, pageWidth - margin * 2 - 20, 35, 3, 3, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DE ESTÁGIO', pageWidth / 2, 85, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Academia Cidadão.AI', pageWidth / 2, 95, { align: 'center' })

    // Student info card with elegant border
    const cardY = 115
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, cardY, pageWidth - margin * 2, 75, 5, 5, 'F')
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(1.5)
    doc.roundedRect(margin, cardY, pageWidth - margin * 2, 75, 5, 5)

    // Green accent bar on left
    doc.setFillColor(22, 163, 74)
    doc.roundedRect(margin, cardY, 5, 75, 2, 0, 'F')

    doc.setTextColor(22, 163, 74)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('ESTAGIÁRIO(A)', margin + 15, cardY + 18)

    doc.setTextColor(31, 41, 55) // gray-800
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(user.name, margin + 15, cardY + 38)

    // Decorative line under name
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin + 15, cardY + 45, pageWidth - margin - 15, cardY + 45)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(user.email, margin + 15, cardY + 60)

    // Summary stats with modern card design
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const statsY = 205

    const statWidth = (pageWidth - margin * 2 - 15) / 4
    const stats = [
      { label: 'Carga Horária', value: `${hours}h ${minutes}min`, color: [22, 163, 74] },
      { label: 'XP Total', value: user.totalXp.toLocaleString('pt-BR'), color: [59, 130, 246] },
      { label: 'Nível', value: `Lv.${user.currentLevel}`, color: [168, 85, 247] },
      {
        label: 'Rank',
        value: user.currentRank.charAt(0).toUpperCase() + user.currentRank.slice(1),
        color: [249, 115, 22],
      },
    ]

    stats.forEach((stat, index) => {
      const x = margin + statWidth * index + index * 5
      const cardWidth = statWidth

      // Card background
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(x, statsY, cardWidth, 50, 3, 3, 'F')

      // Top accent
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2])
      doc.roundedRect(x, statsY, cardWidth, 4, 3, 0, 'F')

      // Value
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(stat.value, x + cardWidth / 2, statsY + 28, { align: 'center' })

      // Label
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
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
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    doc.line(margin + 40, pageHeight - 45, pageWidth - margin - 40, pageHeight - 45)

    doc.setTextColor(75, 85, 99)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Relatório gerado em ${currentDate}`, pageWidth / 2, pageHeight - 35, {
      align: 'center',
    })

    // Bottom corner decoration
    doc.setDrawColor(22, 163, 74)
    doc.line(margin, pageHeight - 25, margin + 30, pageHeight - 25)
    doc.line(margin, pageHeight - 25, margin, pageHeight - 55)
    doc.line(pageWidth - margin, pageHeight - 25, pageWidth - margin - 30, pageHeight - 25)
    doc.line(pageWidth - margin, pageHeight - 25, pageWidth - margin, pageHeight - 55)

    // ===== PAGE 2: TELEMETRY =====
    addNewPage()

    // Elegant header with decorative elements
    doc.setFillColor(22, 101, 52) // green-800
    doc.rect(0, 0, pageWidth, 8, 'F')
    doc.setFillColor(22, 163, 74) // green-600
    doc.rect(0, 8, pageWidth, 32, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TELEMETRIA DE ATIVIDADES', pageWidth / 2, 28, { align: 'center' })

    currentY = 55

    // Section description
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'Métricas coletadas automaticamente durante o período de estágio',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    )
    currentY += 15

    // Bar chart for metrics with improved styling
    const chartMetrics = [
      {
        label: 'Vídeos Assistidos',
        value: telemetry.videosCompleted,
        max: telemetry.totalVideos,
        color: [34, 197, 94],
        icon: '▶',
      },
      {
        label: 'Leituras Concluídas',
        value: telemetry.readingsCompleted,
        max: telemetry.totalReadings,
        color: [59, 130, 246],
        icon: '📖',
      },
      {
        label: 'Entradas no Diário',
        value: telemetry.diaryEntries,
        max: Math.max(telemetry.diaryEntries, 10),
        color: [168, 85, 247],
        icon: '✍',
      },
      {
        label: 'Sessões de Estudo',
        value: telemetry.totalSessions,
        max: Math.max(telemetry.totalSessions, 20),
        color: [249, 115, 22],
        icon: '⏱',
      },
      {
        label: 'Interações com Mentor',
        value: telemetry.chatMessages,
        max: Math.max(telemetry.chatMessages, 50),
        color: [236, 72, 153],
        icon: '💬',
      },
    ]

    const barHeight = 18
    const barSpacing = 38
    const maxBarWidth = pageWidth - margin * 2 - 80

    chartMetrics.forEach((metric, index) => {
      const y = currentY + index * barSpacing

      // Card background for each metric
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(margin - 5, y - 8, pageWidth - margin * 2 + 10, barSpacing - 5, 3, 3, 'F')

      // Label with icon
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text(`${metric.label}`, margin, y)

      // Background bar with shadow effect
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(margin, y + 5, maxBarWidth, barHeight, 4, 4, 'F')

      // Value bar with gradient-like effect
      const barWidth = Math.max((metric.value / metric.max) * maxBarWidth, 8)
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
      doc.roundedRect(margin, y + 5, barWidth, barHeight, 4, 4, 'F')

      // Percentage indicator inside bar
      const percentage = Math.round((metric.value / metric.max) * 100)
      if (barWidth > 30) {
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${percentage}%`, margin + barWidth - 15, y + 16)
      }

      // Value text with styling
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2])
      doc.text(`${metric.value}`, margin + maxBarWidth + 10, y + 12)
      doc.setFontSize(9)
      doc.setTextColor(156, 163, 175)
      doc.text(`/ ${metric.max}`, margin + maxBarWidth + 25, y + 12)
    })

    currentY += chartMetrics.length * barSpacing + 15

    // XP Breakdown section with improved design
    checkPageBreak(100)

    // Section header
    doc.setFillColor(22, 163, 74)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('📊 HISTÓRICO DE XP', margin + 10, currentY + 16)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('(Últimas 10 transações)', pageWidth - margin - 10, currentY + 16, { align: 'right' })
    currentY += 30

    // Table header with modern styling
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52)
    doc.text('DATA', margin + 8, currentY + 10)
    doc.text('ATIVIDADE', margin + 45, currentY + 10)
    doc.text('XP GANHO', pageWidth - margin - 8, currentY + 10, { align: 'right' })
    currentY += 18

    // Last 10 XP transactions with alternating row colors
    const recentXp = xpTransactions.slice(-10).reverse()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    if (recentXp.length === 0) {
      doc.setTextColor(156, 163, 175)
      doc.setFont('helvetica', 'italic')
      doc.text('Nenhuma transação de XP registrada ainda', pageWidth / 2, currentY + 10, {
        align: 'center',
      })
      currentY += 20
    } else {
      recentXp.forEach((tx, index) => {
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(margin, currentY, pageWidth - margin * 2, 12, 'F')
        }

        const date = new Date(tx.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })
        doc.setTextColor(107, 114, 128)
        doc.text(date, margin + 8, currentY + 8)
        doc.setTextColor(55, 65, 81)
        const description =
          tx.description.length > 45 ? tx.description.slice(0, 42) + '...' : tx.description
        doc.text(description, margin + 45, currentY + 8)
        doc.setTextColor(22, 163, 74)
        doc.setFont('helvetica', 'bold')
        doc.text(`+${tx.amount}`, pageWidth - margin - 8, currentY + 8, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        currentY += 12
      })
    }

    // ===== PAGE 3: DAILY ACTIVITY CHART =====
    if (dailyActivity.length > 0) {
      addNewPage()

      // Elegant header
      doc.setFillColor(30, 64, 175) // blue-800
      doc.rect(0, 0, pageWidth, 8, 'F')
      doc.setFillColor(59, 130, 246) // blue-500
      doc.rect(0, 8, pageWidth, 32, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('ATIVIDADE DIÁRIA', pageWidth / 2, 28, { align: 'center' })

      currentY = 55

      // Chart title with styling
      doc.setFillColor(239, 246, 255) // blue-50
      doc.roundedRect(margin, currentY - 5, pageWidth - margin * 2, 22, 3, 3, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 64, 175)
      doc.text('📈 Tempo de estudo por dia (últimos 30 dias)', margin + 10, currentY + 8)
      currentY += 25

      // Calculate chart dimensions
      const chartWidth = pageWidth - margin * 2
      const chartHeight = 90
      const maxMinutes = Math.max(...dailyActivity.map((d) => d.minutes), 60) // Min 60 for scale
      const chartBarWidth = Math.max((chartWidth - 30) / dailyActivity.length - 2, 6)

      // Draw chart background with grid
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(margin, currentY, chartWidth, chartHeight + 25, 5, 5, 'F')

      // Horizontal grid lines
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.3)
      for (let i = 0; i <= 4; i++) {
        const gridY = currentY + 5 + (chartHeight / 4) * i
        doc.line(margin + 25, gridY, margin + chartWidth - 10, gridY)
      }

      // Draw bars with hover effect simulation
      dailyActivity.forEach((day, index) => {
        const x = margin + 30 + index * (chartBarWidth + 2)
        const dayBarHeight = Math.max((day.minutes / maxMinutes) * chartHeight, 2)
        const y = currentY + chartHeight - dayBarHeight + 5

        // Bar shadow
        doc.setFillColor(203, 213, 225)
        doc.roundedRect(x + 1, y + 1, chartBarWidth, dayBarHeight, 2, 2, 'F')

        // Main bar with color based on activity level
        const intensity = day.minutes / maxMinutes
        if (intensity > 0.7) {
          doc.setFillColor(34, 197, 94) // green for high activity
        } else if (intensity > 0.3) {
          doc.setFillColor(59, 130, 246) // blue for medium
        } else {
          doc.setFillColor(147, 197, 253) // light blue for low
        }
        doc.roundedRect(x, y, chartBarWidth, dayBarHeight, 2, 2, 'F')

        // Date label (only show some to avoid crowding)
        if (
          index % Math.ceil(dailyActivity.length / 8) === 0 ||
          index === dailyActivity.length - 1
        ) {
          doc.setFontSize(7)
          doc.setTextColor(107, 114, 128)
          const dateStr = new Date(day.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })
          doc.text(dateStr, x + chartBarWidth / 2, currentY + chartHeight + 18, { align: 'center' })
        }
      })

      // Y-axis labels with units
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(`${maxMinutes}min`, margin + 2, currentY + 8)
      doc.text(`${Math.round(maxMinutes / 2)}min`, margin + 2, currentY + chartHeight / 2 + 5)
      doc.text('0min', margin + 2, currentY + chartHeight + 5)

      currentY += chartHeight + 35

      // Daily summary table with improved design
      doc.setFillColor(59, 130, 246)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('📋 Detalhamento por Dia', margin + 10, currentY + 14)
      currentY += 28

      // Table header
      doc.setFillColor(239, 246, 255)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 64, 175)
      doc.text('DATA', margin + 8, currentY + 10)
      doc.text('TEMPO', margin + 55, currentY + 10)
      doc.text('SESSÕES', margin + 100, currentY + 10)
      doc.text('XP GANHO', pageWidth - margin - 8, currentY + 10, { align: 'right' })
      currentY += 18

      // Show last 10 days with alternating colors
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const recentDays = dailyActivity.slice(-10).reverse()

      recentDays.forEach((day, index) => {
        if (currentY > pageHeight - 30) return

        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(margin, currentY, pageWidth - margin * 2, 12, 'F')
        }

        const dateStr = new Date(day.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        const dayHours = Math.floor(day.minutes / 60)
        const dayMins = day.minutes % 60
        const timeStr = dayHours > 0 ? `${dayHours}h ${dayMins}min` : `${dayMins}min`

        doc.setTextColor(107, 114, 128)
        doc.text(dateStr, margin + 8, currentY + 8)
        doc.setTextColor(59, 130, 246)
        doc.setFont('helvetica', 'bold')
        doc.text(timeStr, margin + 55, currentY + 8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(55, 65, 81)
        doc.text(day.sessions.toString(), margin + 100, currentY + 8)
        doc.setTextColor(22, 163, 74)
        doc.setFont('helvetica', 'bold')
        doc.text(`+${day.xp}`, pageWidth - margin - 8, currentY + 8, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        currentY += 12
      })
    }

    // ===== PAGE 4: DIARY ENTRIES (EXPANDED) =====
    if (diaryEntries.length > 0) {
      addNewPage()

      // Elegant purple header
      doc.setFillColor(107, 33, 168) // purple-800
      doc.rect(0, 0, pageWidth, 8, 'F')
      doc.setFillColor(168, 85, 247) // purple-500
      doc.rect(0, 8, pageWidth, 32, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('DIÁRIO DE BORDO', pageWidth / 2, 28, { align: 'center' })

      currentY = 55

      // Section description
      doc.setFillColor(250, 245, 255) // purple-50
      doc.roundedRect(margin, currentY - 5, pageWidth - margin * 2, 28, 3, 3, 'F')
      doc.setTextColor(107, 33, 168)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text(
        'Reflexões e aprendizados registrados durante o período de estágio',
        pageWidth / 2,
        currentY + 5,
        { align: 'center' }
      )
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(156, 163, 175)
      doc.text(
        `Total de ${diaryEntries.length} entrada${diaryEntries.length !== 1 ? 's' : ''} no diário`,
        pageWidth / 2,
        currentY + 16,
        { align: 'center' }
      )
      currentY += 35

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
        if (currentY + entryHeight > pageHeight - 30) {
          addNewPage()
          // Continue header on new page
          doc.setFillColor(250, 245, 255)
          doc.roundedRect(margin, margin, pageWidth - margin * 2, 18, 2, 2, 'F')
          doc.setTextColor(168, 85, 247)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text('📝 DIÁRIO DE BORDO (continuação)', margin + 10, margin + 12)
          currentY = margin + 28
        }

        // Entry card with elegant design
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, entryHeight, 4, 4, 'F')

        // Left accent bar (purple gradient effect)
        doc.setFillColor(168, 85, 247)
        doc.roundedRect(margin, currentY, 4, entryHeight, 2, 0, 'F')

        // Entry number badge
        doc.setFillColor(168, 85, 247)
        doc.circle(margin + 15, currentY + 12, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${entryIndex + 1}`, margin + 15, currentY + 15, { align: 'center' })

        // Date header
        doc.setTextColor(168, 85, 247)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(date.charAt(0).toUpperCase() + date.slice(1), margin + 28, currentY + 15)

        // Decorative line
        doc.setDrawColor(233, 213, 255) // purple-200
        doc.setLineWidth(0.5)
        doc.line(margin + 10, currentY + 22, pageWidth - margin - 10, currentY + 22)

        // Full content with proper wrapping
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(55, 65, 81)
        doc.setFontSize(9)

        let contentY = currentY + 32
        contentLines.forEach((line: string) => {
          if (contentY < currentY + entryHeight - 8) {
            doc.text(line, margin + 12, contentY)
            contentY += 5
          }
        })

        // Shadow effect (subtle)
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        doc.line(margin + 2, currentY + entryHeight, pageWidth - margin - 2, currentY + entryHeight)

        currentY += entryHeight + 8
      })

      // Summary box at the end of diary section
      checkPageBreak(40)
      doc.setFillColor(250, 245, 255)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 35, 3, 3, 'F')
      doc.setDrawColor(168, 85, 247)
      doc.setLineWidth(1)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 35, 3, 3)

      doc.setTextColor(107, 33, 168)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('📊 Resumo do Diário de Bordo', margin + 10, currentY + 12)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)

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
          ? Math.round(
              diaryEntries.reduce((sum, e) => sum + e.content.length, 0) / diaryEntries.length
            )
          : 0

      doc.text(`Primeira entrada: ${firstEntryDate}`, margin + 10, currentY + 24)
      doc.text(`Última entrada: ${lastEntryDate}`, margin + 80, currentY + 24)
      doc.text(`Média de caracteres: ${avgLength}`, pageWidth - margin - 10, currentY + 24, {
        align: 'right',
      })

      currentY += 45
    } else {
      // No diary entries - show empty state
      addNewPage()

      doc.setFillColor(107, 33, 168)
      doc.rect(0, 0, pageWidth, 8, 'F')
      doc.setFillColor(168, 85, 247)
      doc.rect(0, 8, pageWidth, 32, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('DIÁRIO DE BORDO', pageWidth / 2, 28, { align: 'center' })

      currentY = 80

      doc.setFillColor(250, 245, 255)
      doc.roundedRect(margin + 20, currentY, pageWidth - margin * 2 - 40, 60, 5, 5, 'F')

      doc.setTextColor(168, 85, 247)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('📝', pageWidth / 2, currentY + 22, { align: 'center' })

      doc.setTextColor(107, 114, 128)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Nenhuma entrada no diário registrada', pageWidth / 2, currentY + 38, {
        align: 'center',
      })

      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(
        'O diário de bordo é uma ferramenta importante para reflexão e aprendizado.',
        pageWidth / 2,
        currentY + 50,
        { align: 'center' }
      )

      currentY += 80
    }

    // ===== FINAL PAGE: EXECUTIVE SUMMARY & SIGNATURE =====
    addNewPage()

    // Elegant background
    doc.setFillColor(250, 252, 255)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Decorative top border
    doc.setFillColor(22, 101, 52)
    doc.rect(0, 0, pageWidth, 8, 'F')
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 8, pageWidth, 32, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMO EXECUTIVO', pageWidth / 2, 28, { align: 'center' })

    currentY = 55

    // Executive summary card
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 100, 5, 5, 'F')
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(1)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 100, 5, 5)

    // Summary content
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Desempenho Geral do Estagiário', margin + 10, currentY + 15)

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin + 10, currentY + 20, pageWidth - margin - 10, currentY + 20)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(10)

    const summaryLines = [
      `• Nome: ${user.name}`,
      `• Carga horária total: ${hours}h ${minutes}min de estudo`,
      `• Experiência acumulada: ${user.totalXp.toLocaleString('pt-BR')} XP`,
      `• Nível alcançado: ${user.currentLevel} (${user.currentRank})`,
      `• Vídeos assistidos: ${telemetry.videosCompleted} de ${telemetry.totalVideos}`,
      `• Leituras concluídas: ${telemetry.readingsCompleted} de ${telemetry.totalReadings}`,
      `• Entradas no diário: ${telemetry.diaryEntries}`,
      `• Sessões de estudo: ${telemetry.totalSessions}`,
    ]

    let summaryY = currentY + 32
    summaryLines.forEach((line) => {
      doc.text(line, margin + 15, summaryY)
      summaryY += 9
    })

    currentY += 115

    // Conclusion box
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 45, 5, 5, 'F')

    doc.setTextColor(22, 101, 52)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Conclusão', margin + 10, currentY + 15)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
    const conclusionText = `Este relatório documenta as atividades realizadas por ${user.name} durante o período de capacitação na Academia Cidadão.AI. Os dados foram coletados automaticamente pelo sistema de telemetria e representam fielmente o progresso do estagiário.`
    const conclusionLines = doc.splitTextToSize(conclusionText, pageWidth - margin * 2 - 20)
    doc.text(conclusionLines, margin + 10, currentY + 27)

    currentY += 60

    // Signature section
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 70, 5, 5, 'F')
    doc.setDrawColor(156, 163, 175)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 70, 5, 5)

    doc.setTextColor(75, 85, 99)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Este relatório foi gerado automaticamente pelo sistema',
      pageWidth / 2,
      currentY + 15,
      {
        align: 'center',
      }
    )
    doc.text(
      'Academia Cidadão.AI com base nas atividades registradas.',
      pageWidth / 2,
      currentY + 25,
      {
        align: 'center',
      }
    )

    // Signature line
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.8)
    doc.line(pageWidth / 2 - 50, currentY + 48, pageWidth / 2 + 50, currentY + 48)

    doc.setTextColor(22, 101, 52)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Coordenação Cidadão.AI Academy', pageWidth / 2, currentY + 58, { align: 'center' })

    // Report ID and footer
    const reportId = `REP-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

    // Bottom decorative element
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    doc.line(margin + 40, pageHeight - 35, pageWidth - margin - 40, pageHeight - 35)

    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ID do Relatório: ${reportId}`, margin, pageHeight - 22)
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
    doc.setDrawColor(22, 163, 74)
    doc.line(margin, pageHeight - 5, margin + 20, pageHeight - 5)
    doc.line(margin, pageHeight - 5, margin, pageHeight - 25)
    doc.line(pageWidth - margin, pageHeight - 5, pageWidth - margin - 20, pageHeight - 5)
    doc.line(pageWidth - margin, pageHeight - 5, pageWidth - margin, pageHeight - 25)

    return { pdf: doc, reportId }
  }

  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const handleGenerateCertificate = async () => {
    if (!user) return
    setIsGenerating(true)
    try {
      const { pdf, certId } = generateCertificatePDF()
      pdf.save(`certificado-agora-${certId}.pdf`)

      // Track certificate download
      const totalHours = Math.floor(user.totalTimeMinutes / 60)
      trackCertificateDownload(totalHours, user.currentLevel)

      // Save certificate to Supabase if authenticated
      if (isAuthenticated && user && certificateType) {
        const certType = determineCertificateType(telemetry)
        await saveCertificate({
          certificateNumber: certId,
          certificateType: certType,
          totalHours: totalHours + (user.totalTimeMinutes % 60) / 60,
          totalXp: user.totalXp,
          finalRank: user.currentRank,
          finalLevel: user.currentLevel,
          missionsCompleted: telemetry.videosCompleted + telemetry.readingsCompleted,
          articlesRead: telemetry.readingsCompleted,
          conversationsCount: telemetry.chatMessages,
          verificationHash: `${user.id}-${Date.now()}-${certId}`.slice(0, 64),
        })
      }
    } catch (error) {
      console.error('Failed to generate certificate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!user) return
    setIsGeneratingReport(true)
    try {
      const { pdf, reportId } = generateReportPDF()
      pdf.save(`relatorio-estagio-${reportId}.pdf`)

      // Track report download
      const totalHours = Math.floor(user.totalTimeMinutes / 60)
      trackReportDownload(totalHours, user.totalXp)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Use validation from requirements system
  const canGenerateCertificate = validation?.canGenerate ?? false
  const completionPercentage = validation?.progressPercentage ?? 0
  const hasConsistencyWarnings = consistency?.warnings && consistency.warnings.length > 0

  // Get certificate type if eligible
  let certificateType: ReturnType<typeof formatCertificateType> | null = null
  if (canGenerateCertificate) {
    try {
      const type = determineCertificateType(telemetry)
      certificateType = formatCertificateType(type)
    } catch {
      // Not eligible
    }
  }

  const uiMetrics = [
    {
      label: 'Vídeos Obrigatórios',
      value: telemetry.requiredVideosCompleted,
      max: telemetry.totalRequiredVideos,
      icon: Video,
      color: 'green',
      required: true,
    },
    {
      label: 'Tempo de Vídeo (min)',
      value: Math.floor(telemetry.totalVideoWatchTimeSeconds / 60),
      max: 120,
      icon: Clock,
      color: 'green',
      required: true,
    },
    {
      label: 'Leituras Obrigatórias',
      value: telemetry.requiredReadingsCompleted,
      max: telemetry.totalRequiredReadings,
      icon: BookOpen,
      color: 'blue',
      required: true,
    },
    {
      label: 'Entradas no Diário',
      value: telemetry.diaryEntries,
      max: 3,
      icon: FileText,
      color: 'purple',
      required: true,
    },
    {
      label: 'Mensagens com Mentor',
      value: telemetry.chatMessages,
      max: 10,
      icon: MessageSquare,
      color: 'pink',
      required: true,
    },
    {
      label: 'Tempo Total (min)',
      value: telemetry.totalTimeMinutes,
      max: 180,
      icon: Clock,
      color: 'orange',
      required: true,
    },
  ]

  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return Video
      case 'reading':
        return BookOpen
      case 'engagement':
        return MessageSquare
      case 'time':
        return Clock
      default:
        return CheckCircle
    }
  }

  // Don't render if user is not available
  if (!user) {
    return null
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" showCloseButton={false}>
        <ModalHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <ModalTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Certificado e Relatório
              </ModalTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Telemetria da sua jornada
              </p>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Progress Overview */}
          <Card variant="filled" padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Progresso Geral
                </span>
              </div>
              <Badge variant={completionPercentage >= 70 ? 'success' : 'warning'} size="lg">
                {completionPercentage}%
              </Badge>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </Card>

          {/* Metrics Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Métricas Coletadas
            </h3>
            <div className="space-y-3">
              {uiMetrics.map((metric) => {
                const Icon = metric.icon
                const percentage = Math.min((metric.value / metric.max) * 100, 100)
                return (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {metric.value} / {metric.max}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClasses[metric.color]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card
              variant="filled"
              padding="sm"
              className="text-center bg-green-50 dark:bg-green-900/20"
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {user.totalXp}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">XP Total</div>
            </Card>
            <Card
              variant="filled"
              padding="sm"
              className="text-center bg-blue-50 dark:bg-blue-900/20"
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(user.totalTimeMinutes / 60)}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tempo de Estudo</div>
            </Card>
            <Card
              variant="filled"
              padding="sm"
              className="text-center bg-purple-50 dark:bg-purple-900/20"
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Lv.{user.currentLevel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.currentRank}</div>
            </Card>
          </div>

          {/* Requirements Checklist */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              {canGenerateCertificate ? (
                <Unlock className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500" />
              )}
              Requisitos para Certificado
              <Badge variant={canGenerateCertificate ? 'success' : 'warning'} size="sm">
                {validation?.completedRequirements ?? 0}/{validation?.totalRequirements ?? 0}
              </Badge>
            </h3>

            <div className="space-y-2">
              {validation?.requirements.map((req) => {
                const Icon = getCategoryIcon(req.category)
                return (
                  <div
                    key={req.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      req.met
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        req.met
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {req.met ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          req.met
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {req.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {req.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          req.met
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {req.currentValue}
                      </p>
                      <p className="text-xs text-gray-400">/ {req.required}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Consistency Warnings */}
          {hasConsistencyWarnings && (
            <Card
              variant="outlined"
              padding="sm"
              className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Avisos de Consistência
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {consistency?.warnings.map((warning, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Certificate Type Badge */}
          {canGenerateCertificate && certificateType && (
            <Card
              variant="filled"
              padding="sm"
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{certificateType.emoji}</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Certificado</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {certificateType.label}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateCertificate}
                disabled={!canGenerateCertificate || isGenerating}
                loading={isGenerating}
                leftIcon={!isGenerating ? <GraduationCap className="w-5 h-5" /> : undefined}
                className="flex-1"
              >
                {isGenerating ? 'Gerando...' : 'Baixar Certificado'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                loading={isGeneratingReport}
                leftIcon={!isGeneratingReport ? <ScrollText className="w-5 h-5" /> : undefined}
                className="flex-1"
              >
                {isGeneratingReport ? 'Gerando...' : 'Baixar Relatorio'}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Certificado: apenas carga horaria | Relatorio: telemetria completa
            </p>
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto sm:self-center">
              Fechar
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
