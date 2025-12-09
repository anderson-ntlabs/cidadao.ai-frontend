/**
 * Kids Area Main Page
 *
 * Dashboard for children with agents and videos.
 * Features vibrant design and large touch targets.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useKids, useRequireKidsMode } from '@/hooks/use-kids'
import { getKidsAgents } from '@/data/agents'
import { KIDS_VIDEOS } from '@/data/kids-videos'
import { KidsAgentCard, KidsVideoCard } from '@/components/kids'
import { useRouter } from 'next/navigation'
import { Sparkles, PlayCircle, MessageCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function KidsPage() {
  const router = useRouter()
  const { isReady, isLoading } = useRequireKidsMode()
  const { childName, trackAgent, trackVideo } = useKids()

  const kidsAgents = getKidsAgents()
  const featuredVideos = KIDS_VIDEOS.slice(0, 4) // First 4 videos

  const handleAgentSelect = (agentId: string) => {
    trackAgent(agentId)
    router.push(`/pt/agora/kids/chat?agent=${agentId}`)
  }

  const handleVideoClick = (video: (typeof KIDS_VIDEOS)[0]) => {
    trackVideo(video.id)
    // Open YouTube video in modal or new tab
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not in kids mode (handled by hook)
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Modo Kids não está ativo.</p>
          <Link
            href="/pt/agora"
            className="kids-button bg-primary text-primary-foreground px-6 py-3 rounded-full inline-block"
          >
            Voltar para Ágora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-kids-yellow/20 px-4 py-2">
          <Sparkles className="h-5 w-5 text-kids-orange" />
          <span className="text-sm font-medium text-kids-orange">Bem-vindo à Área Kids!</span>
        </div>
        <h1 className="text-kids-large kids-gradient-text">Olá, {childName || 'Amiguinho'}!</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Vamos aprender programação de um jeito divertido?
        </p>
      </section>

      {/* Agents Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-kids-turquoise flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-kids-heading">Seus Mentores</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kidsAgents.map((agent) => (
            <KidsAgentCard key={agent.id} agent={agent} lang="pt" onSelect={handleAgentSelect} />
          ))}
        </div>
      </section>

      {/* Videos Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-kids-coral flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-kids-heading">Vídeos para Aprender</h2>
          </div>
          <Link
            href="/pt/agora/kids/videos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVideos.map((video) => (
            <KidsVideoCard key={video.id} video={video} lang="pt" onClick={handleVideoClick} />
          ))}
        </div>
      </section>

      {/* Fun Facts */}
      <section className="kids-card p-8 text-center kids-gradient">
        <h3 className="text-2xl font-bold text-white mb-2">Você sabia?</h3>
        <p className="text-lg text-white/90 max-w-lg mx-auto">
          Programação é como uma superpoder! Com ela, você pode criar jogos, aplicativos, robôs e
          muito mais!
        </p>
      </section>
    </div>
  )
}
