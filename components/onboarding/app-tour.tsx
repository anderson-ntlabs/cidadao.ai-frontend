'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TourStep {
  target: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface AppTourProps {
  steps: TourStep[]
  tourId: string
  onComplete?: () => void
  onSkip?: () => void
  autoStart?: boolean
}

const STORAGE_KEY_PREFIX = 'app-tour-'

export function AppTour({ steps, tourId, onComplete, onSkip, autoStart = true }: AppTourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const storageKey = `${STORAGE_KEY_PREFIX}${tourId}`

  // Check if tour was already completed
  useEffect(() => {
    setMounted(true)
    if (autoStart) {
      const completed = localStorage.getItem(storageKey)
      if (!completed) {
        // Delay start to let page render
        const timer = setTimeout(() => setIsActive(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [autoStart, storageKey])

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !steps[currentStep]) return

    const findTarget = () => {
      const target = document.querySelector(steps[currentStep].target)
      if (target) {
        const rect = target.getBoundingClientRect()
        setTargetRect(rect)

        // Scroll into view if needed
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    findTarget()

    // Update position on scroll/resize
    const handleUpdate = () => findTarget()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isActive, currentStep, steps])

  // Calculate tooltip position
  const getTooltipStyle = useCallback(() => {
    if (!targetRect || !tooltipRef.current) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const tooltip = tooltipRef.current.getBoundingClientRect()
    const step = steps[currentStep]
    const padding = 16
    const isMobile = window.innerWidth < 768

    let position = step.position || 'auto'

    // Auto-detect best position
    if (position === 'auto') {
      const spaceTop = targetRect.top
      const spaceBottom = window.innerHeight - targetRect.bottom
      const spaceLeft = targetRect.left
      const spaceRight = window.innerWidth - targetRect.right

      if (isMobile) {
        // On mobile, prefer top/bottom
        position = spaceBottom > spaceTop ? 'bottom' : 'top'
      } else {
        // On desktop, use the side with most space
        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight)
        if (maxSpace === spaceBottom) position = 'bottom'
        else if (maxSpace === spaceTop) position = 'top'
        else if (maxSpace === spaceRight) position = 'right'
        else position = 'left'
      }
    }

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = targetRect.top - tooltip.height - padding
        left = targetRect.left + (targetRect.width - tooltip.width) / 2
        break
      case 'bottom':
        top = targetRect.bottom + padding
        left = targetRect.left + (targetRect.width - tooltip.width) / 2
        break
      case 'left':
        top = targetRect.top + (targetRect.height - tooltip.height) / 2
        left = targetRect.left - tooltip.width - padding
        break
      case 'right':
        top = targetRect.top + (targetRect.height - tooltip.height) / 2
        left = targetRect.right + padding
        break
    }

    // Keep within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltip.height - padding))
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltip.width - padding))

    return { top: `${top}px`, left: `${left}px` }
  }, [targetRect, currentStep, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, new Date().toISOString())
    setIsActive(false)
    setCurrentStep(0)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'skipped')
    setIsActive(false)
    setCurrentStep(0)
    onSkip?.()
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePrev()
          break
        case 'Escape':
          e.preventDefault()
          handleSkip()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentStep])

  // Public method to restart tour
  const restart = useCallback(() => {
    localStorage.removeItem(storageKey)
    setCurrentStep(0)
    setIsActive(true)
  }, [storageKey])

  if (!mounted || !isActive) return null

  const step = steps[currentStep]

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={handleSkip}
          >
            {/* Dark overlay with cutout for target */}
            <svg className="w-full h-full">
              <defs>
                <mask id="tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={targetRect.left - 8}
                      y={targetRect.top - 8}
                      width={targetRect.width + 16}
                      height={targetRect.height + 16}
                      rx="8"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.7)"
                mask="url(#tour-mask)"
              />
            </svg>
          </motion.div>

          {/* Highlight ring around target */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            >
              <div className="w-full h-full rounded-lg ring-4 ring-green-500 ring-offset-2 ring-offset-transparent animate-pulse" />
            </motion.div>
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'fixed z-[10000]',
              'bg-white dark:bg-gray-900',
              'border border-gray-200 dark:border-gray-700',
              'rounded-xl shadow-2xl',
              'w-[calc(100vw-32px)] sm:w-[360px] max-w-sm',
              'p-5'
            )}
            style={getTooltipStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Pular tour"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-green-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Passo {currentStep + 1} de {steps.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {step.content}
            </p>

            {/* Action button if provided */}
            {step.action && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mb-4"
                onClick={() => {
                  step.action?.onClick?.()
                  if (step.action?.href) {
                    window.location.href = step.action.href
                  }
                }}
              >
                {step.action.label}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <div className="flex gap-1.5">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentStep
                        ? 'w-6 bg-green-500'
                        : index < currentStep
                          ? 'bg-green-300'
                          : 'bg-gray-300 dark:bg-gray-600'
                    )}
                    aria-label={`Ir para passo ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={
                  currentStep < steps.length - 1 ? <ChevronRight className="w-4 h-4" /> : undefined
                }
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
              </Button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-gray-400 text-center mt-3 hidden sm:block">
              Use as setas ← → para navegar ou ESC para sair
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// Button to restart tour
export function TourRestartButton({
  tourId,
  onRestart,
}: {
  tourId: string
  onRestart: () => void
}) {
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tourId}`)
    setHasCompleted(!!completed)
  }, [tourId])

  if (!hasCompleted) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onRestart}
      leftIcon={<Sparkles className="w-4 h-4" />}
    >
      Refazer tour
    </Button>
  )
}
