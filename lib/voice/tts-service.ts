/**
 * Text-to-Speech Service
 *
 * Provides text-to-speech functionality using Web Speech API
 * with agent-specific voice personalities
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

export interface VoiceConfig {
  pitch: number      // 0.0 - 2.0 (default: 1.0)
  rate: number       // 0.1 - 10.0 (default: 1.0)
  volume: number     // 0.0 - 1.0 (default: 1.0)
  voiceName?: string // Preferred voice name
}

export interface AgentVoiceProfile {
  agentId: string
  agentName: string
  config: VoiceConfig
  description: string
}

export class TTSService {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isPaused = false
  private isEnabled = true

  // Agent voice personalities
  private agentProfiles: Record<string, AgentVoiceProfile> = {
    'zumbi': {
      agentId: 'zumbi',
      agentName: 'Zumbi dos Palmares',
      config: { pitch: 0.8, rate: 0.9, volume: 1.0 },
      description: 'Voz grave e reflexiva'
    },
    'anita': {
      agentId: 'anita',
      agentName: 'Anita Garibaldi',
      config: { pitch: 1.2, rate: 1.0, volume: 1.0 },
      description: 'Voz clara e analítica'
    },
    'tiradentes': {
      agentId: 'tiradentes',
      agentName: 'Tiradentes',
      config: { pitch: 1.0, rate: 1.1, volume: 1.0 },
      description: 'Voz enérgica e assertiva'
    },
    'machado': {
      agentId: 'machado',
      agentName: 'Machado de Assis',
      config: { pitch: 0.9, rate: 0.8, volume: 1.0 },
      description: 'Voz pausada e eloquente'
    },
    'senna': {
      agentId: 'ayrton_senna',
      agentName: 'Ayrton Senna',
      config: { pitch: 1.1, rate: 1.2, volume: 1.0 },
      description: 'Voz rápida e dinâmica'
    },
    'bonifacio': {
      agentId: 'bonifacio',
      agentName: 'José Bonifácio',
      config: { pitch: 0.85, rate: 0.85, volume: 1.0 },
      description: 'Voz formal e autoridade'
    },
    'abaporu': {
      agentId: 'abaporu',
      agentName: 'Abaporu',
      config: { pitch: 1.0, rate: 1.0, volume: 1.0 },
      description: 'Voz equilibrada e coordenadora'
    },
    'nana': {
      agentId: 'nana',
      agentName: 'Nanã',
      config: { pitch: 0.95, rate: 0.9, volume: 1.0 },
      description: 'Voz sábia e calma'
    }
  }

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  /**
   * Check if TTS is available in the browser
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /**
   * Get available voices for pt-BR
   */
  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synthesis) return []

    return new Promise((resolve) => {
      let voices = this.synthesis!.getVoices()

      if (voices.length > 0) {
        resolve(voices.filter(v => v.lang.startsWith('pt')))
      } else {
        // Voices load asynchronously in some browsers
        this.synthesis!.onvoiceschanged = () => {
          voices = this.synthesis!.getVoices()
          resolve(voices.filter(v => v.lang.startsWith('pt')))
        }
      }
    })
  }

  /**
   * Speak text with agent's voice personality
   */
  async speak(text: string, agentId?: string): Promise<void> {
    if (!this.synthesis || !this.isEnabled) {
      console.log('TTS is disabled or not available')
      return
    }

    // Stop current speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'

    // Apply agent voice profile
    if (agentId && this.agentProfiles[agentId]) {
      const profile = this.agentProfiles[agentId]
      utterance.pitch = profile.config.pitch
      utterance.rate = profile.config.rate
      utterance.volume = profile.config.volume
    }

    // Select best pt-BR voice
    const voices = await this.getAvailableVoices()
    if (voices.length > 0) {
      // Prefer "pt-BR" over "pt-PT"
      const ptBrVoice = voices.find(v => v.lang === 'pt-BR') || voices[0]
      utterance.voice = ptBrVoice
    }

    // Event handlers
    utterance.onstart = () => {
      this.currentUtterance = utterance
      this.isPaused = false
    }

    utterance.onend = () => {
      this.currentUtterance = null
      this.isPaused = false
    }

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error)
      this.currentUtterance = null
    }

    this.synthesis.speak(utterance)
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause()
      this.isPaused = true
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
      this.isPaused = false
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis && (this.synthesis.speaking || this.synthesis.pending)) {
      this.synthesis.cancel()
      this.currentUtterance = null
      this.isPaused = false
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  /**
   * Check if paused
   */
  isPausedState(): boolean {
    return this.isPaused
  }

  /**
   * Enable/disable TTS
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.stop()
    }
  }

  /**
   * Get agent voice profile
   */
  getAgentProfile(agentId: string): AgentVoiceProfile | undefined {
    return this.agentProfiles[agentId]
  }

  /**
   * Get all agent profiles
   */
  getAllProfiles(): AgentVoiceProfile[] {
    return Object.values(this.agentProfiles)
  }
}

// Singleton instance
let ttsInstance: TTSService | null = null

export function getTTSService(): TTSService {
  if (!ttsInstance && TTSService.isSupported()) {
    ttsInstance = new TTSService()
  }

  if (!ttsInstance) {
    throw new Error('TTS Service not available')
  }

  return ttsInstance
}

export default getTTSService
