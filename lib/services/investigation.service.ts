import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Investigation } from '@/types/supabase'

export class InvestigationService {
  private supabase = createClient()
  private logger = createLogger('InvestigationService')

  async createInvestigation(data: {
    title: string
    description?: string
    agents_used?: string[]
    metadata?: Record<string, any>
  }): Promise<Investigation | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: investigation, error } = await this.supabase
      .from('investigations')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        agents_used: data.agents_used || [],
        metadata: data.metadata || {},
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      this.logger.error('Error creating investigation:', error)
      return null
    }

    return investigation
  }

  async getUserInvestigations(
    status?: 'active' | 'completed' | 'archived'
  ): Promise<Investigation[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) return []

    let query = this.supabase
      .from('investigations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      this.logger.error('Error fetching investigations:', error)
      return []
    }

    return data || []
  }

  async getInvestigation(id: string): Promise<Investigation | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('investigations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      this.logger.error('Error fetching investigation:', error)
      return null
    }

    return data
  }

  async updateInvestigation(
    id: string,
    updates: Partial<Investigation>
  ): Promise<Investigation | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('investigations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      this.logger.error('Error updating investigation:', error)
      return null
    }

    return data
  }

  async deleteInvestigation(id: string): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) return false

    const { error } = await this.supabase
      .from('investigations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      this.logger.error('Error deleting investigation:', error)
      return false
    }

    return true
  }

  async archiveInvestigation(id: string): Promise<Investigation | null> {
    return this.updateInvestigation(id, { status: 'archived' })
  }

  async completeInvestigation(id: string): Promise<Investigation | null> {
    return this.updateInvestigation(id, { status: 'completed' })
  }
}

export const investigationService = new InvestigationService()
