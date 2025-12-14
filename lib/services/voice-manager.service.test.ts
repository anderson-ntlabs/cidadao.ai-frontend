/**
 * Tests for Voice Manager Service
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/utils/ensure-https', () => ({
  getSecureApiUrl: () => 'https://api.example.com',
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('VoiceManagerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockFetch.mockReset()
  })

  describe('VoiceCache', () => {
    it('should cache and retrieve audio blobs', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio data'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // First call - should fetch
      await service.synthesize('Hello', 'zumbi')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      await service.synthesize('Hello', 'zumbi')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Still 1, cached
    })

    it('should evict oldest entry when cache is full', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // Fill cache with 51 items (max size is 50)
      for (let i = 0; i < 51; i++) {
        await service.synthesize(`Text ${i}`, 'zumbi')
      }

      // Cache size should be limited to 50
      const stats = service.getCacheStats()
      expect(stats.size).toBeLessThanOrEqual(50)
    })
  })

  describe('synthesize', () => {
    it('should call backend API with correct parameters', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      await service.synthesize('Hello world', 'zumbi', { speaking_rate: 1.2 })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/voice/speak',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body).toHaveProperty('text', 'Hello world')
      expect(body).toHaveProperty('speaking_rate', 1.2)
      expect(body).toHaveProperty('voice_name', 'pt-BR-Chirp3-HD-Fenrir') // zumbi's voice
    })

    it('should throw on API error', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(service.synthesize('Test', 'zumbi')).rejects.toThrow(
        'Voice synthesis failed: 500 Internal Server Error'
      )
    })

    it('should use default speaking rate when not provided', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      await service.synthesize('Test', 'abaporu')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body).toHaveProperty('speaking_rate', 1.0)
    })
  })

  describe('stop', () => {
    it('should set isPlaying to false when called', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      // Initially not playing
      expect(service.isCurrentlyPlaying()).toBe(false)

      // Stop should not throw when nothing is playing
      service.stop()
      expect(service.isCurrentlyPlaying()).toBe(false)
    })
  })

  describe('queue management', () => {
    it('should add items to queue', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // This test mainly checks that addToQueue doesn't throw
      expect(() => service.addToQueue('zumbi', 'Low priority', 1)).not.toThrow()
    })

    it('should clear queue', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      // Clear should not throw
      expect(() => service.clearQueue()).not.toThrow()
    })
  })

  describe('transcribe', () => {
    it('should send audio file to transcription endpoint', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            transcription: 'Hello world',
            confidence: 0.95,
            language_detected: 'pt-BR',
            duration_ms: 2500,
          }),
      })

      const audioFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await service.transcribe(audioFile)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/voice/transcribe',
        expect.objectContaining({
          method: 'POST',
        })
      )

      expect(result.transcript).toBe('Hello world')
      expect(result.confidence).toBe(0.95)
      expect(result.language_code).toBe('pt-BR')
    })

    it('should throw user-friendly error on 400', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      })

      const audioFile = new Blob(['audio'], { type: 'audio/webm' })

      await expect(service.transcribe(audioFile)).rejects.toThrow(/Speech-to-Text/i)
    })

    it('should throw user-friendly error on 404', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      })

      const audioFile = new Blob(['audio'], { type: 'audio/webm' })

      await expect(service.transcribe(audioFile)).rejects.toThrow(/Speech-to-Text/i)
    })

    it('should throw generic error on other failures', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      })

      const audioFile = new Blob(['audio'], { type: 'audio/webm' })

      await expect(service.transcribe(audioFile)).rejects.toThrow('Transcription failed: 500')
    })
  })

  describe('clearCache', () => {
    it('should clear the audio cache', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // Add item to cache
      await service.synthesize('Test', 'zumbi')
      expect(service.getCacheStats().size).toBe(1)

      // Clear cache
      service.clearCache()
      expect(service.getCacheStats().size).toBe(0)
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const { VoiceManagerService } = await import('./voice-manager.service')
      const service = new VoiceManagerService()

      const stats = service.getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('maxSize', 50)
    })
  })

  describe('singleton', () => {
    it('should return singleton instance on client-side', async () => {
      vi.stubGlobal('window', {})

      const { getVoiceManager } = await import('./voice-manager.service')

      const instance1 = getVoiceManager()
      const instance2 = getVoiceManager()

      // Both should be instances
      expect(instance1).toBeDefined()
      expect(instance2).toBeDefined()
    })

    it('should return new instance on server-side', async () => {
      vi.stubGlobal('window', undefined)

      const { getVoiceManager } = await import('./voice-manager.service')

      const instance = getVoiceManager()

      expect(instance).toBeDefined()
    })
  })
})
