import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendEmergencyMessage } from './chat-adapter-emergency';
import { api } from './client';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

// Mock dependencies
vi.mock('./client');
vi.mock('@/lib/telemetry/chat-telemetry');

describe('chat-adapter-emergency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendEmergencyMessage', () => {
    const mockRequest = {
      message: 'Test emergency message',
      session_id: 'test-session',
      context: { test: true },
    };

    const mockBackendResponse = {
      session_id: 'test-session',
      agent_id: 'abaporu',
      agent_name: 'Abaporu',
      message: 'Emergency response',
      confidence: 0.95,
      suggested_actions: ['action1', 'action2'],
      metadata: { original_meta: true },
    };

    it('should successfully send emergency message and convert response', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      const result = await sendEmergencyMessage(mockRequest);

      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/emergency', {
        message: mockRequest.message,
        session_id: mockRequest.session_id,
        context: mockRequest.context,
      });

      expect(trackChatMessage).toHaveBeenCalledWith(
        'test-session',
        'Test emergency message',
        'emergency'
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
        message: 'Emergency response',
        confidence: 0.95,
        suggested_actions: ['action1', 'action2'],
        metadata: {
          original_meta: true,
          endpoint: 'emergency',
          response_time: expect.any(Number),
          model: 'sabiazinho-3',
          fallback: true,
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

      await sendEmergencyMessage(requestWithoutSession);

      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/emergency', {
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

      const result = await sendEmergencyMessage(mockRequest);

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

      const result = await sendEmergencyMessage(mockRequest);

      expect(result).toMatchObject({
        session_id: 'test-session',
        agent_id: 'assistant',
        agent_name: 'Assistente Cidadão.AI',
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

      const result = await sendEmergencyMessage(mockRequest);

      expect(result.message).toBe('');
    });

    it('should throw error when API returns unsuccessful response', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: false,
        error: { message: 'Emergency endpoint failed' },
      });

      await expect(sendEmergencyMessage(mockRequest)).rejects.toThrow('Emergency endpoint failed');
      
      expect(trackChatError).toHaveBeenCalledWith('test-session', expect.any(Error));
    });

    it('should throw error when API returns no data', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: undefined,
      });

      await expect(sendEmergencyMessage(mockRequest)).rejects.toThrow('Failed to send message');
    });

    it('should handle API errors and track them', async () => {
      const apiError = new Error('Network error');
      vi.mocked(api.post).mockRejectedValue(apiError);

      await expect(sendEmergencyMessage(mockRequest)).rejects.toThrow('Network error');

      expect(trackChatError).toHaveBeenCalledWith('test-session', apiError);
      expect(console.error).toHaveBeenCalledWith('[Chat Emergency] Error:', apiError);
    });

    it('should track error with unknown session when session_id is missing', async () => {
      const apiError = new Error('API error');
      vi.mocked(api.post).mockRejectedValue(apiError);

      const requestWithoutSession = { message: 'Test' };

      await expect(sendEmergencyMessage(requestWithoutSession)).rejects.toThrow('API error');

      expect(trackChatError).toHaveBeenCalledWith('unknown', apiError);
    });

    it('should log message sending and response timing', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockBackendResponse,
      });

      await sendEmergencyMessage(mockRequest);

      expect(console.log).toHaveBeenCalledWith(
        '[Chat Emergency] Sending message:',
        'Test emergency message'
      );

      expect(console.log).toHaveBeenCalledWith(
        '[Chat Emergency] Response received in',
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

      const promise = sendEmergencyMessage(mockRequest);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      resolvePromise({
        success: true,
        data: mockBackendResponse,
      });

      const result = await promise;

      expect(result.metadata.response_time).toBeGreaterThanOrEqual(90); // Allow some timing variance
    });
  });
});