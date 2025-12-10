'use client'

/**
 * Agora Trilhas (Learning Tracks) Page
 *
 * Redesigned with improved UX:
 * - Hero section with current track progress
 * - Interactive track cards with expansion
 * - Visual journey representation
 * - Mentor connection per track
 * - Mobile-first responsive design
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAgora } from '@/hooks/use-agora'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import {
  Server,
  Palette,
  Brain,
  Code,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  Sparkles,
  GraduationCap,
  BookOpen,
  Video,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  Zap,
  Target,
  Users,
} from 'lucide-react'

// Track definitions with modules and prerequisites
const TRACKS = [
  {
    id: 'introducao' as const,
    name: 'Introdução',
    subtitle: 'Conheça o Cidadão.AI',
    description:
      'Descubra a plataforma, conheça os agentes de IA e aprenda como aproveitar ao máximo a Ágora Academy',
    icon: GraduationCap,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    mentor: {
      id: 'abaporu',
      name: 'Abaporu',
      role: 'Agente Orquestrador',
      image: '/agents/abaporu.png',
    },
    duration: '1-2 horas',
    xpTotal: 500,
    isIntro: true,
    prerequisite: null, // No prerequisite - entry point
    modules: [
      { id: 1, name: 'Bem-vindo ao Cidadao.AI', type: 'video', duration: '10min' },
      { id: 2, name: 'Como funciona a Agora', type: 'reading', duration: '15min' },
      { id: 3, name: 'Conheca os Agentes de IA', type: 'video', duration: '20min' },
      { id: 4, name: 'Configurando seu GitHub', type: 'project', duration: '20min' },
      { id: 5, name: 'Converse com Abaporu', type: 'chat', duration: '10min' },
      { id: 6, name: 'Proximo Passo: Sua Trilha', type: 'reading', duration: '10min' },
    ],
  },
  {
    id: 'backend' as const,
    name: 'Backend',
    subtitle: 'APIs & Arquitetura',
    description: 'Aprenda a construir APIs robustas, microservicos e arquiteturas escalaveis',
    icon: Server,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    mentor: {
      id: 'santos-dumont',
      name: 'Santos-Dumont',
      role: 'Mentor de Engenharia',
      image: '/agents/santos-dumont.png',
    },
    duration: '4-6 semanas',
    xpTotal: 2000,
    prerequisite: 'introducao', // Requires Introdução to be completed
    modules: [
      { id: 1, name: 'Fundamentos de APIs', type: 'video', duration: '45min' },
      { id: 2, name: 'FastAPI na pratica', type: 'reading', duration: '30min' },
      { id: 3, name: 'Design de REST APIs', type: 'chat', duration: '20min' },
      { id: 4, name: 'Bancos de dados', type: 'video', duration: '60min' },
      { id: 5, name: 'Autenticacao JWT', type: 'reading', duration: '25min' },
      { id: 6, name: 'Projeto final', type: 'project', duration: '2h' },
    ],
  },
  {
    id: 'frontend' as const,
    name: 'Frontend',
    subtitle: 'UI/UX & React',
    description: 'Crie interfaces incriveis com React, Next.js e design system profissional',
    icon: Palette,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    mentor: {
      id: 'bobardi',
      name: 'Lina Bo Bardi',
      role: 'Mentora de Design',
      image: '/agents/bobardi.png',
    },
    duration: '4-6 semanas',
    xpTotal: 2000,
    prerequisite: 'introducao', // Requires Introdução to be completed
    modules: [
      { id: 1, name: 'React fundamentals', type: 'video', duration: '50min' },
      { id: 2, name: 'Next.js App Router', type: 'reading', duration: '40min' },
      { id: 3, name: 'TypeScript essencial', type: 'video', duration: '45min' },
      { id: 4, name: 'Design System', type: 'chat', duration: '25min' },
      { id: 5, name: 'Acessibilidade (a11y)', type: 'reading', duration: '30min' },
      { id: 6, name: 'Projeto final', type: 'project', duration: '2h' },
    ],
  },
  {
    id: 'ia' as const,
    name: 'IA/ML',
    subtitle: 'Agentes & LLMs',
    description: 'Domine inteligencia artificial, agentes autonomos e Large Language Models',
    icon: Brain,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-600 dark:text-green-400',
    mentor: {
      id: 'santos-dumont',
      name: 'Santos-Dumont',
      role: 'Mentor de Engenharia',
      image: '/agents/santos-dumont.png',
    },
    duration: '6-8 semanas',
    xpTotal: 2500,
    prerequisite: 'introducao', // Requires Introdução to be completed
    modules: [
      { id: 1, name: 'Introdução a IA', type: 'video', duration: '40min' },
      { id: 2, name: 'LLMs e Prompts', type: 'reading', duration: '35min' },
      { id: 3, name: 'Agentes de IA', type: 'chat', duration: '30min' },
      { id: 4, name: 'RAG e Vetores', type: 'video', duration: '55min' },
      { id: 5, name: 'Fine-tuning basico', type: 'reading', duration: '40min' },
      { id: 6, name: 'Avaliacao de modelos', type: 'video', duration: '35min' },
      { id: 7, name: 'Projeto final', type: 'project', duration: '3h' },
    ],
  },
  {
    id: 'devops' as const,
    name: 'DevOps',
    subtitle: 'Cloud & CI/CD',
    description: 'Aprenda infraestrutura, containers, deploy automatizado e monitoramento',
    icon: Code,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    mentor: {
      id: 'santos-dumont',
      name: 'Santos-Dumont',
      role: 'Mentor de Engenharia',
      image: '/agents/santos-dumont.png',
    },
    duration: '4-6 semanas',
    xpTotal: 2000,
    prerequisite: 'introducao', // Requires Introdução to be completed
    modules: [
      { id: 1, name: 'Docker essencial', type: 'video', duration: '50min' },
      { id: 2, name: 'GitHub Actions', type: 'reading', duration: '35min' },
      { id: 3, name: 'Deploy na cloud', type: 'video', duration: '45min' },
      { id: 4, name: 'Monitoramento', type: 'chat', duration: '25min' },
      { id: 5, name: 'Scaling e performance', type: 'reading', duration: '30min' },
      { id: 6, name: 'Projeto final', type: 'project', duration: '2h' },
    ],
  },
]

const MODULE_ICONS = {
  video: Video,
  reading: BookOpen,
  chat: MessageSquare,
  project: Target,
}

function ModuleIcon({ type }: { type: string }) {
  const Icon = MODULE_ICONS[type as keyof typeof MODULE_ICONS] || Circle
  return <Icon className="w-4 h-4" />
}

function TrackCard({
  track,
  isEnrolled,
  isExpanded,
  onToggle,
  onStart,
  progress,
  isLocked,
  prerequisiteName,
}: {
  track: (typeof TRACKS)[0]
  isEnrolled: boolean
  isExpanded: boolean
  onToggle: () => void
  onStart: () => void
  progress: number
  isLocked: boolean
  prerequisiteName?: string
}) {
  const Icon = track.icon
  const completedModules = Math.floor((progress / 100) * track.modules.length)

  return (
    <GlassCard
      className={cn(
        'transition-all duration-300 overflow-hidden',
        isLocked && 'opacity-75',
        isExpanded && 'ring-2 ring-offset-2',
        isExpanded && track.color === 'blue' && 'ring-blue-500',
        isExpanded && track.color === 'purple' && 'ring-purple-500',
        isExpanded && track.color === 'green' && 'ring-green-500',
        isExpanded && track.color === 'orange' && 'ring-orange-500',
        isExpanded && track.color === 'emerald' && 'ring-emerald-500'
      )}
    >
      {/* Card Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 relative',
              isLocked ? 'bg-gray-400 dark:bg-gray-600' : cn('bg-gradient-to-br', track.gradient)
            )}
          >
            {isLocked ? (
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {track.name}
              </h3>
              {isLocked ? (
                <Badge variant="secondary" size="sm">
                  <Lock className="w-3 h-3" />
                  Bloqueada
                </Badge>
              ) : isEnrolled ? (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativa
                </Badge>
              ) : null}
            </div>
            <p className={cn('text-sm font-medium', isLocked ? 'text-gray-400' : track.textColor)}>
              {track.subtitle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {track.description}
            </p>
            {isLocked && prerequisiteName && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Requer conclusão da trilha "{prerequisiteName}"
              </p>
            )}

            {/* Quick stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {track.duration}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {track.xpTotal} XP
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {track.modules.length} modulos
              </span>
            </div>

            {/* Progress bar for enrolled tracks */}
            {isEnrolled && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className={cn('font-medium', track.textColor)}>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full bg-gradient-to-r transition-all duration-500',
                      track.gradient
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Expand indicator */}
          <div className="flex-shrink-0 self-center">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={cn('border-t', track.borderColor)}>
          {/* Mentor Section */}
          <div className={cn('p-4 sm:p-6', track.bgLight, track.bgDark)}>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800">
                <Image
                  src={track.mentor.image}
                  alt={track.mentor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Seu mentor
                </p>
                <p className="font-bold text-gray-900 dark:text-white">{track.mentor.name}</p>
                <p className={cn('text-sm', track.textColor)}>{track.mentor.role}</p>
              </div>
            </div>
          </div>

          {/* Modules List */}
          <div className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Modulos do curso
            </h4>
            <div className="space-y-2">
              {track.modules.map((module, index) => {
                const isCompleted = index < completedModules
                const isCurrent = index === completedModules && isEnrolled
                const isLocked = index > completedModules && isEnrolled

                return (
                  <div
                    key={module.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors',
                      isCompleted && 'bg-green-50 dark:bg-green-900/20',
                      isCurrent && cn(track.bgLight, track.bgDark, 'ring-2', track.borderColor),
                      !isCompleted && !isCurrent && 'bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    {/* Status indicator */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        isCompleted && 'bg-green-500 text-white',
                        isCurrent && cn('bg-gradient-to-br', track.gradient, 'text-white'),
                        !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Module info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-medium',
                          isCompleted
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-gray-900 dark:text-white'
                        )}
                      >
                        {module.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ModuleIcon type={module.type} />
                        <span className="capitalize">{module.type}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>

                    {/* Action */}
                    {isCurrent && (
                      <Link href={`/pt/agora/trilhas/${track.id}/${module.id}`}>
                        <Button size="sm" variant="primary" className="flex-shrink-0">
                          <Play className="w-3 h-3 mr-1" />
                          Iniciar
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div
            className={cn(
              'p-4 sm:p-6 border-t',
              track.borderColor,
              'bg-gray-50 dark:bg-gray-800/50'
            )}
          >
            {isLocked ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    Complete a trilha{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {prerequisiteName}
                    </strong>{' '}
                    para desbloquear
                  </span>
                </div>
                <Link href="/pt/agora/trilhas/introducao/1">
                  <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Ir para {prerequisiteName}
                  </Button>
                </Link>
              </div>
            ) : isEnrolled ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {completedModules}/{track.modules.length}
                  </span>{' '}
                  modulos concluidos
                </div>
                <Link href={`/pt/agora/trilhas/${track.id}/${completedModules + 1}`}>
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Continuar trilha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Ganhe ate <strong className={track.textColor}>{track.xpTotal} XP</strong> e
                    certificado
                  </span>
                </div>
                <Button
                  onClick={onStart}
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Iniciar trilha
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

export default function AgoraTrilhasPage() {
  const router = useRouter()
  const { user, isLoading, isDemoMode } = useAgora()
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)

  // Redirect to onboarding if not completed - required for trilhas
  useEffect(() => {
    if (!isLoading && user && !user.hasCompletedOnboarding) {
      router.replace('/pt/agora/onboarding?redirect=trilhas')
    }
  }, [isLoading, user, router])

  // Get user's enrolled tracks
  const enrolledTracks = user?.tracks || []

  // Calculate progress (mock - in production comes from Supabase)
  const getTrackProgress = (trackId: string) => {
    if (!enrolledTracks.includes(trackId as any)) return 0
    // Mock progress based on XP
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track) return 0
    const xpPerTrack = Math.floor((user?.totalXp || 0) / Math.max(enrolledTracks.length, 1))
    return Math.min(100, Math.floor((xpPerTrack / track.xpTotal) * 100))
  }

  // Check if a track is completed (100% progress or all modules done)
  const isTrackCompleted = (trackId: string) => {
    return getTrackProgress(trackId) >= 100
  }

  // Check if track is locked based on prerequisites
  const isTrackLocked = (track: (typeof TRACKS)[0]) => {
    if (!track.prerequisite) return false
    return !isTrackCompleted(track.prerequisite)
  }

  // Get prerequisite track name
  const getPrerequisiteName = (prerequisiteId: string | null) => {
    if (!prerequisiteId) return undefined
    const prereqTrack = TRACKS.find((t) => t.id === prerequisiteId)
    return prereqTrack?.name
  }

  const handleStartTrack = (trackId: string) => {
    // Go directly to first module of the track
    router.push(`/pt/agora/trilhas/${trackId}/1`)
  }

  const handleToggleTrack = (trackId: string) => {
    setExpandedTrack(expandedTrack === trackId ? null : trackId)
  }

  // Auto-expand first enrolled track or first track
  useState(() => {
    if (enrolledTracks.length > 0) {
      setExpandedTrack(enrolledTracks[0])
    }
  })

  // Show loading or redirect if onboarding not completed
  if (isLoading || (user && !user.hasCompletedOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {user && !user.hasCompletedOnboarding
              ? 'Redirecionando para onboarding...'
              : 'Carregando trilhas...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header is now provided by the layout */}

      {/* Page Title */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/pt/agora${isDemoMode ? '?demo=true' : ''}`}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Trilhas de Aprendizado
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escolha sua especializacao</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        {enrolledTracks.length > 0 && (
          <GlassCard className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <GlassCardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trilhas ativas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {enrolledTracks.length}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {user?.totalXp || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">XP total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {user?.currentLevel || 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nivel</p>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Empty State */}
        {enrolledTracks.length === 0 && (
          <GlassCard className="mb-6 border-dashed border-2 border-emerald-300 dark:border-emerald-700">
            <GlassCardContent className="p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Comece pela Introdução
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                  A trilha de{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">Introdução</strong> e
                  obrigatoria para desbloquear as trilhas avancadas. Configure seu GitHub e conheca
                  os agentes de IA!
                </p>
                <Link href="/pt/agora/trilhas/introducao/1">
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Comecar Introdução
                  </Button>
                </Link>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Track Cards */}
        <div className="space-y-4">
          {TRACKS.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isEnrolled={enrolledTracks.includes(track.id as any)}
              isExpanded={expandedTrack === track.id}
              onToggle={() => handleToggleTrack(track.id)}
              onStart={() => handleStartTrack(track.id)}
              progress={getTrackProgress(track.id)}
              isLocked={isTrackLocked(track)}
              prerequisiteName={getPrerequisiteName(track.prerequisite)}
            />
          ))}
        </div>

        {/* Info Footer */}
        <GlassCard className="mt-6 bg-gray-50/80 dark:bg-gray-800/50">
          <GlassCardContent className="p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong className="text-gray-900 dark:text-white">Múltiplas trilhas:</strong> Voce
                  pode se inscrever em quantas trilhas quiser e ganhar certificados em cada uma!
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </main>
    </div>
  )
}
