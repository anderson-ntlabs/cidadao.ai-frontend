/**
 * Survey Types
 *
 * TypeScript interfaces for the UX Survey system
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

// ===========================================
// Question Types
// ===========================================

export type QuestionType =
  | 'nps' // Net Promoter Score (0-10)
  | 'stars' // Star rating (1-5)
  | 'multiple_single' // Single selection
  | 'multiple_multi' // Multiple selection
  | 'text' // Free text input

export interface QuestionOption {
  value: string
  label_pt: string
  label_en: string
}

export interface SurveyQuestion {
  id: string
  type: QuestionType
  question_pt: string
  question_en: string
  required: boolean
  options?: QuestionOption[]
  placeholder_pt?: string
  placeholder_en?: string
  min?: number // For NPS/stars
  max?: number // For NPS/stars
  maxLength?: number // For text
}

// ===========================================
// Survey State
// ===========================================

export type SurveyStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'

export interface SurveyAnswers {
  [questionId: string]: string | number | string[]
}

export interface SurveyResponse {
  id: string
  user_id: string
  survey_version: string
  answers: SurveyAnswers
  current_step: number
  total_steps: number
  started_at: string
  completed_at: string | null
  updated_at: string
  badge_awarded: boolean
  metadata?: SurveyMetadata
}

export interface SurveyMetadata {
  device_type?: 'mobile' | 'tablet' | 'desktop'
  browser?: string
  screen_width?: number
  screen_height?: number
  duration_ms?: number
  source?: 'fab' | 'footer' | 'profile'
}

// ===========================================
// Survey Store State
// ===========================================

export interface SurveyStoreState {
  // UI State
  isOpen: boolean
  currentStep: number
  isSubmitting: boolean
  error: string | null

  // Data State
  answers: SurveyAnswers
  hasCompleted: boolean
  showSuccess: boolean

  // Response from DB (if exists)
  savedResponse: SurveyResponse | null
}

export interface SurveyStoreActions {
  // Modal controls
  openSurvey: (source?: 'fab' | 'footer' | 'profile') => void
  closeSurvey: () => void

  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Answers
  setAnswer: (questionId: string, value: string | number | string[]) => void
  clearAnswer: (questionId: string) => void

  // Persistence
  loadSurveyProgress: () => Promise<void>
  saveSurveyProgress: () => Promise<void>
  submitSurvey: () => Promise<boolean>

  // Reset
  resetSurvey: () => void
  dismissSuccess: () => void
}

export type SurveyStore = SurveyStoreState & SurveyStoreActions

// ===========================================
// Analytics Events
// ===========================================

export type SurveyAnalyticsEvent =
  | 'survey_fab_shown'
  | 'survey_fab_clicked'
  | 'survey_opened'
  | 'survey_question_viewed'
  | 'survey_question_answered'
  | 'survey_question_skipped'
  | 'survey_step_back'
  | 'survey_completed'
  | 'survey_abandoned'
  | 'survey_closed'

export interface SurveyAnalyticsPayload {
  event: SurveyAnalyticsEvent
  survey_version?: string
  question_id?: string
  question_type?: QuestionType
  step?: number
  total_steps?: number
  duration_ms?: number
  source?: 'fab' | 'footer' | 'profile'
  completion_percent?: number
}
