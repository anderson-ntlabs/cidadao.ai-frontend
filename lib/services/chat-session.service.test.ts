/**
 * Chat Session Service Tests
 *
 * The service is a thin wrapper over the backend chat API (Railway
 * PostgreSQL); it no longer talks to Supabase directly and only exposes
 * getSession / getUserSessions / deleteSession. These tests mock chatService
 * and validate the pass-through + error-handling contract.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api/chat.service', () => ({
  chatService: {
    getSession: vi.fn(),
    getUserSessions: vi.fn(),
    deleteSession: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}))

import { ChatSessionService, chatSessionService } from './chat-session.service'
import { chatService } from '@/lib/api/chat.service'

describe('ChatSessionService', () => {
  let service: ChatSessionService

  beforeEach(() => {
    service = new ChatSessionService()
    vi.clearAllMocks()
  })

  describe('getSession', () => {
    it('should return the session from the backend', async () => {
      const session = { session_id: 'test-session', message_count: 2 } as any
      vi.mocked(chatService.getSession).mockResolvedValue(session)

      const result = await service.getSession('test-session')

      expect(result).toEqual(session)
      expect(chatService.getSession).toHaveBeenCalledWith('test-session')
    })

    it('should return null when the session is not found', async () => {
      vi.mocked(chatService.getSession).mockResolvedValue(null)

      expect(await service.getSession('missing')).toBeNull()
    })

    it('should return null when the backend throws', async () => {
      vi.mocked(chatService.getSession).mockRejectedValue(new Error('network error'))

      expect(await service.getSession('test-session')).toBeNull()
    })
  })

  describe('getUserSessions', () => {
    it('should return the sessions list from the backend', async () => {
      const sessions = [{ session_id: 'session-1' }, { session_id: 'session-2' }] as any
      vi.mocked(chatService.getUserSessions).mockResolvedValue(sessions)

      const result = await service.getUserSessions()

      expect(result).toEqual(sessions)
    })

    it('should forward pagination arguments', async () => {
      vi.mocked(chatService.getUserSessions).mockResolvedValue([])

      await service.getUserSessions(10, 20)

      expect(chatService.getUserSessions).toHaveBeenCalledWith(10, 20)
    })

    it('should return an empty array when the backend throws', async () => {
      vi.mocked(chatService.getUserSessions).mockRejectedValue(new Error('network error'))

      expect(await service.getUserSessions()).toEqual([])
    })
  })

  describe('deleteSession', () => {
    it('should return true when the backend confirms deletion', async () => {
      vi.mocked(chatService.deleteSession).mockResolvedValue(true)

      expect(await service.deleteSession('test-session')).toBe(true)
      expect(chatService.deleteSession).toHaveBeenCalledWith('test-session')
    })

    it('should return false when the backend reports failure', async () => {
      vi.mocked(chatService.deleteSession).mockResolvedValue(false)

      expect(await service.deleteSession('test-session')).toBe(false)
    })

    it('should return false when the backend throws', async () => {
      vi.mocked(chatService.deleteSession).mockRejectedValue(new Error('network error'))

      expect(await service.deleteSession('test-session')).toBe(false)
    })
  })

  describe('chatSessionService singleton', () => {
    it('should be an instance of ChatSessionService', () => {
      expect(chatSessionService).toBeInstanceOf(ChatSessionService)
    })
  })
})
