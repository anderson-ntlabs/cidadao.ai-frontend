export interface Profile {
  id: string
  created_at: string
  updated_at: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  role: 'user' | 'admin' | 'moderator'
  preferences: Record<string, any>
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  language: 'pt' | 'en'
  notifications_enabled: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface Investigation {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  agents_used: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  investigation_id?: string
  agent_id: string
  messages: ChatMessage[]
  session_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at'>>
      }
      investigations: {
        Row: Investigation
        Insert: Omit<Investigation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Investigation, 'id' | 'user_id' | 'created_at'>>
      }
      chat_sessions: {
        Row: ChatSession
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChatSession, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}