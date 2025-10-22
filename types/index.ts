/**
 * Centralized type definitions for Cidadão.AI Frontend
 * Single source of truth for all type definitions
 */

// =============================================================================
// API Types - Backend communication types
// =============================================================================

export namespace API {
  /**
   * Chat message in API responses
   */
  export interface ChatMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agent_id?: string;
    agent_name?: string;
    timestamp: string;
    metadata?: ChatMetadata;
  }

  /**
   * Chat session from API
   */
  export interface ChatSession {
    session_id: string;
    user_id?: string;
    created_at: string;
    last_message_at?: string;
    metadata: Record<string, unknown>;
  }

  /**
   * Investigation from API
   */
  export interface Investigation {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    agents_involved: string[];
    findings_count: number;
    anomalies_count: number;
    confidence_score: number;
  }

  /**
   * Metadata for chat messages
   */
  export interface ChatMetadata {
    agent_id: string;
    agent_name: string;
    confidence: number;
    processing_time_ms: number;
    model_used: string;
    tokens_used?: number;
    cached?: boolean;
    endpoint?: string;
    response_time?: number;
  }

  /**
   * Chat request payload
   */
  export interface ChatRequest {
    message: string;
    session_id?: string;
    context?: ChatContext;
  }

  /**
   * Chat context for requests
   */
  export interface ChatContext {
    model_preference?: 'auto' | 'economic' | 'quality' | 'stable';
    use_drummond?: boolean;
    session_history?: string[];
    user_preferences?: Record<string, unknown>;
  }

  /**
   * Chat response from backend
   */
  export interface ChatResponse {
    session_id: string;
    agent_id: string;
    agent_name: string;
    message: string;
    confidence: number;
    suggested_actions?: string[];
    requires_input?: Record<string, string>;
    metadata: ChatMetadata;
  }

  /**
   * Backend chat message response (specific endpoint format)
   */
  export interface BackendChatMessageResponse {
    response?: string;
    message?: string;
    session_id: string;
    message_id: string;
    agent_used?: string;
    agent_id?: string;
    agent_name?: string;
    processing_time?: number;
    confidence?: number;
    suggestions?: string[];
    suggested_actions?: string[];
    metadata?: Record<string, unknown>;
  }
}

// =============================================================================
// Database Types - Supabase/PostgreSQL types
// =============================================================================

export namespace Database {
  /**
   * User profile in database
   */
  export interface Profile {
    id: string;
    created_at: string;
    updated_at: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    role: 'user' | 'admin' | 'moderator';
    preferences: Record<string, unknown>;
  }

  /**
   * User preferences in database
   */
  export interface UserPreferences {
    id: string;
    user_id: string;
    theme: 'light' | 'dark' | 'auto';
    language: 'pt' | 'en';
    notifications_enabled: boolean;
    email_notifications: boolean;
    created_at: string;
    updated_at: string;
  }

  /**
   * Investigation record in database
   */
  export interface Investigation {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    agents_used: string[];
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }

  /**
   * Chat session in database (persisted)
   */
  export interface ChatSession {
    id: string;
    session_id: string;
    user_id: string;
    investigation_id?: string;
    agent_id: string;
    messages: Database.ChatMessage[];
    session_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }

  /**
   * Chat message in database
   */
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    agent_id?: string;
    agent_name?: string;
    metadata?: Record<string, unknown>;
  }

  /**
   * Supabase database schema
   */
  export interface Schema {
    public: {
      Tables: {
        profiles: {
          Row: Profile;
          Insert: Omit<Profile, 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        };
        user_preferences: {
          Row: UserPreferences;
          Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at'>>;
        };
        investigations: {
          Row: Investigation;
          Insert: Omit<Investigation, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Investigation, 'id' | 'user_id' | 'created_at'>>;
        };
        chat_sessions: {
          Row: ChatSession;
          Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<ChatSession, 'id' | 'user_id' | 'created_at'>>;
        };
      };
    };
  }
}

// =============================================================================
// Shared/Common Types
// =============================================================================

