/**
 * Speech Recognition Service
 *
 * Core service for handling speech-to-text conversion
 * using the Web Speech API.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

import {
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  logBrowserCompatibility,
} from './browser-detection'
import type {
  VoiceInputConfig,
  VoiceInputCallbacks,
  SpeechRecognitionState,
  SpeechRecognitionError,
} from './types'

/**
 * Default configuration for voice input
 */
const DEFAULT_CONFIG: Required<VoiceInputConfig> = {
  lang: 'pt-BR', // Brazilian Portuguese by default
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  autoStopTimeout: 3000, // 3 seconds of silence
}

/**
 * Speech Recognition Service
 *
 * Provides a high-level interface for speech recognition
 * with error handling, state management, and callbacks.
 */
export class SpeechRecognitionService {
  private recognition: any = null
  private config: Required<VoiceInputConfig>
  private callbacks: VoiceInputCallbacks = {}
  private state: SpeechRecognitionState = 'idle'
  private autoStopTimer: NodeJS.Timeout | null = null
  private interimTranscript = ''
  private finalTranscript = ''
  private isListening = false

  constructor(config?: VoiceInputConfig, callbacks?: VoiceInputCallbacks) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.callbacks = callbacks || {}

    // Initialize if supported
    if (this.isSupported()) {
      this.initialize()
    }
  }

  /**
   * Check if speech recognition is supported
   */
  public isSupported(): boolean {
    return isSpeechRecognitionSupported()
  }

  /**
   * Initialize the speech recognition instance
   */
  private initialize(): void {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not available')
      return
    }

    this.recognition = new SpeechRecognition()
    this.configureRecognition()
    this.attachEventHandlers()
  }

  /**
   * Configure recognition settings
   */
  private configureRecognition(): void {
    if (!this.recognition) return

    this.recognition.lang = this.config.lang
    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults
    this.recognition.maxAlternatives = this.config.maxAlternatives
  }

  /**
   * Attach event handlers to recognition instance
   */
  private attachEventHandlers(): void {
    if (!this.recognition) return

    // On start
    this.recognition.onstart = () => {
      this.isListening = true
      this.setState('listening')
      this.callbacks.onStart?.()
      this.resetAutoStopTimer()
    }

    // On end
    this.recognition.onend = () => {
      this.isListening = false
      this.setState('idle')
      this.callbacks.onEnd?.()
      this.clearAutoStopTimer()

      // Auto-restart if continuous mode
      if (this.config.continuous && this.state !== 'error') {
        setTimeout(() => {
          if (!this.isListening && this.state === 'idle') {
            this.start()
          }
        }, 100)
      }
    }

    // On result
    this.recognition.onresult = (event: any) => {
      this.resetAutoStopTimer()
      this.setState('processing')

      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence || 0

        if (result.isFinal) {
          finalTranscript += transcript
          this.finalTranscript += transcript

          // Call final transcript callback
          this.callbacks.onTranscript?.(transcript, confidence)
        } else {
          interimTranscript += transcript
        }
      }

      // Update interim transcript
      if (this.config.interimResults && interimTranscript) {
        this.interimTranscript = interimTranscript
        this.callbacks.onInterimResult?.(this.finalTranscript + interimTranscript)
      }

      // Back to listening state
      if (finalTranscript || interimTranscript) {
        this.setState('listening')
      }
    }

    // On error
    this.recognition.onerror = (event: any) => {
      const error: SpeechRecognitionError = {
        code: event.error,
        message: this.getErrorMessage(event.error),
      }

      console.error('Speech recognition error:', error)
      this.setState('error')
      this.callbacks.onError?.(error)

      // Stop on critical errors
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        this.stop()
      }
    }

    // On no match
    this.recognition.onnomatch = () => {
      console.log('No speech match')
    }

    // On audio start/end
    this.recognition.onaudiostart = () => {
      console.log('Audio capture started')
    }

    this.recognition.onaudioend = () => {
      console.log('Audio capture ended')
    }

    // On sound start/end
    this.recognition.onsoundstart = () => {
      console.log('Sound detected')
    }

    this.recognition.onsoundend = () => {
      console.log('Sound ended')
    }

    // On speech start/end
    this.recognition.onspeechstart = () => {
      console.log('Speech started')
      this.resetAutoStopTimer()
    }

    this.recognition.onspeechend = () => {
      console.log('Speech ended')
    }
  }

  /**
   * Start speech recognition
   */
  public async start(): Promise<void> {
    if (!this.isSupported()) {
      const error: SpeechRecognitionError = {
        code: 'not-allowed',
        message: 'Speech recognition not supported in this browser',
      }
      this.callbacks.onError?.(error)
      return
    }

    if (this.isListening) {
      console.log('Already listening')
      return
    }

    try {
      // Reset transcripts
      this.interimTranscript = ''
      this.finalTranscript = ''

      // Check for microphone permissions
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (err) {
          const error: SpeechRecognitionError = {
            code: 'not-allowed',
            message: 'Microphone permission denied',
          }
          this.setState('error')
          this.callbacks.onError?.(error)
          return
        }
      }

      this.recognition?.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      if (this.isListening) {
        // Already started, ignore
        return
      }
      const error: SpeechRecognitionError = {
        code: 'audio-capture',
        message: 'Failed to start speech recognition',
      }
      this.setState('error')
      this.callbacks.onError?.(error)
    }
  }

  /**
   * Stop speech recognition
   */
  public stop(): void {
    if (!this.recognition || !this.isListening) return

    try {
      this.recognition.stop()
      this.isListening = false
      this.clearAutoStopTimer()
    } catch (err) {
      console.error('Failed to stop recognition:', err)
    }
  }

  /**
   * Abort speech recognition (immediate stop)
   */
  public abort(): void {
    if (!this.recognition) return

    try {
      this.recognition.abort()
      this.isListening = false
      this.clearAutoStopTimer()
    } catch (err) {
      console.error('Failed to abort recognition:', err)
    }
  }

  /**
   * Toggle speech recognition on/off
   */
  public async toggle(): Promise<void> {
    if (this.isListening) {
      this.stop()
    } else {
      await this.start()
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<VoiceInputConfig>): void {
    this.config = { ...this.config, ...config }
    this.configureRecognition()
  }

  /**
   * Update callbacks
   */
  public updateCallbacks(callbacks: VoiceInputCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Get current state
   */
  public getState(): SpeechRecognitionState {
    return this.state
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening
  }

  /**
   * Get current transcript (final + interim)
   */
  public getCurrentTranscript(): string {
    return this.finalTranscript + this.interimTranscript
  }

  /**
   * Clear transcripts
   */
  public clearTranscripts(): void {
    this.interimTranscript = ''
    this.finalTranscript = ''
  }

  /**
   * Set state and notify callbacks
   */
  private setState(state: SpeechRecognitionState): void {
    if (this.state === state) return
    this.state = state
    this.callbacks.onStateChange?.(state)
  }

  /**
   * Reset auto-stop timer
   */
  private resetAutoStopTimer(): void {
    this.clearAutoStopTimer()

    if (this.config.autoStopTimeout > 0) {
      this.autoStopTimer = setTimeout(() => {
        if (this.isListening) {
          console.log('Auto-stopping due to silence')
          this.stop()
        }
      }, this.config.autoStopTimeout)
    }
  }

  /**
   * Clear auto-stop timer
   */
  private clearAutoStopTimer(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer)
      this.autoStopTimer = null
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'no-speech': 'Nenhuma fala detectada',
      aborted: 'Reconhecimento cancelado',
      'audio-capture': 'Falha na captura de áudio',
      network: 'Erro de rede',
      'not-allowed': 'Permissão de microfone negada',
      'service-not-allowed': 'Serviço de fala não permitido',
      'bad-grammar': 'Erro de gramática',
      'language-not-supported': 'Idioma não suportado',
    }
    return messages[code] || 'Erro desconhecido'
  }

  /**
   * Destroy the service and clean up
   */
  public destroy(): void {
    this.stop()
    this.clearAutoStopTimer()
    this.recognition = null
    this.callbacks = {}
  }

  /**
   * Log debug information
   */
  public logDebugInfo(): void {
    logBrowserCompatibility()
    console.log('Current state:', this.state)
    console.log('Is listening:', this.isListening)
    console.log('Config:', this.config)
    console.log('Final transcript:', this.finalTranscript)
    console.log('Interim transcript:', this.interimTranscript)
  }
}

/**
 * Factory function to create a speech recognition service
 */
export function createSpeechRecognitionService(
  config?: VoiceInputConfig,
  callbacks?: VoiceInputCallbacks
): SpeechRecognitionService {
  return new SpeechRecognitionService(config, callbacks)
}

// Export singleton instance for convenience
let defaultService: SpeechRecognitionService | null = null

export function getDefaultSpeechRecognitionService(): SpeechRecognitionService {
  if (!defaultService) {
    defaultService = new SpeechRecognitionService()
  }
  return defaultService
}
