// Chat-related type definitions matching the backend API

// Intent types matching the backend
export enum IntentType {
  // Task-specific intents
  INVESTIGATE = "investigate",
  ANALYZE = "analyze",
  REPORT = "report",
  STATUS = "status",
  
  // Conversational intents
  GREETING = "greeting",
  CONVERSATION = "conversation",
  HELP_REQUEST = "help_request",
  ABOUT_SYSTEM = "about_system",
  SMALLTALK = "smalltalk",
  THANKS = "thanks",
  GOODBYE = "goodbye",
  
  // General
  QUESTION = "question",
  HELP = "help",
  UNKNOWN = "unknown"
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  session_id: string;
  agent_id: string;
  agent_name: string;
  message: string;
  confidence: float;
  suggested_actions?: string[];
  requires_input?: Record<string, string>;
  metadata: Record<string, any>;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id?: string;
  agent_name?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  session_id: string;
  user_id?: string;
  created_at: string;
  last_message_at?: string;
  metadata: Record<string, any>;
}

export interface CursorPaginationResponse {
  items: ChatMessage[];
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

// WebSocket message types
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

export interface WSMessage {
  type: WSMessageType;
  data?: any;
  id?: string;
  timestamp?: string;
}

export interface WSChatMessage extends WSMessage {
  type: 'chat';
  data: {
    content: string;
    session_id?: string;
    context?: Record<string, any>;
  };
}

export interface WSChatResponse extends WSMessage {
  type: 'chat' | 'chat_complete';
  data: {
    agent_id: string;
    agent_name: string;
    content: string;
    chunk_index?: number;
    is_complete?: boolean;
    suggested_actions?: string[];
    metadata?: Record<string, any>;
  };
}

// SSE event types for streaming
export interface SSEEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

export type SSEEventType = 
  | 'start'
  | 'detecting'
  | 'intent'
  | 'agent_selected'
  | 'chunk'
  | 'complete'
  | 'error';

export interface SSEChatEvent {
  type: SSEEventType;
  data: any;
}

// Investigation-related types
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

// Chat state types
export type ChatConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatState {
  messages: ChatMessage[];
  session: ChatSession | null;
  connectionStatus: ChatConnectionStatus;
  isTyping: boolean;
  activeAgents: AgentInfo[];
  suggestedActions: QuickAction[];
  currentInvestigation?: Investigation;
}

// Type alias for float (TypeScript doesn't have native float)
type float = number;