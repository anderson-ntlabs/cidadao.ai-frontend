import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatSessionService } from './chat-session.service';
import type { ChatSession, ChatMessage } from '@/types/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockReturnValue('mock-uuid-123'),
});

describe('ChatSessionService', () => {
  let service: ChatSessionService;
  let mockSupabase: any;
  let mockFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChatSessionService();
    mockSupabase = (service as any).supabase;
    
    // Setup default mock chain
    mockFrom = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    
    // Make all methods return mockFrom for chaining
    Object.keys(mockFrom).forEach(method => {
      if (method === 'eq') {
        // eq needs special handling to allow multiple chaining
        mockFrom[method].mockImplementation(() => mockFrom);
      } else {
        mockFrom[method].mockReturnValue(mockFrom);
      }
    });
    
    mockSupabase.from = vi.fn().mockReturnValue(mockFrom);
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock date
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  describe('createSession', () => {
    const mockUser = { id: 'user-123' };
    const mockSession: ChatSession = {
      id: 'session-123',
      user_id: 'user-123',
      investigation_id: 'inv-123',
      agent_id: 'abaporu',
      messages: [],
      session_metadata: { test: true },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    } as ChatSession;

    it('should create session successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.single.mockResolvedValue({ data: mockSession, error: null });

      const result = await service.createSession({
        investigation_id: 'inv-123',
        agent_id: 'abaporu',
        metadata: { test: true },
      });

      expect(result).toEqual(mockSession);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        investigation_id: 'inv-123',
        agent_id: 'abaporu',
        messages: [],
        session_metadata: { test: true },
      });
      expect(mockFrom.select).toHaveBeenCalled();
      expect(mockFrom.single).toHaveBeenCalled();
    });

    it('should create session with defaults when optional fields not provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.single.mockResolvedValue({ data: mockSession, error: null });

      await service.createSession({
        agent_id: 'zumbi',
      });

      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        investigation_id: undefined,
        agent_id: 'zumbi',
        messages: [],
        session_metadata: {},
      });
    });

    it('should throw error when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(service.createSession({ agent_id: 'test' }))
        .rejects.toThrow('User not authenticated');
      
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await service.createSession({ agent_id: 'test' });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error creating chat session:',
        { message: 'DB error' }
      );
    });
  });

  describe('getSession', () => {
    const mockUser = { id: 'user-123' };
    const mockSession = { id: 'session-123', messages: [] };

    it('should fetch single session by id', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.single.mockResolvedValue({ data: mockSession, error: null });

      const result = await service.getSession('session-123');

      expect(result).toEqual(mockSession);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'session-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockFrom.single).toHaveBeenCalled();
    });

    it('should return null when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.getSession('session-123');

      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await service.getSession('session-123');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching chat session:',
        { message: 'Not found' }
      );
    });
  });

  describe('getUserSessions', () => {
    const mockUser = { id: 'user-123' };
    const mockSessions = [
      { id: '1', agent_id: 'abaporu' },
      { id: '2', agent_id: 'zumbi' },
    ];

    it('should fetch user sessions with default limit', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.limit.mockResolvedValue({ data: mockSessions, error: null });

      const result = await service.getUserSessions();

      expect(result).toEqual(mockSessions);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockFrom.limit).toHaveBeenCalledWith(10);
    });

    it('should fetch user sessions with custom limit', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.limit.mockResolvedValue({ data: mockSessions, error: null });

      await service.getUserSessions(20);

      expect(mockFrom.limit).toHaveBeenCalledWith(20);
    });

    it('should return empty array when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.getUserSessions();

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.limit.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await service.getUserSessions();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching chat sessions:',
        { message: 'DB error' }
      );
    });

    it('should return empty array when data is null', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.limit.mockResolvedValue({ data: null, error: null });

      const result = await service.getUserSessions();

      expect(result).toEqual([]);
    });
  });

  describe('getInvestigationSessions', () => {
    const mockUser = { id: 'user-123' };
    const mockSessions = [
      { id: '1', investigation_id: 'inv-123' },
      { id: '2', investigation_id: 'inv-123' },
    ];

    it('should fetch sessions for specific investigation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.order.mockResolvedValue({ data: mockSessions, error: null });

      const result = await service.getInvestigationSessions('inv-123');

      expect(result).toEqual(mockSessions);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('investigation_id', 'inv-123');
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.getInvestigationSessions('inv-123');

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await service.getInvestigationSessions('inv-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching investigation sessions:',
        { message: 'DB error' }
      );
    });
  });

  describe('addMessage', () => {
    const mockUser = { id: 'user-123' };
    const mockSession = {
      id: 'session-123',
      messages: [
        { id: 'msg-1', role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00.000Z' }
      ] as ChatMessage[]
    };

    it('should add message successfully', async () => {
      // First mock the getSession call
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } });
      
      // Create a separate chain for getSession call
      const getSessionChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
      };
      
      // Create a separate chain for update call  
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      
      // Mock from to return different chains for different calls
      mockSupabase.from
        .mockReturnValueOnce(getSessionChain) // First call for getSession
        .mockReturnValueOnce(updateChain); // Second call for update

      const newMessage = {
        role: 'assistant' as const,
        content: 'Hello! How can I help?',
      };

      const result = await service.addMessage('session-123', newMessage);

      expect(result).toBe(true);
      
      // Check getSession was called
      expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'chat_sessions');
      expect(getSessionChain.select).toHaveBeenCalledWith('*');
      expect(getSessionChain.eq).toHaveBeenNthCalledWith(1, 'id', 'session-123');
      expect(getSessionChain.eq).toHaveBeenNthCalledWith(2, 'user_id', 'user-123');
      
      // Check update was called
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'chat_sessions');
      expect(updateChain.update).toHaveBeenCalledWith({
        messages: [
          ...mockSession.messages,
          {
            id: 'mock-uuid-123',
            timestamp: '2024-01-01T00:00:00.000Z',
            role: 'assistant',
            content: 'Hello! How can I help?',
          }
        ],
        updated_at: '2024-01-01T00:00:00.000Z'
      });
      expect(updateChain.eq).toHaveBeenCalledWith('id', 'session-123');
    });

    it('should return false when session not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.addMessage('session-123', {
        role: 'user',
        content: 'Test',
      });

      expect(result).toBe(false);
      expect(mockFrom.update).not.toHaveBeenCalled();
    });

    it('should return false when update fails', async () => {
      // First mock the getSession call
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } });
      
      // Create a separate chain for getSession call
      const getSessionChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
      };
      
      // Create a separate chain for update call that fails
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      };
      
      // Mock from to return different chains for different calls
      mockSupabase.from
        .mockReturnValueOnce(getSessionChain) // First call for getSession
        .mockReturnValueOnce(updateChain); // Second call for update

      const result = await service.addMessage('session-123', {
        role: 'user',
        content: 'Test',
      });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error adding message:',
        { message: 'Update failed' }
      );
    });
  });

  describe('updateSessionMetadata', () => {
    const mockUser = { id: 'user-123' };

    it('should update metadata successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Override the last eq to return the final result
      let eqCallCount = 0;
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          // This is the final eq call in the chain
          return Promise.resolve({ error: null });
        }
        return mockFrom;
      });

      const metadata = { status: 'completed', score: 0.85 };
      const result = await service.updateSessionMetadata('session-123', metadata);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.update).toHaveBeenCalledWith({
        session_metadata: metadata,
        updated_at: '2024-01-01T00:00:00.000Z'
      });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'session-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should return false when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.updateSessionMetadata('session-123', {});

      expect(result).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return false when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Override the last eq to return an error
      let eqCallCount = 0;
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({ error: { message: 'Update failed' } });
        }
        return mockFrom;
      });

      const result = await service.updateSessionMetadata('session-123', {});

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error updating session metadata:',
        { message: 'Update failed' }
      );
    });
  });

  describe('deleteSession', () => {
    const mockUser = { id: 'user-123' };

    it('should delete session successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Override the last eq to return the final result
      let eqCallCount = 0;
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({ error: null });
        }
        return mockFrom;
      });

      const result = await service.deleteSession('session-123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_sessions');
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'session-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should return false when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await service.deleteSession('session-123');

      expect(result).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return false when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      // Override the last eq to return an error
      let eqCallCount = 0;
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({ error: { message: 'Delete failed' } });
        }
        return mockFrom;
      });

      const result = await service.deleteSession('session-123');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting chat session:',
        { message: 'Delete failed' }
      );
    });
  });
});