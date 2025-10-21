import { createClient } from '@/lib/supabase/client'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

export class AuthIntegrationService {
  private supabase = createClient()

  /**
   * Get Supabase session token to send to backend
   */
  async getSessionToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Register user with backend using Supabase auth
   */
  async registerWithBackend(): Promise<boolean> {
    try {
      const token = await this.getSessionToken()
      if (!token) return false

      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        {
          supabase_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          provider: user.app_metadata?.provider || 'email'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.status === 200 || response.status === 201
    } catch (error) {
      console.error('Failed to register with backend:', error)
      return false
    }
  }

  /**
   * Get authenticated headers for backend requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getSessionToken()
    
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'X-Client-Type': 'web',
      'X-Client-Version': '1.0.0'
    }
  }

  /**
   * Make authenticated request to backend
   */
  async authenticatedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T | null> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await axios({
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers,
        data
      })

      return response.data
    } catch (error) {
      console.error('Authenticated request failed:', error)
      return null
    }
  }

  /**
   * Sync user profile between Supabase and backend
   */
  async syncProfile(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const profile = await this.authenticatedRequest<any>(
        'POST',
        '/api/user/profile/sync',
        {
          supabase_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url
        }
      )

      return !!profile
    } catch (error) {
      console.error('Profile sync failed:', error)
      return false
    }
  }
}

export const authIntegrationService = new AuthIntegrationService()