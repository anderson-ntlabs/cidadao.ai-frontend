'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAcademy, TRACK_REPOS } from '@/hooks/use-academy'
import {
  Rocket,
  Code,
  Palette,
  Brain,
  Server,
  Github,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  PartyPopper,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Academy Onboarding Page
 *
 * Multi-step wizard for new interns:
 * 1. Welcome - Introduction to Academy
 * 2. Track Selection - Choose development track
 * 3. GitHub Setup - Enter GitHub username
 * 4. Fork Verification - Verify repository fork
 * 5. Complete - Welcome to the team!
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
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
  { label: 'Boas-vindas', icon: Rocket },
  { label: 'Trilha', icon: Code },
  { label: 'GitHub', icon: Github },
  { label: 'Fork', icon: ExternalLink },
  { label: 'Pronto!', icon: PartyPopper },
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
  } = useAcademy()

  const [githubInput, setGithubInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

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
      router.replace('/pt/academy/contract')
    }
  }, [user.hasAcceptedInternshipContract, router, isPreviewMode, isHydrated])

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!isHydrated) return
    // Skip redirects in preview mode
    if (isPreviewMode) return
    if (user.hasCompletedOnboarding) {
      router.replace('/pt/academy')
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
      router.push('/pt/academy')
      return
    }
    completeOnboarding()
    router.push('/pt/academy')
  }

  const goToStep = (step: number) => {
    if (onboarding?.completedSteps.includes(step) || step <= currentStep) {
      updateOnboarding({ currentStep: step })
    }
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
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="space-y-8 py-4">
                {/* Hero */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl shadow-green-500/25 mb-6">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Bem-vindo à Academy Cidadão.AI!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                    Prepare-se para uma experiência imersiva de aprendizado com IA e transparência
                    pública.
                  </p>
                </div>

                {/* What is Academy */}
                <Card
                  variant="elevated"
                  padding="md"
                  className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                >
                  <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />O que é a Academy?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    A Academy é o programa de capacitação do projeto Cidadão.AI. Aqui você vai
                    aprender na prática, contribuindo com código real para uma plataforma de
                    transparência pública com Inteligência Artificial.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🎯', text: 'Aprendizado prático' },
                      { icon: '🤖', text: 'Mentor IA 24/7' },
                      { icon: '📊', text: 'Métricas de progresso' },
                      { icon: '🏆', text: 'Certificado oficial' },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Onboarding Steps */}
                <Card variant="filled" padding="md">
                  <h2 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Próximos passos do onboarding:
                  </h2>
                  <ul className="space-y-4">
                    {[
                      {
                        title: 'Escolher sua trilha',
                        desc: 'Backend, Frontend, IA/ML ou DevOps',
                      },
                      {
                        title: 'Conectar GitHub',
                        desc: 'Para rastrear suas contribuições',
                      },
                      {
                        title: 'Fazer fork do repositório',
                        desc: 'Seu espaço para desenvolver',
                      },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* CTA */}
                <div className="text-center">
                  <Button
                    onClick={() =>
                      updateOnboarding({
                        currentStep: 2,
                        completedSteps: [...onboarding.completedSteps, 1],
                      })
                    }
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Começar Jornada
                  </Button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Tempo estimado: 3-5 minutos
                  </p>
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
