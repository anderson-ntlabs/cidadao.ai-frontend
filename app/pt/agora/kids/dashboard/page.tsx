/**
 * Kids Dashboard Page
 *
 * Main dashboard for children with both mentors and video trail.
 * Features vibrant design and large touch targets.
 * Includes certificate progress tracking.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Added certificate system integration
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents } from '@/data/agents'
import { KIDS_VIDEOS } from '@/data/kids-videos'
import {
  KidsAgentCard,
  KidsVideoCard,
  KidsCertificateDisplay,
  KidsLevelBadges,
} from '@/components/kids'
import { useRouter } from 'next/navigation'
import { Sparkles, PlayCircle, MessageCircle, Loader2, BookOpen, Trophy } from 'lucide-react'
import Link from 'next/link'
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
  const { childName, parentEmail, trackAgent, trackVideo } = useKids()

  const [showCertificate, setShowCertificate] = useState(false)
  const [telemetry, setTelemetry] = useState<KidsTelemetryData | null>(null)

  const kidsAgents = getKidsAgents()
  const featuredVideos = KIDS_VIDEOS.slice(0, 4) // First 4 videos

  // Start session and load telemetry on mount
  useEffect(() => {
    if (isReady && childName) {
      startKidsSession(childName)
      const data = calculateKidsTelemetry()
      setTelemetry(data)
    }

    // End session on unmount
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
    // Update telemetry after tracking
    setTimeout(() => {
      setTelemetry(calculateKidsTelemetry())
    }, 100)
    // Open YouTube video in modal or new tab
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-kids-coral" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not in kids mode
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Modo Kids não está ativo.</p>
          <Link
            href="/pt/agora/kids"
            className="kids-button bg-kids-coral text-white px-6 py-3 rounded-full inline-block"
          >
            Configurar Área Kids
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-kids-yellow/20 px-4 py-2">
          <Sparkles className="h-5 w-5 text-kids-orange" />
          <span className="text-sm font-medium text-kids-orange">Bem-vindo à Área Kids!</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="kids-gradient-text">Olá, {childName || 'Amiguinho'}!</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Vamos aprender programação de um jeito divertido?
        </p>
      </section>

      {/* Mentors Section - Both Lobato and Tarsila */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-kids-turquoise flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Seus Mentores</h2>
          </div>
        </div>

        <p className="text-muted-foreground">
          Converse com nossos mentores! Eles vão te ajudar a aprender programação de forma
          divertida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kidsAgents.map((agent) => (
            <KidsAgentCard key={agent.id} agent={agent} lang="pt" onSelect={handleAgentSelect} />
          ))}
        </div>
      </section>

      {/* Trilha de Programação - Video Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-kids-coral flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Trilha de Programação</h2>
          </div>
          <Link
            href="/pt/agora/kids/videos"
            className="text-sm font-medium text-kids-coral hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        <p className="text-muted-foreground">
          Assista aos vídeos na ordem para aprender programação passo a passo!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVideos.map((video) => (
            <KidsVideoCard key={video.id} video={video} lang="pt" onClick={handleVideoClick} />
          ))}
        </div>
      </section>

      {/* Learning Path Overview */}
      <section className="kids-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-kids-purple flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">O que você vai aprender</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '🎮', title: 'Criar Jogos', desc: 'Aprenda a fazer seus próprios jogos!' },
            { emoji: '🤖', title: 'Robôs', desc: 'Programe robôs virtuais' },
            { emoji: '🎨', title: 'Animações', desc: 'Crie desenhos que se movem' },
            { emoji: '🧩', title: 'Lógica', desc: 'Resolva problemas como um ninja' },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 text-center"
            >
              <span className="text-4xl mb-2 block">{item.emoji}</span>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fun Fact */}
      <section className="kids-card p-8 text-center kids-gradient">
        <h3 className="text-2xl font-bold text-white mb-2">Você sabia?</h3>
        <p className="text-lg text-white/90 max-w-lg mx-auto">
          Programação é como um superpoder! Com ela, você pode criar jogos, aplicativos, robôs e
          muito mais! 🚀
        </p>
      </section>

      {/* Certificate Progress Section */}
      {telemetry && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-kids-yellow flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Sua Jornada</h2>
            </div>
            <button
              onClick={() => setShowCertificate(true)}
              className="text-sm font-medium text-kids-coral hover:underline"
            >
              Ver certificado →
            </button>
          </div>

          <div className="kids-card p-6">
            {/* Level badges */}
            <KidsLevelBadges telemetry={telemetry} />

            {/* Progress bar to next level */}
            {certificateInfo && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {certificateInfo.currentLevel
                      ? `Você é ${certificateInfo.currentLevel.label}!`
                      : 'Continue aprendendo!'}
                  </span>
                  {certificateInfo.nextLevel && (
                    <span className="text-muted-foreground">
                      Próximo: {certificateInfo.nextLevel.label}
                    </span>
                  )}
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-kids-turquoise to-kids-coral"
                    style={{ width: `${certificateInfo.progress}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  {certificateInfo.progress}% para o próximo nível!
                </p>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-kids-coral">{telemetry.videosWatched}</div>
                <div className="text-xs text-muted-foreground">Vídeos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kids-turquoise">
                  {telemetry.mentorConversations}
                </div>
                <div className="text-xs text-muted-foreground">Conversas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-kids-yellow">{telemetry.daysActive}</div>
                <div className="text-xs text-muted-foreground">Dias</div>
              </div>
            </div>
          </div>
        </section>
      )}

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
