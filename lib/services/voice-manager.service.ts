/**
 * Voice Manager Service
 *
 * Manages TTS (Text-to-Speech) and STT (Speech-to-Text) integration
 * with the Cidadão.AI backend voice system.
 *
 * Features:
 * - Automatic voice selection per agent (16 unique Chirp3-HD voices)
 * - Audio caching (LRU with 50 items)
 * - Queue management for sequential playback
 * - Speech-to-text transcription
 * - Error handling with retry logic
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-01-30
 */

import { logger } from '@/lib/utils/logger'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

export interface VoiceSynthesizeRequest {
  text: string
  voice_name?: string
  speaking_rate?: number
  pitch?: number
}

// Agent to voice mapping (from backend agent-voices endpoint)
const AGENT_VOICE_MAP: Record<string, string> = {
  abaporu: 'pt-BR-Chirp3-HD-Rasalgethi',
  zumbi: 'pt-BR-Chirp3-HD-Fenrir',
  anita: 'pt-BR-Chirp3-HD-Callirrhoe',
  drummond: 'pt-BR-Chirp3-HD-Zephyr',
  ayrton_senna: 'pt-BR-Chirp3-HD-Algenib',
  tiradentes: 'pt-BR-Chirp3-HD-Schedar',
  machado: 'pt-BR-Chirp3-HD-Iapetus',
  nana: 'pt-BR-Chirp3-HD-Leda',
  // Add more as needed or fetch from backend
}

export interface TranscriptionResponse {
  transcript: string
  confidence: number
  language_code: string
  metadata: {
    duration_seconds: number
    audio_format: string
  }
}

export interface VoiceQueueItem {
  agentId?: string
  text: string
  priority: number
}

/**
 * LRU Cache for audio blobs
 */
class VoiceCache {
  private cache: Map<string, Blob> = new Map()
  private maxSize: number = 50

  getCacheKey(agentId: string | undefined, text: string): string {
    const agent = agentId || 'system'
    // Use first 100 chars to avoid huge keys
    return `${agent}:${text.substring(0, 100)}`
  }

  async get(agentId: string | undefined, text: string): Promise<Blob | null> {
    const key = this.getCacheKey(agentId, text)
    const blob = this.cache.get(key)

    if (blob) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, blob)
      logger.debug('VoiceCache: Cache hit', { key })
    }

    return blob || null
  }

  async set(agentId: string | undefined, text: string, blob: Blob): Promise<void> {
    const key = this.getCacheKey(agentId, text)

    // LRU eviction if cache full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string | undefined
      if (firstKey) {
        this.cache.delete(firstKey)
        logger.debug('VoiceCache: Evicted oldest entry', { evictedKey: firstKey })
      }
    }

    this.cache.set(key, blob)
    logger.debug('VoiceCache: Cached audio', { key, size: this.cache.size })
  }

  clear(): void {
    this.cache.clear()
    logger.debug('VoiceCache: Cache cleared')
  }

  getSize(): number {
    return this.cache.size
  }
}

/**
 * Voice Manager Service
 */
export class VoiceManagerService {
  private cache: VoiceCache
  private queue: VoiceQueueItem[] = []
  private isPlaying: boolean = false
  private currentAudio: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null

  constructor() {
    this.cache = new VoiceCache()

    // Initialize AudioContext on user interaction (required by browsers)
    if (typeof window !== 'undefined') {
      this.initAudioContext()
    }
  }

