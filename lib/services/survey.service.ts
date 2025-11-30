/**
 * Survey Service
 *
 * Manages UX survey responses and submission in Supabase
 * Handles survey progress persistence and completion tracking
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import type { SurveyResponse, SurveyAnswers, SurveyMetadata } from '@/types/survey'
import { SURVEY_VERSION, TOTAL_SURVEY_STEPS } from '@/data/survey-questions'
import { badgeService } from './badge.service'

class SurveyService {
  private supabase = createClient()

  /**
   * Check if user has already completed the survey
   */
  async hasCompletedSurvey(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('survey_responses')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('survey_version', SURVEY_VERSION)
        .single()

      if (error) {
        // No response found - user hasn't started survey
        if (error.code === 'PGRST116') {
          return false
        }
        throw error
      }

      return data?.completed_at !== null
    } catch (error) {
      logger.error('Failed to check survey completion', { userId, error })
      return false
    }
  }

  /**
   * Get user's survey response (if exists)
   */
  async getSurveyResponse(userId: string): Promise<SurveyResponse | null> {
    try {
      const { data, error } = await this.supabase
        .from('survey_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('survey_version', SURVEY_VERSION)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data as SurveyResponse
    } catch (error) {
      logger.error('Failed to get survey response', { userId, error })
      return null
    }
  }

  /**
   * Start a new survey for user
   */
  async startSurvey(userId: string, metadata?: SurveyMetadata): Promise<SurveyResponse | null> {
    try {
      const { data, error } = await this.supabase
        .from('survey_responses')
        .insert({
          user_id: userId,
          survey_version: SURVEY_VERSION,
          answers: {},
          current_step: 0,
          total_steps: TOTAL_SURVEY_STEPS,
          metadata: metadata || {},
        })
        .select()
        .single()

      if (error) {
        // If survey already exists, return existing one
        if (error.code === '23505') {
          // unique violation
          logger.info('Survey already exists for user, fetching existing', { userId })
          return this.getSurveyResponse(userId)
        }
        throw error
      }

      logger.info('Survey started', { userId, surveyVersion: SURVEY_VERSION })
      return data as SurveyResponse
    } catch (error) {
      logger.error('Failed to start survey', { userId, error })
      return null
    }
  }

  /**
   * Save survey progress (partial answers)
   */
  async saveSurveyProgress(
    userId: string,
    answers: SurveyAnswers,
    currentStep: number
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('survey_responses')
        .update({
          answers,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('survey_version', SURVEY_VERSION)

      if (error) throw error

      logger.debug('Survey progress saved', { userId, currentStep })
      return true
    } catch (error) {
      logger.error('Failed to save survey progress', { userId, error })
      return false
    }
  }

  /**
   * Submit completed survey and award badge
   */
  async submitSurvey(
    userId: string,
    answers: SurveyAnswers,
    metadata?: SurveyMetadata
  ): Promise<{ success: boolean; badgeAwarded: boolean }> {
    try {
      // Update survey response as completed
      const { error: updateError } = await this.supabase
        .from('survey_responses')
        .update({
          answers,
          current_step: TOTAL_SURVEY_STEPS,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          badge_awarded: true,
          metadata: metadata || {},
        })
        .eq('user_id', userId)
        .eq('survey_version', SURVEY_VERSION)

      if (updateError) throw updateError

      // Award the badge
      const badgeAwarded = await badgeService.awardBadge(userId, 'colaborador', 'survey')

      logger.info('Survey submitted successfully', {
        userId,
        surveyVersion: SURVEY_VERSION,
        badgeAwarded,
      })

      return { success: true, badgeAwarded }
    } catch (error) {
      logger.error('Failed to submit survey', { userId, error })
      return { success: false, badgeAwarded: false }
    }
  }

  /**
   * Get survey completion stats (for analytics)
   */
  async getSurveyStats(): Promise<{
    totalResponses: number
    completedResponses: number
    abandonedResponses: number
    completionRate: number
  }> {
    try {
      const { data: total } = await this.supabase
        .from('survey_responses')
        .select('id', { count: 'exact' })
        .eq('survey_version', SURVEY_VERSION)

      const { data: completed } = await this.supabase
        .from('survey_responses')
        .select('id', { count: 'exact' })
        .eq('survey_version', SURVEY_VERSION)
        .not('completed_at', 'is', null)

      const totalCount = total?.length || 0
      const completedCount = completed?.length || 0
      const abandonedCount = totalCount - completedCount
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

      return {
        totalResponses: totalCount,
        completedResponses: completedCount,
        abandonedResponses: abandonedCount,
        completionRate: Math.round(completionRate * 10) / 10,
      }
    } catch (error) {
      logger.error('Failed to get survey stats', { error })
      return {
        totalResponses: 0,
        completedResponses: 0,
        abandonedResponses: 0,
        completionRate: 0,
      }
    }
  }
}

// Singleton instance
export const surveyService = new SurveyService()
