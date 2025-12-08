/**
 * Voice Input Hook
 *
 * React hook for managing speech-to-text functionality
 * with state management and callbacks.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { SpeechRecognitionService } from '@/lib/speech/speech-recognition.service'
import { isSpeechRecognitionSupported, getBrowserInfo } from '@/lib/speech/browser-detection'
import { createLogger } from '@/lib/logger'
import type {
  VoiceInputConfig,
  SpeechRecognitionState,
  SpeechRecognitionError,
} from '@/lib/speech/types'

const logger = createLogger('VoiceInput')

/**
 * Voice input hook options
 */
export interface UseVoiceInputOptions extends VoiceInputConfig {
  /** Called when final transcript is ready */
  onTranscript?: (transcript: string) => void
  /** Called with interim results */
  onInterimTranscript?: (transcript: string) => void
  /** Called on error */
  onError?: (error: SpeechRecognitionError) => void
  /** Auto-clear transcript after final result */
  autoClear?: boolean
  /** Delay before auto-clear (ms) */
  autoClearDelay?: number
}

/**
 * Voice input hook return type
 */
export interface UseVoiceInputReturn {
  /** Current transcript (final + interim) */
  transcript: string
  /** Interim transcript only */
  interimTranscript: string
  /** Final transcript only */
  finalTranscript: string
  /** Current state */
  state: SpeechRecognitionState
  /** Is currently listening */
  isListening: boolean
  /** Is supported in browser */
  isSupported: boolean
  /** Browser information */
  browserInfo: ReturnType<typeof getBrowserInfo>
  /** Start listening */
  start: () => Promise<void>
  /** Stop listening */
  stop: () => void
  /** Toggle listening */
  toggle: () => Promise<void>
  /** Clear transcript */
  clear: () => void
  /** Current error (if any) */
  error: SpeechRecognitionError | null
}

/**
 * Hook for voice input functionality
 *
 * @example
 * ```tsx
 * const {
 *   transcript,
 *   isListening,
 *   start,
 *   stop,
 *   toggle
 * } = useVoiceInput({
 *   onTranscript: (text) => {
 *     console.log('User said:', text)
 *   }
 * })
 * ```
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    onInterimTranscript,
    onError,
    autoClear = false,
    autoClearDelay = 1000,
    lang = 'pt-BR',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    autoStopTimeout = 3000,
  } = options

  // State
  const [state, setState] = useState<SpeechRecognitionState>('idle')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [error, setError] = useState<SpeechRecognitionError | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [browserInfo, setBrowserInfo] = useState(getBrowserInfo())

  // Refs
  const serviceRef = useRef<SpeechRecognitionService | null>(null)
  const autoClearTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize service
  useEffect(() => {
    // Check browser support
    const supported = isSpeechRecognitionSupported()
    setIsSupported(supported)
    setBrowserInfo(getBrowserInfo())

    if (!supported) {
      logger.warn('Speech recognition not supported in this browser')
      return
    }

    // Create service instance
    const service = new SpeechRecognitionService(
      {
        lang,
        continuous,
        interimResults,
        maxAlternatives,
        autoStopTimeout,
      },
      {
        onTranscript: (text, confidence) => {
          setFinalTranscript((prev) => prev + text)
          setTranscript((prev) => prev + text)
          setInterimTranscript('')

          // Call user callback
          onTranscript?.(text)

          // Auto clear if enabled
          if (autoClear) {
            if (autoClearTimerRef.current) {
              clearTimeout(autoClearTimerRef.current)
            }
            autoClearTimerRef.current = setTimeout(() => {
              setTranscript('')
              setFinalTranscript('')
              setInterimTranscript('')
            }, autoClearDelay)
          }
        },
        onInterimResult: (text) => {
          const parts = text.split(finalTranscript)
          const interim = parts[parts.length - 1] || ''
          setInterimTranscript(interim)
          setTranscript(text)
          onInterimTranscript?.(text)
        },
        onError: (err) => {
          setError(err)
          onError?.(err)
        },
        onStateChange: (newState) => {
          setState(newState)
        },
        onStart: () => {
          setIsListening(true)
          setError(null)
        },
        onEnd: () => {
          setIsListening(false)
        },
      }
    )

    serviceRef.current = service

    // Cleanup
    return () => {
      service.destroy()
      if (autoClearTimerRef.current) {
        clearTimeout(autoClearTimerRef.current)
      }
    }
  }, []) // Only run once on mount

  // Update config when options change
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updateConfig({
        lang,
        continuous,
        interimResults,
        maxAlternatives,
        autoStopTimeout,
      })
    }
  }, [lang, continuous, interimResults, maxAlternatives, autoStopTimeout])

  // Start listening
  const start = useCallback(async () => {
    if (!serviceRef.current) {
      logger.error('Speech recognition service not initialized')
      return
    }

    if (!isSupported) {
      const error: SpeechRecognitionError = {
        code: 'not-allowed',
        message: 'Speech recognition not supported in this browser',
      }
      setError(error)
      onError?.(error)
      return
    }

    try {
      // Clear previous error
      setError(null)

      // Clear transcripts if starting fresh
      if (!continuous) {
        setTranscript('')
        setInterimTranscript('')
        setFinalTranscript('')
      }

      await serviceRef.current.start()
    } catch (err) {
      logger.error('Failed to start voice input', { error: err })
    }
  }, [isSupported, continuous, onError])

  // Stop listening
  const stop = useCallback(() => {
    if (!serviceRef.current) return
    serviceRef.current.stop()
  }, [])

  // Toggle listening
  const toggle = useCallback(async () => {
    if (!serviceRef.current) return
    await serviceRef.current.toggle()
  }, [])

  // Clear transcript
  const clear = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setFinalTranscript('')
    if (serviceRef.current) {
      serviceRef.current.clearTranscripts()
    }
    if (autoClearTimerRef.current) {
      clearTimeout(autoClearTimerRef.current)
      autoClearTimerRef.current = null
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    state,
    isListening,
    isSupported,
    browserInfo,
    start,
    stop,
    toggle,
    clear,
    error,
  }
}

/**
 * Hook for simple voice input without state management
 *
 * @example
 * ```tsx
 * const startListening = useSimpleVoiceInput((transcript) => {
 *   console.log('User said:', transcript)
 * })
 * ```
 */
export function useSimpleVoiceInput(
  onTranscript: (transcript: string) => void,
  config?: VoiceInputConfig
): () => Promise<void> {
  const serviceRef = useRef<SpeechRecognitionService | null>(null)

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return

    const service = new SpeechRecognitionService(config, {
      onTranscript: (text) => onTranscript(text),
    })

    serviceRef.current = service

    return () => {
      service.destroy()
    }
  }, [])

  return useCallback(async () => {
    if (serviceRef.current) {
      await serviceRef.current.toggle()
    }
  }, [])
}
