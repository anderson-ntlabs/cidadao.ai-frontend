import { useState, useEffect, useCallback } from 'react';
import { TourManager } from '@/lib/services/tour-manager';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useChatStore } from '@/store/chat-store';

export interface UseTourOptions {
  autoStart?: boolean;
  mode?: 'quick' | 'complete';
  onComplete?: () => void;
  onSkip?: () => void;
}

export interface TourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  mode: 'quick' | 'complete';
  stepInfo?: {
    title?: string;
    description?: string;
    element?: string;
  };
}

export function useTour(options: UseTourOptions = {}) {
  const { autoStart = false, mode = 'quick', onComplete, onSkip } = options;
  const { user } = useAuth();
  const { messages } = useChatStore();
  
  const [tourManager] = useState(() => new TourManager());
  const [tourState, setTourState] = useState<TourState>({
    isActive: false,
    currentStep: 0,
    totalSteps: 0,
    mode
  });

  // Check if tour should auto-start
  useEffect(() => {
    if (autoStart && user && messages.length === 0) {
      const hasSeenTour = localStorage.getItem('tour-completed') === 'true';
      if (!hasSeenTour) {
        startTour(mode);
      }
    }
  }, [autoStart, user, messages.length]);

  const startTour = useCallback((tourMode: 'quick' | 'complete' = mode) => {
    tourManager.initialize({ mode: tourMode });
    tourManager.start(tourMode);
    
    setTourState({
      isActive: true,
      currentStep: tourManager.getCurrentStep(),
      totalSteps: tourManager.getTotalSteps(),
      mode: tourMode,
      stepInfo: getStepInfo(tourManager.getCurrentStep(), tourMode)
    });
  }, [tourManager]);

  const nextStep = useCallback(() => {
    tourManager.moveNext();
    const newStep = tourManager.getCurrentStep();
    
    setTourState(prev => ({
      ...prev,
      currentStep: newStep,
      stepInfo: getStepInfo(newStep, prev.mode)
    }));

    // Check if tour is complete
    if (tourManager.isLastStep() && !tourManager.hasNextStep()) {
      completeTour();
    }
  }, [tourManager]);

  const prevStep = useCallback(() => {
    tourManager.movePrevious();
    const newStep = tourManager.getCurrentStep();
    
    setTourState(prev => ({
      ...prev,
      currentStep: newStep,
      stepInfo: getStepInfo(newStep, prev.mode)
    }));
  }, [tourManager]);

  const skipTour = useCallback(() => {
    tourManager.stop();
    setTourState({
      isActive: false,
      currentStep: 0,
      totalSteps: 0,
      mode
    });
    
    // Mark as skipped
    localStorage.setItem('tour-skipped', 'true');
    onSkip?.();
  }, [tourManager, onSkip]);

  const completeTour = useCallback(() => {
    tourManager.stop();
    setTourState({
      isActive: false,
      currentStep: 0,
      totalSteps: 0,
      mode
    });
    
    // Mark as completed
    localStorage.setItem('tour-completed', 'true');
    localStorage.setItem('tour-completed-date', new Date().toISOString());
    onComplete?.();
  }, [tourManager, onComplete]);

  const restartTour = useCallback(() => {
    tourManager.stop();
    startTour(mode);
  }, [tourManager, startTour, mode]);

  // Helper to get step info based on current step
  const getStepInfo = (step: number, tourMode: 'quick' | 'complete') => {
    const steps = tourMode === 'quick' ? getQuickSteps() : getCompleteSteps();
    const currentStepData = steps[step];
    
    if (!currentStepData) return undefined;

    return {
      title: currentStepData.popover.title,
      description: currentStepData.popover.description,
      element: currentStepData.element
    };
  };

  // Step definitions (should match TourManager)
  const getQuickSteps = () => [
    {
      element: '.chat-input textarea',
      popover: {
        title: 'Começe por aqui!',
        description: 'Digite sua pergunta sobre transparência pública'
      }
    },
    {
      element: '.suggested-questions',
      popover: {
        title: 'Sugestões rápidas',
        description: 'Ou clique em uma sugestão para começar'
      }
    },
    {
      element: '.chat-history-button',
      popover: {
        title: 'Histórico de conversas',
        description: 'Acesse conversas anteriores aqui'
      }
    },
    {
      element: '.send-button',
      popover: {
        title: 'Envie sua pergunta',
        description: 'Clique aqui ou pressione Enter'
      }
    }
  ];

  const getCompleteSteps = () => [
    ...getQuickSteps(),
    {
      element: '.upload-button',
      popover: {
        title: 'Envie documentos',
        description: 'Analise documentos com IA'
      }
    },
    {
      element: '.agent-status',
      popover: {
        title: 'Agentes trabalhando',
        description: 'Veja quais agentes estão analisando'
      }
    },
    {
      element: '.contrast-toggle',
      popover: {
        title: 'Alto contraste',
        description: 'Ative para melhor visibilidade'
      }
    }
  ];

  return {
    // State
    isActive: tourState.isActive,
    currentStep: tourState.currentStep,
    totalSteps: tourState.totalSteps,
    isFirstStep: tourState.currentStep === 0,
    isLastStep: tourState.currentStep === tourState.totalSteps - 1,
    stepInfo: tourState.stepInfo,
    
    // Actions
    startTour,
    nextStep,
    prevStep,
    skipTour,
    restartTour,
    
    // Utils
    hasSeenTour: () => localStorage.getItem('tour-completed') === 'true',
    clearTourHistory: () => {
      localStorage.removeItem('tour-completed');
      localStorage.removeItem('tour-skipped');
      localStorage.removeItem('tour-completed-date');
    }
  };
}