/**
 * Chat Module Index Tests
 */

import { describe, it, expect, vi } from 'vitest'

// Mock the chat service
vi.mock('./chat.service', () => ({
  ChatService: class MockChatService {
    sendMessage = vi.fn().mockResolvedValue({ response: 'test' })
  },
  chatService: {
    sendMessage: vi.fn().mockResolvedValue({ response: 'test' }),
  },
}))

// Mock adapters
vi.mock('./adapters/primary.adapter', () => ({
  PrimaryAdapter: class MockPrimaryAdapter {},
}))

vi.mock('./adapters/fallback.adapter', () => ({
  FallbackAdapter: class MockFallbackAdapter {},
}))

describe('Chat Module Index', () => {
  describe('exports', () => {
    it('should export PrimaryAdapter', async () => {
      const { PrimaryAdapter } = await import('./index')
      expect(PrimaryAdapter).toBeDefined()
    })

    it('should export FallbackAdapter', async () => {
      const { FallbackAdapter } = await import('./index')
      expect(FallbackAdapter).toBeDefined()
    })

    it('should export ChatService', async () => {
      const { ChatService } = await import('./index')
      expect(ChatService).toBeDefined()
    })

    it('should export chatService singleton', async () => {
      const { chatService } = await import('./index')
      expect(chatService).toBeDefined()
    })

    it('should export sendChatMessage function', async () => {
      const { sendChatMessage } = await import('./index')
      expect(typeof sendChatMessage).toBe('function')
    })
  })

  describe('sendChatMessage', () => {
    it('should call chatService.sendMessage', async () => {
      const { sendChatMessage } = await import('./index')

      await sendChatMessage('Hello')

      // Import chatService to verify it was called
      const { chatService } = await import('./chat.service')
      expect(chatService.sendMessage).toHaveBeenCalledWith({
        message: 'Hello',
        agentId: undefined,
      })
    })

    it('should pass agentId when provided', async () => {
      const { sendChatMessage } = await import('./index')

      await sendChatMessage('Hello', 'zumbi')

      const { chatService } = await import('./chat.service')
      expect(chatService.sendMessage).toHaveBeenCalledWith({
        message: 'Hello',
        agentId: 'zumbi',
      })
    })
  })
})
