/**
 * Chat Schema Tests
 */

import { describe, it, expect } from 'vitest'
import {
  MessageRoleSchema,
  ConnectionStatusSchema,
  AgentStatusSchema,
  ChatMessageSchema,
  ChatSessionSchema,
  AgentInfoSchema,
  QuickActionSchema,
  InvestigationSchema,
  ChatStoreSchema,
  validateChatMessage,
  validateChatSession,
  validateChatStore,
} from './chat.schema'

describe('Enum Schemas', () => {
  describe('MessageRoleSchema', () => {
    it('should accept valid roles', () => {
      expect(MessageRoleSchema.parse('user')).toBe('user')
      expect(MessageRoleSchema.parse('assistant')).toBe('assistant')
      expect(MessageRoleSchema.parse('system')).toBe('system')
    })

    it('should reject invalid roles', () => {
      expect(() => MessageRoleSchema.parse('invalid')).toThrow()
      expect(() => MessageRoleSchema.parse('')).toThrow()
    })
  })

  describe('ConnectionStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(ConnectionStatusSchema.parse('connecting')).toBe('connecting')
      expect(ConnectionStatusSchema.parse('connected')).toBe('connected')
      expect(ConnectionStatusSchema.parse('disconnected')).toBe('disconnected')
      expect(ConnectionStatusSchema.parse('error')).toBe('error')
    })

    it('should reject invalid statuses', () => {
      expect(() => ConnectionStatusSchema.parse('invalid')).toThrow()
    })
  })

  describe('AgentStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(AgentStatusSchema.parse('idle')).toBe('idle')
      expect(AgentStatusSchema.parse('thinking')).toBe('thinking')
      expect(AgentStatusSchema.parse('responding')).toBe('responding')
      expect(AgentStatusSchema.parse('error')).toBe('error')
    })

    it('should reject invalid statuses', () => {
      expect(() => AgentStatusSchema.parse('working')).toThrow()
    })
  })
})

describe('ChatMessageSchema', () => {
  const validMessage = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    content: 'Hello, world!',
    role: 'user',
    timestamp: '2025-01-01T00:00:00Z',
  }

  it('should accept valid message', () => {
    const result = ChatMessageSchema.parse(validMessage)
    expect(result.id).toBe(validMessage.id)
    expect(result.content).toBe(validMessage.content)
    expect(result.role).toBe(validMessage.role)
  })

  it('should accept message with optional fields', () => {
    const messageWithOptionals = {
      ...validMessage,
      agentId: 'agent-123',
      agentName: 'Zumbi',
      confidence: 0.95,
      edited: true,
      editedAt: '2025-01-02T00:00:00Z',
    }
    const result = ChatMessageSchema.parse(messageWithOptionals)
    expect(result.agentId).toBe('agent-123')
    expect(result.confidence).toBe(0.95)
    expect(result.edited).toBe(true)
  })

  it('should reject message with invalid id', () => {
    expect(() => ChatMessageSchema.parse({ ...validMessage, id: 'not-a-uuid' })).toThrow()
  })

  it('should reject empty content', () => {
    expect(() => ChatMessageSchema.parse({ ...validMessage, content: '' })).toThrow()
  })

  it('should reject content over 10000 characters', () => {
    const longContent = 'a'.repeat(10001)
    expect(() => ChatMessageSchema.parse({ ...validMessage, content: longContent })).toThrow()
  })

  it('should reject invalid confidence values', () => {
    expect(() => ChatMessageSchema.parse({ ...validMessage, confidence: -0.1 })).toThrow()
    expect(() => ChatMessageSchema.parse({ ...validMessage, confidence: 1.1 })).toThrow()
  })
})

describe('ChatSessionSchema', () => {
  const validSession = {
    id: 'session-123',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T01:00:00Z',
    messageCount: 10,
  }

  it('should accept valid session', () => {
    const result = ChatSessionSchema.parse(validSession)
    expect(result.id).toBe('session-123')
    expect(result.messageCount).toBe(10)
  })

  it('should accept session with optional fields', () => {
    const sessionWithOptionals = {
      ...validSession,
      title: 'Test Session',
      lastMessage: 'Hello',
      tags: ['important', 'test'],
      archived: true,
    }
    const result = ChatSessionSchema.parse(sessionWithOptionals)
    expect(result.title).toBe('Test Session')
    expect(result.tags).toEqual(['important', 'test'])
    expect(result.archived).toBe(true)
  })

  it('should default archived to false', () => {
    const result = ChatSessionSchema.parse(validSession)
    expect(result.archived).toBe(false)
  })

  it('should reject negative message count', () => {
    expect(() => ChatSessionSchema.parse({ ...validSession, messageCount: -1 })).toThrow()
  })
})

