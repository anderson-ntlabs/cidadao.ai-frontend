/**
 * User Profile Service
 *
 * Manages user profile data persistence in Supabase
 * Includes profile updates, avatar uploads, and preferences
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  username: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: 'pt' | 'en'
  font_size?: 'small' | 'normal' | 'large' | 'xlarge'
  high_contrast?: boolean
  vlibras_enabled?: boolean
  notifications_enabled?: boolean
  email_notifications?: boolean
}

export interface UserStats {
  total_sessions: number
  total_messages: number
  total_investigations: number
  member_since: string
  last_active?: string
}

class UserProfileService {
  private supabase = createClient()

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Profile doesn't exist yet - this is normal for new users
        if (error.code === 'PGRST116') {
          logger.info('Profile not found for user, will be created on first update', { userId })
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to get user profile', { userId, error })
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      logger.info('Profile updated successfully', { userId })
      return data
    } catch (error) {
      logger.error('Failed to update profile', { userId, error })
      throw error
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl })

      logger.info('Avatar uploaded successfully', { userId, publicUrl })
      return publicUrl
    } catch (error) {
      logger.error('Failed to upload avatar', { userId, error })
      throw error
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Return defaults if no preferences found
        if (error.code === 'PGRST116') {
          return this.getDefaultPreferences()
        }
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to get preferences', { userId, error })
      return this.getDefaultPreferences()
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      logger.info('Preferences updated', { userId })
      return data
    } catch (error) {
      logger.error('Failed to update preferences', { userId, error })
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<UserStats> {
    try {
      // Get session count
      const { count: sessionCount } = await this.supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get message count
      const { count: messageCount } = await this.supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get investigation count
      const { count: investigationCount } = await this.supabase
        .from('investigations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get user creation date
      const { data: { user } } = await this.supabase.auth.getUser()
      const memberSince = user?.created_at || new Date().toISOString()

      // Get last activity (most recent message or session)
      const { data: lastSession } = await this.supabase
        .from('chat_sessions')
        .select('updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      return {
        total_sessions: sessionCount || 0,
        total_messages: messageCount || 0,
        total_investigations: investigationCount || 0,
        member_since: memberSince,
        last_active: lastSession?.updated_at
      }
    } catch (error) {
      logger.error('Failed to get user stats', { userId, error })
      // Return zeros if tables don't exist yet
      return {
        total_sessions: 0,
        total_messages: 0,
        total_investigations: 0,
        member_since: new Date().toISOString(),
      }
    }
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      // Mark profile as deleted
      await this.updateProfile(userId, {
        full_name: '[Deleted User]',
        bio: null,
        avatar_url: null
      })

      logger.warn('User account deleted', { userId })
    } catch (error) {
      logger.error('Failed to delete account', { userId, error })
      throw error
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'pt',
      font_size: 'normal',
      high_contrast: false,
      vlibras_enabled: false,
      notifications_enabled: true,
      email_notifications: false
    }
  }
}

// Singleton instance
export const userProfileService = new UserProfileService()
