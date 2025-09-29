'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ButtonV2 } from './button';
import { StrategicTooltip } from './tooltip';
import { toast } from '@/hooks/use-toast';

export function ContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedContrast = localStorage.getItem('theme-contrast');
    if (savedContrast === 'high') {
      enableHighContrast();
    }
  }, []);

  const enableHighContrast = () => {
    document.documentElement.classList.add('high-contrast');
    setIsHighContrast(true);
    localStorage.setItem('theme-contrast', 'high');
    
    // Import high contrast styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/high-contrast.css';
    link.id = 'high-contrast-styles';
    document.head.appendChild(link);
  };

  const disableHighContrast = () => {
    document.documentElement.classList.remove('high-contrast');
    setIsHighContrast(false);
    localStorage.setItem('theme-contrast', 'normal');
    
    // Remove high contrast styles
    const link = document.getElementById('high-contrast-styles');
    if (link) {
      link.remove();
    }
  };

  const toggleContrast = () => {
    if (isHighContrast) {
      disableHighContrast();
      toast.info('Modo de alto contraste desativado');
    } else {
      enableHighContrast();
      toast.success('Modo de alto contraste ativado - Melhora a visibilidade para leitura');
    }
  };

  return (
    <StrategicTooltip
      tooltipKey="contrast-toggle"
      content={
        <div>
          <p className="font-semibold">Modo de Alto Contraste</p>
          <p className="text-sm mt-1">
            {isHighContrast 
              ? 'Clique para voltar ao modo normal' 
              : 'Ativa cores de alto contraste para melhor leitura'}
          </p>
          <p className="text-xs mt-2 opacity-75">
            Recomendado para usuários com dificuldades visuais
          </p>
        </div>
      }
      position="bottom"
      delay={500}
    >
      <ButtonV2
        variant={isHighContrast ? 'primary' : 'secondary'}
        size="sm"
        onClick={toggleContrast}
        leftIcon={isHighContrast ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        aria-label={`${isHighContrast ? 'Desativar' : 'Ativar'} modo de alto contraste`}
        aria-pressed={isHighContrast}
      >
        <span className="hidden sm:inline">
          {isHighContrast ? 'Alto Contraste' : 'Contraste'}
        </span>
        <span className="sm:hidden">A11y</span>
      </ButtonV2>
    </StrategicTooltip>
  );
}

// Component for automatic contrast detection and suggestion
export function ContrastChecker() {
  const [needsHighContrast, setNeedsHighContrast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || dismissed) return;

    // Check if user has system preference for high contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Check if user has reduced transparency preference (often correlated with vision needs)
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    
    // Check localStorage to see if already suggested
    const alreadySuggested = localStorage.getItem('contrast-suggested') === 'true';
    
    if ((prefersHighContrast || prefersReducedTransparency) && !alreadySuggested) {
      setNeedsHighContrast(true);
      localStorage.setItem('contrast-suggested', 'true');
    }
  }, [dismissed]);

  if (!needsHighContrast || dismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm p-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg shadow-lg">
      <div className="flex items-start gap-3">
        <Eye className="w-5 h-5 text-yellow-700 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            Modo de Alto Contraste Disponível
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
            Detectamos que você pode se beneficiar do modo de alto contraste.
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                document.getElementById('contrast-toggle-button')?.click();
                setDismissed(true);
              }}
              className="px-3 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800 text-sm font-medium"
            >
              Ativar Agora
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 text-sm"
            >
              Talvez Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}