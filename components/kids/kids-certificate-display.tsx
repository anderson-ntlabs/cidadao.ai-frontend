'use client'

/**
 * Kids Certificate Display
 *
 * Visual certificate display for children - colorful and fun!
 * Shows achieved level with animations and friendly messaging.
 * Parents can download PDF report from here.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-09
 */

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import {
  calculateKidsLevel,
  formatKidsTime,
  type KidsTelemetryData,
  type KidsCertificateLevel,
} from '@/lib/agora/kids-certificate-requirements'
import { KidsProgressTimeline, KidsLevelBadges } from './kids-progress-timeline'
import { generateKidsParentReport } from '@/lib/agora/kids-parent-report'
import { Download, Share2, Star, Trophy, Sparkles, FileText, X } from 'lucide-react'

interface KidsCertificateDisplayProps {
  isOpen: boolean
  onClose: () => void
  telemetry: KidsTelemetryData
  childName: string
  parentName: string
  parentEmail: string
}

export function KidsCertificateDisplay({
  isOpen,
  onClose,
  telemetry,
  childName,
  parentName,
  parentEmail,
}: KidsCertificateDisplayProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [activeTab, setActiveTab] = useState<'certificate' | 'timeline'>('certificate')

  const { currentLevel, nextLevel, progress, milestones } = useMemo(
    () => calculateKidsLevel(telemetry),
    [telemetry]
  )

  const handleDownloadReport = async () => {
    setIsGeneratingReport(true)
    try {
      const pdf = generateKidsParentReport({
        childName,
        parentName,
        parentEmail,
        telemetry,
        currentLevel,
        milestones,
      })
      pdf.save(`relatorio-${childName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" showCloseButton={false} className="max-h-[90vh] overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('certificate')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === 'certificate'
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Trophy className="w-4 h-4 inline mr-1" />
              Certificado
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === 'timeline'
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              Jornada
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
          {activeTab === 'certificate' ? (
            <CertificateView
              telemetry={telemetry}
              childName={childName}
              currentLevel={currentLevel}
              progress={progress}
            />
          ) : (
            <KidsProgressTimeline telemetry={telemetry} childName={childName} />
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
              loading={isGeneratingReport}
              leftIcon={<FileText className="w-5 h-5" />}
              className="flex-1"
            >
              {isGeneratingReport ? 'Gerando...' : 'Relatorio para Pais'}
            </Button>
            {currentLevel && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  // TODO: Share certificate image
                  alert('Em breve: compartilhar certificado!')
                }}
                leftIcon={<Share2 className="w-5 h-5" />}
                className="flex-1"
                style={{ backgroundColor: currentLevel.color }}
              >
                Compartilhar
              </Button>
            )}
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            O relatorio completo e enviado apenas para os pais
          </p>
        </div>
      </ModalContent>
    </Modal>
  )
}

interface CertificateViewProps {
  telemetry: KidsTelemetryData
  childName: string
  currentLevel: KidsCertificateLevel | null
  progress: number
}

function CertificateView({ telemetry, childName, currentLevel, progress }: CertificateViewProps) {
  if (!currentLevel) {
    // No certificate yet - show encouragement
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] flex items-center justify-center">
          <Star className="w-12 h-12 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Continue assim, {childName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Voce esta no caminho certo para ganhar seu primeiro certificado!
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#FF6B6B] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {progress}% para o primeiro certificado!
          </p>
        </div>

        {/* Level badges (greyed out) */}
        <KidsLevelBadges telemetry={telemetry} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <StatCard icon="🎬" value={telemetry.videosWatched} label="Videos" color="#FF6B6B" />
          <StatCard
            icon="💬"
            value={telemetry.mentorConversations}
            label="Conversas"
            color="#4ECDC4"
          />
          <StatCard icon="📅" value={telemetry.daysActive} label="Dias" color="#FFE66D" />
        </div>
      </div>
    )
  }

  // Has certificate - show it!
  return (
    <div className="text-center space-y-6">
      {/* Certificate card */}
      <div
        className="relative mx-auto max-w-md p-8 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentLevel.color}20 0%, ${currentLevel.color}40 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: currentLevel.color, transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: currentLevel.color, transform: 'translate(-30%, 30%)' }}
        />

        {/* Stars decoration */}
        <div className="absolute top-4 left-4 text-2xl animate-bounce">⭐</div>
        <div className="absolute top-4 right-4 text-2xl animate-bounce delay-100">🌟</div>

        {/* Badge */}
        <div
          className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-6xl shadow-lg mb-4"
          style={{ backgroundColor: currentLevel.color }}
        >
          {currentLevel.emoji}
        </div>

        {/* Title */}
        <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
          Certificado
        </h2>
        <h1 className="text-3xl font-black mb-2" style={{ color: currentLevel.color }}>
          {currentLevel.label}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentLevel.description}</p>

        {/* Child name */}
        <div className="py-4 border-t border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Concedido a</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{childName}</p>
        </div>

        {/* Version badge */}
        <div className="mt-4">
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-white font-bold"
            style={{ backgroundColor: currentLevel.color }}
          >
            <Trophy className="w-4 h-4" />
            Cidadaozinho {currentLevel.version}
          </span>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400 mt-4">
          {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Level badges */}
      <KidsLevelBadges telemetry={telemetry} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        <StatCard icon="🎬" value={telemetry.videosWatched} label="Videos" color="#FF6B6B" />
        <StatCard
          icon="💬"
          value={telemetry.mentorConversations}
          label="Conversas"
          color="#4ECDC4"
        />
        <StatCard icon="📅" value={telemetry.daysActive} label="Dias" color="#FFE66D" />
        <StatCard
          icon="⏱️"
          value={Math.floor(telemetry.totalTimeMinutes / 60)}
          label="Horas"
          color="#A78BFA"
        />
      </div>

      {/* Time message */}
      <p className="text-gray-500 dark:text-gray-400">
        Total de {formatKidsTime(telemetry.totalTimeMinutes)} de estudo! 🎉
      </p>
    </div>
  )
}

interface StatCardProps {
  icon: string
  value: number
  label: string
  color: string
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="p-3 rounded-xl text-center" style={{ backgroundColor: `${color}15` }}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}
