/**
 * Kids Dashboard Page
 *
 * Main dashboard for children - Uses Agora Design System with Kids theme.
 * Features vibrant colors, large touch targets, and fun visual elements.
 * Follows the same layout patterns as the main Agora dashboard.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Consolidated with Agora design system
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents } from '@/data/agents'
import { KIDS_VIDEOS } from '@/data/kids-videos'
import { GlassCard } from '@/components/ui/glass-card'
import { KidsCertificateDisplay, KidsLevelBadges } from '@/components/kids'
import {
  Sparkles,
  PlayCircle,
  MessageCircle,
  Loader2,
  Trophy,
  Star,
  Rocket,
  Heart,
  ArrowRight,
  Clock,
  BookOpen,
  Gamepad2,
} from 'lucide-react'
import {
  calculateKidsTelemetry,
  startKidsSession,
  endKidsSession,
} from '@/lib/analytics/kids-tracker'
import { calculateKidsLevel } from '@/lib/agora/kids-certificate-requirements'
import type { KidsTelemetryData } from '@/lib/agora/kids-certificate-requirements'

export default function KidsDashboardPage() {
  const router = useRouter()
  const { isReady, isLoading } = useRequireKidsMode()
  const { childName, parentEmail, childAvatar, trackAgent, trackVideo } = useKids()

  const [showCertificate, setShowCertificate] = useState(false)
  const [telemetry, setTelemetry] = useState<KidsTelemetryData | null>(null)

  const kidsAgents = getKidsAgents()
  const featuredVideos = KIDS_VIDEOS.slice(0, 4)

  // Start session and load telemetry on mount
  useEffect(() => {
    if (isReady && childName) {
      startKidsSession(childName)
      const data = calculateKidsTelemetry()
      setTelemetry(data)
    }

    return () => {
      if (isReady) {
        endKidsSession()
      }
    }
  }, [isReady, childName])

  // Calculate certificate level
  const certificateInfo = useMemo(() => {
    if (!telemetry) return null
    return calculateKidsLevel(telemetry)
  }, [telemetry])

  const handleAgentSelect = (agentId: string) => {
    trackAgent(agentId)
    router.push(`/pt/agora/kids/chat?agent=${agentId}`)
  }

  const handleVideoClick = (video: (typeof KIDS_VIDEOS)[0]) => {
    trackVideo(video.id)
    setTimeout(() => {
      setTelemetry(calculateKidsTelemetry())
    }, 100)
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kids-coral to-kids-yellow flex items-center justify-center animate-pulse">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-kids-coral/20 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-kids-coral" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Modo Kids não está ativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Peça para seus pais configurarem a Área Kids para você!
          </p>
          <Link
            href="/pt/agora/kids"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kids-coral text-white font-medium hover:bg-kids-coral/90 transition-colors"
          >
            Configurar Área Kids
            <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Section - Welcome + Progress */}
      <GlassCard className="overflow-hidden bg-gradient-to-br from-kids-coral/10 via-kids-yellow/10 to-kids-turquoise/10 dark:from-kids-coral/5 dark:via-kids-yellow/5 dark:to-kids-turquoise/5">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-kids-turquoise to-kids-coral p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {childAvatar === 'tarsila' ? (
                    <Image
                      src="/agents/tarsila-amaral.png"
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/agents/monteiro-lobato.png"
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
              {certificateInfo?.currentLevel && (
                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-lg"
                  style={{ backgroundColor: certificateInfo.currentLevel.color }}
                >
                  {certificateInfo.currentLevel.emoji}
                </div>
              )}
            </div>

            {/* Welcome Message */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kids-yellow/30 mb-2">
                <Sparkles className="w-4 h-4 text-kids-orange" />
                <span className="text-sm font-medium text-kids-orange">Área Kids</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Olá, {childName || 'Amiguinho'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {certificateInfo?.currentLevel
                  ? `Você é um ${certificateInfo.currentLevel.label}!`
                  : 'Vamos aprender programação de um jeito divertido?'}
              </p>
            </div>

            {/* Quick Stats - Mini Cards */}
            {telemetry && (
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="text-center p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-kids-coral/20 flex items-center justify-center mb-1">
                    <PlayCircle className="w-5 h-5 text-kids-coral" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {telemetry.videosWatched}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Vídeos
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-kids-turquoise/20 flex items-center justify-center mb-1">
                    <MessageCircle className="w-5 h-5 text-kids-turquoise" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {telemetry.mentorConversations}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Conversas
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-kids-yellow/30 flex items-center justify-center mb-1">
                    <Star className="w-5 h-5 text-kids-orange" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {telemetry.daysActive}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Dias
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Main Grid - 2/3 + 1/3 Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mentors Card */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-kids-turquoise/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-kids-turquoise" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Seus Mentores
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Escolha um para conversar!
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {kidsAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-2 border-transparent hover:border-kids-turquoise transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                      <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-kids-turquoise transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role.pt}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                        {agent.description.pt}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-kids-turquoise opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Conversar</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Videos Trail Card */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-kids-coral/20 flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-kids-coral" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Trilha de Programação
                </span>
              </div>
              <Link
                href="/pt/agora/kids/videos"
                className="text-xs font-medium text-kids-coral hover:underline flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredVideos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className="group text-left"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-xs font-bold text-kids-coral">
                      #{index + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-kids-coral flex items-center justify-center shadow-lg">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-kids-coral transition-colors">
                    {video.title}
                  </h4>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* What You'll Learn Card */}
          <GlassCard className="p-5 bg-gradient-to-br from-kids-purple/10 to-kids-turquoise/10 dark:from-kids-purple/5 dark:to-kids-turquoise/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-kids-purple/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-kids-purple" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                O que você vai aprender
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  emoji: '🎮',
                  title: 'Criar Jogos',
                  desc: 'Faça seus próprios jogos!',
                  color: 'kids-coral',
                },
                {
                  emoji: '🤖',
                  title: 'Robôs',
                  desc: 'Programe robôs virtuais',
                  color: 'kids-turquoise',
                },
                {
                  emoji: '🎨',
                  title: 'Animações',
                  desc: 'Desenhos que se movem',
                  color: 'kids-yellow',
                },
                { emoji: '🧩', title: 'Lógica', desc: 'Resolva problemas', color: 'kids-purple' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 text-center hover:scale-105 transition-transform"
                >
                  <span className="text-3xl block mb-2">{item.emoji}</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Certificate Progress Card */}
          {telemetry && (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-kids-yellow/30 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-kids-orange" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sua Jornada
                  </span>
                </div>
                <button
                  onClick={() => setShowCertificate(true)}
                  className="text-xs font-medium text-kids-coral hover:underline"
                >
                  Ver certificado
                </button>
              </div>

              {/* Level Badges */}
              <KidsLevelBadges telemetry={telemetry} />

              {/* Progress to Next Level */}
              {certificateInfo && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {certificateInfo.currentLevel
                        ? certificateInfo.currentLevel.label
                        : 'Iniciante'}
                    </span>
                    {certificateInfo.nextLevel && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {certificateInfo.nextLevel.label}
                      </span>
                    )}
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-kids-turquoise to-kids-coral"
                      style={{ width: `${certificateInfo.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    {certificateInfo.progress}% para o próximo nível!
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-kids-coral">{telemetry.videosWatched}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Vídeos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-kids-turquoise">
                    {telemetry.mentorConversations}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Conversas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-kids-orange">{telemetry.daysActive}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Dias</div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Fun Fact Card */}
          <GlassCard className="p-5 bg-gradient-to-br from-kids-coral to-kids-yellow text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Você sabia?</span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Programação é como um superpoder! Com ela, você pode criar jogos, aplicativos, robôs e
              muito mais! 🚀
            </p>
          </GlassCard>

          {/* Quick Actions Card */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-kids-turquoise/20 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-kids-turquoise" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Ações Rápidas
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/pt/agora/kids/videos"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-kids-coral/10 dark:hover:bg-kids-coral/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-kids-coral/20 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-kids-coral" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ver Vídeos</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {KIDS_VIDEOS.length} vídeos disponíveis
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-kids-coral group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/pt/agora/kids/chat?agent=monteiro_lobato"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-kids-turquoise/10 dark:hover:bg-kids-turquoise/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-kids-turquoise/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-kids-turquoise" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Conversar</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fale com os mentores</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-kids-turquoise group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </GlassCard>

          {/* Time Spent Card */}
          {telemetry && telemetry.totalTimeMinutes > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kids-purple to-kids-turquoise flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tempo de estudo</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {telemetry.totalTimeMinutes >= 60
                      ? `${Math.floor(telemetry.totalTimeMinutes / 60)}h ${telemetry.totalTimeMinutes % 60}min`
                      : `${telemetry.totalTimeMinutes} minutos`}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {telemetry && (
        <KidsCertificateDisplay
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          telemetry={telemetry}
          childName={childName || 'Amiguinho'}
          parentName=""
          parentEmail={parentEmail || ''}
        />
      )}
    </div>
  )
}
