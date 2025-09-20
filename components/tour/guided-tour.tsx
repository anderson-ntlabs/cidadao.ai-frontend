'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
// import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard-overview"]',
    title: 'Visão Geral do Dashboard',
    content: 'Aqui você encontra as métricas principais do sistema, incluindo investigações ativas e anomalias detectadas.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="agents-section"]',
    title: 'Agentes de IA',
    content: 'Nossos 17 agentes especializados trabalham 24/7 analisando dados públicos em busca de irregularidades.',
    placement: 'left'
  },
  {
    target: '[data-tour="chat-button"]',
    title: 'Converse com os Agentes',
    content: 'Faça perguntas sobre transparência pública e receba análises detalhadas dos nossos agentes de IA.',
    placement: 'left',
    action: {
      label: 'Abrir Chat',
      onClick: () => console.log('Open chat')
    }
  },
  {
    target: '[data-tour="export-button"]',
    title: 'Exporte Relatórios',
    content: 'Baixe análises completas em PDF ou CSV para compartilhar ou analisar offline.',
    placement: 'top'
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notificações em Tempo Real',
    content: 'Receba alertas instantâneos sobre novas anomalias e conclusões de investigações.',
    placement: 'bottom'
  }
]

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
}

export function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = tourSteps[currentStep]

  useEffect(() => {
    if (!isOpen || !step) return

    const findTarget = () => {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setTargetElement(element)
        element.classList.add('tour-highlight')
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    // Try to find the target element immediately and after a delay
    findTarget()
    const timer = setTimeout(findTarget, 500)

    return () => {
      clearTimeout(timer)
      if (targetElement) {
        targetElement.classList.remove('tour-highlight')
      }
    }
  }, [currentStep, step, isOpen, targetElement])

  useEffect(() => {
    if (!targetElement || !tooltipRef.current) return

    const calculatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current!.getBoundingClientRect()
      
      let top = 0
      let left = 0

      switch (step.placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case 'bottom':
          top = targetRect.bottom + 16
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.left - tooltipRect.width - 16
          break
        case 'right':
        default:
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.right + 16
          break
      }

      // Keep tooltip within viewport
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16))
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16))

      setPosition({ top, left })
    }

    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition)

    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition)
    }
  }, [targetElement, step.placement])

  const handleNext = () => {
    if (targetElement) {
      targetElement.classList.remove('tour-highlight')
    }
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (targetElement) {
      targetElement.classList.remove('tour-highlight')
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    if (targetElement) {
      targetElement.classList.remove('tour-highlight')
    }
    onClose()
    setCurrentStep(0)
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />
      
      {targetElement && (
        <div
          ref={tooltipRef}
          className="fixed z-[10000] bg-card border shadow-xl rounded-lg p-6 max-w-sm animate-scale-in"
          style={{ top: position.top, left: position.left }}
        >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

            {step.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={step.action.onClick}
                className="mb-4 w-full"
              >
                {step.action.label}
              </Button>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} de {tourSteps.length}
              </span>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                >
                  {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  {currentStep < tourSteps.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
      )}
    </>,
    document.body
  )
}