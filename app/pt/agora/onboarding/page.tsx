'use client'

/**
 * Academy Onboarding Page - Simplified Version
 *
 * Clean, interactive onboarding flow:
 * 1. Welcome - Brief introduction to the platform
 * 2. Accept Terms - LGPD consent and internship contract
 * 3. Tour - Quick interactive highlights of main features
 * 4. Complete - Ready to start!
 *
 * Design: Uses design system tokens for visual consistency
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-08 - Simplified from 40-slide carousel to interactive tour
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAgora } from '@/hooks/use-agora'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Shield,
  Sparkles,
  Target,
  MessageSquare,
  Trophy,
  BookOpen,
  Home,
  Eye,
  FileText,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Onboarding steps - simplified
const STEPS = [
  { id: 1, label: 'Boas-vindas', icon: Sparkles },
  { id: 2, label: 'Termos', icon: Shield },
  { id: 3, label: 'Tour', icon: Target },
  { id: 4, label: 'Pronto!', icon: CheckCircle2 },
]

// Tour highlights - key features
const TOUR_FEATURES = [
  {
    icon: MessageSquare,
    title: 'Mentores IA',
    description: 'Converse com Santos-Dumont e Lina Bo Bardi para tirar duvidas tecnicas.',
    color: 'bg-[var(--color-primary)]',
  },
  {
    icon: Target,
    title: 'Trilhas de Aprendizado',
    description: 'Backend, Frontend, IA/ML e DevOps - escolha sua especializacao.',
    color: 'bg-[var(--color-secondary)]',
  },
  {
    icon: Trophy,
    title: 'Gamificacao',
    description: 'Ganhe XP, badges e suba no ranking completando atividades.',
    color: 'bg-[var(--color-accent)]',
  },
  {
    icon: BookOpen,
    title: 'Diário de Bordo',
    description: 'Organize seus estudos e acompanhe seu progresso no calendario.',
    color: 'bg-[var(--cidadao-purple-600)]',
  },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreviewMode = searchParams.get('preview') === 'true'

  const { user, isAuthenticated, isLoading, completeOnboarding } = useAgora()

  const [currentStep, setCurrentStep] = useState(1)
  const [acceptedLgpd, setAcceptedLgpd] = useState(false)
  const [acceptedContract, setAcceptedContract] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)

  // Redirect if already completed onboarding (unless preview)
  useEffect(() => {
    if (!isPreviewMode && !isLoading && user?.hasCompletedOnboarding) {
      router.replace('/pt/agora')
    }
  }, [isPreviewMode, isLoading, user?.hasCompletedOnboarding, router])

  // Redirect if not authenticated (unless preview)
  useEffect(() => {
    if (!isPreviewMode && !isLoading && !isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isPreviewMode, isLoading, isAuthenticated, router])

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (isPreviewMode) {
      router.push('/pt/agora')
      return
    }
    await completeOnboarding()
    router.push('/pt/agora')
  }

  const canProceedStep2 = acceptedLgpd && acceptedContract
  const canProceedStep3 = tourIndex >= TOUR_FEATURES.length - 1

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-secondary)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-[var(--color-text-muted)]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)]">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-[var(--color-secondary)] text-white py-2.5 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Modo Preview</span>
            </div>
            <Link
              href="/pt/agora"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              Voltar
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[var(--color-surface-primary)] border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--color-text-primary)] text-sm">
                Bem-vindo a Agora
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)]">Academy Cidadao.AI</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  currentStep === step.id
                    ? 'w-6 bg-[var(--color-primary)]'
                    : currentStep > step.id
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-[var(--color-surface-primary)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Bem-vindo a Agora!
                </h2>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                  A plataforma de aprendizado do Cidadao.AI onde você vai desenvolver habilidades
                  reais contribuindo com um projeto de impacto social.
                </p>
              </div>

              {/* Quick overview cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm">
                      Aprenda na Pratica
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Contribua com codigo real em um projeto open source brasileiro.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm">
                      Mentoria IA 24/7
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Tire duvidas com nossos agentes de IA a qualquer momento.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm">
                      Gamificacao
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Ganhe XP, badges e certificados ao completar trilhas.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--cidadao-purple-600)]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[var(--cidadao-purple-600)]" />
                    </div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm">
                      Certificado
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Receba certificado oficial de 50 horas ao concluir.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Terms */}
          {currentStep === 2 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  Termos e Consentimentos
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Para continuar, aceite os termos abaixo.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* LGPD Consent */}
                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    acceptedLgpd
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={acceptedLgpd}
                    onChange={(e) => setAcceptedLgpd(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm mb-1">
                      Consentimento LGPD
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Protecao
                      de Dados para fins de participacao na plataforma Agora Academy.
                    </p>
                  </div>
                </label>

                {/* Internship Contract */}
                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    acceptedContract
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={acceptedContract}
                    onChange={(e) => setAcceptedContract(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)] text-sm mb-1">
                      Termo de Compromisso
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Declaro estar ciente das responsabilidades e compromissos do programa de
                      capacitacao, incluindo dedicacao minima de 4 horas semanais.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className={cn(
                    'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
                    !canProceedStep2 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Tour */}
          {currentStep === 3 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  Conheca a Plataforma
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Veja os principais recursos disponiveis para você.
                </p>
              </div>

              {/* Feature highlight */}
              <div className="mb-6">
                <div className="relative p-6 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                      TOUR_FEATURES[tourIndex].color
                    )}
                  >
                    {(() => {
                      const Icon = TOUR_FEATURES[tourIndex].icon
                      return <Icon className="w-7 h-7 text-white" />
                    })()}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {TOUR_FEATURES[tourIndex].title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {TOUR_FEATURES[tourIndex].description}
                  </p>

                  {/* Feature counter */}
                  <div className="absolute top-4 right-4 px-2 py-1 rounded bg-[var(--color-surface-primary)] text-xs text-[var(--color-text-muted)]">
                    {tourIndex + 1} / {TOUR_FEATURES.length}
                  </div>
                </div>
              </div>

              {/* Tour navigation dots */}
              <div className="flex justify-center gap-2 mb-6">
                {TOUR_FEATURES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTourIndex(index)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      tourIndex === index
                        ? 'w-6 bg-[var(--color-primary)]'
                        : tourIndex > index
                          ? 'bg-[var(--color-primary)]/50'
                          : 'bg-[var(--color-border)]'
                    )}
                  />
                ))}
              </div>

              {/* Tour controls */}
              <div className="flex gap-3 mb-6">
                <Button
                  variant="secondary"
                  onClick={() => setTourIndex(Math.max(0, tourIndex - 1))}
                  disabled={tourIndex === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setTourIndex(Math.min(TOUR_FEATURES.length - 1, tourIndex + 1))}
                  disabled={tourIndex === TOUR_FEATURES.length - 1}
                  className="flex-1"
                >
                  Proximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                >
                  {canProceedStep3 ? 'Concluir Tour' : 'Pular Tour'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="p-6 md:p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                Voce completou o onboarding e está pronto para começar sua jornada na Agora Academy.
              </p>

              {/* XP reward */}
              {!isPreviewMode && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">+50 XP conquistados!</span>
                </div>
              )}

              {/* Next steps */}
              <div className="text-left max-w-sm mx-auto mb-8">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-3">
                  Próximos passos:
                </h3>
                <ul className="space-y-2">
                  {[
                    'Explore o dashboard e conheca as funcionalidades',
                    'Escolha uma trilha de aprendizado para começar',
                    'Converse com um mentor IA para tirar duvidas',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                    >
                      <span className="w-5 h-5 rounded bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-[var(--color-primary)]">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => void handleComplete()}
                size="lg"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
              >
                Ir para o Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-secondary)]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-500">Carregando onboarding...</p>
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
