'use client'

/**
 * Survey Progress Component
 *
 * Visual progress indicator for survey wizard
 * Shows step dots and progress bar
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { cn } from '@/lib/utils'

interface SurveyProgressProps {
  currentStep: number
  totalSteps: number
  onStepClick?: (step: number) => void
  allowNavigation?: boolean
}

export function SurveyProgress({
  currentStep,
  totalSteps,
  onStepClick,
  allowNavigation = false,
}: SurveyProgressProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full space-y-3">
      {/* Step indicator text */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Pergunta {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{Math.round(progressPercent)}%</span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Progresso: pergunta ${currentStep + 1} de ${totalSteps}`}
      >
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between gap-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isClickable = allowNavigation && (isCompleted || isCurrent)

          return (
            <button
              key={i}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(i)}
              aria-label={`Ir para pergunta ${i + 1}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                    ? 'bg-green-400'
                    : 'bg-gray-200 dark:bg-gray-700',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
