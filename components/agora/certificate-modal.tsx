'use client'

/**
 * Certificate Modal Component
 *
 * Modal for viewing certificate progress and downloading certificates/reports.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 * Refactored from 1579 lines to ~450 lines
 */

import { useState } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { useCertificateData } from '@/hooks/use-certificate-data'
import { saveCertificate } from '@/app/pt/agora/actions'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
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
import { determineCertificateType } from '@/lib/agora/certificate-requirements'
import { UI_COLOR_CLASSES, type UIMetric } from '@/lib/agora/certificate'
// Import PDF generators directly to avoid bundling jsPDF on server
import { generateCertificatePDF } from '@/lib/agora/certificate/generate-certificate-pdf'
import { generateReportPDF } from '@/lib/agora/certificate/generate-report-pdf'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ isOpen, onClose }: CertificateModalProps) {
  const { user, xpTransactions, diaryEntries, sessions, isAuthenticated } = useAgora()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const {
    telemetry,
    validation,
    consistency,
    dailyActivity,
    canGenerateCertificate,
    completionPercentage,
    hasConsistencyWarnings,
    certificateType,
  } = useCertificateData(isOpen)

  const handleGenerateCertificate = async () => {
    if (!user) return
    setIsGenerating(true)
    try {
      const { pdf, id: certId } = generateCertificatePDF({
        id: user.id,
        name: user.name,
        email: user.email,
        totalXp: user.totalXp,
        totalTimeMinutes: user.totalTimeMinutes,
        currentLevel: user.currentLevel,
        currentRank: user.currentRank,
        currentStreak: user.currentStreak,
      })
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
    if (!user) return
    setIsGeneratingReport(true)
    try {
      const { pdf, id: reportId } = generateReportPDF({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          totalXp: user.totalXp,
          totalTimeMinutes: user.totalTimeMinutes,
          currentLevel: user.currentLevel,
          currentRank: user.currentRank,
          currentStreak: user.currentStreak,
        },
        telemetry,
        xpTransactions: xpTransactions.map((t) => ({
          id: t.id,
          sourceType: t.sourceType,
          amount: t.amount,
          description: t.description,
          createdAt: t.createdAt,
        })),
        diaryEntries: diaryEntries.map((e) => ({
          id: e.id,
          entryDate: e.entryDate,
          content: e.content,
          createdAt: e.createdAt,
        })),
        dailyActivity,
      })
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

  // Build UI metrics from telemetry
  const uiMetrics: UIMetric[] = [
    {
      label: 'Videos Obrigatorios',
      value: telemetry.requiredVideosCompleted,
      max: telemetry.totalRequiredVideos,
      icon: Video,
      color: 'green',
      required: true,
    },
    {
      label: 'Tempo de Video (min)',
      value: Math.floor(telemetry.totalVideoWatchTimeSeconds / 60),
      max: 120,
      icon: Clock,
      color: 'green',
      required: true,
    },
    {
      label: 'Leituras Obrigatorias',
      value: telemetry.requiredReadingsCompleted,
      max: telemetry.totalRequiredReadings,
      icon: BookOpen,
      color: 'blue',
      required: true,
    },
    {
      label: 'Entradas no Diario',
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
                Certificado e Relatorio
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
              Metricas Coletadas
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
                        className={`h-full rounded-full transition-all duration-500 ${UI_COLOR_CLASSES[metric.color]}`}
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
                    Avisos de Consistencia
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
