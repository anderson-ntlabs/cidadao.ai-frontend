/**
 * Certificate Module
 *
 * Exports for certificate and report generation.
 *
 * IMPORTANT: PDF generators are NOT exported from this barrel file
 * because jsPDF requires browser APIs (DOMMatrix). Import them directly
 * in client components:
 *
 *   import { generateCertificatePDF } from '@/lib/agora/certificate/generate-certificate-pdf'
 *   import { generateReportPDF } from '@/lib/agora/certificate/generate-report-pdf'
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

// Types
export type {
  VideoProgressEntry,
  ReadingProgressEntry,
  DailyActivity,
  UIMetric,
  XPTransaction,
  DiaryEntry,
  CertificateUser,
  PDFGenerationResult,
  CertificateSavePayload,
  ChartMetric,
} from './types'

// Constants
export {
  STORAGE_KEYS,
  VIDEO_DURATIONS,
  REQUIRED_CONTENT_IDS,
  PDF_COLORS,
  PDF_STYLES,
  UI_COLOR_CLASSES,
} from './constants'

// NOTE: PDF generators must be imported directly from their files
// to avoid bundling jsPDF on the server side