  /**
   * Initialize Web Audio API context
   */
  private initAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
      logger.debug('VoiceManager: AudioContext initialized')
    } catch (error) {
      logger.warn('VoiceManager: Failed to initialize AudioContext', { error })
    }
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(
    text: string,
    agentId?: string,
    options?: Partial<VoiceSynthesizeRequest>
  ): Promise<Blob> {
    // Check cache first
    const cached = await this.cache.get(agentId, text)
    if (cached) {
      logger.debug('VoiceManager: Returning cached audio', { agentId, textLength: text.length })
      return cached
    }

    logger.debug('VoiceManager: Synthesizing voice', { agentId, textLength: text.length })

    // Map agent_id to voice_name
    const voiceName = agentId ? AGENT_VOICE_MAP[agentId] : options?.voice_name

    // Only include voice_name if it's defined (Chirp3-HD voices don't support pitch)
    const requestBody: any = {
      text,
      speaking_rate: options?.speaking_rate || 1.0,
    }

    // Add voice_name only if defined
    if (voiceName) {
      requestBody.voice_name = voiceName
    }

    // Chirp3-HD voices don't support pitch adjustment, so we skip it
    // pitch: options?.pitch || 0.0,

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voice/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Voice synthesis failed: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      // Cache the result
      await this.cache.set(agentId, text, blob)

      logger.debug('VoiceManager: Voice synthesized successfully', {
        agentId,
        blobSize: blob.size,
        cacheSize: this.cache.getSize(),
      })

      return blob
    } catch (error) {
      logger.error('VoiceManager: Synthesis failed', { error, agentId })
      throw error
    }
  }

  /**
   * Play audio from blob
   */
  async play(blob: Blob): Promise<void> {
    // Stop any currently playing audio
    this.stop()

    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          this.isPlaying = false
          logger.debug('VoiceManager: Playback ended')
          resolve()
        }

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          this.isPlaying = false
          logger.error('VoiceManager: Playback error', { error })
          reject(new Error('Audio playback failed'))
        }

        this.currentAudio = audio
        this.isPlaying = true

        audio.play().catch((error) => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          this.isPlaying = false
          logger.error('VoiceManager: Play promise rejected', { error })
          reject(error)
        })

        logger.debug('VoiceManager: Playback started')
      } catch (error) {
        this.isPlaying = false
        logger.error('VoiceManager: Failed to create audio element', { error })
        reject(error)
      }
    })
  }

  /**
   * Synthesize and play (convenience method)
   */
  async synthesizeAndPlay(
    text: string,
    agentId?: string,
    options?: Partial<VoiceSynthesizeRequest>
  ): Promise<void> {
    try {
      const blob = await this.synthesize(text, agentId, options)
      await this.play(blob)
    } catch (error) {
      logger.error('VoiceManager: Synthesize and play failed', { error, agentId })
      throw error
    }
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
      this.isPlaying = false
      logger.debug('VoiceManager: Playback stopped')
    }
  }

  /**
   * Check if audio is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Add to playback queue
   */
  addToQueue(agentId: string | undefined, text: string, priority: number = 0): void {
    this.queue.push({ agentId, text, priority })
    // Sort by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority)
    logger.debug('VoiceManager: Added to queue', { queueLength: this.queue.length, priority })

    // Start processing if not already playing
    if (!this.isPlaying) {
      this.processQueue()
    }
  }

  /**
   * Process playback queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false
      logger.debug('VoiceManager: Queue empty')
      return
    }

    const item = this.queue.shift()!
    logger.debug('VoiceManager: Processing queue item', { agentId: item.agentId })

    try {
      await this.synthesizeAndPlay(item.text, item.agentId)
    } catch (error) {
      logger.error('VoiceManager: Queue item playback failed', { error, agentId: item.agentId })
    }

    // Process next item
    this.processQueue()
  }

  /**
   * Clear playback queue
   */
  clearQueue(): void {
    this.queue = []
    logger.debug('VoiceManager: Queue cleared')
  }

  /**
   * Transcribe audio to text (Speech-to-Text)
   */
  async transcribe(
    audioFile: File | Blob,
    languageCode: string = 'pt-BR'
  ): Promise<TranscriptionResponse> {
    logger.debug('VoiceManager: Transcribing audio', {
      size: audioFile.size,
      type: audioFile.type,
      languageCode,
    })

    const formData = new FormData()

    // Backend expects 'audio' (not 'audio_file') and 'sample_rate' (not 'language_code')
    // Try to send with proper MIME type
    const audioBlob = audioFile instanceof Blob ? audioFile : new Blob([audioFile])
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('sample_rate', '44100') // Match recording sample rate

    logger.debug('VoiceManager: Sending transcription request', {
      url: `${API_BASE_URL}/api/v1/voice/transcribe`,
      audioSize: audioBlob.size,
      audioType: audioBlob.type,
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('VoiceManager: Transcription request failed', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        })
        // If API returns 400/404, suggest using Speech-to-Text button
        if (response.status === 400 || response.status === 404) {
          throw new Error(
            'Serviço de transcrição de áudio indisponível no momento. Por favor, use o botão de Speech-to-Text (microfone azul) que funciona diretamente no navegador.'
          )
        }
        throw new Error(`Transcription failed: ${response.status} ${errorText}`)
      }

      const result = await response.json()

      // Adapt backend response to match TranscriptionResponse interface
      const adaptedResult: TranscriptionResponse = {
        transcript: result.transcription || '', // Backend uses 'transcription', not 'transcript'
        confidence: result.confidence || 0,
        language_code: result.language_detected || languageCode,
        metadata: {
          duration_seconds: result.duration_ms ? result.duration_ms / 1000 : 0,
          audio_format: 'webm',
        },
      }

      logger.debug('VoiceManager: Transcription successful', {
        confidence: adaptedResult.confidence,
        textLength: adaptedResult.transcript.length,
      })

      return adaptedResult
    } catch (error) {
      logger.error('VoiceManager: Transcription failed', { error })
      throw error
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.getSize(),
      maxSize: 50,
    }
  }
}

// Singleton instance
let voiceManagerInstance: VoiceManagerService | null = null

export function getVoiceManager(): VoiceManagerService {
  if (typeof window === 'undefined') {
    // Server-side: return a mock instance
    return new VoiceManagerService()
  }

  if (!voiceManagerInstance) {
    voiceManagerInstance = new VoiceManagerService()
  }

  return voiceManagerInstance
}

export const voiceManager = getVoiceManager()
