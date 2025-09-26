import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserPreferences, UpdateProfileData, UpdatePreferencesData } from '@/types/profile'

export class ProfileService {
  private supabase = createClient()

  async getProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return {
        ...data,
        email: user.email!
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }

  async updateProfile(updates: UpdateProfileData): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const { error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('theme, language, notifications_enabled, email_notifications')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Preferences fetch error:', error)
      return null
    }
  }

  async updatePreferences(updates: UpdatePreferencesData): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const { error } = await this.supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating preferences:', error)
        return false
      }

      // Apply theme immediately
      if (updates.theme) {
        this.applyTheme(updates.theme)
      }

      return true
    } catch (error) {
      console.error('Preferences update error:', error)
      return false
    }
  }

  async uploadAvatar(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

      const { data, error } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Error uploading avatar:', error)
        return null
      }

      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      return null
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto') {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }
}

export const profileService = new ProfileService()