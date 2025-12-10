/**
 * Certificate Module
 *
 * Exports for certificate and report generation.
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

// PDF Generators
export { generateCertificatePDF } from './generate-certificate-pdf'
export { generateReportPDF } from './generate-report-pdf'
