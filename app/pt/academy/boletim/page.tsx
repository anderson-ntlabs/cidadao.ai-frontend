/**
 * Academy Boletim (Report Card) Page
 *
 * Real-time metrics dashboard with:
 * - XP and progression tracking
 * - Activity history
 * - Agenda events summary
 * - PDF export functionality
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { AcademyHeader, AcademySidebar } from '@/components/academy'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FileText,
  Download,
  Trophy,
  Flame,
  Clock,
  MessageSquare,
  Video,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Target,
  GraduationCap,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { trackReportDownload } from '@/lib/analytics/academy-tracker'

// Storage keys
const VIDEO_PROGRESS_KEY = 'academy_demo_video_progress'
const READING_PROGRESS_KEY = 'academy_demo_reading_progress'
const STORAGE_EVENTS_KEY = 'academy_agenda_events'

// Rank configuration
const ranks = {
  novato: { name: 'Novato', color: 'gray', minXp: 0 },
  aprendiz: { name: 'Aprendiz', color: 'green', minXp: 100 },
  contribuidor: { name: 'Contribuidor', color: 'blue', minXp: 500 },
  mentor: { name: 'Mentor', color: 'purple', minXp: 2000 },
  arquiteto: { name: 'Arquiteto', color: 'yellow', minXp: 5000 },
}

interface AgendaEvent {
  id: string
  title: string
  start: string
  end?: string
  type: 'study' | 'reading' | 'video' | 'chat' | 'deadline'
  description?: string
  xpReward?: number
  completed?: boolean
}

interface TelemetryData {
  videosCompleted: number
  totalVideos: number
  readingsCompleted: number
  totalReadings: number
  totalXp: number
  totalTimeMinutes: number
  totalSessions: number
  chatMessages: number
  badgesEarned: number
  currentStreak: number
  longestStreak: number
  level: number
  rank: string
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando boletim...</p>
      </div>
    </div>
  )
}

function BoletimContent() {
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  // Auth hooks
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Determine which auth to use
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  // Get user data
  const user = useMemo(() => {
    if (isDemoMode) {
      return demoAuth.user
    }
    if (realAuth.isAuthenticated && realAuth.user) {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user.name)}&background=16a34a&color=fff`
      return {
        ...demoAuth.user,
        id: realAuth.user.id,
        name: realAuth.user.name,
        email: realAuth.user.email,
        avatar: realAuth.user.avatar || defaultAvatar,
        totalXp: realAuth.user.totalXp,
        currentLevel: realAuth.user.currentLevel,
        currentRank: realAuth.user.currentRank,
        currentStreak: realAuth.user.currentStreak,
        totalTimeMinutes: realAuth.user.totalTimeMinutes,
        totalSessions: realAuth.user.totalSessions,
      }
    }
    return demoAuth.user
  }, [isDemoMode, realAuth.isAuthenticated, realAuth.user, demoAuth.user])

  const { xpTransactions, badges, sessions, resetDemo } = demoAuth

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    videosCompleted: 0,
    totalVideos: 15,
    readingsCompleted: 0,
    totalReadings: 8,
    totalXp: 0,
    totalTimeMinutes: 0,
    totalSessions: 0,
    chatMessages: 0,
    badgesEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    rank: 'novato',
  })

  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load telemetry data
  const loadTelemetry = useCallback(() => {
    // Load video progress
    const videoProgress = localStorage.getItem(VIDEO_PROGRESS_KEY)
    const videosCompleted = videoProgress
      ? (Object.values(JSON.parse(videoProgress)) as Array<{ status?: string }>).filter(
          (v) => v.status === 'completed'
        ).length
      : 0

    // Load reading progress
    const readingProgress = localStorage.getItem(READING_PROGRESS_KEY)
    const readingsCompleted = readingProgress
      ? (Object.values(JSON.parse(readingProgress)) as Array<{ status?: string }>).filter(
          (r) => r.status === 'completed'
        ).length
      : 0

    // Load agenda events
    const savedEvents = localStorage.getItem(STORAGE_EVENTS_KEY)
    if (savedEvents) {
      setAgendaEvents(JSON.parse(savedEvents))
    }

    // Count chat messages from XP transactions
    const chatMessages = xpTransactions.filter(
      (t) =>
        t.sourceType === 'chat' || t.sourceType === 'agent_chat' || t.sourceType === 'conversation'
    ).length

    setTelemetry({
      videosCompleted,
      totalVideos: 15,
      readingsCompleted,
      totalReadings: 8,
      totalXp: user.totalXp,
      totalTimeMinutes: user.totalTimeMinutes,
      totalSessions: sessions.length,
      chatMessages: chatMessages * 5,
      badgesEarned: badges.length,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      level: user.currentLevel,
      rank: user.currentRank,
    })

    setLastUpdated(new Date())
  }, [user, xpTransactions, badges, sessions])

  // Load on mount and when dependencies change
  useEffect(() => {
    if (!isLoading) {
      loadTelemetry()
    }
  }, [isLoading, loadTelemetry])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTelemetry, 30000)
    return () => clearInterval(interval)
  }, [loadTelemetry])

  const handleLogout = async () => {
    if (!isDemoMode && realAuth.isAuthenticated) {
      await realAuth.logout()
    } else {
      resetDemo()
    }
  }

  // Calculate progress percentage
  const overallProgress = Math.round(
    (telemetry.videosCompleted / telemetry.totalVideos) * 35 +
      (telemetry.readingsCompleted / telemetry.totalReadings) * 35 +
      (telemetry.badgesEarned > 0 ? 15 : 0) +
      (telemetry.totalSessions > 0 ? 15 : 0)
  )

  // Get upcoming and completed events
  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = agendaEvents
    .filter((e) => e.start >= today && !e.completed)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5)

  const completedEvents = agendaEvents
    .filter((e) => e.completed)
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, 5)

  // Recent XP transactions
  const recentXp = xpTransactions.slice(0, 10)

  // Generate PDF report
  const generatePDF = () => {
    setIsGenerating(true)

    try {
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

      // === COVER PAGE ===
      doc.setFillColor(240, 253, 244)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')

      // Header bar
      doc.setFillColor(22, 163, 74)
      doc.rect(0, 0, pageWidth, 50, 'F')

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('BOLETIM ACADEMICO', pageWidth / 2, 30, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Academia Cidadao.AI', pageWidth / 2, 42, { align: 'center' })

      // Student info
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, 65, pageWidth - margin * 2, 50, 5, 5, 'F')
      doc.setDrawColor(22, 163, 74)
      doc.setLineWidth(1)
      doc.roundedRect(margin, 65, pageWidth - margin * 2, 50, 5, 5)

      doc.setTextColor(22, 163, 74)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTUDANTE', margin + 10, 78)

      doc.setTextColor(55, 65, 81)
      doc.setFontSize(16)
      doc.text(user.name, margin + 10, 92)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(user.email, margin + 10, 105)

      // Stats summary
      const statsY = 130
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, statsY, pageWidth - margin * 2, 40, 5, 5, 'F')

      const hours = Math.floor(telemetry.totalTimeMinutes / 60)
      const minutes = telemetry.totalTimeMinutes % 60
      const statWidth = (pageWidth - margin * 2) / 5
      const stats = [
        { label: 'Carga Horaria', value: `${hours}h ${minutes}m` },
        { label: 'XP Total', value: telemetry.totalXp.toString() },
        { label: 'Nivel', value: `Lv.${telemetry.level}` },
        { label: 'Rank', value: telemetry.rank.charAt(0).toUpperCase() + telemetry.rank.slice(1) },
        { label: 'Badges', value: telemetry.badgesEarned.toString() },
      ]

      stats.forEach((stat, index) => {
        const x = margin + statWidth * index + statWidth / 2
        doc.setTextColor(22, 163, 74)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(stat.value, x, statsY + 18, { align: 'center' })
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(stat.label, x, statsY + 30, { align: 'center' })
      })

      // Progress section
      currentY = 185
      doc.setTextColor(55, 65, 81)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Progresso Geral', margin, currentY)
      currentY += 10

      // Progress bar
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 10, 3, 3, 'F')
      doc.setFillColor(22, 163, 74)
      doc.roundedRect(
        margin,
        currentY,
        ((pageWidth - margin * 2) * overallProgress) / 100,
        10,
        3,
        3,
        'F'
      )
      doc.setTextColor(55, 65, 81)
      doc.setFontSize(10)
      doc.text(`${overallProgress}%`, pageWidth - margin, currentY + 8, { align: 'right' })

      currentY += 25

      // Metrics breakdown
      const metrics = [
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
          label: 'Sessoes de Estudo',
          value: telemetry.totalSessions,
          max: Math.max(telemetry.totalSessions, 20),
          color: [168, 85, 247],
        },
        {
          label: 'Streak Atual',
          value: telemetry.currentStreak,
          max: Math.max(telemetry.longestStreak, 7),
          color: [249, 115, 22],
        },
      ]

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Metricas de Atividade', margin, currentY)
      currentY += 10

      metrics.forEach((metric) => {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(55, 65, 81)
        doc.text(metric.label, margin, currentY + 5)
        doc.text(`${metric.value} / ${metric.max}`, pageWidth - margin - 30, currentY + 5)

        // Bar
        const barWidth = 100
        const barX = pageWidth - margin - barWidth - 35
        doc.setFillColor(229, 231, 235)
        doc.roundedRect(barX, currentY, barWidth, 6, 2, 2, 'F')
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2])
        const fillWidth = Math.max((metric.value / metric.max) * barWidth, 3)
        doc.roundedRect(barX, currentY, fillWidth, 6, 2, 2, 'F')

        currentY += 15
      })

      // === PAGE 2: ACTIVITY LOG ===
      addNewPage()

      doc.setFillColor(22, 163, 74)
      doc.rect(0, 0, pageWidth, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('HISTORICO DE ATIVIDADES', pageWidth / 2, 22, { align: 'center' })

      currentY = 50

      // Recent XP transactions
      doc.setTextColor(22, 163, 74)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Ultimas Conquistas de XP', margin, currentY)
      currentY += 8

      // Table header
      doc.setFillColor(240, 253, 244)
      doc.rect(margin, currentY, pageWidth - margin * 2, 10, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text('Data', margin + 5, currentY + 7)
      doc.text('Atividade', margin + 40, currentY + 7)
      doc.text('XP', pageWidth - margin - 10, currentY + 7, { align: 'right' })
      currentY += 12

      doc.setFont('helvetica', 'normal')
      recentXp.slice(0, 15).forEach((tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })
        doc.setTextColor(107, 114, 128)
        doc.text(date, margin + 5, currentY + 5)
        doc.setTextColor(55, 65, 81)
        doc.text(tx.description.slice(0, 45), margin + 40, currentY + 5)
        doc.setTextColor(22, 163, 74)
        doc.text(`+${tx.amount}`, pageWidth - margin - 10, currentY + 5, { align: 'right' })
        currentY += 8
      })

      currentY += 15

      // Agenda section
      if (agendaEvents.length > 0) {
        checkPageBreak(60)
        doc.setTextColor(59, 130, 246)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Agenda de Estudos', margin, currentY)
        currentY += 8

        // Upcoming events
        const upcoming = agendaEvents.filter((e) => !e.completed).slice(0, 5)
        if (upcoming.length > 0) {
          doc.setFontSize(10)
          doc.setTextColor(55, 65, 81)
          doc.text('Proximos Eventos:', margin, currentY + 5)
          currentY += 10

          upcoming.forEach((event) => {
            const date = new Date(event.start).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
            doc.setFontSize(8)
            doc.setTextColor(107, 114, 128)
            doc.text(`${date}`, margin + 5, currentY + 5)
            doc.setTextColor(55, 65, 81)
            doc.text(event.title.slice(0, 50), margin + 30, currentY + 5)
            currentY += 8
          })
        }

        currentY += 10

        // Completed events
        const completed = agendaEvents.filter((e) => e.completed).slice(0, 5)
        if (completed.length > 0) {
          doc.setFontSize(10)
          doc.setTextColor(22, 163, 74)
          doc.text('Eventos Concluidos:', margin, currentY + 5)
          currentY += 10

          completed.forEach((event) => {
            const date = new Date(event.start).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
            doc.setFontSize(8)
            doc.setTextColor(107, 114, 128)
            doc.text(`${date}`, margin + 5, currentY + 5)
            doc.setTextColor(55, 65, 81)
            doc.text(`[OK] ${event.title.slice(0, 45)}`, margin + 30, currentY + 5)
            if (event.xpReward) {
              doc.setTextColor(22, 163, 74)
              doc.text(`+${event.xpReward} XP`, pageWidth - margin - 10, currentY + 5, {
                align: 'right',
              })
            }
            currentY += 8
          })
        }
      }

      // === FOOTER ===
      addNewPage()
      doc.setFillColor(240, 253, 244)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')

      doc.setTextColor(55, 65, 81)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Este boletim foi gerado automaticamente pelo sistema', pageWidth / 2, 80, {
        align: 'center',
      })
      doc.text('Academia Cidadao.AI com base nas atividades registradas.', pageWidth / 2, 92, {
        align: 'center',
      })

      // Signature
      doc.setDrawColor(156, 163, 175)
      doc.setLineWidth(0.5)
      doc.line(pageWidth / 2 - 60, 130, pageWidth / 2 + 60, 130)
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      doc.text('Coordenacao Cidadao.AI Academy', pageWidth / 2, 140, { align: 'center' })

      // Report ID and date
      const reportId = `BOL-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text(`Gerado em ${currentDate}`, pageWidth / 2, pageHeight - 25, { align: 'center' })
      doc.text(`ID: ${reportId}`, pageWidth / 2, pageHeight - 18, { align: 'center' })

      // Save PDF
      doc.save(`boletim-academy-${reportId}.pdf`)

      // Track download
      trackReportDownload(hours, telemetry.totalXp)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato

  return (
    <div className="min-h-screen flex flex-col">
      <AcademyHeader user={user} onLogout={handleLogout} isDemoMode={isDemoMode} />

      <div className="flex flex-1">
        <AcademySidebar user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Boletim Academico
                  </h1>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={loadTelemetry} size="md">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </Button>
                <Button variant="primary" onClick={generatePDF} disabled={isGenerating} size="md">
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Overview */}
            <Card
              variant="filled"
              padding="lg"
              className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 border-0"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm mb-1">Progresso Geral</p>
                    <p className="text-4xl font-bold">{overallProgress}%</p>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold">{telemetry.totalXp}</p>
                    <p className="text-green-100 text-sm">XP Total</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">Lv.{telemetry.level}</p>
                    <p className="text-green-100 text-sm">{rankInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{telemetry.badgesEarned}</p>
                    <p className="text-green-100 text-sm">Badges</p>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {telemetry.videosCompleted}/{telemetry.totalVideos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {telemetry.readingsCompleted}/{telemetry.totalReadings}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Leituras</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {telemetry.currentStreak}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dias Seguidos</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.floor(telemetry.totalTimeMinutes / 60)}h
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tempo Total</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent XP */}
              <Card variant="elevated" padding="md">
                <CardHeader className="mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Historico de XP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {recentXp.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Nenhuma atividade registrada ainda
                    </p>
                  ) : (
                    recentXp.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge variant="success" size="sm">
                          +{tx.amount} XP
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Agenda Summary */}
              <Card variant="elevated" padding="md">
                <CardHeader className="mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Agenda de Estudos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upcoming */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Proximos Eventos
                    </p>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhum evento agendado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                          >
                            <Circle className="w-4 h-4 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(event.start).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completed */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Concluidos Recentemente
                    </p>
                    {completedEvents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhum evento concluido
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {completedEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(event.start).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                            {event.xpReward && (
                              <Badge variant="success" size="sm">
                                +{event.xpReward} XP
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link href={`/pt/academy/agenda${isDemoMode ? '?demo=true' : ''}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Calendar className="w-4 h-4" />
                      Ver Agenda Completa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <Card variant="elevated" padding="md" className="mt-6">
                <CardHeader className="mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Badges Conquistados ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/30"
                      >
                        <span className="text-3xl">{badge.emoji}</span>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{badge.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {badge.criteria}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AcademyBoletimPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BoletimContent />
    </Suspense>
  )
}
