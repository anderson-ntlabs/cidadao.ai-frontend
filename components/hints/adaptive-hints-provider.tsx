'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { AdaptiveHintSystem, Hint, PageContext } from '@/lib/services/adaptive-hints';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useChatStore } from '@/store/chat-store';
import { Tooltip } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lightbulb, Keyboard, Eye, Smartphone, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HintContextValue {
  hintSystem: AdaptiveHintSystem;
  currentHints: Hint[];
  dismissHint: (key: string) => void;
  reportError: (error: string) => void;
}

const HintContext = createContext<HintContextValue | null>(null);

export const useAdaptiveHints = () => {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error('useAdaptiveHints must be used within AdaptiveHintsProvider');
  }
  return context;
};

interface AdaptiveHintsProviderProps {
  children: React.ReactNode;
}

export function AdaptiveHintsProvider({ children }: AdaptiveHintsProviderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { messages } = useChatStore();
  const [hintSystem] = useState(() => new AdaptiveHintSystem());
  const [currentHints, setCurrentHints] = useState<Hint[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Detect page context
  useEffect(() => {
    const page = pathname.split('/').pop() || 'home';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Check contrast ratios (simplified - in production use a proper library)
    const checkContrast = () => {
      if (typeof window === 'undefined') return 4.5;
      
      const styles = getComputedStyle(document.documentElement);
      // This is simplified - real implementation would calculate actual contrast
      const isDarkMode = document.documentElement.classList.contains('dark');
      return isDarkMode ? 7.0 : 3.3; // Based on UX report data
    };

    const context: PageContext = {
      page,
      hasMessages: messages.length > 0,
      contrastRatio: checkContrast(),
      isMobile,
      touchTargetSize: isMobile ? 38 : 48, // Based on UX report
      messageCount: messages.length,
      errors
    };

    const relevantHints = hintSystem.getRelevantHints(context);
    setCurrentHints(relevantHints);

    // Show hints with delays
    relevantHints.forEach(hint => {
      setTimeout(() => {
        // Only show if still relevant
        if (currentHints.find(h => h.key === hint.key)) {
          hintSystem.markHintShown(hint.key);
        }
      }, hint.showAfter);
    });
  }, [pathname, messages.length, errors, hintSystem]);

  const dismissHint = (key: string) => {
    setCurrentHints(prev => prev.filter(h => h.key !== key));
    hintSystem.dismissHint(key);
  };

  const reportError = (error: string) => {
    setErrors(prev => [...prev, error]);
  };

  return (
    <HintContext.Provider value={{ hintSystem, currentHints, dismissHint, reportError }}>
      {children}
      <HintsDisplay hints={currentHints} onDismiss={dismissHint} />
    </HintContext.Provider>
  );
}

interface HintsDisplayProps {
  hints: Hint[];
  onDismiss: (key: string) => void;
}

function HintsDisplay({ hints, onDismiss }: HintsDisplayProps) {
  const [visibleHints, setVisibleHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    hints.forEach(hint => {
      setTimeout(() => {
        setVisibleHints(prev => new Set(prev).add(hint.key));
      }, hint.showAfter);
    });
  }, [hints]);

  const getIcon = (key: string) => {
    if (key.includes('keyboard')) return Keyboard;
    if (key.includes('contrast')) return Eye;
    if (key.includes('mobile')) return Smartphone;
    if (key.includes('help')) return HelpCircle;
    return Lightbulb;
  };

  const getColorClass = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {hints
          .filter(hint => visibleHints.has(hint.key))
          .map(hint => {
            const Icon = getIcon(hint.key);
            const content = hint.content as any;

            return (
              <motion.div
                key={hint.key}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`
                  rounded-lg shadow-lg p-4 backdrop-blur-sm
                  ${getColorClass(hint.priority)}
                `}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  
                  <div className="flex-1 min-w-0">
                    {content.title && (
                      <h3 className="font-semibold mb-1">{content.title}</h3>
                    )}
                    
                    {content.description && (
                      <p className="text-sm opacity-90">{content.description}</p>
                    )}
                    
                    {content.examples && (
                      <ul className="text-xs mt-2 space-y-1 opacity-80">
                        {content.examples.map((ex: string, i: number) => (
                          <li key={i}>• {ex}</li>
                        ))}
                      </ul>
                    )}
                    
                    {content.note && (
                      <p className="text-xs mt-2 italic opacity-75">{content.note}</p>
                    )}
                    
                    {content.suggestions && (
                      <div className="text-xs mt-2 space-y-1">
                        {content.suggestions.map((sug: string, i: number) => (
                          <div key={i}>→ {sug}</div>
                        ))}
                      </div>
                    )}
                    
                    {content.action && typeof content.action === 'string' && (
                      <p className="text-sm mt-2 font-medium">{content.action}</p>
                    )}
                    
                    {content.onClick && (
                      <button
                        onClick={content.onClick}
                        className="text-sm mt-2 underline hover:no-underline"
                      >
                        {content.action || 'Clique aqui'}
                      </button>
                    )}
                    
                    {content.actions && Array.isArray(content.actions) && (
                      <div className="flex gap-2 mt-3">
                        {content.actions.map((action: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (action.action === 'start-tour') {
                                // Trigger tour start
                                toast.info('Tour iniciando...');
                              } else if (action.action === 'report-issue') {
                                toast.info('Abrindo formulário de reporte...');
                              }
                              onDismiss(hint.key);
                            }}
                            className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {hint.dismissible !== false && (
                    <button
                      onClick={() => onDismiss(hint.key)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                      aria-label="Fechar dica"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}

// Hook helper para reportar problemas de UX
export function useReportUXIssue() {
  const { reportError } = useAdaptiveHints();
  
  return {
    reportMissingElement: (element: string) => {
      reportError(`${element}-not-found`);
    },
    reportInteractionError: (action: string) => {
      reportError(`interaction-failed-${action}`);
    },
    reportContrastIssue: (element: string, ratio: number) => {
      if (ratio < 4.5) {
        reportError(`low-contrast-${element}-${ratio}`);
      }
    }
  };
}