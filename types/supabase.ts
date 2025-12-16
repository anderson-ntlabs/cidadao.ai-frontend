export interface Profile {
  id: string
  created_at: string
  updated_at: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  role: 'user' | 'admin' | 'moderator'
  preferences: Record<string, unknown>
}

// ============================================
// Agora Platform Types
// ============================================

export interface AgoraProfile {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  github_username: string | null
  total_xp: number
  current_level: number
  current_rank: string | null
  current_streak: number
  longest_streak: number
  total_time_minutes: number
  total_sessions: number
  badges: string[]
  main_track: string | null
  program_start_date: string | null
  last_activity_date: string | null
  has_accepted_lgpd: boolean
  has_accepted_terms: boolean
  has_completed_onboarding: boolean
  created_at: string
  updated_at: string
}

export interface AgoraConsent {
  id: string
  user_id: string
  consent_version: string
  tracking_consent: boolean
  data_processing_consent: boolean
  certificate_consent: boolean
  created_at: string
}

export interface AgoraXpTransaction {
  id: string
  user_id: string
  amount: number
  description: string
  source_type: string
  created_at: string
}

export interface AgoraSession {
  id: string
  user_id: string
  session_type: string
  duration_minutes: number | null
  activity_summary: Record<string, unknown> | null
  started_at: string
  ended_at: string | null
}

export interface AgoraDiaryEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface AgoraVideoProgress {
  id: string
  user_id: string
  video_id: string
  watched_seconds: number
  progress_percentage: number
  status: 'started' | 'watching' | 'completed'
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AgoraReadingProgress {
  id: string
  user_id: string
  reading_id: string
  status: 'pending' | 'completed'
  completed_at: string | null
  created_at: string
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
  session_id: string // Frontend-generated session ID
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
  agent_id?: string
  agent_name?: string
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
