'use client'

import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  image?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Cidadão.AI!',
    description: 'Sua plataforma de transparência pública com inteligência artificial. Vamos configurar sua conta em poucos passos.',
    icon: <Sparkles className="h-12 w-12 text-yellow-500" />
  },
  {
    id: 'agents',
    title: 'Conheça nossos Agentes de IA',
    description: 'Temos 17 agentes especializados em análise de transparência. Cada um com habilidades únicas para detectar anomalias e gerar insights.',
    image: '/agents/zumbi-dos-palmares.png'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Personalizado',
    description: 'Visualize dados em tempo real, acompanhe investigações e exporte relatórios detalhados.',
    icon: <div className="grid grid-cols-2 gap-2">
      <div className="h-8 w-8 bg-green-500/20 rounded" />
      <div className="h-8 w-8 bg-blue-500/20 rounded" />
      <div className="h-8 w-8 bg-yellow-500/20 rounded" />
      <div className="h-8 w-8 bg-purple-500/20 rounded" />
    </div>
  },
  {
    id: 'notifications',
    title: 'Fique Sempre Informado',
    description: 'Configure notificações para receber alertas sobre anomalias detectadas e novas investigações.',
    action: {
      label: 'Configurar Notificações',
      onClick: () => console.log('Configure notifications')
    }
  },
  {
    id: 'ready',
    title: 'Tudo Pronto!',
    description: 'Você está pronto para começar a usar o Cidadão.AI. Explore o dashboard ou inicie uma conversa com nossos agentes.',
    icon: <Check className="h-12 w-12 text-green-500" />
  }
]

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const step = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id])
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-card rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Passo {currentStep + 1} de {onboardingSteps.length}</span>
              <button
                onClick={handleSkip}
                className="hover:text-foreground transition-colors"
              >
                Pular introdução
              </button>
            </div>
          </div>

          <div className="min-h-[400px] flex flex-col items-center justify-center text-center animate-fade-in-up">
              {step.image && (
                <div className="relative w-32 h-32 mb-6">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {step.icon && !step.image && (
                <div className="mb-6">{step.icon}</div>
              )}

              <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                {step.description}
              </p>

              {step.action && (
                <Button
                  onClick={step.action.onClick}
                  variant="outline"
                  className="mb-4"
                >
                  {step.action.label}
                </Button>
              )}

              <div className="flex items-center gap-2 mt-4">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <Button onClick={handleNext}>
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  Começar
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}