import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendOptimizedMessage } from './chat-adapter-optimized-maritaca';
import { api } from './client';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

// Mock dependencies
vi.mock('./client');
vi.mock('@/lib/telemetry/chat-telemetry');

describe('chat-adapter-optimized-maritaca', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendOptimizedMessage', () => {
    const mockRequest = {
      message: 'Test optimized message',
      session_id: 'test-session',
      context: { test: true },
    };

    const mockBackendResponse = {
      session_id: 'test-session',
      agent_id: 'abaporu',
      agent_name: 'Abaporu',
      message: 'Optimized response',
      confidence: 0.95,
      suggested_actions: ['action1', 'action2'],
      metadata: { original_meta: true },
    };

    it('should successfully send optimized message and convert response', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/optimized', {
        message: mockRequest.message,
        session_id: mockRequest.session_id,
        context: mockRequest.context,
      });

      expect(trackChatMessage).toHaveBeenCalledWith(
        'test-session',
        'Test optimized message',
        'optimized'
      );

      expect(trackChatResponse).toHaveBeenCalledWith(
        'test-session',
        expect.any(Number),
        false
      );

      expect(result).toMatchObject({
        session_id: 'test-session',
        agent_id: 'abaporu',
        agent_name: 'Abaporu',
        message: 'Optimized response',
        confidence: 0.95,
        suggested_actions: ['action1', 'action2'],
        metadata: {
          original_meta: true,
          endpoint: 'optimized',
          response_time: expect.any(Number),
          model: 'sabiazinho-3',
          persona: 'drummond',
        },
      });
    });

    it('should generate session_id if not provided', async () => {
      const requestWithoutSession = {
        message: 'Test message',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      await sendOptimizedMessage(requestWithoutSession);

      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/optimized', {
        message: 'Test message',
        session_id: expect.stringMatching(/^session_\d+$/),
        context: undefined,
      });
    });

    it('should handle backend response with response field instead of message', async () => {
      const responseWithResponseField = {
        ...mockBackendResponse,
        message: undefined,
        response: 'Response text',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: responseWithResponseField,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(result.message).toBe('Response text');
    });

    it('should use default values when backend response lacks some fields', async () => {
      const minimalResponse = {
        session_id: 'test-session',
        message: 'Minimal response',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: minimalResponse,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(result).toMatchObject({
        session_id: 'test-session',
        agent_id: 'drummond',
        agent_name: 'Carlos Drummond de Andrade',
        message: 'Minimal response',
        confidence: 0.9,
        suggested_actions: [],
      });
    });

    it('should handle empty message in response', async () => {
      const emptyMessageResponse = {
        session_id: 'test-session',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: emptyMessageResponse,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(result.message).toBe('');
    });

    it('should throw error when API returns unsuccessful response', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: false,
        error: { message: 'Optimized endpoint failed' },
      });

      await expect(sendOptimizedMessage(mockRequest)).rejects.toThrow('Optimized endpoint failed');
      
      expect(trackChatError).toHaveBeenCalledWith('test-session', expect.any(Error));
    });

    it('should throw error when API returns no data', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: undefined,
      });

      await expect(sendOptimizedMessage(mockRequest)).rejects.toThrow('Failed to send message');
    });

    it('should handle API errors and track them', async () => {
      const apiError = new Error('Network error');
      vi.mocked(api.post).mockRejectedValue(apiError);

      await expect(sendOptimizedMessage(mockRequest)).rejects.toThrow('Network error');

      expect(trackChatError).toHaveBeenCalledWith('test-session', apiError);
      expect(console.error).toHaveBeenCalledWith('[Chat Optimized] Error:', apiError);
    });

    it('should track error with unknown session when session_id is missing', async () => {
      const apiError = new Error('API error');
      vi.mocked(api.post).mockRejectedValue(apiError);

      const requestWithoutSession = { message: 'Test' };

      await expect(sendOptimizedMessage(requestWithoutSession)).rejects.toThrow('API error');

      expect(trackChatError).toHaveBeenCalledWith('unknown', apiError);
    });

    it('should log message sending and response timing', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      await sendOptimizedMessage(mockRequest);

      expect(console.log).toHaveBeenCalledWith(
        '[Chat Optimized] Sending message:',
        'Test optimized message'
      );

      expect(console.log).toHaveBeenCalledWith(
        '[Chat Optimized] Response received in',
        expect.any(Number),
        'ms'
      );
    });

    it('should measure response time correctly', async () => {
      let resolvePromise: any;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(api.post).mockReturnValue(delayedPromise as any);

      const promise = sendOptimizedMessage(mockRequest);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      resolvePromise({
        success: true,
        data: mockBackendResponse,
      });

      const result = await promise;

      expect(result.metadata.response_time).toBeGreaterThanOrEqual(90); // Allow some timing variance
    });

    it('should set persona to drummond in metadata', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(result.metadata.persona).toBe('drummond');
    });

    it('should use sabiazinho-3 model name in metadata', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      const result = await sendOptimizedMessage(mockRequest);

      expect(result.metadata.model).toBe('sabiazinho-3');
    });
  });
});