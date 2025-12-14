/**
 * Tests for Web Speech TTS Service
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

describe('WebSpeechTTSService', () => {
  const mockVoices: SpeechSynthesisVoice[] = [
    {
      voiceURI: 'Google português do Brasil',
      name: 'Google português do Brasil',
      lang: 'pt-BR',
      localService: false,
      default: true,
    } as SpeechSynthesisVoice,
    {
      voiceURI: 'Microsoft Francisca',
      name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',
      lang: 'pt-BR',
      localService: false,
      default: false,
    } as SpeechSynthesisVoice,
    {
      voiceURI: 'en-US-Standard',
      name: 'English US Standard',
      lang: 'en-US',
      localService: true,
      default: false,
    } as SpeechSynthesisVoice,
  ]

  let mockSpeechSynthesis: any
  let mockSpeechSynthesisUtterance: any

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    mockSpeechSynthesis = {
      getVoices: vi.fn().mockReturnValue(mockVoices),
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speaking: false,
      paused: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    mockSpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
      text,
      voice: null,
      lang: '',
      rate: 1,
      pitch: 1,
      volume: 1,
      onstart: null,
      onend: null,
      onerror: null,
    }))

    vi.stubGlobal('window', {
      speechSynthesis: mockSpeechSynthesis,
    })

    vi.stubGlobal('SpeechSynthesisUtterance', mockSpeechSynthesisUtterance)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('isSupported', () => {
    it('should return true when speechSynthesis is available', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      expect(service.isSupported()).toBe(true)
    })

    it('should return false on server-side', async () => {
      vi.stubGlobal('window', undefined)

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      expect(service.isSupported()).toBe(false)
    })
  })

  describe('getVoices', () => {
    it('should return all available voices', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const voices = await service.getVoices()

      expect(voices).toHaveLength(3)
      expect(voices[0]).toHaveProperty('voiceURI')
      expect(voices[0]).toHaveProperty('name')
      expect(voices[0]).toHaveProperty('lang')
    })
  })

  describe('getPortugueseVoices', () => {
    it('should filter only Portuguese (Brazil) voices', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const ptVoices = await service.getPortugueseVoices()

      expect(ptVoices).toHaveLength(2)
      expect(ptVoices.every((v) => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt_BR'))).toBe(
        true
      )
    })
  })

  describe('getVoicesGroupedByLanguage', () => {
    it('should group voices by language code', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const grouped = await service.getVoicesGroupedByLanguage()

      expect(grouped).toHaveProperty('pt')
      expect(grouped).toHaveProperty('en')
      expect(grouped['pt']).toHaveLength(2)
      expect(grouped['en']).toHaveLength(1)
    })
  })

  describe('getDefaultPortugueseVoice', () => {
    it('should prefer Google voices', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const defaultVoice = await service.getDefaultPortugueseVoice()

      expect(defaultVoice?.name).toContain('Google')
    })

    it('should fallback to Microsoft voices if no Google', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([mockVoices[1], mockVoices[2]])

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const defaultVoice = await service.getDefaultPortugueseVoice()

      expect(defaultVoice?.name).toContain('Microsoft')
    })

    it('should return first available voice if no PT-BR voices', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([mockVoices[2]])

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const defaultVoice = await service.getDefaultPortugueseVoice()

      expect(defaultVoice?.lang).toBe('en-US')
    })

    it('should return null if no voices available', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([])

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      const defaultVoice = await service.getDefaultPortugueseVoice()

      expect(defaultVoice).toBe(null)
    })
  })

  describe('stop', () => {
    it('should call speechSynthesis.cancel', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      service.stop()

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    it('should call speechSynthesis.pause', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      service.pause()

      expect(mockSpeechSynthesis.pause).toHaveBeenCalled()
    })
  })

  describe('resume', () => {
    it('should call speechSynthesis.resume', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      service.resume()

      expect(mockSpeechSynthesis.resume).toHaveBeenCalled()
    })
  })

  describe('isSpeaking', () => {
    it('should return speechSynthesis.speaking status', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      expect(service.isSpeaking()).toBe(false)

      mockSpeechSynthesis.speaking = true
      expect(service.isSpeaking()).toBe(true)
    })
  })

  describe('isPaused', () => {
    it('should return speechSynthesis.paused status', async () => {
      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      expect(service.isPaused()).toBe(false)

      mockSpeechSynthesis.paused = true
      expect(service.isPaused()).toBe(true)
    })
  })

  describe('speak', () => {
    it('should throw when Web Speech API not supported', async () => {
      vi.stubGlobal('window', {})

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      await expect(service.speak('Test')).rejects.toThrow('Web Speech API not supported')
    })

    it('should create utterance with correct options', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: any) => {
        setTimeout(() => utterance.onend?.(), 10)
      })

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      await service.speak('Hello', 'Google português do Brasil', {
        rate: 1.5,
        pitch: 0.8,
        volume: 0.9,
      })

      expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('Hello')
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    })

    it('should resolve when speech ends', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: any) => {
        setTimeout(() => utterance.onend?.(), 10)
      })

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      await expect(service.speak('Test')).resolves.toBeUndefined()
    })

    it('should resolve when speech is interrupted', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: any) => {
        setTimeout(() => utterance.onerror?.({ error: 'interrupted' }), 10)
      })

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      await expect(service.speak('Test')).resolves.toBeUndefined()
    })

    it('should reject on speech error', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: any) => {
        setTimeout(() => utterance.onerror?.({ error: 'network' }), 10)
      })

      const { getWebSpeechTTS } = await import('./web-speech-tts.service')
      const service = getWebSpeechTTS()

      await expect(service.speak('Test')).rejects.toThrow('Speech synthesis error: network')
    })
  })
})
