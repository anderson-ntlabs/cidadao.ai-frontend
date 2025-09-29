export interface UXIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  solution: string;
  affected: ('mobile' | 'desktop' | 'a11y-users')[];
}

export interface HintContent {
  title?: string;
  description?: string;
  examples?: string[];
  note?: string;
  suggestions?: string[];
  action?: string;
  onClick?: () => void;
  actions?: Array<{ label: string; action: string }>;
  tip?: string;
}

export interface Hint {
  key: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  content: HintContent;
  showAfter: number;
  dismissible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface PageContext {
  page: string;
  hasMessages?: boolean;
  contrastRatio?: number;
  isMobile?: boolean;
  touchTargetSize?: number;
  messageCount?: number;
  lastInteraction?: Date;
  errors?: string[];
}

export interface UserProfile {
  experience: 'new' | 'intermediate' | 'advanced';
  preferences: {
    hintsEnabled: boolean;
    hintLevel: 'minimal' | 'standard' | 'detailed';
  };
  interactions: {
    messagessSent: number;
    documentsUploaded: number;
    hintsDissmissed: number;
    errorsEncountered: number;
  };
  accessibility: {
    needsHighContrast: boolean;
    screenReaderActive: boolean;
    reducedMotion: boolean;
  };
}

export class AdaptiveHintSystem {
  private userProfile: UserProfile;
  private uxIssues: UXIssue[];
  private shownHints: Set<string> = new Set();

  constructor(userProfile?: Partial<UserProfile>) {
    this.userProfile = {
      experience: 'new',
      preferences: {
        hintsEnabled: true,
        hintLevel: 'standard'
      },
      interactions: {
        messagessSent: 0,
        documentsUploaded: 0,
        hintsDissmissed: 0,
        errorsEncountered: 0
      },
      accessibility: {
        needsHighContrast: false,
        screenReaderActive: false,
        reducedMotion: false
      },
      ...userProfile
    };

    this.uxIssues = [
      {
        id: 'chat-send-missing',
        severity: 'critical',
        solution: 'show-keyboard-hint',
        affected: ['mobile', 'desktop']
      },
      {
        id: 'low-contrast-green',
        severity: 'high',
        solution: 'suggest-theme-change',
        affected: ['a11y-users']
      },
      {
        id: 'low-contrast-red',
        severity: 'high',
        solution: 'suggest-theme-change',
        affected: ['a11y-users']
      },
      {
        id: 'low-contrast-gray',
        severity: 'high',
        solution: 'suggest-theme-change',
        affected: ['a11y-users']
      },
      {
        id: 'small-touch-targets',
        severity: 'medium',
        solution: 'zoom-suggestion',
        affected: ['mobile']
      },
      {
        id: 'no-breadcrumbs',
        severity: 'low',
        solution: 'navigation-hint',
        affected: ['desktop', 'mobile']
      }
    ];

    // Load shown hints from localStorage
    if (typeof window !== 'undefined') {
      const shown = localStorage.getItem('adaptive-hints-shown');
      if (shown) {
        this.shownHints = new Set(JSON.parse(shown));
      }
    }
  }

  getRelevantHints(context: PageContext): Hint[] {
    const hints: Hint[] = [];
    
    // Don't show hints if user disabled them
    if (!this.userProfile.preferences.hintsEnabled) {
      return hints;
    }

    // Chat page specific hints
    if (context.page === 'chat') {
      // First time user without messages
      if (!context.hasMessages && this.userProfile.interactions.messagessSent === 0) {
        if (!this.shownHints.has('chat-start')) {
          hints.push({
            key: 'chat-start',
            priority: 'critical',
            content: this.getChatStartHint(),
            showAfter: 2000,
            dismissible: true,
            position: 'top'
          });
        }
      }

      // User seems stuck (no send button found)
      if (context.errors?.includes('send-button-not-found')) {
        hints.push({
          key: 'send-keyboard',
          priority: 'critical',
          content: this.getKeyboardHint(),
          showAfter: 0,
          position: 'bottom'
        });
      }

      // Multiple errors - offer help
      if (context.errors && context.errors.length > 2) {
        hints.push({
          key: 'need-help',
          priority: 'high',
          content: this.getHelpHint(),
          showAfter: 1000,
          dismissible: true
        });
      }
    }
    
    // Contrast issues (WCAG compliance)
    if (context.contrastRatio && context.contrastRatio < 4.5) {
      if (!this.shownHints.has('contrast-fix')) {
        hints.push({
          key: 'contrast-fix',
          priority: 'high',
          content: this.getContrastHint(context.contrastRatio),
          showAfter: 0,
          dismissible: true,
          position: 'top'
        });
      }
    }
    
    // Mobile specific hints
    if (context.isMobile) {
      // Touch target too small
      if (context.touchTargetSize && context.touchTargetSize < 44) {
        if (!this.shownHints.has('mobile-targets')) {
          hints.push({
            key: 'mobile-targets',
            priority: 'medium',
            content: this.getMobileTouchHint(),
            showAfter: 5000,
            dismissible: true
          });
        }
      }

      // First time mobile user
      if (this.userProfile.experience === 'new') {
        hints.push({
          key: 'mobile-orientation',
          priority: 'low',
          content: this.getMobileOrientationHint(),
          showAfter: 10000,
          dismissible: true
        });
      }
    }

    // Navigation hints
    if (!context.page.includes('home') && !this.shownHints.has('navigation')) {
      hints.push({
        key: 'navigation',
        priority: 'low',
        content: this.getNavigationHint(),
        showAfter: 15000,
        dismissible: true
      });
    }

    return this.prioritizeHints(hints);
  }

