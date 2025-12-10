/**
 * Certificate PDF Generator Tests
 *
 * Tests for generateCertificatePDF function.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CertificateUser } from './types'

// Create mock doc factory to get fresh instances
const createMockDoc = () => ({
  internal: {
    pageSize: {
      getWidth: () => 297,
      getHeight: () => 210,
    },
  },
  setFillColor: vi.fn(),
  setDrawColor: vi.fn(),
  setTextColor: vi.fn(),
  setLineWidth: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  rect: vi.fn(),
  circle: vi.fn(),
  roundedRect: vi.fn(),
  line: vi.fn(),
  text: vi.fn(),
  getTextWidth: vi.fn().mockReturnValue(100),
  save: vi.fn(),
})

// Use vi.hoisted to create mock before imports
const { mockJsPDF } = vi.hoisted(() => {
  const mockJsPDF = vi.fn()
  return { mockJsPDF }
})

vi.mock('jspdf', () => ({
  jsPDF: mockJsPDF,
}))

// Import after mock is set up
import { generateCertificatePDF } from './generate-certificate-pdf'

describe('generateCertificatePDF', () => {
  const mockUser: CertificateUser = {
    id: 'test-user-123',
    name: 'Maria Silva',
    email: 'maria@example.com',
    totalXp: 1500,
    totalTimeMinutes: 125,
    currentLevel: 5,
    currentRank: 'estudante',
    currentStreak: 7,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockJsPDF.mockImplementation(() => createMockDoc())
  })

  it('should return a PDF document and certificate ID', () => {
    const result = generateCertificatePDF(mockUser)

    expect(result).toHaveProperty('pdf')
    expect(result).toHaveProperty('id')
    expect(result.id).toMatch(/^CERT-/)
  })

  it('should generate unique certificate IDs with different timestamps', async () => {
    const result1 = generateCertificatePDF(mockUser)
    // Wait a tiny bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 5))
    const result2 = generateCertificatePDF(mockUser)

    // Both should have valid format
    expect(result1.id).toMatch(/^CERT-/)
    expect(result2.id).toMatch(/^CERT-/)
  })

  it('should include user ID suffix in certificate ID', () => {
    const result = generateCertificatePDF(mockUser)

    // User ID ends with 'test-user-123', so last 6 chars are 'r-123'
    expect(result.id).toContain('ER-123')
  })

  it('should create landscape PDF', () => {
    generateCertificatePDF(mockUser)

    expect(mockJsPDF).toHaveBeenCalledWith('landscape')
  })

  it('should set user name in certificate', () => {
    const { pdf } = generateCertificatePDF(mockUser)

    expect(pdf.text).toHaveBeenCalledWith(
      mockUser.name.toUpperCase(),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    )
  })

  it('should format hours and minutes correctly', () => {
    const { pdf } = generateCertificatePDF(mockUser)

    // 125 minutes = 2h 5min
    const textCalls = (pdf.text as ReturnType<typeof vi.fn>).mock.calls
    const timeText = textCalls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('hora')
    )
    expect(timeText).toBeDefined()
  })

  it('should handle zero time minutes', () => {
    const userWithZeroTime = { ...mockUser, totalTimeMinutes: 0 }
    const result = generateCertificatePDF(userWithZeroTime)

    expect(result).toHaveProperty('pdf')
    expect(result).toHaveProperty('id')
  })

  it('should handle large time values', () => {
    const userWithLargeTime = { ...mockUser, totalTimeMinutes: 10000 }
    const result = generateCertificatePDF(userWithLargeTime)

    expect(result).toHaveProperty('pdf')
    expect(result).toHaveProperty('id')
  })

  it('should handle special characters in name', () => {
    const userWithSpecialName = { ...mockUser, name: 'Jose Bonifacio de Andrada' }
    const result = generateCertificatePDF(userWithSpecialName)

    expect(result).toHaveProperty('pdf')
    const textCalls = (result.pdf.text as ReturnType<typeof vi.fn>).mock.calls
    const nameCall = textCalls.find(
      (call) => typeof call[0] === 'string' && call[0] === userWithSpecialName.name.toUpperCase()
    )
    expect(nameCall).toBeDefined()
  })
})
