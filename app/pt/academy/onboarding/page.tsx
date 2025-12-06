'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAcademyDemo, TRACK_REPOS } from '@/hooks/use-academy-demo'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
 */

const TRACKS = [
  {
    id: 'backend' as const,
    name: 'Backend',
    description: 'APIs, microservices e arquitetura de sistemas',
    icon: Server,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    id: 'frontend' as const,
    name: 'Frontend',
    description: 'Interfaces, UX/UI e aplicações web',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
  },
  {
    id: 'ia' as const,
    name: 'IA/ML',
    description: 'Inteligência artificial e machine learning',
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
  },
  {
    id: 'devops' as const,
    name: 'DevOps',
    description: 'Infraestrutura, CI/CD e cloud',
    icon: Code,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
  },
]

export default function AcademyOnboardingPage() {
  const router = useRouter()
  const {
    user,
    onboarding,
    initOnboarding,
    selectTrack,
    setGitHubUsername,
    verifyGitHubFork,
    completeOnboarding,
    updateOnboarding,
  } = useAcademyDemo()

  const [githubInput, setGithubInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  // Initialize onboarding if not started and contract is accepted
  useEffect(() => {
    if (user.hasAcceptedInternshipContract && !onboarding && !user.hasCompletedOnboarding) {
      initOnboarding()
    }
  }, [user.hasAcceptedInternshipContract, user.hasCompletedOnboarding, onboarding, initOnboarding])

  // Redirect if contract not accepted
  useEffect(() => {
    if (!user.hasAcceptedInternshipContract) {
      router.replace('/pt/academy/contract')
    }
  }, [user.hasAcceptedInternshipContract, router])

  // Redirect if onboarding already completed
  useEffect(() => {
    if (user.hasCompletedOnboarding) {
      router.replace('/pt/academy')
    }
  }, [user.hasCompletedOnboarding, router])

  const currentStep = onboarding?.currentStep || 1

  const handleTrackSelect = (trackId: 'backend' | 'frontend' | 'ia' | 'devops') => {
    selectTrack(trackId)
  }

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
    completeOnboarding()
    router.push('/pt/academy')
  }

  const goToStep = (step: number) => {
    if (onboarding?.completedSteps.includes(step) || step <= currentStep) {
      updateOnboarding({ currentStep: step })
    }
  }

  // Loading state
  if (!onboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparando onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => goToStep(step)}
                  disabled={!onboarding.completedSteps.includes(step) && step > currentStep}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    currentStep === step
                      ? 'bg-green-600 text-white scale-110 shadow-lg'
                      : onboarding.completedSteps.includes(step)
                        ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {onboarding.completedSteps.includes(step) ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </button>
                {step < 5 && (
                  <div
                    className={cn(
                      'w-full h-1 mx-2 rounded',
                      onboarding.completedSteps.includes(step)
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                    style={{ minWidth: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Boas-vindas</span>
            <span>Trilha</span>
            <span>GitHub</span>
            <span>Fork</span>
            <span>Pronto!</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                <Rocket className="h-10 w-10 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo à Academy!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Você está prestes a embarcar em uma jornada de aprendizado e contribuição.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-left space-y-4">
                <h2 className="font-semibold text-green-800 dark:text-green-300">
                  O que você vai fazer:
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Escolher sua trilha de desenvolvimento (Backend, Frontend, IA ou DevOps)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Configurar seu GitHub para contribuir com o projeto
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Fazer fork do repositório da sua trilha para começar a contribuir
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() =>
                  updateOnboarding({
                    currentStep: 2,
                    completedSteps: [...onboarding.completedSteps, 1],
                  })
                }
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Começar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Track Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Escolha sua trilha
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Selecione a área em que você quer se especializar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRACKS.map((track) => {
                  const Icon = track.icon
                  const isSelected = onboarding.selectedTrack === track.id

                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackSelect(track.id)}
                      className={cn(
                        'p-6 rounded-xl border-2 text-left transition-all',
                        isSelected
                          ? `${track.borderColor} ${track.bgColor}`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                            track.color
                          )}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {track.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {track.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => goToStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: GitHub Username */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 dark:bg-white mb-4">
                  <Github className="h-8 w-8 text-white dark:text-gray-900" />
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="seu-username"
                    className="pl-8"
                    onKeyDown={(e) => e.key === 'Enter' && handleGitHubSubmit()}
                  />
                </div>

                <Button
                  onClick={handleGitHubSubmit}
                  disabled={!githubInput.trim()}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => goToStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Fork Verification */}
          {currentStep === 4 && onboarding.selectedTrack && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Fork do repositório
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Faça fork do repositório da sua trilha para começar a contribuir
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {TRACK_REPOS[onboarding.selectedTrack].owner}/
                      {TRACK_REPOS[onboarding.selectedTrack].repo}
                    </p>
                    <p className="text-sm text-gray-500">
                      Repositório da trilha {onboarding.selectedTrack.toUpperCase()}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://github.com/${TRACK_REPOS[onboarding.selectedTrack].owner}/${TRACK_REPOS[onboarding.selectedTrack].repo}/fork`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir página de fork no GitHub
                </a>
              </div>

              {verifyError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">{verifyError}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Certifique-se de fazer o fork e tente novamente.
                    </p>
                  </div>
                </div>
              )}

              {onboarding.github?.hasForked && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">
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
              )}

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => goToStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>

                {!onboarding.github?.hasForked ? (
                  <Button
                    onClick={handleVerifyFork}
                    disabled={isVerifying}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Verificar Fork
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateOnboarding({ currentStep: 5 })}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Parabéns, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Você completou o onboarding e está pronto para começar!
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Você ganhou +275 XP no onboarding!</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                    <p className="text-gray-500 dark:text-gray-400">Trilha</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {onboarding.selectedTrack?.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                    <p className="text-gray-500 dark:text-gray-400">GitHub</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      @{onboarding.github?.username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Próximos passos:</h3>
                <ul className="text-left space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium flex-shrink-0">
                      1
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Explore o dashboard e familiarize-se com a plataforma
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium flex-shrink-0">
                      2
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Converse com os agentes IA para tirar dúvidas técnicas
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium flex-shrink-0">
                      3
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Faça seu primeiro commit no repositório!
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleComplete}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Ir para o Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
