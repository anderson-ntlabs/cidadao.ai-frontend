import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Supabase BEFORE any imports that use it
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Mock the chat store
vi.mock('@/store/chat-store');

import { useChat } from './use-chat-store';
import { useChatStore } from '@/store/chat-store';

describe('useChat', () => {
  const mockStore = {
    messages: [],
    session: null,
    connectionStatus: 'disconnected',
    isTyping: false,
    agentTyping: false,
    activeAgents: [],
    suggestedActions: [],
    currentInvestigation: null,
    error: null,
    isLoading: false,
    initializeChat: vi.fn(),
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
    connectWebSocket: vi.fn(),
    disconnectWebSocket: vi.fn(),
    setTyping: vi.fn(),
    clearError: vi.fn(),
    loadMoreMessages: vi.fn(),
    subscribeToInvestigation: vi.fn(),
    unsubscribeFromInvestigation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChatStore).mockReturnValue(mockStore as any);
  });

  it('should return all store actions and state', () => {
    const { result } = renderHook(() => useChat());

    // Check state properties
    expect(result.current.messages).toEqual([]);
    expect(result.current.session).toBeNull();
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.isTyping).toBe(false);
    expect(result.current.agentTyping).toBe(false);
    expect(result.current.activeAgents).toEqual([]);
    expect(result.current.suggestedActions).toEqual([]);
    expect(result.current.currentInvestigation).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.canSendMessage).toBe(true);
    expect(typeof result.current.connectionStatusText).toBe('string');

    // Check action functions (only those exposed by useChat)
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.handleQuickAction).toBe('function');
    expect(typeof result.current.retryMessage).toBe('function');
    expect(typeof result.current.clearChat).toBe('function');
    expect(typeof result.current.connectWebSocket).toBe('function');
    expect(typeof result.current.disconnectWebSocket).toBe('function');
    expect(typeof result.current.setTyping).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.loadMoreMessages).toBe('function');
    expect(typeof result.current.subscribeToInvestigation).toBe('function');
    expect(typeof result.current.unsubscribeFromInvestigation).toBe('function');
  });

  it('should call store actions when hook actions are called', async () => {
    const { result } = renderHook(() => useChat());

    // Test sendMessage (calls store.sendMessage with false for streaming)
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    expect(mockStore.sendMessage).toHaveBeenCalledWith('Hello', false);

    // Test handleQuickAction (calls sendMessage internally)
    await act(async () => {
      await result.current.handleQuickAction('Quick action');
    });
    expect(mockStore.sendMessage).toHaveBeenCalled();

    // Test setTyping (passes through to store)
    act(() => {
      result.current.setTyping(true);
    });
    expect(mockStore.setTyping).toHaveBeenCalledWith(true);

    // Test clearError (passes through to store)
    act(() => {
      result.current.clearError();
    });
    expect(mockStore.clearError).toHaveBeenCalled();

    // Test clearChat (passes through to store)
    act(() => {
      result.current.clearChat();
    });
    expect(mockStore.clearChat).toHaveBeenCalled();
  });

  it('should update when store state changes', () => {
    const { result, rerender } = renderHook(() => useChat());

    expect(result.current.isLoading).toBe(false);

    // Update mock store state
    vi.mocked(useChatStore).mockReturnValue({
      ...mockStore,
      isLoading: true,
      error: 'Test error',
    } as any);

    rerender();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('Test error');
  });

  it('should handle WebSocket actions', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.connectWebSocket();
    });
    expect(mockStore.connectWebSocket).toHaveBeenCalled();

    act(() => {
      result.current.disconnectWebSocket();
    });
    expect(mockStore.disconnectWebSocket).toHaveBeenCalled();
  });

  it('should handle error states', () => {
    const { result } = renderHook(() => useChat());

    // useChat doesn't expose setError, only clearError
    // Test that error from store is exposed
    expect(result.current.error).toBeNull();

    // Test clearError action
    act(() => {
      result.current.clearError();
    });
    expect(mockStore.clearError).toHaveBeenCalled();
  });
});