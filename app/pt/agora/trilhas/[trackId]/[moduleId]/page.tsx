'use client'

/**
 * Learning Module Page
 *
 * Slide-based learning experience with:
 * - Video selection (academic, didactic, practical styles)
 * - Agent interaction (diary or chat)
 * - Progress tracking and XP rewards
 *
 * Now fetches data from Supabase database.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11 (Updated to use database)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAgora } from '@/hooks/use-agora'
import useAgoraTracks, { Track, TrackModule, ModuleVideo } from '@/hooks/use-agora-tracks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import {
  VIDEO_STYLE_LABELS,
  XP_CONSTANTS,
  calculateDiaryXp,
  type VideoStyle,
  getTrackContent,
} from '@/data/tracks-content'
import {
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Send,
  PenLine,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Youtube,
  Award,
} from 'lucide-react'

type InteractionMode = 'idle' | 'diary' | 'chat'

export default function LearningModulePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isDemoMode } = useAgora()
  const { tracks, isLoading: tracksLoading, getTrack, getModule } = useAgoraTracks()

  const trackId = params.trackId as string
  const moduleNumber = parseInt(params.moduleId as string, 10)

  // Get track and module data from database or fallback
  const dbTrack = getTrack(trackId)
  const dbModule = getModule(trackId, moduleNumber)

  // Fallback to hardcoded data if database is empty
  const fallbackTrack = useMemo(() => getTrackContent(trackId), [trackId])
  const fallbackModule = fallbackTrack?.modules.find((m) => m.id === moduleNumber)

  // Use database data if available, otherwise fallback
  const track =
    dbTrack ||
    (fallbackTrack
      ? ({
          id: fallbackTrack.id,
          name: fallbackTrack.name,
          subtitle: '',
          description: '',
          icon: 'GraduationCap',
          color: 'emerald',
          gradient: 'from-emerald-500 to-teal-500',
          duration: '',
          xpTotal: fallbackTrack.totalXp,
          certificateHours: fallbackTrack.certificateHours,
          isIntro: false,
          prerequisiteId: undefined,
          displayOrder: 0,
          isActive: true,
          mentor: {
            id: fallbackTrack.mentor.id,
            name: fallbackTrack.mentor.name,
            role: 'Mentor',
            image: `/agents/${fallbackTrack.mentor.id}.webp`,
            greeting: fallbackTrack.mentor.greeting,
            videoIntro: fallbackTrack.mentor.videoIntro,
            diaryEncouragement: fallbackTrack.mentor.diaryEncouragement,
            chatInvitation: fallbackTrack.mentor.chatInvitation,
          },
          modules: fallbackTrack.modules.map((m, idx) => ({
            id: m.id,
            trackId: fallbackTrack.id,
            moduleNumber: idx + 1,
            title: m.title,
            description: m.description,
            objectives: m.objectives,
            xpReward: m.xpReward,
            diaryPrompt: m.diaryPrompt,
            chatPrompt: m.chatPrompt,
            videos: m.videos.map((v, vidIdx) => ({
              id: vidIdx,
              moduleId: m.id,
              style: v.style as 'academic' | 'didactic' | 'practical',
              title: v.title,
              channel: v.channel,
              channelUrl: v.channelUrl,
              youtubeId: v.videoId,
              duration: v.duration,
              description: v.description,
            })),
            exercises: [],
          })),
        } as Track)
      : undefined)

  const module = dbModule || track?.modules.find((m) => m.moduleNumber === moduleNumber)
  const currentModuleIndex = track?.modules.findIndex((m) => m.moduleNumber === moduleNumber) ?? -1
  const totalModules = track?.modules.length ?? 0

  // State
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('didactic')
  const [videoWatched, setVideoWatched] = useState(false)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle')
  const [diaryText, setDiaryText] = useState('')
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'agent'; content: string }>
  >([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [moduleCompleted, setModuleCompleted] = useState(false)

  // Get selected video - now using youtubeId from database
  const selectedVideo = module?.videos.find((v) => v.style === selectedStyle)

  // Save last accessed track to localStorage for "Continue Track" card on dashboard
  useEffect(() => {
    if (trackId && moduleNumber && track) {
      try {
        localStorage.setItem(
          'agora_last_track',
          JSON.stringify({
            trackId,
            moduleId: moduleNumber,
            timestamp: Date.now(),
          })
        )
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [trackId, moduleNumber, track])

  // Calculate diary XP
  const diaryWordCount = diaryText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const potentialDiaryXp = calculateDiaryXp(diaryText)

  // Animate XP gain
  const addXp = useCallback((amount: number) => {
    setEarnedXp((prev) => prev + amount)
    setShowXpAnimation(true)
    setTimeout(() => setShowXpAnimation(false), 1000)
  }, [])

  // Handle video completion
  const handleVideoComplete = () => {
    if (!videoWatched) {
      setVideoWatched(true)
      addXp(XP_CONSTANTS.VIDEO_COMPLETE_XP)
    }
  }

  // Handle diary submission
  const handleDiarySubmit = () => {
    if (potentialDiaryXp > 0) {
      addXp(potentialDiaryXp)
      // Save diary entry (would go to Supabase)
      setInteractionMode('idle')
      setDiaryText('')
    }
  }

  // Handle chat message
  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsTyping(true)

    // Add XP for chatting
    if (chatMessages.filter((m) => m.role === 'user').length < 5) {
      addXp(XP_CONSTANTS.CHAT_XP_PER_MESSAGE)
    }

    // Simulate agent response (in production, this would call the backend)
    setTimeout(() => {
      const responses = [
        `Ótima pergunta! ${module?.title} é fundamental para sua jornada. Vamos explorar mais?`,
        `Interessante sua perspectiva! No contexto de ${track?.name}, isso se conecta com...`,
        `Excelente reflexão! Isso me lembra como eu abordava problemas de engenharia...`,
        `Você está no caminho certo! Continue praticando e as peças vão se encaixar.`,
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setChatMessages((prev) => [...prev, { role: 'agent', content: randomResponse }])
      setIsTyping(false)
    }, 1500)
  }

  // Handle module completion
  const handleCompleteModule = () => {
    addXp(XP_CONSTANTS.MODULE_COMPLETE_BONUS)
    setModuleCompleted(true)
  }

  // Navigate to next/previous module
  const goToModule = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentModuleIndex + 1 : currentModuleIndex - 1
    if (newIndex >= 0 && newIndex < totalModules) {
      const newModule = track?.modules[newIndex]
      if (newModule) {
        router.push(`/pt/agora/trilhas/${trackId}/${newModule.moduleNumber}`)
      }
    }
  }

  // Error state
  if (!track || !module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="max-w-md mx-4">
          <GlassCardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Módulo não encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Este módulo não existe ou foi removido.
            </p>
            <Link href="/pt/agora/trilhas">
              <Button variant="primary">Voltar às trilhas</Button>
            </Link>
          </GlassCardContent>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-32">
      {/* XP Animation */}
      {showXpAnimation && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <Badge variant="success" size="lg" className="shadow-lg">
            <Sparkles className="w-4 h-4 mr-1" />+{earnedXp} XP
          </Badge>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/pt/agora/trilhas${isDemoMode ? '?demo=true' : ''}`}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {track.name} • Módulo {currentModuleIndex + 1}/{totalModules}
                </p>
                <h1 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                  {module.title}
                </h1>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {track.modules.map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-colors',
                    i < currentModuleIndex && 'bg-green-500',
                    i === currentModuleIndex && 'bg-blue-500 ring-2 ring-blue-200',
                    i > currentModuleIndex && 'bg-gray-300 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>

            <Badge variant="success" size="default">
              <Sparkles className="w-3 h-3" />
              {earnedXp} XP
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Mentor Introduction */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800 flex-shrink-0">
                <Image
                  src={track.mentor.image || `/agents/${track.mentor.id}.webp`}
                  alt={track.mentor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide font-medium">
                  {track.mentor.name} diz:
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {track.mentor.videoIntro || 'Escolha o estilo de vídeo que combina com você!'}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Video Style Selection */}
        <GlassCard>
          <GlassCardContent className="p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Escolha seu estilo de aprendizado
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(VIDEO_STYLE_LABELS) as VideoStyle[]).map((style) => {
                const styleInfo = VIDEO_STYLE_LABELS[style]
                const video = module.videos.find((v) => v.style === style)
                const isSelected = selectedStyle === style

                return (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    disabled={!video}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                      !video && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{styleInfo.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {styleInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {styleInfo.description}
                    </p>
                    {video && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        {video.channel} • {video.duration}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Video Player */}
        {selectedVideo && (
          <GlassCard className="overflow-hidden">
            <div className="aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <GlassCardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedVideo.description}
                  </p>
                  <a
                    href={selectedVideo.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                  >
                    <Youtube className="w-4 h-4" />
                    {selectedVideo.channel}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {!videoWatched ? (
                  <Button onClick={handleVideoComplete} variant="primary" size="sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Marcar como visto
                  </Button>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3" />
                    Assistido
                  </Badge>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Learning Objectives */}
        <GlassCard>
          <GlassCardContent className="p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Objetivos de aprendizado
            </h2>
            <ul className="space-y-2">
              {module.objectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </GlassCardContent>
        </GlassCard>

        {/* Navigation between modules */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => goToModule('prev')}
            variant="ghost"
            disabled={currentModuleIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          {currentModuleIndex < totalModules - 1 ? (
            <Button onClick={() => goToModule('next')} variant="primary">
              Próximo módulo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCompleteModule}
              variant="primary"
              disabled={moduleCompleted}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {moduleCompleted ? (
                <>
                  <Award className="w-4 h-4 mr-1" />
                  Trilha concluída!
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-1" />
                  Concluir trilha
                </>
              )}
            </Button>
          )}
        </div>
      </main>

      {/* Bottom Interaction Area - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {interactionMode === 'idle' ? (
            /* Agent asking what to do */
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <Image
                  src={track.mentor.image || `/agents/${track.mentor.id}.webp`}
                  alt={track.mentor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {track.mentor.name}:
                  </span>{' '}
                  O que você quer fazer agora?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setInteractionMode('diary')}
                    variant="secondary"
                    size="sm"
                    className="border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-900/20"
                  >
                    <PenLine className="w-4 h-4 mr-1" />
                    Anotar no diário (+XP por palavra)
                  </Button>
                  <Button
                    onClick={() => setInteractionMode('chat')}
                    variant="secondary"
                    size="sm"
                    className="border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:bg-blue-900/20"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Conversar sobre o tema (+XP)
                  </Button>
                </div>
              </div>
            </div>
          ) : interactionMode === 'diary' ? (
            /* Diary mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Diário de Bordo</span>
                </div>
                <button
                  onClick={() => setInteractionMode('idle')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                "{module.diaryPrompt}"
              </p>

              <div className="relative">
                <textarea
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder="Escreva suas reflexões aqui... (mínimo 20 palavras para ganhar XP)"
                  className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs',
                      diaryWordCount >= 20 ? 'text-green-600' : 'text-gray-400'
                    )}
                  >
                    {diaryWordCount} palavras
                    {potentialDiaryXp > 0 && (
                      <span className="ml-1 text-amber-600">+{potentialDiaryXp} XP</span>
                    )}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDiarySubmit}
                disabled={potentialDiaryXp === 0}
                variant="primary"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Salvar no diário (+{potentialDiaryXp} XP)
              </Button>
            </div>
          ) : (
            /* Chat mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Conversar com {track.mentor.name}
                  </span>
                </div>
                <button
                  onClick={() => setInteractionMode('idle')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    "{module.chatPrompt}"
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] px-3 py-2 rounded-xl text-sm',
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 items-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{track.mentor.name} está digitando...</span>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={handleChatSend} variant="primary" disabled={!chatInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
