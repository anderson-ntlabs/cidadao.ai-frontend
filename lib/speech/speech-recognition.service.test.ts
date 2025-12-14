/**
 * Tests for Speech Recognition Service
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock browser detection
const mockIsSpeechRecognitionSupported = vi.fn()
const mockGetSpeechRecognition = vi.fn()
const mockLogBrowserCompatibility = vi.fn()

vi.mock('./browser-detection', () => ({
  isSpeechRecognitionSupported: () => mockIsSpeechRecognitionSupported(),
  getSpeechRecognition: () => mockGetSpeechRecognition(),
  logBrowserCompatibility: () => mockLogBrowserCompatibility(),
}))

import {
  SpeechRecognitionService,
  createSpeechRecognitionService,
  getDefaultSpeechRecognitionService,
} from './speech-recognition.service'

// Mock recognition class
class MockSpeechRecognition {
  lang = 'pt-BR'
  continuous = false
  interimResults = true
  maxAlternatives = 1
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onresult: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onnomatch: (() => void) | null = null
  onaudiostart: (() => void) | null = null
  onaudioend: (() => void) | null = null
  onsoundstart: (() => void) | null = null
  onsoundend: (() => void) | null = null
  onspeechstart: (() => void) | null = null
  onspeechend: (() => void) | null = null

  start = vi.fn()
  stop = vi.fn()
  abort = vi.fn()
}

describe('SpeechRecognitionService', () => {
  let mockRecognition: MockSpeechRecognition

  beforeEach(() => {
    vi.clearAllMocks()
    mockRecognition = new MockSpeechRecognition()
    mockIsSpeechRecognitionSupported.mockReturnValue(true)
    mockGetSpeechRecognition.mockReturnValue(function () {
      return mockRecognition
    })
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('constructor', () => {
    it('should create service with default config', () => {
      const service = new SpeechRecognitionService()

      expect(service.isSupported()).toBe(true)
    })

    it('should create service with custom config', () => {
      const service = new SpeechRecognitionService({
        lang: 'en-US',
        continuous: true,
      })

      expect(mockRecognition.lang).toBe('en-US')
      expect(mockRecognition.continuous).toBe(true)
    })

    it('should not initialize when not supported', () => {
      mockIsSpeechRecognitionSupported.mockReturnValue(false)

      const service = new SpeechRecognitionService()

      expect(service.isSupported()).toBe(false)
    })
  })

  describe('isSupported', () => {
    it('should return true when supported', () => {
      mockIsSpeechRecognitionSupported.mockReturnValue(true)
      const service = new SpeechRecognitionService()

      expect(service.isSupported()).toBe(true)
    })

    it('should return false when not supported', () => {
      mockIsSpeechRecognitionSupported.mockReturnValue(false)
      const service = new SpeechRecognitionService()

      expect(service.isSupported()).toBe(false)
    })
  })

  describe('start', () => {
    it('should start recognition', async () => {
      const onStart = vi.fn()
      const service = new SpeechRecognitionService({}, { onStart })

      await service.start()

      expect(mockRecognition.start).toHaveBeenCalled()
    })

    it('should call onError when not supported', async () => {
      mockIsSpeechRecognitionSupported.mockReturnValue(false)
      const onError = vi.fn()
      const service = new SpeechRecognitionService({}, { onError })

      await service.start()

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'not-allowed',
        })
      )
    })

    it('should not start if already listening', async () => {
      const service = new SpeechRecognitionService()

      // First start
      await service.start()
      // Simulate onstart event
      mockRecognition.onstart?.()

      // Try to start again
      await service.start()

      // Start should only be called once
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })
  })

  describe('stop', () => {
    it('should stop recognition', async () => {
      const service = new SpeechRecognitionService()

      // Start first
      await service.start()
      mockRecognition.onstart?.()

      service.stop()

      expect(mockRecognition.stop).toHaveBeenCalled()
    })

    it('should not stop if not listening', () => {
      const service = new SpeechRecognitionService()

      service.stop()

      expect(mockRecognition.stop).not.toHaveBeenCalled()
    })
  })

  describe('abort', () => {
    it('should abort recognition', () => {
      const service = new SpeechRecognitionService()

      service.abort()

      expect(mockRecognition.abort).toHaveBeenCalled()
    })
  })

  describe('toggle', () => {
    it('should start when not listening', async () => {
      const service = new SpeechRecognitionService()

      await service.toggle()

      expect(mockRecognition.start).toHaveBeenCalled()
    })

    it('should stop when listening', async () => {
      const service = new SpeechRecognitionService()

      // Start first
      await service.start()
      mockRecognition.onstart?.()

      await service.toggle()

      expect(mockRecognition.stop).toHaveBeenCalled()
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const service = new SpeechRecognitionService()

      service.updateConfig({ lang: 'es-ES' })

      expect(mockRecognition.lang).toBe('es-ES')
    })
  })

  describe('updateCallbacks', () => {
    it('should update callbacks', () => {
      const service = new SpeechRecognitionService()
      const onStart = vi.fn()

      service.updateCallbacks({ onStart })
      // Trigger start
      mockRecognition.onstart?.()

      expect(onStart).toHaveBeenCalled()
    })
  })

  describe('getState', () => {
    it('should return idle by default', () => {
      const service = new SpeechRecognitionService()

      expect(service.getState()).toBe('idle')
    })

    it('should return listening after start', async () => {
      const service = new SpeechRecognitionService()

      await service.start()
      mockRecognition.onstart?.()

      expect(service.getState()).toBe('listening')
    })
  })

  describe('getIsListening', () => {
    it('should return false by default', () => {
      const service = new SpeechRecognitionService()

      expect(service.getIsListening()).toBe(false)
    })

    it('should return true when listening', async () => {
      const service = new SpeechRecognitionService()

      await service.start()
      mockRecognition.onstart?.()

      expect(service.getIsListening()).toBe(true)
    })
  })

  describe('getCurrentTranscript', () => {
    it('should return empty string initially', () => {
      const service = new SpeechRecognitionService()

      expect(service.getCurrentTranscript()).toBe('')
    })
  })

  describe('clearTranscripts', () => {
    it('should clear transcripts', () => {
      const service = new SpeechRecognitionService()

      service.clearTranscripts()

      expect(service.getCurrentTranscript()).toBe('')
    })
  })

  describe('event handlers', () => {
    it('should call onEnd callback on end', async () => {
      const onEnd = vi.fn()
      const service = new SpeechRecognitionService({}, { onEnd })

      mockRecognition.onend?.()

      expect(onEnd).toHaveBeenCalled()
    })

    it('should call onError callback on error', async () => {
      const onError = vi.fn()
      const service = new SpeechRecognitionService({}, { onError })

      mockRecognition.onerror?.({ error: 'network' })

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'network',
        })
      )
    })

    it('should call onTranscript callback on final result', async () => {
      const onTranscript = vi.fn()
      const service = new SpeechRecognitionService({}, { onTranscript })

      mockRecognition.onresult?.({
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hello', confidence: 0.9 },
            isFinal: true,
          },
        ],
      })

      expect(onTranscript).toHaveBeenCalledWith('hello', 0.9)
    })

    it('should call onInterimResult callback on interim result', async () => {
      const onInterimResult = vi.fn()
      const service = new SpeechRecognitionService({}, { onInterimResult })

      mockRecognition.onresult?.({
        resultIndex: 0,
        results: [
          {
            0: { transcript: 'hel', confidence: 0.5 },
            isFinal: false,
          },
        ],
      })

      expect(onInterimResult).toHaveBeenCalledWith('hel')
    })

    it('should call onStateChange callback on state change', async () => {
      const onStateChange = vi.fn()
      const service = new SpeechRecognitionService({}, { onStateChange })

      mockRecognition.onstart?.()

      expect(onStateChange).toHaveBeenCalledWith('listening')
    })
  })

  describe('destroy', () => {
    it('should clean up resources', () => {
      const service = new SpeechRecognitionService()

      service.destroy()

      // Should be able to call getState without error
      expect(service.getState()).toBe('idle')
    })
  })

  describe('logDebugInfo', () => {
    it('should call logBrowserCompatibility', () => {
      const service = new SpeechRecognitionService()

      service.logDebugInfo()

      expect(mockLogBrowserCompatibility).toHaveBeenCalled()
    })
  })
})

describe('createSpeechRecognitionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSpeechRecognitionSupported.mockReturnValue(true)
    mockGetSpeechRecognition.mockReturnValue(function () {
      return new MockSpeechRecognition()
    })
  })

  it('should create a new service instance', () => {
    const service = createSpeechRecognitionService()

    expect(service).toBeInstanceOf(SpeechRecognitionService)
  })

  it('should pass config and callbacks', () => {
    const onStart = vi.fn()
    const service = createSpeechRecognitionService({ lang: 'en-US' }, { onStart })

    expect(service).toBeInstanceOf(SpeechRecognitionService)
  })
})

describe('getDefaultSpeechRecognitionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSpeechRecognitionSupported.mockReturnValue(true)
    mockGetSpeechRecognition.mockReturnValue(function () {
      return new MockSpeechRecognition()
    })
  })

  it('should return a service instance', () => {
    const service = getDefaultSpeechRecognitionService()

    expect(service).toBeInstanceOf(SpeechRecognitionService)
  })

  it('should return same instance on subsequent calls', () => {
    const service1 = getDefaultSpeechRecognitionService()
    const service2 = getDefaultSpeechRecognitionService()

    expect(service1).toBe(service2)
  })
})
