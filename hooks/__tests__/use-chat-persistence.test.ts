/**
 * Tests for useChatPersistence hook
 *
 * The hook was refactored (2025-12-10): the backend (Railway PostgreSQL)
 * persists messages during streaming, so the hook no longer talks to any
 * session service. `initSession` mints a client-side UUID and memoizes it;
 * `saveUserMessage` / `saveAssistantMessage` are intentional no-ops kept for
 * API compatibility. These tests validate that current contract.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChatPersistence } from '../use-chat-persistence'

// Deterministic UUID so initSession is assertable
const mockUUID = '12345678-1234-1234-1234-123456789012'
const randomUUID = vi.fn(() => mockUUID)
Object.defineProperty(global, 'crypto', {
  value: { randomUUID },
  configurable: true,
})

describe('useChatPersistence', () => {
  const defaultOptions = {
    agentId: 'agent-123',
    agentName: 'Test Agent',
    isKidsMode: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with null session ID and expose the API', () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      expect(result.current.sessionId).toBe(null)
      expect(typeof result.current.initSession).toBe('function')
      expect(typeof result.current.saveUserMessage).toBe('function')
      expect(typeof result.current.saveAssistantMessage).toBe('function')
    })

    it('should accept kids mode option', () => {
      const { result } = renderHook(() =>
        useChatPersistence({ ...defaultOptions, isKidsMode: true, childName: 'João' })
      )

      expect(result.current.sessionId).toBe(null)
    })
  })

  describe('initSession', () => {
    it('should mint a client-side UUID (no backend call)', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let sessionId = ''
      await act(async () => {
        sessionId = await result.current.initSession()
      })

      expect(sessionId).toBe(mockUUID)
      expect(randomUUID).toHaveBeenCalledTimes(1)
    })

    it('should mint a session in kids mode too', async () => {
      const { result } = renderHook(() =>
        useChatPersistence({ ...defaultOptions, isKidsMode: true, childName: 'Maria' })
      )

      let sessionId = ''
      await act(async () => {
        sessionId = await result.current.initSession()
      })

      expect(sessionId).toBe(mockUUID)
    })

    it('should memoize the session id and not regenerate on repeat calls', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let first = ''
      let second = ''
      await act(async () => {
        first = await result.current.initSession()
      })
      await act(async () => {
        second = await result.current.initSession()
      })

      expect(second).toBe(first)
      expect(randomUUID).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveUserMessage (no-op, backend persists)', () => {
    it('should resolve without throwing and without persisting', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      await expect(
        result.current.saveUserMessage('Hello, how can I help?')
      ).resolves.toBeUndefined()
    })

    it('should be safe to call before initSession', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await expect(result.current.saveUserMessage('Test message')).resolves.toBeUndefined()
    })

    it('should handle empty and very long content', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await expect(result.current.saveUserMessage('')).resolves.toBeUndefined()
      await expect(result.current.saveUserMessage('a'.repeat(10000))).resolves.toBeUndefined()
    })
  })

  describe('saveAssistantMessage (no-op, backend persists)', () => {
    it('should resolve without throwing and without persisting', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      await expect(
        result.current.saveAssistantMessage('I can help you with that.')
      ).resolves.toBeUndefined()
    })

    it('should be safe to call before initSession', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await expect(
        result.current.saveAssistantMessage('Assistant response')
      ).resolves.toBeUndefined()
    })

    it('should be a no-op in kids mode (with or without child name)', async () => {
      const { result } = renderHook(() =>
        useChatPersistence({ ...defaultOptions, isKidsMode: true, childName: 'Ana' })
      )

      await expect(result.current.saveAssistantMessage('Kids response')).resolves.toBeUndefined()
    })
  })

  describe('conversation flow', () => {
    it('should run init + user + assistant turns without error and keep one session', async () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let sessionId = ''
      await act(async () => {
        sessionId = await result.current.initSession()
        await result.current.saveUserMessage('What is transparency?')
        await result.current.saveAssistantMessage('Government data made accessible.')
        await result.current.saveUserMessage('Tell me more')
      })

      expect(sessionId).toBe(mockUUID)
      expect(randomUUID).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle null child name without error', async () => {
      const { result } = renderHook(() =>
        useChatPersistence({ ...defaultOptions, isKidsMode: true, childName: null })
      )

      let sessionId = ''
      await act(async () => {
        sessionId = await result.current.initSession()
      })

      expect(sessionId).toBe(mockUUID)
    })
  })
})
