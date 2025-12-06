'use client'

import { useState, useEffect } from 'react'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { jsPDF } from 'jspdf'
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
} from 'lucide-react'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
}

const VIDEO_PROGRESS_KEY = 'academy_demo_video_progress'
const READING_PROGRESS_KEY = 'academy_demo_reading_progress'

interface TelemetryData {
  videosCompleted: number
  totalVideos: number
  readingsCompleted: number
  totalReadings: number
  totalXp: number
  totalTimeMinutes: number
  totalSessions: number
  diaryEntries: number
  chatMessages: number
}

export function CertificateModal({ isOpen, onClose }: CertificateModalProps) {
  const { user, xpTransactions, diaryEntries, sessions } = useAcademyDemo()
  const [isGenerating, setIsGenerating] = useState(false)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    videosCompleted: 0,
    totalVideos: 10,
    readingsCompleted: 0,
    totalReadings: 8,
    totalXp: 0,
    totalTimeMinutes: 0,
    totalSessions: 0,
    diaryEntries: 0,
    chatMessages: 0,
  })

  useEffect(() => {
    if (isOpen) {
      // Load progress from localStorage
      const videoProgress = localStorage.getItem(VIDEO_PROGRESS_KEY)
      const readingProgress = localStorage.getItem(READING_PROGRESS_KEY)

      const videosCompleted = videoProgress
        ? (Object.values(JSON.parse(videoProgress)) as Array<{ status?: string }>).filter(
            (v) => v.status === 'completed'
          ).length
        : 0

      const readingsCompleted = readingProgress
        ? (Object.values(JSON.parse(readingProgress)) as Array<{ status?: string }>).filter(
            (r) => r.status === 'completed'
          ).length
        : 0

      // Count chat messages from XP transactions
      const chatMessages = xpTransactions.filter(
        (t) => t.sourceType === 'chat' || t.sourceType === 'agent_chat'
      ).length

      setTelemetry({
        videosCompleted,
        totalVideos: 10,
        readingsCompleted,
        totalReadings: 8,
        totalXp: user.totalXp,
        totalTimeMinutes: user.totalTimeMinutes,
        totalSessions: sessions.length,
        diaryEntries: diaryEntries.length,
        chatMessages: chatMessages * 5, // Approximate messages (XP given every 5 messages)
      })
    }
  }, [isOpen, user, xpTransactions, diaryEntries, sessions])

  const generateCertificatePDF = () => {
    const doc = new jsPDF('landscape')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Background gradient effect (using rectangles)
    doc.setFillColor(240, 253, 244) // green-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Border
    doc.setDrawColor(22, 163, 74) // green-600
    doc.setLineWidth(3)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
    doc.setLineWidth(1)
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

    // Header decoration
    doc.setFillColor(22, 163, 74)
    doc.rect(10, 10, pageWidth - 20, 25, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 27, { align: 'center' })

    // Subtitle
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(14)
    doc.text('Academia Cidadão.AI - Capacitação em Inteligência Artificial', pageWidth / 2, 48, {
      align: 'center',
    })

    // Certificate text
    doc.setTextColor(55, 65, 81) // gray-700
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')

    const certificateText = `Certificamos que`
    doc.text(certificateText, pageWidth / 2, 65, { align: 'center' })

    // Student name
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 101, 52) // green-800
    doc.text(user.name.toUpperCase(), pageWidth / 2, 80, { align: 'center' })

    // User email
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // gray-600
    doc.text(user.email, pageWidth / 2, 90, { align: 'center' })

    // Completion text
    doc.setFontSize(12)
    doc.setTextColor(55, 65, 81)
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const completionText = `concluiu com êxito o programa de capacitação com carga horária de ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}, alcançando o nível ${user.currentLevel} (${user.currentRank.toUpperCase()}) com ${user.totalXp} pontos de experiência.`
    const lines = doc.splitTextToSize(completionText, pageWidth - 80)
    doc.text(lines, pageWidth / 2, 102, { align: 'center' })

    // Telemetry section title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('RELATÓRIO DE TELEMETRIA', pageWidth / 2, 125, { align: 'center' })

    // Draw bar chart
    const chartX = 40
    const chartY = 135
    const chartWidth = pageWidth - 80
    const barHeight = 12
    const barSpacing = 18
    const maxBarWidth = chartWidth - 100

    const metrics = [
      {
        label: 'Vídeos Assistidos',
        value: telemetry.videosCompleted,
        max: telemetry.totalVideos,
        color: [34, 197, 94], // green-500
      },
      {
        label: 'Leituras Concluídas',
        value: telemetry.readingsCompleted,
        max: telemetry.totalReadings,
        color: [59, 130, 246], // blue-500
      },
      {
        label: 'Entradas no Diário',
        value: telemetry.diaryEntries,
        max: Math.max(telemetry.diaryEntries, 10),
        color: [168, 85, 247], // purple-500
      },
      {
        label: 'Sessões de Estudo',
        value: telemetry.totalSessions,
        max: Math.max(telemetry.totalSessions, 20),
        color: [249, 115, 22], // orange-500
      },
      {
        label: 'Mensagens com Mentor',
        value: telemetry.chatMessages,
        max: Math.max(telemetry.chatMessages, 50),
        color: [236, 72, 153], // pink-500
      },
    ]

    metrics.forEach((metric, index) => {
      const y = chartY + index * barSpacing

      // Label
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(metric.label, chartX, y + 8)

      // Background bar
      doc.setFillColor(229, 231, 235) // gray-200
      doc.roundedRect(chartX + 95, y, maxBarWidth, barHeight, 2, 2, 'F')

      // Value bar
      const barWidth = (metric.value / metric.max) * maxBarWidth
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
      doc.roundedRect(chartX + 95, y, Math.max(barWidth, 5), barHeight, 2, 2, 'F')

      // Value text
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      if (barWidth > 30) {
        doc.text(`${metric.value}`, chartX + 95 + barWidth - 15, y + 8)
      }

      // Max text
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')
      doc.text(`/ ${metric.max}`, chartX + 95 + maxBarWidth + 5, y + 8)
    })

    // Footer
    const footerY = pageHeight - 35

    // Date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    doc.text(`Emitido em ${currentDate}`, margin + 20, footerY)

    // Signatures
    const signatureY = footerY - 5

    // Line 1
    doc.setDrawColor(156, 163, 175)
    doc.line(pageWidth / 2 - 60, signatureY, pageWidth / 2 + 60, signatureY)
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.text('Coordenação Cidadão.AI Academy', pageWidth / 2, signatureY + 8, {
      align: 'center',
    })

    // Certificate ID
    const certId = `CERT-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ID: ${certId}`, pageWidth - margin - 20, footerY, { align: 'right' })

    // Partners logos text
    doc.setFontSize(8)
    doc.text('Neural Thinker AI Engineering - Cidadão.AI Academy', pageWidth / 2, pageHeight - 18, {
      align: 'center',
    })

    return { pdf: doc, certId }
  }

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)
    try {
      const { pdf, certId } = generateCertificatePDF()
      pdf.save(`certificado-academy-${certId}.pdf`)
    } catch (error) {
      console.error('Failed to generate certificate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (telemetry.videosCompleted / telemetry.totalVideos) * 40 +
      (telemetry.readingsCompleted / telemetry.totalReadings) * 30 +
      (telemetry.diaryEntries > 0 ? 15 : 0) +
      (telemetry.totalSessions > 0 ? 15 : 0)
  )

  const canGenerateCertificate = telemetry.videosCompleted >= 3 || telemetry.readingsCompleted >= 2

  const uiMetrics = [
    {
      label: 'Vídeos Assistidos',
      value: telemetry.videosCompleted,
      max: telemetry.totalVideos,
      icon: Video,
      color: 'green',
    },
    {
      label: 'Leituras Concluídas',
      value: telemetry.readingsCompleted,
      max: telemetry.totalReadings,
      icon: BookOpen,
      color: 'blue',
    },
    {
      label: 'Entradas no Diário',
      value: telemetry.diaryEntries,
      max: 10,
      icon: FileText,
      color: 'purple',
    },
    {
      label: 'Sessões de Estudo',
      value: telemetry.totalSessions,
      max: 20,
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Mensagens com Mentor',
      value: telemetry.chatMessages,
      max: 50,
      icon: MessageSquare,
      color: 'pink',
    },
  ]

  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
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

          {/* Requirements Warning */}
          {!canGenerateCertificate && (
            <Card
              variant="outlined"
              padding="sm"
              className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Requisitos para Certificado
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li
                      className={`flex items-center gap-2 ${telemetry.videosCompleted >= 3 ? 'line-through opacity-50' : ''}`}
                    >
                      {telemetry.videosCompleted >= 3 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                      Assistir pelo menos 3 vídeos
                    </li>
                    <li
                      className={`flex items-center gap-2 ${telemetry.readingsCompleted >= 2 ? 'line-through opacity-50' : ''}`}
                    >
                      {telemetry.readingsCompleted >= 2 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      Completar pelo menos 2 leituras
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
              Fechar
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateCertificate}
              disabled={!canGenerateCertificate}
              loading={isGenerating}
              leftIcon={!isGenerating ? <Download className="w-5 h-5" /> : undefined}
              className="flex-1"
            >
              {isGenerating ? 'Gerando...' : 'Baixar Certificado (PDF)'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
