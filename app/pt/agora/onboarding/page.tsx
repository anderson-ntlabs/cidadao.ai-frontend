'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAgora, TRACK_REPOS } from '@/hooks/use-agora'
import {
  Code,
  Palette,
  Brain,
  Server,
  Github,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  PartyPopper,
  Sparkles,
  GraduationCap,
  Presentation,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PresentationCarousel, Slide } from '@/components/ui/presentation-carousel'

/**
 * Academy Onboarding Page
 *
 * Multi-step wizard for new interns:
 * 1. Presentation - Cidadão.AI presentation carousel (unlocks track selection)
 * 2. Track Selection - Choose development track(s)
 * 3. GitHub Setup - Enter GitHub username
 * 4. Fork Verification - Verify repository fork
 * 5. Complete - Welcome to the team!
 *
 * Features:
 * - Presentation must be completed (reach last slide) to unlock tracks
 * - Santos-Dumont agent provides narration on each slide
 * - Multi-track selection supported
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-07
 */

const TRACKS = [
  {
    id: 'backend' as const,
    name: 'Backend',
    description: 'APIs, microservices e arquitetura de sistemas',
    details: [
      'FastAPI e Python',
      'Design de APIs REST',
      'Bancos de dados',
      'Autenticação e segurança',
    ],
    icon: Server,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500',
    ringColor: 'ring-blue-500/50',
  },
  {
    id: 'frontend' as const,
    name: 'Frontend',
    description: 'Interfaces, UX/UI e aplicações web',
    details: ['Next.js e React', 'TypeScript', 'Design System', 'Acessibilidade (a11y)'],
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500',
    ringColor: 'ring-purple-500/50',
  },
  {
    id: 'ia' as const,
    name: 'IA/ML',
    description: 'Inteligência artificial e machine learning',
    details: ['Agentes de IA', 'LLMs e prompts', 'RAG e vetores', 'Avaliação de modelos'],
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    borderColor: 'border-green-500',
    ringColor: 'ring-green-500/50',
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
    ringColor: 'ring-orange-500/50',
  },
]

const STEPS = [
  { label: 'Apresentação', icon: Presentation },
  { label: 'Trilha', icon: Code },
  { label: 'GitHub', icon: Github },
  { label: 'Fork', icon: ExternalLink },
  { label: 'Pronto!', icon: PartyPopper },
]