/**
 * Intent types for chat classification
 */
export enum IntentType {
  // Task-specific intents
  INVESTIGATE = 'investigate',
  ANALYZE = 'analyze',
  REPORT = 'report',
  STATUS = 'status',

  // Conversational intents
  GREETING = 'greeting',
  CONVERSATION = 'conversation',
  HELP_REQUEST = 'help_request',
  ABOUT_SYSTEM = 'about_system',
  SMALLTALK = 'smalltalk',
  THANKS = 'thanks',
  GOODBYE = 'goodbye',

  // General
  QUESTION = 'question',
  HELP = 'help',
  UNKNOWN = 'unknown',
}

/**
 * Quick action button
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

/**
 * Agent information
 */
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  type: 'master' | 'investigator' | 'analyst' | 'reporter' | 'conversational' | string;
  description: string;
  specialty: string;
  capabilities?: string[];
  status: 'available' | 'busy' | 'offline';
}

/**
 * WebSocket message types
 */
export type WSMessageType =
  | 'chat'
  | 'subscribe'
  | 'unsubscribe'
  | 'ping'
  | 'connection'
  | 'chat_complete'
  | 'typing'
  | 'error'
  | 'pong'
  | 'subscribed'
  | 'unsubscribed'
  | 'investigation_update';

/**
 * Base WebSocket message
 */
export interface WSMessage {
  type: WSMessageType;
  data?: unknown;
  id?: string;
  timestamp?: string;
}

/**
 * WebSocket chat message
 */
export interface WSChatMessage extends WSMessage {
  type: 'chat';
  data: {
    content: string;
    session_id?: string;
    context?: Record<string, unknown>;
  };
}

/**
 * WebSocket chat response
 */
export interface WSChatResponse extends WSMessage {
  type: 'chat' | 'chat_complete';
  data: {
    agent_id: string;
    agent_name: string;
    content: string;
    chunk_index?: number;
    is_complete?: boolean;
    suggested_actions?: string[];
    metadata?: Record<string, unknown>;
  };
}

/**
 * SSE event types
 */
export type SSEEventType =
  | 'start'
  | 'detecting'
  | 'intent'
  | 'agent_selected'
  | 'chunk'
  | 'complete'
  | 'error';

/**
 * SSE event structure
 */
export interface SSEEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * SSE chat event
 */
export interface SSEChatEvent {
  type: SSEEventType;
  data: unknown;
}

/**
 * Chat connection status
 */
export type ChatConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Chat state for UI
 */
export interface ChatState {
  messages: API.ChatMessage[];
  session: API.ChatSession | null;
  connectionStatus: ChatConnectionStatus;
  isTyping: boolean;
  activeAgents: AgentInfo[];
  suggestedActions: QuickAction[];
  currentInvestigation?: API.Investigation;
}

/**
 * Cursor pagination response
 */
export interface CursorPaginationResponse {
  items: API.ChatMessage[];
  next_cursor?: string;
  previous_cursor?: string;
  has_next: boolean;
  has_previous: boolean;
  total_count: number;
  metadata: {
    session_id: string;
    user_id?: string;
    created_at: string;
  };
}

// =============================================================================
// Legacy type aliases for backward compatibility
// =============================================================================

/**
 * @deprecated Use API.ChatMessage instead
 */
export type ChatMessage = API.ChatMessage;

/**
 * @deprecated Use API.ChatSession instead
 */
export type ChatSession = API.ChatSession;

/**
 * @deprecated Use API.Investigation instead
 */
export type Investigation = API.Investigation;

/**
 * @deprecated Use API.ChatRequest instead
 */
export type ChatRequest = API.ChatRequest;

/**
 * @deprecated Use API.ChatResponse instead
 */
export type ChatResponse = API.ChatResponse;

/**
 * @deprecated Use API.BackendChatMessageResponse instead
 */
export type BackendChatMessageResponse = API.BackendChatMessageResponse;

/**
 * @deprecated Use Database.Schema instead
 */
export type Database = Database.Schema;
