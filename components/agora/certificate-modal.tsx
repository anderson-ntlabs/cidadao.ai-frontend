'use client'

import { useState, useEffect } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { jsPDF } from 'jspdf'
import { getTelemetryData, saveCertificate } from '@/app/pt/agora/actions'
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

  useEffect(() => {
    if (isOpen) {
      loadTelemetryData()
    }
  }, [isOpen, user, xpTransactions, diaryEntries, sessions, isAuthenticated])

  const loadTelemetryData = async () => {
    // If authenticated, load from Supabase
    if (isAuthenticated) {
      const result = await getTelemetryData()
      if (result.success && result.data) {
        setTelemetry(result.data as TelemetryData)
        setValidation(validateCertificateRequirements(result.data as TelemetryData))
        setConsistency(verifyTelemetryConsistency(result.data as TelemetryData))
        return
      }
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
    const doc = new jsPDF('landscape')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Background gradient effect
    doc.setFillColor(240, 253, 244) // green-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Decorative corner elements
    doc.setFillColor(22, 163, 74, 0.1)
    doc.circle(0, 0, 80, 'F')
    doc.circle(pageWidth, pageHeight, 80, 'F')

    // Border
    doc.setDrawColor(22, 163, 74) // green-600
    doc.setLineWidth(3)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
    doc.setLineWidth(1)
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

    // Header decoration
    doc.setFillColor(22, 163, 74)
    doc.rect(10, 10, pageWidth - 20, 30, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE CONCLUSAO', pageWidth / 2, 30, { align: 'center' })

    // Academy logo area
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, 55, 15, 'F')
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(2)
    doc.circle(pageWidth / 2, 55, 15)

    // Subtitle
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Academia Cidadao.AI', pageWidth / 2, 80, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text('Capacitacao em Inteligencia Artificial para Cidadania', pageWidth / 2, 90, {
      align: 'center',
    })

    // Certificate text
    doc.setTextColor(55, 65, 81) // gray-700
    doc.setFontSize(14)
    doc.text('Certificamos que', pageWidth / 2, 110, { align: 'center' })

    // Student name
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52) // green-800
    doc.text(user.name.toUpperCase(), pageWidth / 2, 130, { align: 'center' })

    // Decorative line under name
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    const nameWidth = doc.getTextWidth(user.name.toUpperCase())
    doc.line(pageWidth / 2 - nameWidth / 2 - 10, 135, pageWidth / 2 + nameWidth / 2 + 10, 135)

    // Completion text - only total hours
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const hoursText = hours > 0 ? `${hours} hora${hours !== 1 ? 's' : ''}` : ''
    const minutesText = minutes > 0 ? `${minutes} minuto${minutes !== 1 ? 's' : ''}` : ''
    const timeText = [hoursText, minutesText].filter(Boolean).join(' e ')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)
    doc.text('concluiu com exito o programa de capacitacao', pageWidth / 2, 150, {
      align: 'center',
    })
    doc.text(`com carga horaria total de`, pageWidth / 2, 162, { align: 'center' })

    // Highlight hours
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(timeText || '0 horas', pageWidth / 2, 180, { align: 'center' })

    // Footer area
    const footerY = pageHeight - 45

    // Date
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    doc.text(`Emitido em ${currentDate}`, pageWidth / 2, footerY - 15, { align: 'center' })

    // Signature line
    doc.setDrawColor(156, 163, 175)
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 70, footerY, pageWidth / 2 + 70, footerY)
    doc.setFontSize(10)
    doc.setTextColor(75, 85, 99)
    doc.text('Coordenacao Cidadao.AI Academy', pageWidth / 2, footerY + 8, { align: 'center' })

    // Certificate ID
    const certId = `CERT-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ID: ${certId}`, pageWidth - margin - 10, pageHeight - 18, { align: 'right' })

    // Partners text
    doc.text('Neural Thinker AI Engineering', margin + 10, pageHeight - 18)

    return { pdf: doc, certId }
  }

  // Generate detailed internship report with full telemetry
  const generateReportPDF = () => {
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
    // Background
    doc.setFillColor(240, 253, 244)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Header bar
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 0, pageWidth, 60, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATORIO DE ESTAGIO', pageWidth / 2, 35, { align: 'center' })
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Academia Cidadao.AI', pageWidth / 2, 50, { align: 'center' })

    // Student info box
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, 80, pageWidth - margin * 2, 60, 5, 5, 'F')
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(1)
    doc.roundedRect(margin, 80, pageWidth - margin * 2, 60, 5, 5)

    doc.setTextColor(22, 163, 74)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ESTAGIARIO(A)', margin + 10, 95)

    doc.setTextColor(55, 65, 81)
    doc.setFontSize(18)
    doc.text(user.name, margin + 10, 112)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(user.email, margin + 10, 125)

    // Summary stats
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const statsY = 160

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(margin, statsY, pageWidth - margin * 2, 45, 5, 5, 'F')

    const statWidth = (pageWidth - margin * 2) / 4
    const stats = [
      { label: 'Carga Horaria', value: `${hours}h ${minutes}min` },
      { label: 'XP Total', value: user.totalXp.toString() },
      { label: 'Nivel', value: `Lv.${user.currentLevel}` },
      {
        label: 'Rank',
        value: user.currentRank.charAt(0).toUpperCase() + user.currentRank.slice(1),
      },
    ]

    stats.forEach((stat, index) => {
      const x = margin + statWidth * index + statWidth / 2
      doc.setTextColor(22, 163, 74)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(stat.value, x, statsY + 22, { align: 'center' })
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(stat.label, x, statsY + 35, { align: 'center' })
    })

    // Date
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(10)
    doc.text(`Relatorio gerado em ${currentDate}`, pageWidth / 2, pageHeight - 30, {
      align: 'center',
    })

    // ===== PAGE 2: TELEMETRY =====
    addNewPage()

    // Section header
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('TELEMETRIA DE ATIVIDADES', pageWidth / 2, 25, { align: 'center' })

    currentY = 55

    // Bar chart for metrics
    const chartMetrics = [
      {
        label: 'Videos Assistidos',
        value: telemetry.videosCompleted,
        max: telemetry.totalVideos,
        color: [34, 197, 94],
      },
      {
        label: 'Leituras Concluidas',
        value: telemetry.readingsCompleted,
        max: telemetry.totalReadings,
        color: [59, 130, 246],
      },
      {
        label: 'Entradas no Diario',
        value: telemetry.diaryEntries,
        max: Math.max(telemetry.diaryEntries, 10),
        color: [168, 85, 247],
      },
      {
        label: 'Sessoes de Estudo',
        value: telemetry.totalSessions,
        max: Math.max(telemetry.totalSessions, 20),
        color: [249, 115, 22],
      },
      {
        label: 'Mensagens com Mentor',
        value: telemetry.chatMessages,
        max: Math.max(telemetry.chatMessages, 50),
        color: [236, 72, 153],
      },
    ]

    const barHeight = 20
    const barSpacing = 35
    const maxBarWidth = pageWidth - margin * 2 - 100

    chartMetrics.forEach((metric, index) => {
      const y = currentY + index * barSpacing

      // Label
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text(metric.label, margin, y)

      // Background bar
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(margin, y + 5, maxBarWidth, barHeight, 3, 3, 'F')

      // Value bar
      const barWidth = Math.max((metric.value / metric.max) * maxBarWidth, 5)
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
      doc.roundedRect(margin, y + 5, barWidth, barHeight, 3, 3, 'F')

      // Value text
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text(`${metric.value} / ${metric.max}`, margin + maxBarWidth + 10, y + 18)
    })

    currentY += chartMetrics.length * barSpacing + 20

    // XP Breakdown section
    checkPageBreak(80)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('Historico de XP (Ultimas 10 transacoes)', margin, currentY)
    currentY += 10

    // Table header
    doc.setFillColor(240, 253, 244)
    doc.rect(margin, currentY, pageWidth - margin * 2, 12, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 65, 81)
    doc.text('Data', margin + 5, currentY + 8)
    doc.text('Atividade', margin + 50, currentY + 8)
    doc.text('XP', pageWidth - margin - 15, currentY + 8, { align: 'right' })
    currentY += 15

    // Last 10 XP transactions
    const recentXp = xpTransactions.slice(-10).reverse()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    recentXp.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      doc.setTextColor(107, 114, 128)
      doc.text(date, margin + 5, currentY + 5)
      doc.setTextColor(55, 65, 81)
      doc.text(tx.description.slice(0, 40), margin + 50, currentY + 5)
      doc.setTextColor(22, 163, 74)
      doc.text(`+${tx.amount}`, pageWidth - margin - 15, currentY + 5, { align: 'right' })
      currentY += 10
    })

    // ===== PAGE 3: DIARY ENTRIES =====
    if (diaryEntries.length > 0) {
      addNewPage()

      doc.setFillColor(168, 85, 247)
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('DIARIO DE BORDO', pageWidth / 2, 25, { align: 'center' })

      currentY = 55

      diaryEntries.slice(-5).forEach((entry) => {
        checkPageBreak(50)

        const date = new Date(entry.entryDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })

        doc.setFillColor(248, 250, 252)
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, 40, 3, 3, 'F')

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(168, 85, 247)
        doc.text(date, margin + 5, currentY + 12)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(55, 65, 81)
        doc.setFontSize(9)
        const contentLines = doc.splitTextToSize(entry.content, pageWidth - margin * 2 - 10)
        doc.text(contentLines.slice(0, 2), margin + 5, currentY + 25)

        currentY += 50
      })
    }

    // ===== FINAL PAGE: SIGNATURE =====
    addNewPage()

    doc.setFillColor(240, 253, 244)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    doc.setTextColor(55, 65, 81)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Este relatorio foi gerado automaticamente pelo sistema', pageWidth / 2, 80, {
      align: 'center',
    })
    doc.text('Academia Cidadao.AI com base nas atividades registradas.', pageWidth / 2, 95, {
      align: 'center',
    })

    // Signature area
    doc.setDrawColor(156, 163, 175)
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 60, 150, pageWidth / 2 + 60, 150)
    doc.setFontSize(10)
    doc.setTextColor(75, 85, 99)
    doc.text('Coordenacao Cidadao.AI Academy', pageWidth / 2, 160, { align: 'center' })

    // Report ID
    const reportId = `REP-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ID: ${reportId}`, pageWidth / 2, pageHeight - 20, { align: 'center' })

    return { pdf: doc, reportId }
  }

  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)
    try {
      const { pdf, certId } = generateCertificatePDF()
      pdf.save(`certificado-agora-${certId}.pdf`)

      // Track certificate download
      const totalHours = Math.floor(user.totalTimeMinutes / 60)
      trackCertificateDownload(totalHours, user.currentLevel)

      // Save certificate to Supabase if authenticated
      if (isAuthenticated && certificateType) {
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
