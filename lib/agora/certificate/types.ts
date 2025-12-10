/**
 * Certificate Module Types
 *
 * Type definitions for certificate and report generation.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Video progress entry from localStorage
 */
export interface VideoProgressEntry {
  status?: string
  watched_seconds?: number
  video_id?: string
}

/**
 * Reading progress entry from localStorage
 */
export interface ReadingProgressEntry {
  status?: string
  reading_id?: string
}

/**
 * Daily activity record
 */
export interface DailyActivity {
  date: string
  minutes: number
  xp: number
  sessions: number
}

/**
 * UI metric configuration for display
 */
export interface UIMetric {
  label: string
  value: number
  max: number
  icon: LucideIcon
  color: string
  required: boolean
}

/**
 * XP transaction record
 */
export interface XPTransaction {
  id: string
  sourceType: string
  amount: number
  description: string
  createdAt: string
}

/**
 * Diary entry record
 */
export interface DiaryEntry {
  id: string
  entryDate: string
  content: string
  createdAt: string
}

/**
 * User profile for certificate
 */
export interface CertificateUser {
  id: string
  name: string
  email: string
  totalXp: number
  totalTimeMinutes: number
  currentLevel: number
  currentRank: string
  currentStreak: number
}

/**
 * PDF generation result
 */
export interface PDFGenerationResult {
  pdf: import('jspdf').jsPDF
  id: string
}

/**
 * Certificate save payload for Supabase
 */
export interface CertificateSavePayload {
  certificateNumber: string
  certificateType: string
  totalHours: number
  totalXp: number
  finalRank: string
  finalLevel: number
  missionsCompleted: number
  articlesRead: number
  conversationsCount: number
  verificationHash: string
}

/**
 * Chart metric for PDF reports
 */
export interface ChartMetric {
  label: string
  value: number
  max: number
  color: readonly [number, number, number]
  icon: string
}
