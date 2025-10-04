import { API_BASE_URL } from '@/lib/api/client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * SSE (Server-Sent Events) client for chat streaming
 *
 * Advantages over WebSocket:
 * - Simpler protocol (HTTP-based)
 * - Automatic reconnection built-in
 * - Better serverless compatibility (HuggingFace Spaces)
 * - Native browser support (EventSource API)
 *
 * Usage:
 * ```typescript
 * const sse = new ChatSSE({
 *   sessionId: 'session_123',
 *   onMessage: (chunk) => console.log(chunk),
 *   onComplete: (response) => console.log('Done!', response)
 * });
 *
 * await sse.sendMessage('Hello!');
 * ```
 */

export interface SSEConfig {
  sessionId: string;
  endpoint?: string; // Default: /api/v1/chat/stream
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface SSEHandlers {
  onMessage?: (chunk: string) => void;
  onComplete?: (response: ChatResponse) => void;
  onError?: (error: Error) => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

interface SSEStreamChunk {
  type: 'chunk' | 'complete' | 'error';
  data: any;
  timestamp?: string;
}

export class ChatSSE {
  private eventSource: EventSource | null = null;
  private config: Required<SSEConfig>;
  private handlers: SSEHandlers;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private accumulatedMessage: string = '';
  private currentResponse: Partial<ChatResponse> | null = null;
  private abortController: AbortController | null = null;

  constructor(config: SSEConfig, handlers: SSEHandlers) {
    this.config = {
      endpoint: '/api/v1/chat/stream',
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config,
    };
    this.handlers = handlers;
  }

  /**
   * Send a chat message and start SSE streaming
   */
  async sendMessage(message: string, context?: Record<string, any>): Promise<void> {
    const startTime = Date.now();

    // Reset state
    this.accumulatedMessage = '';
    this.currentResponse = null;
    this.reconnectAttempts = 0;

    // Track message
    trackChatMessage(this.config.sessionId, message, 'sse');

    // Prepare request payload
    const payload: ChatRequest = {
      message,
      session_id: this.config.sessionId,
      context,
    };

    try {
      // Build SSE URL with POST data as query params (SSE is GET-only)
      // Alternative: Use POST with fetch + ReadableStream
      await this.streamWithFetch(payload, startTime);
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error as Error;

      trackChatError(this.config.sessionId, err.message, duration);
      this.handlers.onError?.(err);
      this.updateConnectionStatus('error');

      // Attempt reconnection if enabled
      if (this.config.reconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect(() => this.sendMessage(message, context));
      }
    }
  }

  /**
   * Stream using fetch API with ReadableStream (better for POST)
   * This is the recommended approach for SSE with POST data
   */
  private async streamWithFetch(payload: ChatRequest, startTime: number): Promise<void> {
    this.updateConnectionStatus('connecting');
    this.abortController = new AbortController();

    const url = `${API_BASE_URL}${this.config.endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      this.updateConnectionStatus('connected');

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream completed
          this.handleStreamComplete(startTime);
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by \n\n)
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer

        for (const message of messages) {
          if (message.trim()) {
            this.processSSEMessage(message);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('[SSE] Stream aborted by user');
      } else {
        throw error;
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Process a single SSE message
   * Format: "data: {...}\n"
   */
  private processSSEMessage(message: string): void {
    try {
      // Extract data field from SSE format
      const dataMatch = message.match(/^data: (.+)$/m);
      if (!dataMatch) return;

      const chunk: SSEStreamChunk = JSON.parse(dataMatch[1]);

      switch (chunk.type) {
        case 'chunk':
          // Streaming chunk of the response
          const text = chunk.data.text || chunk.data.content || '';
          this.accumulatedMessage += text;
          this.handlers.onMessage?.(text);
          break;

        case 'complete':
          // Final response with metadata
          this.currentResponse = {
            session_id: chunk.data.session_id || this.config.sessionId,
            agent_id: chunk.data.agent_id || 'system',
            agent_name: chunk.data.agent_name || 'Sistema',
            message: this.accumulatedMessage,
            confidence: chunk.data.confidence || 0.8,
            suggested_actions: chunk.data.suggested_actions || [],
            metadata: chunk.data.metadata,
          };
          break;

        case 'error':
          throw new Error(chunk.data.message || 'Server error during streaming');
      }
    } catch (error) {
      console.error('[SSE] Failed to process message:', error);
      this.handlers.onError?.(error as Error);
    }
  }

  /**
   * Handle stream completion
   */
  private handleStreamComplete(startTime: number): void {
    const duration = Date.now() - startTime;

    if (this.currentResponse) {
      // Track success
      trackChatResponse(
        this.currentResponse.session_id!,
        this.currentResponse.message!,
        this.currentResponse.agent_id!,
        duration,
        'sse'
      );

      this.handlers.onComplete?.(this.currentResponse as ChatResponse);
    }

    this.updateConnectionStatus('disconnected');
    this.reconnectAttempts = 0; // Reset on successful completion
  }

  /**
   * Abort the current stream
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.updateConnectionStatus('disconnected');
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(retryFn: () => Promise<void>): void {
    if (!this.config.reconnect) return;

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[SSE] Max reconnection attempts reached');
      this.updateConnectionStatus('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.min(this.reconnectAttempts, 3);

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      retryFn().catch(error => {
        console.error('[SSE] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Update connection status and notify handler
   */
  private updateConnectionStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.handlers.onConnectionStatus?.(status);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.abort();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Check if currently streaming
   */
  isActive(): boolean {
    return this.abortController !== null;
  }
}

/**
 * Simple function-based SSE streaming (alternative to class)
 * Useful for one-off requests without managing instances
 */
export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (text: string) => void,
  onComplete?: (response: ChatResponse) => void,
  onError?: (error: Error) => void
): Promise<void> {
  const sse = new ChatSSE(
    { sessionId: request.session_id || `session_${Date.now()}` },
    {
      onMessage: onChunk,
      onComplete,
      onError,
    }
  );

  try {
    await sse.sendMessage(request.message, request.context);
  } finally {
    sse.dispose();
  }
}
