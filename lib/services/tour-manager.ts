// import { driver } from 'driver.js'; // Removed for optimization
// import 'driver.js/dist/driver.css';
import { TourAnalytics } from './tour-analytics'

// type Driver = ReturnType<typeof driver>; // Removed with driver.js
type Driver = any // Temporary type until driver.js is re-enabled

export interface TourStep {
  element: string
  popover: {
    title?: string
    description: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    maxWidth?: string
  }
  onNext?: () => void
  onPrev?: () => void
}

export interface TourConfig {
  id: string
  version: string
  mode: 'quick' | 'complete'
  steps: TourStep[]
  analytics: TourAnalytics
}

export interface TourTriggerConfig {
  first_message_sent: number
  document_uploaded: number
  idle_after_login: number
}

export class TourManager {
  private driver: Driver | null = null
  private analytics: TourAnalytics
  private config: TourConfig | null = null
  private triggerTimeouts: Map<string, NodeJS.Timeout> = new Map()

  static TRIGGER_POINTS: TourTriggerConfig = {
    first_message_sent: 3000,
    document_uploaded: 1000,
    idle_after_login: 10000,
  }

  constructor() {
    this.analytics = new TourAnalytics()
  }

  initialize(config: Partial<TourConfig>) {
    this.config = {
      id: config.id || 'cidadao-onboarding',
      version: config.version || '1.0.0',
      mode: config.mode || 'quick',
      steps: config.steps || [],
      analytics: this.analytics,
    }

    // Driver.js initialization disabled - library was removed for optimization
    // To re-enable: npm install driver.js
    this.driver = null
  }

  start(mode: 'quick' | 'complete' = 'quick') {
    if (!this.driver) {
      this.initialize({ mode })
    }

    const steps = this.getSteps(mode)
    if (steps.length === 0) return

    this.analytics.track('tour_started', { mode })
    this.driver!.setSteps(steps)
    // Start the tour by highlighting the first step
    if (steps.length > 0) {
      this.driver!.highlight(steps[0])
    }
  }

  registerTrigger(event: keyof TourTriggerConfig, callback: () => void) {
    // Clear any existing timeout for this event
    if (this.triggerTimeouts.has(event)) {
      clearTimeout(this.triggerTimeouts.get(event))
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      callback()
      this.triggerTimeouts.delete(event)
    }, TourManager.TRIGGER_POINTS[event])

    this.triggerTimeouts.set(event, timeout)
  }

  clearTrigger(event: keyof TourTriggerConfig) {
    if (this.triggerTimeouts.has(event)) {
      clearTimeout(this.triggerTimeouts.get(event))
      this.triggerTimeouts.delete(event)
    }
  }

  clearAllTriggers() {
    this.triggerTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.triggerTimeouts.clear()
  }

  moveNext() {
    this.driver?.moveNext()
  }

  movePrevious() {
    this.driver?.movePrevious()
  }

  isFirstStep(): boolean {
    return this.driver?.isFirstStep() || true
  }

  isLastStep(): boolean {
    return this.driver?.isLastStep() || false
  }

  hasNextStep(): boolean {
    return this.driver?.hasNextStep() || false
  }

  stop() {
    this.driver?.destroy()
    this.clearAllTriggers()
  }

  getCurrentStep(): number {
    return this.driver?.getActiveIndex() || 0
  }

  getTotalSteps(): number {
    return this.config?.steps.length || 0
  }

  private getSteps(mode: 'quick' | 'complete'): TourStep[] {
    if (mode === 'quick') {
      return this.getQuickSteps()
    }
    return this.getCompleteSteps()
  }

  private getQuickSteps(): TourStep[] {
    return [
      {
        element: '.chat-input textarea',
        popover: {
          title: 'Começe por aqui!',
          description:
            'Digite sua pergunta sobre transparência pública. Por exemplo: "Como renovar meu RG?"',
          position: 'top',
        },
      },
      {
        element: '.suggested-questions',
        popover: {
          title: 'Sugestões rápidas',
          description: 'Clique em uma sugestão para começar rapidamente',
          position: 'bottom',
        },
      },
      {
        element: '.chat-history-button',
        popover: {
          title: 'Histórico de conversas',
          description: 'Acesse suas conversas anteriores e continue de onde parou',
          position: 'bottom',
        },
      },
      {
        element: '.send-button',
        popover: {
          title: 'Pronto para começar!',
          description: 'Pressione Enter ou clique aqui para enviar sua pergunta',
          position: 'top',
        },
      },
    ]
  }

  private getCompleteSteps(): TourStep[] {
    // Include all quick steps plus additional detailed steps
    return [
      ...this.getQuickSteps(),
      {
        element: '.upload-button',
        popover: {
          title: 'Envie documentos',
          description: 'Tire fotos ou faça upload de documentos para análise',
          position: 'bottom',
        },
      },
      {
        element: '.agent-status',
        popover: {
          title: 'Agentes em ação',
          description: 'Veja quais agentes especializados estão trabalhando na sua solicitação',
          position: 'bottom',
        },
      },
      {
        element: '.export-button',
        popover: {
          title: 'Exporte suas conversas',
          description: 'Baixe suas análises em PDF ou JSON',
          position: 'bottom',
        },
      },
      {
        element: '.settings-button',
        popover: {
          title: 'Personalize sua experiência',
          description: 'Ajuste preferências, idioma e notificações',
          position: 'bottom',
        },
      },
    ]
  }

  // Mobile-specific steps
  getMobileSteps(): TourStep[] {
    return [
      {
        element: '.chat-input',
        popover: {
          description: 'Digite sua dúvida aqui 💬',
          position: 'top',
          maxWidth: '90vw',
        },
      },
      {
        element: '.upload-button',
        popover: {
          description: 'Tire foto de documentos 📷',
          position: 'top',
          maxWidth: '90vw',
        },
      },
      {
        element: '.menu-button',
        popover: {
          description: 'Mais opções aqui 📋',
          position: 'bottom',
          maxWidth: '90vw',
        },
      },
    ]
  }
}
