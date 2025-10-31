/**
 * Chat Store Validation Schemas
 * Type-safe validation with Zod
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { z } from 'zod'

// Enum schemas
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system'])
export const ConnectionStatusSchema = z.enum(['connecting', 'connected', 'disconnected', 'error'])
export const AgentStatusSchema = z.enum(['idle', 'thinking', 'responding', 'error'])

// Message schema
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  role: MessageRoleSchema,
  timestamp: z.string().datetime(),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
  error: z.string().optional(),
  edited: z.boolean().optional(),
  editedAt: z.string().datetime().optional()
})

// Session schema
export const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  messageCount: z.number().int().min(0),
  lastMessage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().default(false)
})

// Agent schema
export const AgentInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string().url().optional(),
  status: AgentStatusSchema,
  specialties: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional()
})

// Quick action schema
export const QuickActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  action: z.string(),
  category: z.string().optional(),
  enabled: z.boolean().default(true)
})

// Investigation schema
export const InvestigationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'failed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  agentIds: z.array(z.string()),
  findings: z.array(z.any()).optional(),
  progress: z.number().min(0).max(100).optional()
})

// Complete Chat Store schema
export const ChatStoreSchema = z.object({
  // State
  messages: z.array(ChatMessageSchema),
  session: ChatSessionSchema.nullable(),
  connectionStatus: ConnectionStatusSchema,
  isTyping: z.boolean(),
  agentTyping: z.boolean(),
  activeAgents: z.array(AgentInfoSchema),
  suggestedActions: z.array(QuickActionSchema),
  currentInvestigation: InvestigationSchema.nullable(),
  error: z.string().nullable(),
  isLoading: z.boolean(),

  // Settings (for persistence)
  settings: z.object({
    enableSound: z.boolean().default(true),
    enableNotifications: z.boolean().default(true),
    messageLimit: z.number().int().min(10).max(1000).default(100),
    autoSave: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'auto']).default('auto')
  }).optional()
})

// Type exports
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatSession = z.infer<typeof ChatSessionSchema>
export type AgentInfo = z.infer<typeof AgentInfoSchema>
export type QuickAction = z.infer<typeof QuickActionSchema>
export type Investigation = z.infer<typeof InvestigationSchema>
export type ChatStoreState = z.infer<typeof ChatStoreSchema>

// Validation helpers
export const validateChatMessage = (data: unknown) => {
  return ChatMessageSchema.safeParse(data)
}

export const validateChatSession = (data: unknown) => {
  return ChatSessionSchema.safeParse(data)
}

export const validateChatStore = (data: unknown) => {
  return ChatStoreSchema.safeParse(data)
}