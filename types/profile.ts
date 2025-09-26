export interface UserProfile {
  id: string
  username?: string
  full_name?: string
  email: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'pt' | 'en'
  notifications_enabled: boolean
  email_notifications: boolean
}

export interface UpdateProfileData {
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
}

export interface UpdatePreferencesData {
  theme?: 'light' | 'dark' | 'auto'
  language?: 'pt' | 'en'
  notifications_enabled?: boolean
  email_notifications?: boolean
}