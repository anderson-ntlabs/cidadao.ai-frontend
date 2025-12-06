'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAcademy, AcademyTrack } from '@/hooks/use-academy'
import { AcademyHeader, AcademySidebar } from '@/components/academy'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Server,
  Palette,
  Brain,
  Code,
  CheckCircle2,
  Play,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Plus,
} from 'lucide-react'

/**
 * Academy Trilhas (Tracks) Page
 *
 * Shows all available tracks and user's progress:
 * - Tracks already enrolled
 * - Available tracks to start
 * - Progress per track
 * - Certificates earned
 *
 * Users can enroll in multiple tracks and earn multiple certificates.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-06
 */

const TRACKS_INFO = [
  {
    id: 'backend' as const,
    name: 'Backend',
    description: 'APIs, microservices e arquitetura de sistemas',
    details: [
      'FastAPI e Python',
      'Design de APIs REST',
      'Bancos de dados',
      'Autenticacao e seguranca',
    ],
    icon: Server,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500',
    duration: '4-6 semanas',
    xpTotal: 2000,
  },
  {
    id: 'frontend' as const,
    name: 'Frontend',
    description: 'Interfaces, UX/UI e aplicacoes web',
    details: ['Next.js e React', 'TypeScript', 'Design System', 'Acessibilidade (a11y)'],
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500',
    duration: '4-6 semanas',
    xpTotal: 2000,
  },
  {
    id: 'ia' as const,
    name: 'IA/ML',
    description: 'Inteligencia artificial e machine learning',
    details: ['Agentes de IA', 'LLMs e prompts', 'RAG e vetores', 'Avaliacao de modelos'],
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    borderColor: 'border-green-500',
    duration: '6-8 semanas',
    xpTotal: 2500,
  },
  {
    id: 'devops' as const,
    name: 'DevOps',
    description: 'Infraestrutura, CI/CD e cloud',
    details: ['Docker e containers', 'GitHub Actions', 'Monitoramento', 'Deploy e scaling'],
    icon: Code,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    borderColor: 'border-orange-500',
    duration: '4-6 semanas',
    xpTotal: 2000,
  },
]

// Track progress mock data (will be replaced with real data from Supabase)
interface TrackProgress {
  trackId: AcademyTrack
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  xpEarned: number
  certificateId?: string
}

export default function AcademyTrilhasPage() {
  const router = useRouter()
  const { user, isLoading, logout, isDemoMode } = useAcademy()

  // Get user's enrolled tracks
  const enrolledTracks = user.tracks || []

  // Mock progress data (in production, this comes from Supabase)
  const [trackProgress] = useState<Record<string, TrackProgress>>(() => {
    const progress: Record<string, TrackProgress> = {}
    enrolledTracks.forEach((trackId) => {
      progress[trackId] = {
        trackId,
        status: 'in_progress',
        startedAt: user.enrolledAt,
        xpEarned: Math.floor(user.totalXp / enrolledTracks.length),
      }
    })
    return progress
  })

  const handleStartTrack = (trackId: AcademyTrack) => {
    // Navigate to onboarding for this specific track
    router.push(`/pt/academy/onboarding?track=${trackId}`)
  }

  const getTrackStatus = (trackId: AcademyTrack) => {
    if (!enrolledTracks.includes(trackId)) return 'not_started'
    return trackProgress[trackId]?.status || 'not_started'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando trilhas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AcademyHeader user={user} onLogout={logout} isDemoMode={isDemoMode} />

      <div className="flex flex-1">
        <AcademySidebar user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Trilhas de Especializacao
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Escolha suas trilhas de aprendizado. Voce pode fazer varias trilhas e ganhar
                multiplos certificados!
              </p>
            </div>

            {/* Enrolled Tracks Summary */}
            {enrolledTracks.length > 0 && (
              <Card variant="elevated" padding="lg" className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Suas Trilhas Ativas ({enrolledTracks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {enrolledTracks.map((trackId) => {
                      const track = TRACKS_INFO.find((t) => t.id === trackId)
                      if (!track) return null
                      const Icon = track.icon
                      const progress = trackProgress[trackId]

                      return (
                        <div
                          key={trackId}
                          className={cn(
                            'p-4 rounded-xl border-2',
                            track.borderColor,
                            track.bgColor
                          )}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                                track.color
                              )}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {track.name}
                              </h3>
                              <Badge
                                variant={progress?.status === 'completed' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {progress?.status === 'completed' ? 'Concluida' : 'Em andamento'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {progress?.xpEarned || 0} XP
                            </span>
                            <span className="text-gray-500">/ {track.xpTotal} XP</span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full bg-gradient-to-r', track.color)}
                              style={{
                                width: `${Math.min(100, ((progress?.xpEarned || 0) / track.xpTotal) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Tracks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRACKS_INFO.map((track) => {
                const Icon = track.icon
                const status = getTrackStatus(track.id)
                const isEnrolled = status !== 'not_started'

                return (
                  <Card
                    key={track.id}
                    variant="elevated"
                    padding="lg"
                    className={cn(
                      'transition-all duration-300 hover:shadow-xl',
                      isEnrolled && 'ring-2 ring-green-500/50'
                    )}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                          track.color
                        )}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {track.name}
                          </h2>
                          {isEnrolled && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{track.description}</p>
                      </div>
                    </div>

                    {/* Track details */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.details.map((detail) => (
                        <span
                          key={detail}
                          className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>

                    {/* Track meta */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{track.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{track.xpTotal} XP</span>
                      </div>
                    </div>

                    {/* Action button */}
                    {isEnrolled ? (
                      <Link href="/pt/academy/chat">
                        <Button
                          variant="secondary"
                          className="w-full"
                          rightIcon={<Play className="w-4 h-4" />}
                        >
                          Continuar Estudando
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleStartTrack(track.id)}
                        className="w-full"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Iniciar Trilha
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Info card */}
            <Card
              variant="filled"
              padding="md"
              className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Multiplos Certificados
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ao concluir cada trilha, voce recebe um certificado especifico. Complete todas
                    as trilhas para se tornar um <strong>Arquiteto Full Stack</strong> do
                    Cidadao.AI!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
