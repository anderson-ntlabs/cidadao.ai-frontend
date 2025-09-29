'use client';

import React, { useEffect } from 'react';
import { TourControls, TourFloatingButton } from './tour-controls';
import { useTour } from '@/hooks/use-tour';
import { AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface InteractiveTourProps {
  autoStart?: boolean;
  mode?: 'quick' | 'complete';
  showFloatingButton?: boolean;
}

export function InteractiveTour({ 
  autoStart = true, 
  mode = 'quick',
  showFloatingButton = true 
}: InteractiveTourProps) {
  const {
    isActive,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    stepInfo,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    restartTour,
    hasSeenTour
  } = useTour({
    autoStart,
    mode,
    onComplete: () => {
      toast.success('Tour concluído! Agora você está pronto para usar o Cidadão.AI');
    },
    onSkip: () => {
      toast.info('Tour pulado. Você pode reiniciá-lo a qualquer momento');
    }
  });

  // Show floating button if tour was seen/skipped
  const showRestartButton = showFloatingButton && hasSeenTour() && !isActive;

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <TourControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitle={stepInfo?.title}
            stepDescription={stepInfo?.description}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            onRestart={restartTour}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            mode={mode}
          />
        )}
      </AnimatePresence>

      {showRestartButton && (
        <TourFloatingButton onClick={() => startTour(mode)} />
      )}
    </>
  );
}

// Component to trigger tour from UI
export function TourTrigger({ 
  children, 
  mode = 'quick' 
}: { 
  children: React.ReactNode; 
  mode?: 'quick' | 'complete';
}) {
  const { startTour } = useTour({ autoStart: false });

  return (
    <div onClick={() => startTour(mode)} role="button" tabIndex={0}>
      {children}
    </div>
  );
}