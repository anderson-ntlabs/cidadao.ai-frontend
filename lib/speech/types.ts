/**
 * TypeScript Type Definitions for Web Speech API
 *
 * Provides type safety for SpeechRecognition API
 * Handles browser vendor prefixes (webkit)
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-19
 */

/**
 * Speech Recognition Error Codes
 */
export type SpeechRecognitionErrorCode =
  | 'no-speech' // No speech detected
  | 'aborted' // User aborted recognition
  | 'audio-capture' // Audio capture failed
  | 'network' // Network error
  | 'not-allowed' // Microphone permission denied
  | 'service-not-allowed' // Speech service not allowed
  | 'bad-grammar' // Grammar error
  | 'language-not-supported' // Language not supported

/**
 * Speech Recognition Result
 */
export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

/**
 * Speech Recognition Event Data
 */
export interface SpeechRecognitionEventData {
  transcript: string
  interimTranscript: string
  confidence: number
  isFinal: boolean
}

/**
 * Speech Recognition Error
 */
export interface SpeechRecognitionError {
  code: SpeechRecognitionErrorCode
  message: string
}

/**
 * Speech Recognition State
 */
export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error'

/**
 * Browser Information
 */
export interface BrowserInfo {
  name: string
  version: string
  isMobile: boolean
  supportsSpeechRecognition: boolean
  userAgent: string
}

/**
 * Voice Input Configuration
 */
export interface VoiceInputConfig {
  /** Language code (e.g., 'pt-BR', 'en-US') */
  lang?: string
  /** Continue listening after user stops speaking */
  continuous?: boolean
  /** Return interim (real-time) results */
  interimResults?: boolean
  /** Maximum number of alternatives to return */
  maxAlternatives?: number
  /** Auto-stop after silence (milliseconds) */
  autoStopTimeout?: number
}

/**
 * Voice Input Callbacks
 */
export interface VoiceInputCallbacks {
  /** Called when transcription is complete */
  onTranscript?: (transcript: string, confidence: number) => void
  /** Called with interim results (real-time) */
  onInterimResult?: (transcript: string) => void
  /** Called when an error occurs */
  onError?: (error: SpeechRecognitionError) => void
  /** Called when state changes */
  onStateChange?: (state: SpeechRecognitionState) => void
  /** Called when recognition starts */
  onStart?: () => void
  /** Called when recognition ends */
  onEnd?: () => void
}

// Extend Window interface to include SpeechRecognition (with webkit prefix)
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export {}
