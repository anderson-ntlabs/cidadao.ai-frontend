import { ChatSSE, streamChatMessage } from '@/lib/sse/chat-sse';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * SSE-based chat adapter for real-time streaming responses
 *
 * This adapter uses Server-Sent Events (SSE) instead of WebSocket,
 * providing better compatibility with serverless environments like
 * HuggingFace Spaces.
 *
 * Features:
 * - Automatic reconnection on failure
 * - Progressive message streaming
 * - Lower latency than polling
 * - Better UX with real-time updates
 *
 * Usage:
 * ```typescript
 * const response = await sendSSEMessage(request, {
 *   onChunk: (text) => console.log('Received:', text)
 * });
 * ```
 */

export interface SSEMessageOptions {
  onChunk?: (text: string) => void;
  onProgress?: (accumulated: string) => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

/**
 * Send a chat message using SSE streaming
 */
export async function sendSSEMessage(
  request: ChatRequest,
  options: SSEMessageOptions = {}
): Promise<ChatResponse> {
  const startTime = Date.now();
  const sessionId = request.session_id || `session_${Date.now()}`;

  // Track message attempt
  trackChatMessage(sessionId, request.message, 'sse');

  return new Promise((resolve, reject) => {
    let accumulatedText = '';

    const sse = new ChatSSE(
      {
        sessionId,
        endpoint: '/api/v1/chat/stream',
        reconnect: true,
        maxReconnectAttempts: 3,
      },
      {
        onMessage: (chunk: string) => {
          accumulatedText += chunk;

          // Notify about new chunk
          options.onChunk?.(chunk);

          // Notify about accumulated progress
          options.onProgress?.(accumulatedText);
        },

        onComplete: (response: ChatResponse) => {
          const duration = Date.now() - startTime;

          // Track successful response
          trackChatResponse(
            response.session_id,
            response.message,
            response.agent_id,
            duration,
            'sse'
          );

          // Update metadata with streaming info
          const enhancedResponse: ChatResponse = {
            ...response,
            metadata: {
              ...response.metadata,
              streaming: true,
              transport: 'sse',
              duration,
              chunks: accumulatedText.length,
            },
          };

          resolve(enhancedResponse);
        },

        onError: (error: Error) => {
          const duration = Date.now() - startTime;

          // Track error
          trackChatError(sessionId, error.message, duration);

          reject(error);
        },

        onConnectionStatus: (status) => {
          options.onConnectionStatus?.(status);
        },
      }
    );

    // Start streaming
    sse.sendMessage(request.message, request.context).catch(reject);
  });
}

/**
 * Send a chat message with SSE streaming (simple version)
 * Uses the streaming utility function for one-off requests
 */
export async function sendSSEMessageSimple(
  request: ChatRequest,
  onChunk?: (text: string) => void
): Promise<ChatResponse> {
  return new Promise((resolve, reject) => {
    streamChatMessage(
      request,
      (text) => onChunk?.(text),
      (response) => resolve(response),
      (error) => reject(error)
    );
  });
}

/**
 * Create a reusable SSE client for multiple messages
 * Useful for chat sessions where multiple messages are sent
 */
export function createSSEClient(sessionId: string, handlers: SSEMessageOptions) {
  const sse = new ChatSSE(
    {
      sessionId,
      endpoint: '/api/v1/chat/stream',
      reconnect: true,
      maxReconnectAttempts: 3,
    },
    {
      onMessage: handlers.onChunk,
      onConnectionStatus: handlers.onConnectionStatus,
      onComplete: (response) => {
        console.log('[SSE Client] Message complete:', response);
      },
      onError: (error) => {
        console.error('[SSE Client] Error:', error);
      },
    }
  );

  return {
    /**
     * Send a message through the SSE client
     */
    send: (message: string, context?: Record<string, any>): Promise<void> => {
      return sse.sendMessage(message, context);
    },

    /**
     * Abort the current streaming operation
     */
    abort: () => {
      sse.abort();
    },

    /**
     * Check if currently streaming
     */
    isActive: (): boolean => {
      return sse.isActive();
    },

    /**
     * Clean up and dispose resources
     */
    dispose: () => {
      sse.dispose();
    },
  };
}

/**
 * Fallback to non-streaming if SSE fails
 * Falls back to the standard chat endpoint with POST
 */
export async function sendSSEMessageWithFallback(
  request: ChatRequest,
  options: SSEMessageOptions = {}
): Promise<ChatResponse> {
  try {
    // Try SSE streaming first
    return await sendSSEMessage(request, options);
  } catch (error) {
    console.warn('[SSE] Streaming failed, falling back to standard endpoint:', error);

    // Import fallback adapter dynamically to avoid circular dependencies
    const { sendFallbackMessage } = await import('./chat-adapter-fallback');
    return await sendFallbackMessage(request);
  }
}
