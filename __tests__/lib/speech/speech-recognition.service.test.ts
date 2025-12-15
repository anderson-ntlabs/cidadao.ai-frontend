/**
 * Speech Recognition Service Tests
 *
 * Tests for speech-to-text conversion service
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-15
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as browserDetection from '@/lib/speech/browser-detection'
import {
  SpeechRecognitionService,
  createSpeechRecognitionService,
  getDefaultSpeechRecognitionService,
} from '@/lib/speech/speech-recognition.service'
import type {
  VoiceInputConfig,
  VoiceInputCallbacks,
  SpeechRecognitionError,
} from '@/lib/speech/types'

// Mock the functions
vi.mock('@/lib/speech/browser-detection')
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }),
}))

describe('SpeechRecognitionService', () => {
  let mockRecognition: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Create mock recognition instance
    mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      lang: '',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onstart: null,
      onend: null,
      onresult: null,
      onerror: null,
      onnomatch: null,
      onaudiostart: null,
      onaudioend: null,
      onsoundstart: null,
      onsoundend: null,
      onspeechstart: null,
      onspeechend: null,
    }

    // Setup mocks
    vi.mocked(browserDetection.isSpeechRecognitionSupported).mockReturnValue(true)
    vi.mocked(browserDetection.getSpeechRecognition).mockReturnValue(function () {
      return mockRecognition
    })
    vi.mocked(browserDetection.logBrowserCompatibility).mockImplementation(() => {})

    // Mock navigator
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should create service with default config', () => {
      const service = new SpeechRecognitionService()
      expect(service.isSupported()).toBe(true)
    })

    it('should create service with custom config', () => {
      const config: VoiceInputConfig = {
        lang: 'en-US',
        continuous: true,
        interimResults: false,
        maxAlternatives: 3,
      }
      const service = new SpeechRecognitionService(config)
      expect(service.isSupported()).toBe(true)
    })

    it('should create service with callbacks', () => {
      const callbacks: VoiceInputCallbacks = {
        onStart: vi.fn(),
        onEnd: vi.fn(),
        onError: vi.fn(),
      }
      const service = new SpeechRecognitionService(undefined, callbacks)
      expect(service.isSupported()).toBe(true)
    })

    it('should not initialize if not supported', () => {
      vi.mocked(browserDetection.isSpeechRecognitionSupported).mockReturnValue(false)
      const service = new SpeechRecognitionService()
      expect(service.isSupported()).toBe(false)
    })
  })

  describe('isSupported', () => {
    it('should return true when supported', () => {
      vi.mocked(browserDetection.isSpeechRecognitionSupported).mockReturnValue(true)
      const service = new SpeechRecognitionService()
      expect(service.isSupported()).toBe(true)
    })

    it('should return false when not supported', () => {
      vi.mocked(browserDetection.isSpeechRecognitionSupported).mockReturnValue(false)
      const service = new SpeechRecognitionService()
      expect(service.isSupported()).toBe(false)
    })
  })

  describe('start', () => {
    it('should start recognition successfully', async () => {
      const onStart = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onStart })

      await service.start()
      mockRecognition.onstart?.()

      expect(mockRecognition.start).toHaveBeenCalled()
      expect(onStart).toHaveBeenCalled()
      expect(service.getIsListening()).toBe(true)
    })

    it('should not start if not supported', async () => {
      vi.mocked(browserDetection.isSpeechRecognitionSupported).mockReturnValue(false)
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })

      await service.start()

      expect(mockRecognition.start).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'not-allowed',
          message: 'Speech recognition not supported in this browser',
        })
      )
    })

    it('should not start if already listening', async () => {
      const service = new SpeechRecognitionService()

      await service.start()
      mockRecognition.onstart?.()

      const startCallCount = mockRecognition.start.mock.calls.length
      await service.start()

      expect(mockRecognition.start).toHaveBeenCalledTimes(startCallCount)
    })

    it('should request microphone permission before starting', async () => {
      const mockGetUserMedia = vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      })
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
      })

      const service = new SpeechRecognitionService()
      await service.start()

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
    })

    it('should handle microphone permission denied', async () => {
      const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'))
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
      })

      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'not-allowed',
          message: 'Microphone permission denied',
        })
      )
      expect(mockRecognition.start).not.toHaveBeenCalled()
    })

    it('should handle start failure', async () => {
      mockRecognition.start.mockImplementation(() => {
        throw new Error('Start failed')
      })

      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'audio-capture',
          message: 'Failed to start speech recognition',
        })
      )
    })

    it('should ignore error if already listening when start fails', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      // Try to start again which should fail
      mockRecognition.start.mockImplementation(() => {
        throw new Error('Already started')
      })

      await service.start()
      expect(service.getIsListening()).toBe(true)
    })
  })

  describe('stop', () => {
    it('should stop recognition', async () => {
      const onEnd = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onEnd })

      await service.start()
      mockRecognition.onstart?.()
      service.stop()
      mockRecognition.onend?.()

      expect(mockRecognition.stop).toHaveBeenCalled()
      expect(onEnd).toHaveBeenCalled()
      expect(service.getIsListening()).toBe(false)
    })

    it('should not stop if not listening', () => {
      const service = new SpeechRecognitionService()
      service.stop()
      expect(mockRecognition.stop).not.toHaveBeenCalled()
    })

    it('should handle stop failure', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      mockRecognition.stop.mockImplementation(() => {
        throw new Error('Stop failed')
      })

      expect(() => service.stop()).not.toThrow()
    })
  })

  describe('abort', () => {
    it('should abort recognition', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      service.abort()
      expect(mockRecognition.abort).toHaveBeenCalled()
      expect(service.getIsListening()).toBe(false)
    })

    it('should handle abort failure', () => {
      mockRecognition.abort.mockImplementation(() => {
        throw new Error('Abort failed')
      })

      const service = new SpeechRecognitionService()
      expect(() => service.abort()).not.toThrow()
    })
  })

  describe('toggle', () => {
    it('should toggle from stopped to listening', async () => {
      const service = new SpeechRecognitionService()
      await service.toggle()
      mockRecognition.onstart?.()

      expect(service.getIsListening()).toBe(true)
    })

    it('should toggle from listening to stopped', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      await service.toggle()
      mockRecognition.onend?.()

      expect(service.getIsListening()).toBe(false)
    })
  })

  describe('onresult event handler', () => {
    it('should handle final transcript', async () => {
      const onTranscript = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onTranscript })
      await service.start()

      const mockEvent = {
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hello world', confidence: 0.95 },
            isFinal: true,
          },
        ],
      }

      mockRecognition.onresult?.(mockEvent)

      expect(onTranscript).toHaveBeenCalledWith('hello world', 0.95)
      expect(service.getCurrentTranscript()).toBe('hello world')
    })

    it('should handle interim results', async () => {
      const onInterimResult = vi.fn()
      const service = new SpeechRecognitionService({ interimResults: true }, { onInterimResult })
      await service.start()

      const mockEvent = {
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hello', confidence: 0 },
            isFinal: false,
          },
        ],
      }

      mockRecognition.onresult?.(mockEvent)

      expect(onInterimResult).toHaveBeenCalledWith('hello')
    })

    it('should combine multiple results', async () => {
      const onTranscript = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onTranscript })
      await service.start()

      const mockEvent1 = {
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hello', confidence: 0.95 },
            isFinal: true,
          },
        ],
      }

      const mockEvent2 = {
        resultIndex: 1,
        results: [
          {
            0: { transcript: 'hello', confidence: 0.95 },
            isFinal: true,
          },
          {
            0: { transcript: ' world', confidence: 0.96 },
            isFinal: true,
          },
        ],
      }

      mockRecognition.onresult?.(mockEvent1)
      mockRecognition.onresult?.(mockEvent2)

      expect(service.getCurrentTranscript()).toBe('hello world')
    })

    it('should reset auto-stop timer on result', async () => {
      const service = new SpeechRecognitionService({ autoStopTimeout: 3000 })
      await service.start()
      mockRecognition.onstart?.()

      const mockEvent = {
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'test', confidence: 0.95 },
            isFinal: true,
          },
        ],
      }

      // Advance time before result
      vi.advanceTimersByTime(2000)

      // Result resets the timer
      mockRecognition.onresult?.(mockEvent)

      // Advance another 2 seconds (should not stop yet since timer was reset)
      vi.advanceTimersByTime(2000)
      expect(service.getIsListening()).toBe(true)

      // Advance another 1.5 seconds (total 3.5 seconds since reset, should stop)
      vi.advanceTimersByTime(1500)
      expect(mockRecognition.stop).toHaveBeenCalled()
    })
  })

  describe('onerror event handler', () => {
    it('should handle no-speech error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      mockRecognition.onerror?.({ error: 'no-speech' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'no-speech',
          message: 'Nenhuma fala detectada',
        })
      )
    })

    it('should handle aborted error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      mockRecognition.onerror?.({ error: 'aborted' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'aborted',
          message: 'Reconhecimento cancelado',
        })
      )
    })

    it('should handle audio-capture error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      mockRecognition.onerror?.({ error: 'audio-capture' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'audio-capture',
          message: 'Falha na captura de áudio',
        })
      )
    })

    it('should handle network error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      mockRecognition.onerror?.({ error: 'network' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'network',
          message: 'Erro de rede',
        })
      )
    })

    it('should handle not-allowed error and stop', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()
      mockRecognition.onstart?.()

      mockRecognition.onerror?.({ error: 'not-allowed' })

      expect(mockRecognition.stop).toHaveBeenCalled()
    })

    it('should handle service-not-allowed error and stop', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()
      mockRecognition.onstart?.()

      mockRecognition.onerror?.({ error: 'service-not-allowed' })

      expect(mockRecognition.stop).toHaveBeenCalled()
    })

    it('should handle unknown error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onError })
      await service.start()

      mockRecognition.onerror?.({ error: 'unknown-error' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'unknown-error',
          message: 'Erro desconhecido',
        })
      )
    })
  })

  describe('onend event handler', () => {
    it('should handle end event', async () => {
      const onEnd = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onEnd })
      await service.start()
      mockRecognition.onstart?.()

      mockRecognition.onend?.()

      expect(onEnd).toHaveBeenCalled()
      expect(service.getIsListening()).toBe(false)
    })

    it('should auto-restart in continuous mode', async () => {
      const service = new SpeechRecognitionService({ continuous: true })
      await service.start()
      mockRecognition.onstart?.()

      // End the recognition
      mockRecognition.onend?.()

      // Advance timers to trigger auto-restart
      await vi.advanceTimersByTimeAsync(150)

      // Start should be called twice (initial + auto-restart)
      expect(mockRecognition.start).toHaveBeenCalledTimes(2)
    })

    it('should not auto-restart if state is error', async () => {
      const service = new SpeechRecognitionService({ continuous: true })
      await service.start()
      mockRecognition.onstart?.()

      mockRecognition.onerror?.({ error: 'not-allowed' })
      mockRecognition.onend?.()

      vi.advanceTimersByTime(150)

      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })

    it('should not auto-restart if already listening', async () => {
      const service = new SpeechRecognitionService({ continuous: true })
      await service.start()
      mockRecognition.onstart?.()

      // Simulate immediate restart
      mockRecognition.onend?.()
      await service.start()
      mockRecognition.onstart?.()

      vi.advanceTimersByTime(150)

      // Should not attempt another restart
      expect(mockRecognition.start).toHaveBeenCalledTimes(2)
    })
  })

  describe('auto-stop timer', () => {
    it('should auto-stop after timeout', async () => {
      const service = new SpeechRecognitionService({ autoStopTimeout: 3000 })
      await service.start()
      mockRecognition.onstart?.()

      vi.advanceTimersByTime(3500)

      expect(mockRecognition.stop).toHaveBeenCalled()
    })

    it('should not auto-stop if autoStopTimeout is 0', async () => {
      const service = new SpeechRecognitionService({ autoStopTimeout: 0 })
      await service.start()
      mockRecognition.onstart?.()

      vi.advanceTimersByTime(10000)

      expect(mockRecognition.stop).not.toHaveBeenCalled()
    })

    it('should reset timer on speech start', async () => {
      const service = new SpeechRecognitionService({ autoStopTimeout: 3000 })
      await service.start()
      mockRecognition.onstart?.()

      vi.advanceTimersByTime(2000)
      mockRecognition.onspeechstart?.()

      vi.advanceTimersByTime(2000)
      expect(mockRecognition.stop).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1500)
      expect(mockRecognition.stop).toHaveBeenCalled()
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const service = new SpeechRecognitionService({ lang: 'pt-BR' })
      service.updateConfig({ lang: 'en-US', continuous: true })

      expect(mockRecognition.lang).toBe('en-US')
      expect(mockRecognition.continuous).toBe(true)
    })
  })

  describe('updateCallbacks', () => {
    it('should update callbacks', () => {
      const onStart1 = vi.fn()
      const onStart2 = vi.fn()

      const service = new SpeechRecognitionService(undefined, { onStart: onStart1 })
      service.updateCallbacks({ onStart: onStart2 })

      // Test that new callback is used
      expect(() => service.start()).not.toThrow()
    })
  })

  describe('getState', () => {
    it('should return idle initially', () => {
      const service = new SpeechRecognitionService()
      expect(service.getState()).toBe('idle')
    })

    it('should return listening when started', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      expect(service.getState()).toBe('listening')
    })

    it('should return error on error', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onerror?.({ error: 'network' })

      expect(service.getState()).toBe('error')
    })
  })

  describe('clearTranscripts', () => {
    it('should clear all transcripts', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      const mockEvent = {
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hello world', confidence: 0.95 },
            isFinal: true,
          },
        ],
      }

      mockRecognition.onresult?.(mockEvent)
      expect(service.getCurrentTranscript()).toBe('hello world')

      service.clearTranscripts()
      expect(service.getCurrentTranscript()).toBe('')
    })
  })

  describe('destroy', () => {
    it('should clean up service', async () => {
      const service = new SpeechRecognitionService()
      await service.start()
      mockRecognition.onstart?.()

      service.destroy()

      expect(mockRecognition.stop).toHaveBeenCalled()
      expect(service.getIsListening()).toBe(false)
    })
  })

  describe('logDebugInfo', () => {
    it('should not throw when logging debug info', () => {
      const service = new SpeechRecognitionService()
      expect(() => service.logDebugInfo()).not.toThrow()
    })
  })

  describe('audio event handlers', () => {
    it('should handle audio start', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onaudiostart?.()).not.toThrow()
    })

    it('should handle audio end', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onaudioend?.()).not.toThrow()
    })

    it('should handle sound start', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onsoundstart?.()).not.toThrow()
    })

    it('should handle sound end', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onsoundend?.()).not.toThrow()
    })

    it('should handle speech end', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onspeechend?.()).not.toThrow()
    })

    it('should handle no match', async () => {
      const service = new SpeechRecognitionService()
      await service.start()

      expect(() => mockRecognition.onnomatch?.()).not.toThrow()
    })
  })

  describe('state change callback', () => {
    it('should call onStateChange when state changes', async () => {
      const onStateChange = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onStateChange })

      await service.start()
      mockRecognition.onstart?.()

      expect(onStateChange).toHaveBeenCalledWith('listening')

      mockRecognition.onend?.()
      expect(onStateChange).toHaveBeenCalledWith('idle')
    })

    it('should not call onStateChange if state does not change', async () => {
      const onStateChange = vi.fn()
      const service = new SpeechRecognitionService(undefined, { onStateChange })

      expect(service.getState()).toBe('idle')
      service.stop()

      expect(onStateChange).not.toHaveBeenCalled()
    })
  })

  describe('factory functions', () => {
    it('should create service with createSpeechRecognitionService', () => {
      const service = createSpeechRecognitionService()
      expect(service).toBeInstanceOf(SpeechRecognitionService)
    })

    it('should create service with config and callbacks', () => {
      const config: VoiceInputConfig = { lang: 'en-US' }
      const callbacks: VoiceInputCallbacks = { onStart: vi.fn() }
      const service = createSpeechRecognitionService(config, callbacks)
      expect(service).toBeInstanceOf(SpeechRecognitionService)
    })

    it('should return singleton instance', () => {
      const service1 = getDefaultSpeechRecognitionService()
      const service2 = getDefaultSpeechRecognitionService()
      expect(service1).toBe(service2)
    })
  })
})