describe('AgentInfoSchema', () => {
  const validAgent = {
    id: 'agent-123',
    name: 'Zumbi',
    role: 'Analyst',
    status: 'idle',
  }

  it('should accept valid agent', () => {
    const result = AgentInfoSchema.parse(validAgent)
    expect(result.id).toBe('agent-123')
    expect(result.name).toBe('Zumbi')
  })

  it('should accept agent with optional fields', () => {
    const agentWithOptionals = {
      ...validAgent,
      avatar: 'https://example.com/avatar.jpg',
      specialties: ['transparency', 'analysis'],
      confidence: 0.9,
    }
    const result = AgentInfoSchema.parse(agentWithOptionals)
    expect(result.avatar).toBe('https://example.com/avatar.jpg')
    expect(result.specialties).toEqual(['transparency', 'analysis'])
  })

  it('should reject invalid avatar URL', () => {
    expect(() => AgentInfoSchema.parse({ ...validAgent, avatar: 'not-a-url' })).toThrow()
  })
})

describe('QuickActionSchema', () => {
  const validAction = {
    id: 'action-1',
    label: 'Start Investigation',
    action: 'start_investigation',
  }

  it('should accept valid action', () => {
    const result = QuickActionSchema.parse(validAction)
    expect(result.id).toBe('action-1')
    expect(result.label).toBe('Start Investigation')
  })

  it('should accept action with optional fields', () => {
    const actionWithOptionals = {
      ...validAction,
      description: 'Starts a new investigation',
      icon: 'search',
      category: 'investigation',
      enabled: false,
    }
    const result = QuickActionSchema.parse(actionWithOptionals)
    expect(result.description).toBe('Starts a new investigation')
    expect(result.enabled).toBe(false)
  })

  it('should default enabled to true', () => {
    const result = QuickActionSchema.parse(validAction)
    expect(result.enabled).toBe(true)
  })
})

describe('InvestigationSchema', () => {
  const validInvestigation = {
    id: 'inv-123',
    title: 'Contract Analysis',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T01:00:00Z',
    agentIds: ['agent-1', 'agent-2'],
  }

  it('should accept valid investigation', () => {
    const result = InvestigationSchema.parse(validInvestigation)
    expect(result.id).toBe('inv-123')
    expect(result.status).toBe('active')
  })

  it('should accept all status values', () => {
    const statuses = ['pending', 'active', 'completed', 'failed']
    statuses.forEach((status) => {
      const result = InvestigationSchema.parse({ ...validInvestigation, status })
      expect(result.status).toBe(status)
    })
  })

  it('should accept all priority values', () => {
    const priorities = ['low', 'medium', 'high', 'critical']
    priorities.forEach((priority) => {
      const result = InvestigationSchema.parse({ ...validInvestigation, priority })
      expect(result.priority).toBe(priority)
    })
  })

  it('should validate progress range', () => {
    expect(InvestigationSchema.parse({ ...validInvestigation, progress: 0 }).progress).toBe(0)
    expect(InvestigationSchema.parse({ ...validInvestigation, progress: 100 }).progress).toBe(100)
    expect(() => InvestigationSchema.parse({ ...validInvestigation, progress: -1 })).toThrow()
    expect(() => InvestigationSchema.parse({ ...validInvestigation, progress: 101 })).toThrow()
  })
})

describe('Validation Helpers', () => {
  describe('validateChatMessage', () => {
    it('should return success for valid message', () => {
      const result = validateChatMessage({
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello',
        role: 'user',
        timestamp: '2025-01-01T00:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('should return error for invalid message', () => {
      const result = validateChatMessage({ invalid: 'data' })
      expect(result.success).toBe(false)
    })
  })

  describe('validateChatSession', () => {
    it('should return success for valid session', () => {
      const result = validateChatSession({
        id: 'session-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        messageCount: 0,
      })
      expect(result.success).toBe(true)
    })

    it('should return error for invalid session', () => {
      const result = validateChatSession({ id: 123 })
      expect(result.success).toBe(false)
    })
  })

  describe('validateChatStore', () => {
    it('should return success for valid store state', () => {
      const result = validateChatStore({
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
      })
      expect(result.success).toBe(true)
    })

    it('should return error for invalid store state', () => {
      const result = validateChatStore({
        messages: 'not-an-array',
      })
      expect(result.success).toBe(false)
    })
  })
})
