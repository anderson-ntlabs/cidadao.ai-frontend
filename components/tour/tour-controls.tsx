'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonV2 } from '@/components/ui/button';

interface TourControlsProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  stepDescription?: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onRestart?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  mode?: 'quick' | 'complete';
  className?: string;
}

export function TourControls({
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  onNext,
  onPrev,
  onSkip,
  onRestart,
  isFirstStep,
  isLastStep,
  mode = 'quick',
  className
}: TourControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Announce step changes to screen readers
  useEffect(() => {
    const stepAnnouncement = `Passo ${currentStep + 1} de ${totalSteps}. ${stepTitle || ''}`;
    setAnnouncement(stepAnnouncement);
  }, [currentStep, totalSteps, stepTitle]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when tour is active (could add focus check here)
      switch (e.key) {
        case 'ArrowRight':
          if (!isLastStep) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (!isFirstStep) {
            e.preventDefault();
            onPrev();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onSkip();
          break;
        case 'Home':
          if (onRestart && !isFirstStep) {
            e.preventDefault();
            onRestart();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirstStep, isLastStep, onNext, onPrev, onSkip, onRestart]);

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <>
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]',
          'bg-white dark:bg-gray-900 rounded-lg shadow-2xl',
          'border border-gray-200 dark:border-gray-700',
          'min-w-[320px] max-w-[480px]',
          className
        )}
        role="region"
        aria-label="Controles do tour"
      >
        {/* Progress bar */}
        <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                {stepTitle && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {stepTitle}
                  </h3>
                )}
                {stepDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {stepDescription}
                  </p>
                )}

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-3">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Could implement jump to step if needed
                      }}
                      className={cn(
                        'w-2 h-2 rounded-full mx-1 transition-all',
                        index === currentStep
                          ? 'bg-green-500 w-6'
                          : index < currentStep
                          ? 'bg-green-300'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}
                      aria-label={`Ir para passo ${index + 1}`}
                      aria-current={index === currentStep ? 'step' : undefined}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control buttons */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
          {/* Left side controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isExpanded ? 'Minimizar controles' : 'Expandir controles'}
              aria-expanded={isExpanded}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <ButtonV2
              variant="secondary"
              size="sm"
              onClick={onPrev}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              aria-label="Passo anterior"
            >
              <span className="hidden sm:inline">Anterior</span>
            </ButtonV2>

            <ButtonV2
              variant="primary"
              size="sm"
              onClick={onNext}
              disabled={isLastStep}
              rightIcon={!isLastStep && <ChevronRight className="w-4 h-4" />}
              aria-label={isLastStep ? 'Concluir tour' : 'Próximo passo'}
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
            </ButtonV2>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Pular tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="px-3 pb-2">
          <button
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            onClick={() => {
              // Could show keyboard shortcuts modal
            }}
            aria-label="Ver atalhos de teclado"
          >
            <Info className="w-3 h-3" />
            <span>Dica: Use ← → para navegar, ESC para sair</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Floating tour button to restart tour
export function TourFloatingButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'w-12 h-12 rounded-full',
        'bg-green-500 hover:bg-green-600',
        'text-white shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-200'
      )}
      aria-label="Iniciar tour novamente"
    >
      <Info className="w-6 h-6" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
          >
            Fazer tour novamente
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}