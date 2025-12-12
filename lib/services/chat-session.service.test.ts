/**
 * Chat Session Service Tests
 *
 * Tests for Supabase chat session management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist mock to avoid initialization order issues
const mockSupabaseClient = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
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

describe('ChatSessionService', () => {
  let service: ChatSessionService

  beforeEach(() => {
    service = new ChatSessionService()
    vi.clearAllMocks()

    // Reset mock chain
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
  })

  describe('createSession', () => {
    it('should return null when no authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.createSession({
        session_id: 'test-session',
        agent_id: 'abaporu',
      })

      expect(result).toBeNull()
    })

    it('should create session when user is authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSession = {
        id: 1,
        session_id: 'test-session',
        user_id: 'user-123',
        agent_id: 'abaporu',
        messages: [],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.createSession({
        session_id: 'test-session',
        agent_id: 'abaporu',
      })

      expect(result).toEqual(mockSession)
    })

    it('should return null on database error', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.createSession({
        session_id: 'test-session',
        agent_id: 'abaporu',
      })

      expect(result).toBeNull()
    })

    it('should handle exception gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'))

      const result = await service.createSession({
        session_id: 'test-session',
        agent_id: 'abaporu',
      })

      expect(result).toBeNull()
    })
  })

  describe('getSession', () => {
    it('should return null when no authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.getSession('test-session')

      expect(result).toBeNull()
    })

    it('should return session when found', async () => {
      const mockUser = { id: 'user-123' }
      const mockSession = {
        id: 1,
        session_id: 'test-session',
        messages: [{ id: 'msg-1', content: 'Hello' }],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.getSession('test-session')

      expect(result).toEqual(mockSession)
    })

    it('should return null on database error', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.getSession('test-session')

      expect(result).toBeNull()
    })
  })

  describe('getUserSessions', () => {
    it('should return empty array when no authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.getUserSessions()

      expect(result).toEqual([])
    })

    it('should return sessions array', async () => {
      const mockUser = { id: 'user-123' }
      const mockSessions = [
        { id: 1, session_id: 'session-1' },
        { id: 2, session_id: 'session-2' },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.getUserSessions()

      expect(result).toEqual(mockSessions)
    })

    it('should support pagination', async () => {
      const mockUser = { id: 'user-123' }
      const mockSessions = [{ id: 3, session_id: 'session-3' }]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const rangeMock = vi.fn().mockResolvedValue({ data: mockSessions, error: null })
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: rangeMock,
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.getUserSessions(10, 20)

      expect(rangeMock).toHaveBeenCalledWith(20, 29)
      expect(result).toEqual(mockSessions)
    })

    it('should return empty array on error', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.getUserSessions()

      expect(result).toEqual([])
    })
  })

  describe('updateSession', () => {
    it('should return false when no authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.updateSession('test-session', { agent_id: 'new-agent' })

      expect(result).toBe(false)
    })

    it('should return true on successful update', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Need double eq() because the service chains .eq().eq()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockChain = {
        update: vi.fn().mockReturnValue({ eq: mockEq1 }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.updateSession('test-session', { agent_id: 'new-agent' })

      expect(result).toBe(true)
    })

    it('should return false on database error', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.updateSession('test-session', { agent_id: 'new-agent' })

      expect(result).toBe(false)
    })
  })

  describe('deleteSession', () => {
    it('should return false when no authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.deleteSession('test-session')

      expect(result).toBe(false)
    })

    it('should return true on successful deletion', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Need double eq() because the service chains .eq().eq()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockChain = {
        delete: vi.fn().mockReturnValue({ eq: mockEq1 }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.deleteSession('test-session')

      expect(result).toBe(true)
    })

    it('should return false on database error', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await service.deleteSession('test-session')

      expect(result).toBe(false)
    })
  })

  describe('addMessage', () => {
    it('should return false when session not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await service.addMessage('non-existent-session', {
        role: 'user',
        content: 'Hello',
        agent_id: 'abaporu',
        agent_name: 'Abaporu',
      })

      expect(result).toBe(false)
    })
  })

  describe('chatSessionService singleton', () => {
    it('should be an instance of ChatSessionService', () => {
      expect(chatSessionService).toBeInstanceOf(ChatSessionService)
    })
  })
})
