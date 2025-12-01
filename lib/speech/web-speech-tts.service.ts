/**
 * Web Speech API TTS Service
 *
 * Free text-to-speech using the browser's native Web Speech API.
 * Replaces the paid backend TTS service.
 *
 * Features:
 * - No API costs (100% browser-based)
 * - Per-agent voice customization
 * - User preference persistence
 * - Brazilian Portuguese optimized
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('WebSpeechTTS')

export interface VoiceOption {
  voiceURI: string
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export interface TTSOptions {
  rate?: number // 0.1 to 10, default 1
  pitch?: number // 0 to 2, default 1
  volume?: number // 0 to 1, default 1
}

/**
 * Web Speech TTS Service
 *
 * Uses browser's SpeechSynthesis API for free TTS.
 */
class WebSpeechTTSService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false
  private voicesLoadedPromise: Promise<void> | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.voicesLoadedPromise = this.loadVoices()
    }
  }

  /**
   * Load available voices from the browser
   */
  private async loadVoices(): Promise<void> {
    if (!this.synth) return

    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synth!.getVoices()
        if (this.voices.length > 0) {
          this.isInitialized = true
          logger.debug('Voices loaded', { count: this.voices.length })
          resolve()
        }
      }

      // Try loading immediately
      loadVoices()

      // If not loaded, wait for the event
      if (!this.isInitialized && this.synth) {
        this.synth.addEventListener('voiceschanged', loadVoices, { once: true })

        // Fallback timeout
        setTimeout(() => {
          if (!this.isInitialized) {
            loadVoices()
            resolve()
          }
        }, 1000)
      }
    })
  }

  /**
   * Ensure voices are loaded before using
   */
  async ensureInitialized(): Promise<void> {
    if (this.voicesLoadedPromise) {
      await this.voicesLoadedPromise
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /**
   * Get all available voices
   */
  async getVoices(): Promise<VoiceOption[]> {
    await this.ensureInitialized()

    return this.voices.map((voice) => ({
      voiceURI: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
    }))
  }

  /**
   * Get Portuguese (Brazil) voices
   */
  async getPortugueseVoices(): Promise<VoiceOption[]> {
    const allVoices = await this.getVoices()
    return allVoices.filter(
      (voice) => voice.lang.startsWith('pt-BR') || voice.lang.startsWith('pt_BR')
    )
  }

  /**
   * Get all voices grouped by language
   */
  async getVoicesGroupedByLanguage(): Promise<Record<string, VoiceOption[]>> {
    const allVoices = await this.getVoices()
    const grouped: Record<string, VoiceOption[]> = {}

    for (const voice of allVoices) {
      const lang = voice.lang.split('-')[0] || voice.lang.split('_')[0]
      if (!grouped[lang]) {
        grouped[lang] = []
      }
      grouped[lang].push(voice)
    }

    return grouped
  }

  /**
   * Find a voice by URI
   */
  private findVoice(voiceURI: string): SpeechSynthesisVoice | undefined {
    return this.voices.find((v) => v.voiceURI === voiceURI)
  }

  /**
   * Get default Portuguese voice
   */
  async getDefaultPortugueseVoice(): Promise<VoiceOption | null> {
    const ptVoices = await this.getPortugueseVoices()

    if (ptVoices.length === 0) {
      // Fallback to any available voice
      const allVoices = await this.getVoices()
      return allVoices[0] || null
    }

    // Prefer Google voices (higher quality)
    const googleVoice = ptVoices.find((v) => v.name.toLowerCase().includes('google'))
    if (googleVoice) return googleVoice

    // Then prefer Microsoft voices
    const msVoice = ptVoices.find((v) => v.name.toLowerCase().includes('microsoft'))
    if (msVoice) return msVoice

    // Return first available
    return ptVoices[0]
  }

  /**
   * Speak text using specified voice
   */
  async speak(text: string, voiceURI?: string, options: TTSOptions = {}): Promise<void> {
    await this.ensureInitialized()

    if (!this.synth) {
      throw new Error('Web Speech API not supported')
    }

    // Cancel any ongoing speech
    this.stop()

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)

      // Set voice
      if (voiceURI) {
        const voice = this.findVoice(voiceURI)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
        }
      } else {
        // Default to Portuguese
        utterance.lang = 'pt-BR'
      }

      // Set options
      utterance.rate = options.rate ?? 1
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      // Event handlers
      utterance.onend = () => {
        this.currentUtterance = null
        logger.debug('Speech ended')
        resolve()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        // 'interrupted' is not really an error (user stopped it)
        if (event.error === 'interrupted' || event.error === 'canceled') {
          logger.debug('Speech interrupted')
          resolve()
        } else {
          logger.error('Speech error', { error: event.error })
          reject(new Error(`Speech synthesis error: ${event.error}`))
        }
      }

      utterance.onstart = () => {
        logger.debug('Speech started', {
          voice: utterance.voice?.name,
          text: text.substring(0, 50),
        })
      }

      this.currentUtterance = utterance
      this.synth!.speak(utterance)
    })
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel()
      this.currentUtterance = null
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause()
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume()
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth?.speaking ?? false
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synth?.paused ?? false
  }
}

// Singleton instance
let instance: WebSpeechTTSService | null = null

export function getWebSpeechTTS(): WebSpeechTTSService {
  if (typeof window === 'undefined') {
    // Server-side: return a mock instance
    return new WebSpeechTTSService()
  }

  if (!instance) {
    instance = new WebSpeechTTSService()
  }

  return instance
}

export const webSpeechTTS = getWebSpeechTTS()