  private prioritizeHints(hints: Hint[]): Hint[] {
    // Sort by priority and filter based on user's hint level
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    let filteredHints = hints.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Apply hint level filter
    switch (this.userProfile.preferences.hintLevel) {
      case 'minimal':
        filteredHints = filteredHints.filter(h => h.priority === 'critical');
        break;
      case 'standard':
        filteredHints = filteredHints.filter(h => 
          h.priority === 'critical' || h.priority === 'high'
        );
        break;
      // 'detailed' shows all hints
    }

    // Maximum 3 hints at once to avoid overwhelming
    return filteredHints.slice(0, 3);
  }

  markHintShown(hintKey: string) {
    this.shownHints.add(hintKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'adaptive-hints-shown',
        JSON.stringify(Array.from(this.shownHints))
      );
    }
  }

  dismissHint(hintKey: string) {
    this.markHintShown(hintKey);
    this.userProfile.interactions.hintsDissmissed++;
    
    // If user dismisses too many hints, reduce hint level
    if (this.userProfile.interactions.hintsDissmissed > 5) {
      this.userProfile.preferences.hintLevel = 'minimal';
    }
  }

  updateUserProfile(updates: Partial<UserProfile>) {
    this.userProfile = { ...this.userProfile, ...updates };
    
    // Update experience level based on interactions
    const totalInteractions = 
      this.userProfile.interactions.messagessSent +
      this.userProfile.interactions.documentsUploaded;
    
    if (totalInteractions > 20) {
      this.userProfile.experience = 'advanced';
    } else if (totalInteractions > 5) {
      this.userProfile.experience = 'intermediate';
    }
  }

  // Hint content generators
  private getChatStartHint(): HintContent {
    return {
      title: 'Como posso ajudar? 🤔',
      description: 'Comece com uma pergunta simples sobre serviços públicos.',
      examples: [
        'Como renovar CNH?',
        'Quero contestar uma multa',
        'Preciso de ajuda com IPTU'
      ],
      action: 'Experimente uma dessas perguntas!'
    };
  }

  private getKeyboardHint(): HintContent {
    return {
      title: '⌨️ Dica Rápida',
      description: 'Pressione Enter para enviar sua mensagem',
      note: 'Use Shift+Enter para quebrar linha'
    };
  }

  private getContrastHint(ratio: number): HintContent {
    return {
      title: '👁️ Melhorar Visibilidade',
      description: `O contraste atual (${ratio.toFixed(2)}:1) está abaixo do recomendado.`,
      action: 'Ativar modo de alto contraste',
      onClick: () => this.enableHighContrast()
    };
  }

  private getMobileTouchHint(): HintContent {
    return {
      title: '📱 Dica Mobile',
      description: 'Alguns botões estão pequenos para toque.',
      suggestions: [
        'Use dois dedos para zoom',
        'Gire para modo paisagem',
        'Ou acesse do computador'
      ]
    };
  }

  private getMobileOrientationHint(): HintContent {
    return {
      title: '🔄 Gire seu Celular',
      description: 'O modo paisagem oferece melhor experiência para digitação.'
    };
  }

  private getNavigationHint(): HintContent {
    return {
      title: '🧭 Navegação',
      description: 'Use o menu superior para acessar outras seções.',
      tip: 'O histórico salva todas suas conversas'
    };
  }

  private getHelpHint(): HintContent {
    return {
      title: '🆘 Precisa de ajuda?',
      description: 'Parece que você está com dificuldades.',
      actions: [
        { label: 'Ver tutorial', action: 'start-tour' },
        { label: 'Reportar problema', action: 'report-issue' }
      ]
    };
  }

  private enableHighContrast() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('theme-contrast', 'high');
    }
  }

  // Analytics methods
  getHintMetrics() {
    return {
      shown: this.shownHints.size,
      dismissed: this.userProfile.interactions.hintsDissmissed,
      effectiveness: this.calculateEffectiveness(),
      userLevel: this.userProfile.experience
    };
  }

  private calculateEffectiveness(): number {
    // If hints were shown but errors decreased, hints are effective
    if (this.shownHints.size === 0) return 0;
    
    const dismissRate = this.userProfile.interactions.hintsDissmissed / this.shownHints.size;
    const errorRate = this.userProfile.interactions.errorsEncountered / 
      (this.userProfile.interactions.messagessSent || 1);
    
    // High effectiveness = low dismiss rate + low error rate
    return Math.max(0, (1 - dismissRate) * (1 - errorRate) * 100);
  }
}