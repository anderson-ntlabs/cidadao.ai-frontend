/**
 * Certificate PDF Generator
 *
 * Generates elegant completion certificates with total hours only.
 * Uses dynamic import to reduce initial bundle size (~180KB savings).
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import { PDF_COLORS, PDF_STYLES } from './constants'
import type { CertificateUser, PDFGenerationResult } from './types'

/**
 * Generate a completion certificate PDF
 *
 * @param user - User profile data for the certificate
 * @returns PDF document and certificate ID
 */
export async function generateCertificatePDF(user: CertificateUser): Promise<PDFGenerationResult> {
  // Lazy load jsPDF only when generating PDF
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Elegant background
  doc.setFillColor(...PDF_COLORS.LIGHT_BG)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Decorative corner elements (subtle)
  doc.setFillColor(...PDF_COLORS.GREEN_50)
  doc.circle(-20, -20, 60, 'F')
  doc.circle(pageWidth + 20, pageHeight + 20, 60, 'F')

  // Outer border with elegant styling
  doc.setDrawColor(...PDF_COLORS.GREEN_800)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.BORDER)
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
  doc.setDrawColor(...PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THICK)
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24)
  doc.setDrawColor(...PDF_COLORS.GREEN_200)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.rect(16, 16, pageWidth - 32, pageHeight - 32)

  // Header decoration with gradient effect
  doc.setFillColor(...PDF_COLORS.GREEN_800)
  doc.rect(12, 12, pageWidth - 24, 8, 'F')
  doc.setFillColor(...PDF_COLORS.GREEN_600)
  doc.rect(12, 20, pageWidth - 24, 22, 'F')

  // Title with proper accents
  doc.setTextColor(...PDF_COLORS.WHITE)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.MASSIVE)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE CONCLUSAO', pageWidth / 2, 36, { align: 'center' })

  // Academy emblem area
  doc.setFillColor(...PDF_COLORS.WHITE)
  doc.circle(pageWidth / 2, 58, 16, 'F')
  doc.setDrawColor(...PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.EXTRA)
  doc.circle(pageWidth / 2, 58, 16)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.THICK)
  doc.circle(pageWidth / 2, 58, 12)

  // Academy name with accents
  doc.setTextColor(...PDF_COLORS.GREEN_800)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('Academia Cidadao.AI', pageWidth / 2, 82, { align: 'center' })
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SUBHEADING)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF_COLORS.GRAY_500)
  doc.text('Capacitacao em Inteligencia Artificial para Cidadania', pageWidth / 2, 92, {
    align: 'center',
  })

  // Decorative line
  doc.setDrawColor(...PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.NORMAL)
  doc.line(pageWidth / 2 - 60, 98, pageWidth / 2 + 60, 98)

  // Certificate text with proper accents
  doc.setTextColor(...PDF_COLORS.GRAY_700)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.HEADING)
  doc.text('Certificamos que', pageWidth / 2, 112, { align: 'center' })

  // Student name with elegant styling
  doc.setFontSize(PDF_STYLES.FONT_SIZE.NAME)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_COLORS.GREEN_800)
  doc.text(user.name.toUpperCase(), pageWidth / 2, 132, { align: 'center' })

  // Decorative line under name
  doc.setDrawColor(...PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.MEDIUM)
  const nameWidth = doc.getTextWidth(user.name.toUpperCase())
  doc.line(pageWidth / 2 - nameWidth / 2 - 15, 138, pageWidth / 2 + nameWidth / 2 + 15, 138)

  // Completion text with proper accents
  const hours = Math.floor(user.totalTimeMinutes / 60)
  const minutes = user.totalTimeMinutes % 60
  const hoursText = hours > 0 ? `${hours} hora${hours !== 1 ? 's' : ''}` : ''
  const minutesText = minutes > 0 ? `${minutes} minuto${minutes !== 1 ? 's' : ''}` : ''
  const timeText = [hoursText, minutesText].filter(Boolean).join(' e ')

  doc.setFontSize(PDF_STYLES.FONT_SIZE.HEADING)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF_COLORS.GRAY_700)
  doc.text('concluiu com exito o programa de capacitacao', pageWidth / 2, 152, {
    align: 'center',
  })
  doc.text('com carga horaria total de', pageWidth / 2, 163, { align: 'center' })

  // Highlight hours with badge effect
  doc.setFillColor(...PDF_COLORS.GREEN_50)
  doc.roundedRect(pageWidth / 2 - 50, 170, 100, 18, 3, 3, 'F')
  doc.setFontSize(PDF_STYLES.FONT_SIZE.HERO)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_COLORS.GREEN_600)
  doc.text(timeText || '0 horas', pageWidth / 2, 183, { align: 'center' })

  // Footer area
  const footerY = pageHeight - 40

  // Date with proper formatting
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF_COLORS.GRAY_500)
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`Emitido em ${currentDate}`, pageWidth / 2, footerY - 18, { align: 'center' })

  // Signature line with elegant styling
  doc.setDrawColor(...PDF_COLORS.GREEN_600)
  doc.setLineWidth(PDF_STYLES.LINE_WIDTH.MEDIUM)
  doc.line(pageWidth / 2 - 60, footerY, pageWidth / 2 + 60, footerY)
  doc.setFontSize(PDF_STYLES.FONT_SIZE.BODY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_COLORS.GREEN_800)
  doc.text('Coordenacao Cidadao.AI Academy', pageWidth / 2, footerY + 10, { align: 'center' })

  // Certificate ID
  const certId = `CERT-${user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  doc.setFontSize(PDF_STYLES.FONT_SIZE.SMALL)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF_COLORS.GRAY_400)
  doc.text(`ID: ${certId}`, pageWidth - margin - 8, pageHeight - 16, { align: 'right' })

  // Partners text
  doc.text('Neural Thinker AI Engineering', margin + 8, pageHeight - 16)

  return { pdf: doc, id: certId }
}
