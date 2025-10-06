import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatWebSocket, getChatWebSocket, closeChatWebSocket } from './chat-websocket';
import type { WebSocketConfig, WebSocketEventHandler } from './chat-websocket';
import type { WSMessage } from '@/types/chat';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
    // Simulate connection after a delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }
  
  send = vi.fn((data: string) => {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  });
  
  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  });
  
  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  
  simulateError() {
    this.onerror?.(new Event('error'));
  }
  
  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: code === 1000 }));
  }
}

// Replace global WebSocket
(global as any).WebSocket = MockWebSocket;

// Mock timers
vi.useFakeTimers();

// Mock WS_BASE_URL
vi.mock('@/lib/api/client', () => ({
  WS_BASE_URL: 'ws://localhost:8000',
}));

describe('ChatWebSocket', () => {
  let config: WebSocketConfig;
  let handlers: WebSocketEventHandler;
  let chatWs: ChatWebSocket;
  let mockWebSocket: MockWebSocket;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    config = {
      sessionId: 'test-session',
      token: 'test-token',
    };
    
    handlers = {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
      onChat: vi.fn(),
      onTyping: vi.fn(),
      onConnectionStatus: vi.fn(),
    };
    
    // Capture created WebSocket instances
    const originalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = vi.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url);
      return mockWebSocket;
    });
    (global as any).WebSocket.CONNECTING = MockWebSocket.CONNECTING;
    (global as any).WebSocket.OPEN = MockWebSocket.OPEN;
    (global as any).WebSocket.CLOSING = MockWebSocket.CLOSING;
    (global as any).WebSocket.CLOSED = MockWebSocket.CLOSED;
  });
  
  afterEach(() => {
    if (chatWs) {
      chatWs.disconnect();
    }
    vi.clearAllTimers();
  });
  
  describe('constructor', () => {
    it('should create instance with default config', () => {
      chatWs = new ChatWebSocket(config, handlers);
      expect(chatWs).toBeInstanceOf(ChatWebSocket);
    });
    
    it('should merge custom config with defaults', () => {
      const customConfig: WebSocketConfig = {
        sessionId: 'test-session',
        reconnect: false,
        reconnectInterval: 10000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 60000,
      };
      
      chatWs = new ChatWebSocket(customConfig, handlers);
      expect(chatWs).toBeInstanceOf(ChatWebSocket);
    });
  });
  
  describe('connect', () => {
    it('should establish WebSocket connection', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();
      
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('connecting');
      expect((global as any).WebSocket).toHaveBeenCalledWith(
        'ws://localhost:8000/api/v1/ws/chat/test-session?token=test-token'
      );
      
      // Wait for connection
      await vi.advanceTimersByTimeAsync(10);
      
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('connected');
      expect(handlers.onOpen).toHaveBeenCalled();
    });
    
    it('should connect without token', async () => {
      const noTokenConfig = { sessionId: 'test-session' };
      chatWs = new ChatWebSocket(noTokenConfig, handlers);
      chatWs.connect();
      
      expect((global as any).WebSocket).toHaveBeenCalledWith(
        'ws://localhost:8000/api/v1/ws/chat/test-session'
      );
    });
    
    it('should not connect if already connected', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();
      
      await vi.advanceTimersByTimeAsync(10);
      
      vi.clearAllMocks();
      chatWs.connect();
      
      expect((global as any).WebSocket).not.toHaveBeenCalled();
    });
    
    it('should handle connection error', () => {
      // Mock WebSocket constructor to throw
      (global as any).WebSocket = vi.fn(() => {
        throw new Error('Connection failed');
      });
      (global as any).WebSocket.OPEN = MockWebSocket.OPEN;
      
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();
      
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('error');
    });
  });
  
  describe('message handling', () => {
    beforeEach(async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();
      await vi.advanceTimersByTimeAsync(10);
    });
    
    it('should handle chat messages', () => {
      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello', role: 'assistant' },
      };
      
      mockWebSocket.simulateMessage(message);
      
      expect(handlers.onMessage).toHaveBeenCalledWith(message);
      expect(handlers.onChat).toHaveBeenCalledWith(message.data);
    });
    
    it('should handle typing messages', () => {
      const message: WSMessage = {
        type: 'typing',
        data: { isTyping: true },
      };
      
      mockWebSocket.simulateMessage(message);
      
      expect(handlers.onTyping).toHaveBeenCalledWith(true);
    });
    
    it('should handle error messages', () => {
      const message: WSMessage = {
        type: 'error',
        data: { error: 'Something went wrong' },
      };
      
      mockWebSocket.simulateMessage(message);
      
      expect(handlers.onMessage).toHaveBeenCalledWith(message);
    });
    
    it('should handle connection messages', () => {
      const message: WSMessage = {
        type: 'connection',
        data: { sessionId: 'test-session' },
      };
      
      mockWebSocket.simulateMessage(message);
      
      expect(handlers.onMessage).toHaveBeenCalledWith(message);
    });
    
    it('should handle pong messages', () => {
      const message: WSMessage = {
        type: 'pong',
      };
      
      mockWebSocket.simulateMessage(message);
      
      expect(handlers.onMessage).toHaveBeenCalledWith(message);
    });
    
    it('should handle malformed messages', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWebSocket.onmessage?.(new MessageEvent('message', { data: 'invalid json' }));
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse WebSocket message:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('sending messages', () => {
    beforeEach(async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();
      await vi.advanceTimersByTimeAsync(10);
    });
    
    it('should send messages when connected', () => {
      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello' },
      };
      
      chatWs.send(message);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });
    
    it('should queue messages when not connected', () => {
      mockWebSocket.readyState = MockWebSocket.CLOSED;
      
      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello' },
      };
      
      chatWs.send(message);
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
    
    it('should send chat messages', () => {
      chatWs.sendChatMessage('Hello', { key: 'value' });
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"content":"Hello"')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"session_id":"test-session"')
      );
    });
    
    it('should subscribe to investigations', () => {
      chatWs.subscribeToInvestigation('inv-123');
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          data: { investigation_id: 'inv-123' },
        })
      );
    });
    
    it('should unsubscribe from investigations', () => {
      chatWs.unsubscribeFromInvestigation('inv-123');
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'unsubscribe',
          data: { investigation_id: 'inv-123' },
        })
      );
    });
  });
  
  describe('heartbeat', () => {
    it('should send ping messages periodically', async () => {
      const customConfig = { ...config, heartbeatInterval: 1000 };
      chatWs = new ChatWebSocket(customConfig, handlers);
      chatWs.connect();
      
      await vi.advanceTimersByTimeAsync(10);
      vi.clearAllMocks();
      
      // Advance to trigger heartbeat
      await vi.advanceTimersByTimeAsync(1000);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'ping' })
      );
      
      // Advance again for another heartbeat
      await vi.advanceTimersByTimeAsync(1000);
      
      expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
    });
    
    it.skip('should stop heartbeat on disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();

      await vi.runOnlyPendingTimersAsync();

      chatWs.disconnect();
      vi.clearAllMocks();

      // Advance time - no heartbeat should be sent
      await vi.advanceTimersByTimeAsync(30000);

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });
  
  describe('reconnection', () => {
    it.skip('should reconnect on unexpected close', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();

      await vi.runOnlyPendingTimersAsync();
      vi.clearAllMocks();

      // Simulate unexpected close
      mockWebSocket.simulateClose(1006, 'Abnormal closure');

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('disconnected');

      // Advance time for reconnect
      await vi.advanceTimersByTimeAsync(5000);

      expect((global as any).WebSocket).toHaveBeenCalled();
    });

    it.skip('should not reconnect on clean close', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();

      await vi.runOnlyPendingTimersAsync();
      vi.clearAllMocks();

      // Simulate clean close
      mockWebSocket.simulateClose(1000, 'Normal closure');

      await vi.advanceTimersByTimeAsync(5000);

      expect((global as any).WebSocket).not.toHaveBeenCalled();
    });
    
  });
  
  describe('disconnect', () => {
    it.skip('should close connection and stop reconnection', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();

      await vi.runOnlyPendingTimersAsync();

      chatWs.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect');
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('disconnected');

      // Should not reconnect after manual disconnect
      vi.clearAllMocks();
      await vi.advanceTimersByTimeAsync(5000);

      expect((global as any).WebSocket).not.toHaveBeenCalled();
    });
  });
  
  describe('state management', () => {
    it.skip('should report correct connection state', async () => {
      chatWs = new ChatWebSocket(config, handlers);

      expect(chatWs.getState()).toBe('disconnected');
      expect(chatWs.isConnected()).toBe(false);

      chatWs.connect();
      mockWebSocket.readyState = MockWebSocket.CONNECTING;
      expect(chatWs.getState()).toBe('connecting');
      expect(chatWs.isConnected()).toBe(false);

      await vi.runOnlyPendingTimersAsync();

      expect(chatWs.getState()).toBe('connected');
      expect(chatWs.isConnected()).toBe(true);

      mockWebSocket.readyState = MockWebSocket.CLOSING;
      expect(chatWs.getState()).toBe('disconnected');
      expect(chatWs.isConnected()).toBe(false);

      mockWebSocket.readyState = MockWebSocket.CLOSED;
      expect(chatWs.getState()).toBe('disconnected');
      expect(chatWs.isConnected()).toBe(false);
    });
  });
  
  describe('message queue', () => {
    it.skip('should queue messages when not connected', async () => {
      chatWs = new ChatWebSocket(config, handlers);

      // Send messages before connecting
      const message1: WSMessage = { type: 'chat', data: { content: 'Message 1' } };
      const message2: WSMessage = { type: 'chat', data: { content: 'Message 2' } };

      chatWs.send(message1);
      chatWs.send(message2);

      // Connect and wait for connection
      chatWs.connect();
      await vi.runOnlyPendingTimersAsync();

      // Both messages should be sent after connection
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message1));
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message2));
    });
  });
  
  describe('error handling', () => {
    it.skip('should handle WebSocket errors', async () => {
      chatWs = new ChatWebSocket(config, handlers);
      chatWs.connect();

      await vi.runOnlyPendingTimersAsync();

      mockWebSocket.simulateError();

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('error');
      expect(handlers.onError).toHaveBeenCalled();
    });
  });
});

describe('singleton management', () => {
  let handlers: WebSocketEventHandler;
  
  beforeEach(() => {
    handlers = {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
    };
    
    // Clear singleton
    closeChatWebSocket();
  });
  
  afterEach(() => {
    closeChatWebSocket();
  });
  
  it('should create singleton instance', () => {
    const config = { sessionId: 'test-session' };
    
    const instance1 = getChatWebSocket(config, handlers);
    const instance2 = getChatWebSocket(config, handlers);
    
    expect(instance1).toBe(instance2);
  });
  
  it('should close and clear singleton', () => {
    const config = { sessionId: 'test-session' };
    
    const instance = getChatWebSocket(config, handlers);
    const disconnectSpy = vi.spyOn(instance, 'disconnect');
    
    closeChatWebSocket();
    
    expect(disconnectSpy).toHaveBeenCalled();
    
    // New instance should be different
    const newInstance = getChatWebSocket(config, handlers);
    expect(newInstance).not.toBe(instance);
  });
});