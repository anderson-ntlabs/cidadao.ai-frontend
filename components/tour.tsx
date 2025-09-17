'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface TourProps {
  steps: TourStep[]
  onComplete?: () => void
  storageKey?: string
}

export function Tour({ steps, onComplete, storageKey = 'tour-completed' }: TourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  
  useEffect(() => {
    // Verifica se o tour já foi completado
    const completed = localStorage.getItem(storageKey)
    if (!completed && steps.length > 0) {
      // Aguarda um momento para garantir que os elementos estejam renderizados
      setTimeout(() => {
        setIsActive(true)
      }, 1000)
    }
  }, [storageKey, steps])
  
  useEffect(() => {
    if (!isActive || !steps[currentStep]) return
    
    const element = document.querySelector(steps[currentStep].target) as HTMLElement
    if (element) {
      setTargetElement(element)
      // Scroll suave até o elemento
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Adiciona destaque ao elemento
      element.classList.add('tour-highlight')
      
      return () => {
        element.classList.remove('tour-highlight')
      }
    }
  }, [isActive, currentStep, steps])
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleComplete = () => {
    setIsActive(false)
    localStorage.setItem(storageKey, 'true')
    onComplete?.()
  }
  
  const handleSkip = () => {
    handleComplete()
  }
  
  if (!isActive || !targetElement || !steps[currentStep]) return null
  
  const step = steps[currentStep]
  const rect = targetElement.getBoundingClientRect()
  
  // Calcula a posição do tooltip
  const getTooltipPosition = () => {
    const placement = step.placement || 'bottom'
    const tooltipWidth = 320
    const tooltipHeight = 200
    const offset = 20
    
    switch (placement) {
      case 'top':
        return {
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          top: rect.top - tooltipHeight - offset
        }
      case 'bottom':
        return {
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          top: rect.bottom + offset
        }
      case 'left':
        return {
          left: rect.left - tooltipWidth - offset,
          top: rect.top + rect.height / 2 - tooltipHeight / 2
        }
      case 'right':
        return {
          left: rect.right + offset,
          top: rect.top + rect.height / 2 - tooltipHeight / 2
        }
      default:
        return {
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          top: rect.bottom + offset
        }
    }
  }
  
  const position = getTooltipPosition()
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleSkip}>
        {/* Highlight hole */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - 4}
                y={rect.top - 4}
                width={rect.width + 8}
                height={rect.height + 8}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="black"
            fillOpacity="0.5"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>
      
      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 animate-fade-in"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <h3 className="text-lg font-bold mb-2 pr-8">{step.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{step.content}</p>
        
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-green-600'
                    : index < currentStep
                    ? 'bg-green-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {currentStep + 1} de {steps.length}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Pular
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}