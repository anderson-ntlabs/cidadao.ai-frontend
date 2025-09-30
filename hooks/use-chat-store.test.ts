import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStoreActions } from './use-chat-store';
import { useChatStore } from '@/store/chat-store';

// Mock the chat store
vi.mock('@/store/chat-store');

describe('useChatStoreActions', () => {
  const mockStore = {
    messages: [],
    session: null,
    connectionStatus: 'disconnected',
    isTyping: false,
    agentTyping: false,
    error: null,
    isLoading: false,
    initializeChat: vi.fn(),
    sendMessage: vi.fn(),
    sendStreamingMessage: vi.fn(),
    loadChatHistory: vi.fn(),
    clearChat: vi.fn(),
    connectWebSocket: vi.fn(),
    disconnectWebSocket: vi.fn(),
    setTyping: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChatStore).mockReturnValue(mockStore as any);
  });

  it('should return all store actions and state', () => {
    const { result } = renderHook(() => useChatStoreActions());

    // Check state properties
    expect(result.current.messages).toEqual([]);
    expect(result.current.session).toBeNull();
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.isTyping).toBe(false);
    expect(result.current.agentTyping).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);

    // Check action functions
    expect(typeof result.current.initializeChat).toBe('function');
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.sendStreamingMessage).toBe('function');
    expect(typeof result.current.loadChatHistory).toBe('function');
    expect(typeof result.current.clearChat).toBe('function');
    expect(typeof result.current.connectWebSocket).toBe('function');
    expect(typeof result.current.disconnectWebSocket).toBe('function');
    expect(typeof result.current.setTyping).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should call store actions when hook actions are called', async () => {
    const { result } = renderHook(() => useChatStoreActions());

    // Test initializeChat
    await act(async () => {
      await result.current.initializeChat('session123');
    });
    expect(mockStore.initializeChat).toHaveBeenCalledWith('session123');

    // Test sendMessage
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    expect(mockStore.sendMessage).toHaveBeenCalledWith('Hello');

    // Test sendStreamingMessage
    act(() => {
      result.current.sendStreamingMessage('Streaming message');
    });
    expect(mockStore.sendStreamingMessage).toHaveBeenCalledWith('Streaming message');

    // Test setTyping
    act(() => {
      result.current.setTyping(true);
    });
    expect(mockStore.setTyping).toHaveBeenCalledWith(true);

    // Test clearError
    act(() => {
      result.current.clearError();
    });
    expect(mockStore.clearError).toHaveBeenCalled();
  });

  it('should update when store state changes', () => {
    const { result, rerender } = renderHook(() => useChatStoreActions());

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
    const { result } = renderHook(() => useChatStoreActions());

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
    const { result } = renderHook(() => useChatStoreActions());

    act(() => {
      result.current.setError('Network error');
    });
    expect(mockStore.setError).toHaveBeenCalledWith('Network error');

    act(() => {
      result.current.clearError();
    });
    expect(mockStore.clearError).toHaveBeenCalled();
  });
});