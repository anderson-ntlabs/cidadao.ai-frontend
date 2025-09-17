import { WS_BASE_URL } from '@/lib/api/client';
import type { WSMessage, WSChatMessage, WSChatResponse, WSMessageType } from '@/types/chat';

export interface WebSocketConfig {
  sessionId: string;
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export type WebSocketEventHandler = {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WSMessage) => void;
  onChat?: (data: WSChatResponse['data']) => void;
  onTyping?: (isTyping: boolean) => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
};

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig & {
    reconnect: boolean;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
  };
  private handlers: WebSocketEventHandler;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WSMessage[] = [];
  private isConnecting = false;

  constructor(config: WebSocketConfig, handlers: WebSocketEventHandler) {
    this.config = {
      reconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config,
    };
    this.handlers = handlers;
  }

  // Connect to WebSocket
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.isConnecting = true;
    this.updateConnectionStatus('connecting');

    try {
      // Build WebSocket URL with query parameters
      const wsUrl = new URL(`${WS_BASE_URL}/api/v1/ws/chat/${this.config.sessionId}`);
      if (this.config.token) {
        wsUrl.searchParams.append('token', this.config.token);
      }

      this.ws = new WebSocket(wsUrl.toString());
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.updateConnectionStatus('error');
      this.scheduleReconnect();
    }
  }

  // Set up WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.updateConnectionStatus('connected');
      this.startHeartbeat();
      this.flushMessageQueue();
      this.handlers.onOpen?.();
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.isConnecting = false;
      this.updateConnectionStatus('disconnected');
      this.stopHeartbeat();
      this.handlers.onClose?.(event);
      
      if (this.config.reconnect && !event.wasClean) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.updateConnectionStatus('error');
      this.handlers.onError?.(error);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  // Handle incoming messages
  private handleMessage(message: WSMessage): void {
    this.handlers.onMessage?.(message);

    switch (message.type) {
      case 'connection':
        console.log('Connection confirmed:', message.data);
        break;
      
      case 'chat':
      case 'chat_complete':
        this.handlers.onChat?.(message.data);
        break;
      
      case 'typing':
        this.handlers.onTyping?.(message.data?.isTyping || false);
        break;
      
      case 'error':
        console.error('Server error:', message.data);
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      case 'subscribed':
      case 'unsubscribed':
        console.log(`${message.type}:`, message.data);
        break;
      
      case 'investigation_update':
        // Handle investigation updates if needed
        break;
    }
  }

  // Send a message
  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      console.log('WebSocket not ready, message queued');
      
      // Try to reconnect if disconnected
      if (!this.isConnecting) {
        this.connect();
      }
    }
  }

  // Send a chat message
  sendChatMessage(content: string, context?: Record<string, any>): void {
    const message: WSChatMessage = {
      type: 'chat',
      data: {
        content,
        session_id: this.config.sessionId,
        context,
      },
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    this.send(message);
  }

  // Subscribe to investigation updates
  subscribeToInvestigation(investigationId: string): void {
    this.send({
      type: 'subscribe',
      data: { investigation_id: investigationId },
    });
  }

  // Unsubscribe from investigation updates
  unsubscribeFromInvestigation(investigationId: string): void {
    this.send({
      type: 'unsubscribe',
      data: { investigation_id: investigationId },
    });
  }

  // Disconnect WebSocket
  disconnect(): void {
    this.config.reconnect = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.updateConnectionStatus('disconnected');
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (!this.config.reconnect) return;
    
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionStatus('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.min(this.reconnectAttempts, 3);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Update connection status
  private updateConnectionStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.handlers.onConnectionStatus?.(status);
  }

  // Get connection state
  getState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export a singleton instance manager
let chatWebSocketInstance: ChatWebSocket | null = null;

export function getChatWebSocket(
  config: WebSocketConfig,
  handlers: WebSocketEventHandler
): ChatWebSocket {
  if (!chatWebSocketInstance) {
    chatWebSocketInstance = new ChatWebSocket(config, handlers);
  }
  return chatWebSocketInstance;
}

export function closeChatWebSocket(): void {
  if (chatWebSocketInstance) {
    chatWebSocketInstance.disconnect();
    chatWebSocketInstance = null;
  }
}