import { API_BASE_URL } from './client';
import type { ChatRequest } from '@/types/chat';
import { trackChatMessage, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Stream token interface matching backend documentation
 */
export interface StreamToken {
  type: 'token' | 'error' | 'complete';
  content?: string;
  error?: string;
  metadata?: {
    agent: string;
    processing_time?: number;
  };
}

/**
 * Stream chat messages using Server-Sent Events (SSE)
 * Follows the backend API documentation for /api/v1/chat/stream
 */
export function streamChatMessage(
  request: ChatRequest,
  onToken: (token: StreamToken) => void,
  onError?: (error: Error) => void
): EventSource {
  const sessionId = request.session_id || `stream_${Date.now()}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Track the message
  trackChatMessage(sessionId, request.message, 'stream');
  
  // Construct SSE URL with auth token
  const url = `${API_BASE_URL}/api/v1/chat/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  
  // Create EventSource for SSE
  const eventSource = new EventSource(url);
  
  // Send the initial message via POST
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({
      message: request.message,
      session_id: sessionId,
      context: request.context
    })
  }).catch(error => {
    console.error('[Chat Stream] Failed to send message:', error);
    trackChatError(sessionId, error);
    if (onError) onError(error);
  });
  
  // Handle SSE messages
  eventSource.onmessage = (event) => {
    try {
      const data: StreamToken = JSON.parse(event.data);
      console.log('[Chat Stream] Received:', data.type);
      onToken(data);
      
      // Close connection on complete or error
      if (data.type === 'complete' || data.type === 'error') {
        eventSource.close();
      }
    } catch (error) {
      console.error('[Chat Stream] Parse error:', error);
      if (onError) onError(error as Error);
    }
  };
  
  // Handle SSE errors
  eventSource.onerror = (error) => {
    console.error('[Chat Stream] SSE error:', error);
    trackChatError(sessionId, new Error('SSE connection failed'));
    eventSource.close();
    if (onError) onError(new Error('Stream connection failed'));
  };
  
  return eventSource;
}

/**
 * Helper to accumulate streamed tokens into complete response
 */
export class StreamAccumulator {
  private content: string = '';
  private metadata: any = {};
  
  addToken(token: StreamToken): void {
    if (token.type === 'token' && token.content) {
      this.content += token.content;
    } else if (token.type === 'complete' && token.metadata) {
      this.metadata = token.metadata;
    }
  }
  
  getContent(): string {
    return this.content;
  }
  
  getMetadata(): any {
    return this.metadata;
  }
  
  reset(): void {
    this.content = '';
    this.metadata = {};
  }
}