// Full Cidadão.AI presentation with 40 slides
// Slides available at public/agora/slides/slide-XX.png
const PRESENTATION_SLIDES: Slide[] = [
  {
    id: 1,
    src: '/agora/slides/slide-01.png',
    alt: 'Slide 1 - Capa',
    title: 'Cidadão.AI',
    narration:
      'Olá! Sou Santos-Dumont, seu guia nesta jornada. Bem-vindo ao Cidadão.AI - uma iniciativa inovadora que combina inteligência artificial e transparência pública no Brasil!',
  },
  {
    id: 2,
    src: '/agora/slides/slide-02.png',
    alt: 'Slide 2 - Introdução',
    title: 'Introdução ao Projeto',
    narration:
      'O Cidadão.AI nasceu da necessidade de democratizar o acesso às informações públicas. Vamos usar a tecnologia para empoderar o cidadão brasileiro!',
  },
  {
    id: 3,
    src: '/agora/slides/slide-03.png',
    alt: 'Slide 3 - Problema',
    title: 'O Problema',
    narration:
      'Dados públicos existem, mas estão dispersos, complexos e de difícil acesso. O cidadão comum não consegue entender o que acontece com seu dinheiro.',
  },
  {
    id: 4,
    src: '/agora/slides/slide-04.png',
    alt: 'Slide 4 - Solução',
    title: 'Nossa Solução',
    narration:
      'Criamos uma plataforma que usa IA para analisar, simplificar e alertar sobre irregularidades nos gastos públicos. Transparência ao alcance de todos!',
  },
  {
    id: 5,
    src: '/agora/slides/slide-05.png',
    alt: 'Slide 5 - Visão Geral',
    title: 'Visão Geral',
    narration:
      'Nossa plataforma conecta cidadãos, dados públicos e inteligência artificial em um ecossistema colaborativo de fiscalização.',
  },
  {
    id: 6,
    src: '/agora/slides/slide-06.png',
    alt: 'Slide 6 - Arquitetura',
    title: 'Arquitetura do Sistema',
    narration:
      'Utilizamos uma arquitetura moderna: Next.js no frontend, FastAPI no backend, e múltiplos agentes de IA especializados trabalhando em conjunto.',
  },
  {
    id: 7,
    src: '/agora/slides/slide-07.png',
    alt: 'Slide 7 - Agentes de IA',
    title: 'Nossos Agentes',
    narration:
      'Temos 17 agentes de IA, cada um representando um herói brasileiro! Eu, Santos-Dumont, cuido da inovação. Zumbi detecta anomalias, Anita analisa padrões...',
  },
  {
    id: 8,
    src: '/agora/slides/slide-08.png',
    alt: 'Slide 8 - Abaporu',
    title: 'Agente Abaporu',
    narration:
      'O Abaporu é nosso orquestrador principal, inspirado na obra de Tarsila do Amaral. Ele coordena todos os outros agentes!',
  },
  {
    id: 9,
    src: '/agora/slides/slide-09.png',
    alt: 'Slide 9 - Zumbi',
    title: 'Agente Zumbi',
    narration:
      'Zumbi dos Palmares é especialista em detectar anomalias e irregularidades. Sua luta por liberdade inspira nossa busca por transparência!',
  },
  {
    id: 10,
    src: '/agora/slides/slide-10.png',
    alt: 'Slide 10 - Anita',
    title: 'Agente Anita',
    narration:
      'Anita Garibaldi analisa padrões nos dados. Sua coragem e determinação guiam nossas análises mais complexas!',
  },
  {
    id: 11,
    src: '/agora/slides/slide-11.png',
    alt: 'Slide 11 - Tiradentes',
    title: 'Agente Tiradentes',
    narration:
      'Tiradentes é responsável pelos relatórios. O mártir da Inconfidência inspira nossa transparência absoluta!',
  },
  {
    id: 12,
    src: '/agora/slides/slide-12.png',
    alt: 'Slide 12 - Mais Agentes',
    title: 'Mais Agentes',
    narration:
      'Temos ainda Senna (velocidade), Machado de Assis (comunicação), José Bonifácio (aspectos legais), e muitos outros!',
  },
  {
    id: 13,
    src: '/agora/slides/slide-13.png',
    alt: 'Slide 13 - Tecnologias',
    title: 'Tecnologias Utilizadas',
    narration:
      'Next.js 15, TypeScript, FastAPI, Python, Supabase, Tailwind CSS... Usamos o que há de mais moderno no mercado!',
  },
  {
    id: 14,
    src: '/agora/slides/slide-14.png',
    alt: 'Slide 14 - Frontend',
    title: 'Frontend Moderno',
    narration:
      'Interface responsiva, acessível (WCAG AAA) e com suporte a VLibras para libras. Tecnologia inclusiva para todos!',
  },
  {
    id: 15,
    src: '/agora/slides/slide-15.png',
    alt: 'Slide 15 - Backend',
    title: 'Backend Robusto',
    narration:
      'API REST com FastAPI, documentação automática, e processamento paralelo de dados. Eficiência e escalabilidade!',
  },
  {
    id: 16,
    src: '/agora/slides/slide-16.png',
    alt: 'Slide 16 - IA/ML',
    title: 'Inteligência Artificial',
    narration:
      'Usamos modelos de linguagem brasileiros como Maritaca AI, otimizados para entender o contexto nacional!',
  },
  {
    id: 17,
    src: '/agora/slides/slide-17.png',
    alt: 'Slide 17 - Dados',
    title: 'Fontes de Dados',
    narration:
      'Portal da Transparência, TCU, CGU, IBGE... Integramos múltiplas fontes para uma visão completa!',
  },
  {
    id: 18,
    src: '/agora/slides/slide-18.png',
    alt: 'Slide 18 - Academy',
    title: 'Academy Cidadão.AI',
    narration:
      'A Academy é nosso programa de capacitação. Aprenda na prática contribuindo com código real para um projeto de impacto social!',
  },
  {
    id: 19,
    src: '/agora/slides/slide-19.png',
    alt: 'Slide 19 - Trilhas',
    title: 'Trilhas de Aprendizado',
    narration:
      'Oferecemos 4 trilhas: Backend, Frontend, IA/ML e DevOps. Cada uma com vídeos, exercícios e projetos práticos!',
  },
  {
    id: 20,
    src: '/agora/slides/slide-20.png',
    alt: 'Slide 20 - Backend Track',
    title: 'Trilha Backend',
    narration:
      'Na trilha Backend você aprende Python, FastAPI, bancos de dados, autenticação e muito mais!',
  },
  {
    id: 21,
    src: '/agora/slides/slide-21.png',
    alt: 'Slide 21 - Frontend Track',
    title: 'Trilha Frontend',
    narration:
      'A trilha Frontend ensina React, Next.js, TypeScript, design system e acessibilidade!',
  },
  {
    id: 22,
    src: '/agora/slides/slide-22.png',
    alt: 'Slide 22 - IA Track',
    title: 'Trilha IA/ML',
    narration:
      'Na trilha de IA você aprende sobre agentes, LLMs, RAG, embeddings e avaliação de modelos!',
  },
  {
    id: 23,
    src: '/agora/slides/slide-23.png',
    alt: 'Slide 23 - DevOps Track',
    title: 'Trilha DevOps',
    narration:
      'DevOps ensina Docker, CI/CD, monitoramento, cloud e práticas modernas de infraestrutura!',
  },
  {
    id: 24,
    src: '/agora/slides/slide-24.png',
    alt: 'Slide 24 - Gamificação',
    title: 'Sistema de Gamificação',
    narration:
      'Ganhe XP por cada ação! Vídeos, anotações, conversas com agentes, commits... Quanto mais participa, mais evolui!',
  },
  {
    id: 25,
    src: '/agora/slides/slide-25.png',
    alt: 'Slide 25 - Certificado',
    title: 'Certificação',
    narration:
      'Complete as trilhas e receba um certificado oficial de 50 horas! Conteúdo equivalente a 2 períodos de computação!',
  },
  {
    id: 26,
    src: '/agora/slides/slide-26.png',
    alt: 'Slide 26 - GitHub',
    title: 'Open Source',
    narration:
      'Todo código é open source no GitHub! Suas contribuições ficam registradas no seu perfil profissional!',
  },
  {
    id: 27,
    src: '/agora/slides/slide-27.png',
    alt: 'Slide 27 - Comunidade',
    title: 'Comunidade',
    narration:
      'Faça parte de uma comunidade de desenvolvedores comprometidos com o impacto social!',
  },
  {
    id: 28,
    src: '/agora/slides/slide-28.png',
    alt: 'Slide 28 - Mentoria',
    title: 'Mentoria IA 24/7',
    narration:
      'Tem dúvidas? Converse comigo a qualquer hora! Estou sempre disponível para ajudar no seu aprendizado!',
  },
  {
    id: 29,
    src: '/agora/slides/slide-29.png',
    alt: 'Slide 29 - Diário',
    title: 'Diário de Bordo',
    narration:
      'Registre suas anotações no diário de bordo. Quanto mais escreve, mais XP ganha! Mínimo de 20 palavras.',
  },
  {
    id: 30,
    src: '/agora/slides/slide-30.png',
    alt: 'Slide 30 - Progresso',
    title: 'Acompanhamento',
    narration:
      'Acompanhe seu progresso em tempo real! Dashboard completo com métricas, badges e conquistas!',
  },
  {
    id: 31,
    src: '/agora/slides/slide-31.png',
    alt: 'Slide 31 - Impacto',
    title: 'Impacto Social',
    narration:
      'Ao participar do Cidadão.AI, você contribui diretamente para uma sociedade mais transparente e justa!',
  },
  {
    id: 32,
    src: '/agora/slides/slide-32.png',
    alt: 'Slide 32 - Futuro',
    title: 'Visão de Futuro',
    narration:
      'Queremos ser referência em transparência pública na América Latina! Com sua ajuda, chegaremos lá!',
  },
  {
    id: 33,
    src: '/agora/slides/slide-33.png',
    alt: 'Slide 33 - Parcerias',
    title: 'Parcerias',
    narration:
      'Buscamos parcerias com universidades, órgãos públicos e organizações da sociedade civil!',
  },
  {
    id: 34,
    src: '/agora/slides/slide-34.png',
    alt: 'Slide 34 - Roadmap',
    title: 'Roadmap',
    narration:
      'Temos um roadmap ambicioso: mais agentes, mais integrações, aplicativo móvel e muito mais!',
  },
  {
    id: 35,
    src: '/agora/slides/slide-35.png',
    alt: 'Slide 35 - Como Participar',
    title: 'Como Participar',
    narration:
      'Completar esta apresentação é o primeiro passo! Em seguida, escolha sua trilha e comece a aprender!',
  },
  {
    id: 36,
    src: '/agora/slides/slide-36.png',
    alt: 'Slide 36 - Próximos Passos',
    title: 'Próximos Passos',
    narration:
      'Após a apresentação: 1) Escolha suas trilhas, 2) Configure seu GitHub, 3) Faça fork do repositório!',
  },
  {
    id: 37,
    src: '/agora/slides/slide-37.png',
    alt: 'Slide 37 - Contato',
    title: 'Contato',
    narration:
      'Dúvidas? Sugestões? Entre em contato pelo GitHub ou converse com nossos agentes de IA!',
  },
  {
    id: 38,
    src: '/agora/slides/slide-38.png',
    alt: 'Slide 38 - Agradecimentos',
    title: 'Agradecimentos',
    narration:
      'Obrigado por fazer parte desta jornada! Juntos, vamos transformar a relação do cidadão com o governo!',
  },
  {
    id: 39,
    src: '/agora/slides/slide-39.png',
    alt: 'Slide 39 - Citação',
    title: 'Inspiração',
    narration:
      'Como disse Santos-Dumont: "Eu inventei o avião para unir os povos". Nós criamos o Cidadão.AI para unir o povo às suas informações!',
  },
  {
    id: 40,
    src: '/agora/slides/slide-40.png',
    alt: 'Slide 40 - Vamos Começar',
    title: 'Vamos Começar!',
    narration:
      'Parabéns por completar a apresentação! Agora você está pronto para escolher sua trilha de especialização. Estou ansioso para acompanhar sua jornada! Vamos lá?',
  },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreviewMode = searchParams.get('preview') === 'true'
  const [isHydrated, setIsHydrated] = useState(false)

  const {
    user,
    onboarding,
    initOnboarding,
    toggleTrack,
    confirmTracks,
    setGitHubUsername,
    verifyGitHubFork,
    completeOnboarding,
    updateOnboarding,
    mode,
    isDemoMode,
    isRealAuth,
  } = useAgora()

  const [githubInput, setGithubInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [presentationCompleted, setPresentationCompleted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Mark as hydrated after first client render
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Wait for hydration to check preview mode
    if (!isHydrated) return

    // In preview mode, always init onboarding for demonstration
    if (isPreviewMode && !onboarding) {
      initOnboarding()
      return
    }
    if (user.hasAcceptedInternshipContract && !onboarding && !user.hasCompletedOnboarding) {
      initOnboarding()
    }
  }, [
    user.hasAcceptedInternshipContract,
    user.hasCompletedOnboarding,
    onboarding,
    initOnboarding,
    isPreviewMode,
    isHydrated,
  ])

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!isHydrated) return
    // Skip redirects in preview mode
    if (isPreviewMode) return
    if (!user.hasAcceptedInternshipContract) {
      router.replace('/pt/agora/contract')
    }
  }, [user.hasAcceptedInternshipContract, router, isPreviewMode, isHydrated])

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!isHydrated) return
    // Skip redirects in preview mode
    if (isPreviewMode) return
    if (user.hasCompletedOnboarding) {
      router.replace('/pt/agora')
    }
  }, [user.hasCompletedOnboarding, router, isPreviewMode, isHydrated])

  const currentStep = onboarding?.currentStep || 1
  const selectedTracks = onboarding?.selectedTracks || []

  const handleGitHubSubmit = async () => {
    if (!githubInput.trim()) return
    await setGitHubUsername(githubInput.trim())
  }

  const handleVerifyFork = async () => {
    setIsVerifying(true)
    setVerifyError(null)
    const result = await verifyGitHubFork()
    setIsVerifying(false)
    if (!result.success) {
      setVerifyError(result.message)
    }
  }

  const handleComplete = () => {
    if (isPreviewMode) {
      // In preview mode, just go back to dashboard without saving
      router.push('/pt/agora')
      return
    }
    completeOnboarding()
    router.push('/pt/agora')
  }

  const goToStep = (step: number) => {
    if (onboarding?.completedSteps.includes(step) || step <= currentStep) {
      updateOnboarding({ currentStep: step })
    }
  }

  // Handle presentation slide changes
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index)
    // Mark as completed when user reaches the last slide
    if (index === PRESENTATION_SLIDES.length - 1) {
      setPresentationCompleted(true)
    }
  }

  // Complete presentation and go to track selection
  const handlePresentationComplete = () => {
    if (!onboarding) return
    updateOnboarding({
      currentStep: 2,
      completedSteps: [...onboarding.completedSteps, 1],
    })
  }

  if (!onboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Preparando onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white py-2 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-sm">
            <span className="animate-pulse">👁️</span>
            <span className="font-medium">Modo Preview</span>
            <span className="hidden sm:inline text-white/80">
              — Explore o onboarding sem alterar seus dados
            </span>
          </div>
        </div>
      )}

      {/* Auth Mode Indicator (dev/debug) */}
      {!isPreviewMode && (
        <div
          className={`py-1 px-4 text-center text-xs ${
            isRealAuth
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          }`}
        >
          {isRealAuth ? (
            <>
              <span className="font-medium">Modo Autenticado</span>
              <span className="hidden sm:inline"> — Dados salvos no Supabase</span>
            </>
          ) : (
            <>
              <span className="font-medium">Modo Demo</span>
              <span className="hidden sm:inline"> — Dados salvos localmente</span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100">Onboarding</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Academy Cidadão.AI</p>
            </div>
          </div>
          <Badge variant="warning" size="lg">
            <Sparkles className="w-3 h-3 mr-1" />
            {isPreviewMode ? 'Preview' : '+275 XP ao concluir'}
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
            {/* Progress line filled */}
            <div
              className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
              style={{ width: `calc(${((currentStep - 1) / 4) * 100}% - 32px)` }}
            />

            {STEPS.map((step, index) => {
              const stepNum = index + 1
              const isCompleted = onboarding.completedSteps.includes(stepNum)
              const isCurrent = currentStep === stepNum
              const Icon = step.icon

              return (
                <button
                  key={stepNum}
                  onClick={() => goToStep(stepNum)}
                  disabled={!isCompleted && stepNum > currentStep}
                  className="relative z-10 flex flex-col items-center group"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCurrent
                        ? 'bg-gradient-to-br from-green-500 to-blue-600 text-white scale-110 shadow-lg ring-4 ring-green-500/20'
                        : isCompleted
                          ? 'bg-green-500 text-white cursor-pointer group-hover:scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-2 font-medium transition-colors',
                      isCurrent
                        ? 'text-green-600 dark:text-green-400'
                        : isCompleted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card variant="elevated" padding="lg" className="animate-fade-in">
          <CardContent>
            {/* Step 1: Presentation */}
            {currentStep === 1 && (
              <div className="space-y-6 py-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Conheça o Cidadão.AI
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Assista a apresentação para entender o projeto e desbloquear as trilhas de
                    aprendizado
                  </p>
                </div>

                {/* Presentation Carousel */}
                <PresentationCarousel
                  slides={PRESENTATION_SLIDES}
                  autoplay={false}
                  showNarration={true}
                  agentName="Santos-Dumont"
                  agentImage="/agents/santos-dumont.png"
                  onSlideChange={handleSlideChange}
                  className="max-w-3xl mx-auto"
                />

                {/* Progress indicator */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {presentationCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Apresentação concluída!
                        </span>
                      </>
                    ) : (
                      <>
                        <Presentation className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Slide {currentSlide + 1} de {PRESENTATION_SLIDES.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Agent tip */}
                {!presentationCompleted && (
                  <Card
                    variant="filled"
                    padding="sm"
                    className="max-w-lg mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src="/agents/santos-dumont.png"
                          alt="Santos-Dumont"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide">
                          Dica do Santos-Dumont:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          Navegue pelos slides usando as setas ou clicando nos pontos. Chegue até o
                          último slide para desbloquear as trilhas!
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* CTA */}
                <div className="text-center pt-4">
                  <Button
                    onClick={handlePresentationComplete}
                    disabled={!presentationCompleted}
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className={cn(!presentationCompleted && 'opacity-50 cursor-not-allowed')}
                  >
                    {presentationCompleted ? 'Escolher Minha Trilha' : 'Complete a Apresentação'}
                  </Button>
                  {!presentationCompleted && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      Vá até o último slide para continuar
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Track Selection (Multi-select) */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Escolha suas trilhas de especialização
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Você pode escolher várias trilhas! Cada uma oferece projetos práticos
                    diferentes.
                  </p>
                  {selectedTracks.length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      {selectedTracks.length} trilha{selectedTracks.length > 1 ? 's' : ''}{' '}
                      selecionada{selectedTracks.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TRACKS.map((track) => {
                    const Icon = track.icon
                    const isSelected = selectedTracks.includes(track.id)

                    return (
                      <button
                        key={track.id}
                        onClick={() => toggleTrack(track.id)}
                        className={cn(
                          'p-5 rounded-2xl border-2 text-left transition-all duration-300',
                          'hover:shadow-lg group',
                          isSelected
                            ? `${track.borderColor} ${track.bgColor} ring-4 ${track.ringColor}`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={cn(
                              'w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                              'group-hover:scale-110 transition-transform',
                              track.color
                            )}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {track.name}
                              </h3>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {track.description}
                            </p>
                          </div>
                        </div>

                        {/* Track details */}
                        <div className="flex flex-wrap gap-2">
                          {track.details.map((detail) => (
                            <span
                              key={detail}
                              className={cn(
                                'px-2 py-1 rounded-md text-xs font-medium',
                                isSelected
                                  ? 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              )}
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => goToStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={confirmTracks}
                    disabled={selectedTracks.length === 0}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Confirmar ({selectedTracks.length}) e Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: GitHub Username */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-900 dark:bg-white shadow-xl mb-4">
                    <Github className="w-10 h-10 text-white dark:text-gray-900" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Configure seu GitHub
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Informe seu username do GitHub para rastrear suas contribuições
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      @
                    </span>
                    <Input
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="seu-username"
                      className="pl-10"
                      inputSize="lg"
                      onKeyDown={(e) => e.key === 'Enter' && handleGitHubSubmit()}
                    />
                  </div>

                  <Button
                    onClick={handleGitHubSubmit}
                    disabled={!githubInput.trim()}
                    className="w-full"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continuar
                  </Button>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => goToStep(2)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Fork Verification */}
            {currentStep === 4 && selectedTracks.length > 0 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Fork do repositório
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Faça fork do repositório da sua trilha principal para começar a contribuir
                  </p>
                </div>

                <Card variant="filled" padding="md" className="max-w-lg mx-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                      <Github className="w-6 h-6 text-white dark:text-gray-900" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {TRACK_REPOS[selectedTracks[0]].owner}/{TRACK_REPOS[selectedTracks[0]].repo}
                      </p>
                      <p className="text-sm text-gray-500">
                        Repositório da trilha {selectedTracks[0].toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://github.com/${TRACK_REPOS[selectedTracks[0]].owner}/${TRACK_REPOS[selectedTracks[0]].repo}/fork`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir página de fork no GitHub
                  </a>
                </Card>

                {verifyError && (
                  <Card
                    variant="outlined"
                    padding="sm"
                    className="max-w-lg mx-auto border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700 dark:text-red-300">{verifyError}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Certifique-se de fazer o fork e tente novamente.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {onboarding.github?.hasForked && (
                  <Card
                    variant="outlined"
                    padding="sm"
                    className="max-w-lg mx-auto border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          Fork verificado com sucesso!
                        </p>
                        <a
                          href={onboarding.github.forkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          Ver seu fork
                        </a>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => goToStep(3)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>

                  {!onboarding.github?.hasForked ? (
                    <Button
                      onClick={handleVerifyFork}
                      loading={isVerifying}
                      rightIcon={!isVerifying ? <CheckCircle2 className="w-4 h-4" /> : undefined}
                    >
                      {isVerifying ? 'Verificando...' : 'Verificar Fork'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateOnboarding({ currentStep: 5 })}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <div className="text-center space-y-8 py-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-orange-500/25 animate-bounce">
                  <PartyPopper className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Parabéns, {user.name.split(' ')[0]}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Você completou o onboarding e está pronto para começar!
                  </p>
                </div>

                <Card
                  variant="filled"
                  padding="md"
                  className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold text-lg">+275 XP conquistados!</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Trilha{selectedTracks.length > 1 ? 's' : ''}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedTracks.map((t) => t.toUpperCase()).join(', ')}
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">GitHub</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        @{onboarding.github?.username}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="max-w-md mx-auto text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Próximos passos:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Explore o dashboard e familiarize-se com a plataforma',
                      'Converse com o mentor IA para tirar dúvidas técnicas',
                      'Faça seu primeiro commit no repositório!',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            {i + 1}
                          </span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={handleComplete}
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Ir para o Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Loading fallback for Suspense
function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando onboarding...</p>
      </div>
    </div>
  )
}

export default function AcademyOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  )
}
