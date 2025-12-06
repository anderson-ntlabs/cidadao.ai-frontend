'use client'

import { useState, useEffect } from 'react'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { jsPDF } from 'jspdf'

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
    doc.text('CERTIFICADO DE CONCLUSAO', pageWidth / 2, 27, { align: 'center' })

    // Subtitle
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(14)
    doc.text('Academia Cidadao.AI - Programa de Estagio em IA', pageWidth / 2, 48, {
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

    // Course info
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // gray-600
    doc.text(
      `Matricula: ${user.matricula} | ${user.curso} - ${user.periodo}o Periodo`,
      pageWidth / 2,
      90,
      { align: 'center' }
    )

    // Completion text
    doc.setFontSize(12)
    doc.setTextColor(55, 65, 81)
    const hours = Math.floor(user.totalTimeMinutes / 60)
    const minutes = user.totalTimeMinutes % 60
    const completionText = `concluiu com exito o programa de estagio com carga horaria de ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}, alcancando o nivel ${user.currentLevel} (${user.currentRank.toUpperCase()}) com ${user.totalXp} pontos de experiencia.`
    const lines = doc.splitTextToSize(completionText, pageWidth - 80)
    doc.text(lines, pageWidth / 2, 102, { align: 'center' })

    // Telemetry section title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('RELATORIO DE TELEMETRIA', pageWidth / 2, 125, { align: 'center' })

    // Draw bar chart
    const chartX = 40
    const chartY = 135
    const chartWidth = pageWidth - 80
    const barHeight = 12
    const barSpacing = 18
    const maxBarWidth = chartWidth - 100

    const metrics = [
      {
        label: 'Videos Assistidos',
        value: telemetry.videosCompleted,
        max: telemetry.totalVideos,
        color: [34, 197, 94], // green-500
      },
      {
        label: 'Leituras Concluidas',
        value: telemetry.readingsCompleted,
        max: telemetry.totalReadings,
        color: [59, 130, 246], // blue-500
      },
      {
        label: 'Entradas no Diario',
        value: telemetry.diaryEntries,
        max: Math.max(telemetry.diaryEntries, 10),
        color: [168, 85, 247], // purple-500
      },
      {
        label: 'Sessoes de Estudo',
        value: telemetry.totalSessions,
        max: Math.max(telemetry.totalSessions, 20),
        color: [249, 115, 22], // orange-500
      },
      {
        label: 'Mensagens com Agentes',
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
    doc.text('Coordenacao LabSoft - IFSULDEMINAS', pageWidth / 2, signatureY + 8, {
      align: 'center',
    })

    // Certificate ID
    const certId = `CERT-${user.matricula}-${Date.now().toString(36).toUpperCase()}`
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`ID: ${certId}`, pageWidth - margin - 20, footerY, { align: 'right' })

    // Partners logos text
    doc.setFontSize(8)
    doc.text(
      'Neural Thinker AI Engineering + IFSULDEMINAS/LabSoft',
      pageWidth / 2,
      pageHeight - 18,
      {
        align: 'center',
      }
    )

    return { pdf: doc, certId }
  }

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)
    try {
      const { pdf, certId } = generateCertificatePDF()
      pdf.save(`certificado-academy-${user.matricula}-${certId}.pdf`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Certificado de Conclusão</h2>
              <p className="text-green-100">Relatório de Telemetria do Estágio</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {/* Progress overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso Geral
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Telemetry bars */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Métricas Coletadas</h3>

            {/* Videos */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Vídeos Assistidos</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {telemetry.videosCompleted} / {telemetry.totalVideos}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(telemetry.videosCompleted / telemetry.totalVideos) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Readings */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Leituras Concluídas</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {telemetry.readingsCompleted} / {telemetry.totalReadings}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(telemetry.readingsCompleted / telemetry.totalReadings) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Diary entries */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Entradas no Diário</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {telemetry.diaryEntries}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.min((telemetry.diaryEntries / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Sessions */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Sessões de Estudo</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {telemetry.totalSessions}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width: `${Math.min((telemetry.totalSessions / 20) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Chat messages */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Mensagens com Agentes</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {telemetry.chatMessages}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{
                    width: `${Math.min((telemetry.chatMessages / 50) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {user.totalXp}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">XP Total</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(user.totalTimeMinutes / 60)}h
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Tempo de Estudo</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Lv.{user.currentLevel}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{user.currentRank}</div>
            </div>
          </div>

          {/* Requirements */}
          {!canGenerateCertificate && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">
                Requisitos para Certificado
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li className={telemetry.videosCompleted >= 3 ? 'line-through opacity-50' : ''}>
                  - Assistir pelo menos 3 vídeos
                </li>
                <li className={telemetry.readingsCompleted >= 2 ? 'line-through opacity-50' : ''}>
                  - Completar pelo menos 2 leituras
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Fechar
            </button>
            <button
              onClick={handleGenerateCertificate}
              disabled={!canGenerateCertificate || isGenerating}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all ${
                canGenerateCertificate
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Gerando...
                </span>
              ) : (
                'Gerar Certificado (PDF)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
