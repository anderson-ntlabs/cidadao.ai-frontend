/**
 * Tests for CertificateModal
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificateModal } from '../certificate-modal'

// Mock dependencies
vi.mock('@/hooks/use-agora', () => ({
  useAgora: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'Maria Santos',
      email: 'maria@test.com',
      totalXp: 1500,
      totalTimeMinutes: 240,
      currentLevel: 5,
      currentRank: 'Cidadão Ativo',
      currentStreak: 7,
    },
    xpTransactions: [
      { id: '1', sourceType: 'video', amount: 100, description: 'Video', createdAt: new Date() },
    ],
    diaryEntries: [{ id: '1', entryDate: '2025-12-15', content: 'Entry', createdAt: new Date() }],
    sessions: [],
    isAuthenticated: true,
  })),
}))

vi.mock('@/hooks/use-certificate-data', () => ({
  useCertificateData: vi.fn(() => ({
    telemetry: {
      requiredVideosCompleted: 5,
      totalRequiredVideos: 5,
      totalVideoWatchTimeSeconds: 7200,
      requiredReadingsCompleted: 3,
      totalRequiredReadings: 3,
      diaryEntries: 3,
      chatMessages: 15,
      totalTimeMinutes: 240,
      videosCompleted: 5,
      readingsCompleted: 3,
    },
    validation: {
      completedRequirements: 6,
      totalRequirements: 6,
      requirements: [
        {
          id: '1',
          label: 'Videos',
          description: 'Watch videos',
          met: true,
          currentValue: 5,
          required: 5,
          category: 'video',
        },
        {
          id: '2',
          label: 'Leituras',
          description: 'Read articles',
          met: true,
          currentValue: 3,
          required: 3,
          category: 'reading',
        },
        {
          id: '3',
          label: 'Diário',
          description: 'Write diary',
          met: true,
          currentValue: 3,
          required: 3,
          category: 'engagement',
        },
      ],
    },
    consistency: {
      warnings: [],
      isConsistent: true,
    },
    dailyActivity: {},
    canGenerateCertificate: true,
    completionPercentage: 100,
    hasConsistencyWarnings: false,
    certificateType: {
      emoji: '🎓',
      label: 'Certificado Completo',
    },
  })),
}))

vi.mock('@/app/pt/agora/actions', () => ({
  saveCertificate: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/analytics/agora-tracker', () => ({
  trackCertificateDownload: vi.fn(),
  trackReportDownload: vi.fn(),
}))

vi.mock('@/lib/agora/certificate-requirements', () => ({
  determineCertificateType: vi.fn(() => 'complete'),
}))

// Mock PDF generators - use vi.hoisted for variables used in mocks
const { mockSave } = vi.hoisted(() => ({
  mockSave: vi.fn(),
}))

vi.mock('@/lib/agora/certificate/generate-certificate-pdf', () => ({
  generateCertificatePDF: vi.fn().mockResolvedValue({
    pdf: { save: mockSave },
    id: 'cert-123',
  }),
}))

vi.mock('@/lib/agora/certificate/generate-report-pdf', () => ({
  generateReportPDF: vi.fn().mockResolvedValue({
    pdf: { save: mockSave },
    id: 'report-456',
  }),
}))

describe('CertificateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Certificado e Relatorio')).toBeInTheDocument()
    })

    it('displays progress percentage', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('shows user stats', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('1500')).toBeInTheDocument() // XP
      expect(screen.getByText('4h')).toBeInTheDocument() // Time (240 min = 4h)
      expect(screen.getByText('Lv.5')).toBeInTheDocument() // Level
    })

    it('shows certificate type when eligible', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Certificado Completo')).toBeInTheDocument()
    })

    it('renders metrics grid', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Videos Obrigatorios')).toBeInTheDocument()
      expect(screen.getByText('Leituras Obrigatorias')).toBeInTheDocument()
      expect(screen.getByText('Entradas no Diario')).toBeInTheDocument()
      expect(screen.getByText('Mensagens com Mentor')).toBeInTheDocument()
    })

    it('renders requirements checklist', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Requisitos para Certificado')).toBeInTheDocument()
      expect(screen.getByText('6/6')).toBeInTheDocument()
    })
  })

  describe('Certificate Download', () => {
    it('enables certificate button when eligible', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /baixar certificado/i })
      expect(button).not.toBeDisabled()
    })

    it('certificate button is clickable', async () => {
      const user = userEvent.setup()
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /baixar certificado/i })
      // Should be able to click without throwing
      await user.click(button)
    })
  })

  describe('Report Download', () => {
    it('shows report download button', () => {
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /baixar relatorio/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('report button is clickable', async () => {
      const user = userEvent.setup()
      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /baixar relatorio/i })
      // Should be able to click without throwing
      await user.click(button)
    })
  })

  describe('Close Modal', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<CertificateModal isOpen={true} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /fechar/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Not Eligible', () => {
    it('disables certificate button when not eligible', async () => {
      // Override mock for this test
      const useCertificateDataMock = await import('@/hooks/use-certificate-data')
      vi.mocked(useCertificateDataMock.useCertificateData).mockReturnValueOnce({
        telemetry: {
          requiredVideosCompleted: 2,
          totalRequiredVideos: 5,
          totalVideoWatchTimeSeconds: 3600,
          requiredReadingsCompleted: 1,
          totalRequiredReadings: 3,
          diaryEntries: 1,
          chatMessages: 5,
          totalTimeMinutes: 60,
          videosCompleted: 2,
          readingsCompleted: 1,
        },
        validation: {
          completedRequirements: 2,
          totalRequirements: 6,
          requirements: [],
        },
        consistency: { warnings: [], isConsistent: true },
        dailyActivity: {},
        canGenerateCertificate: false,
        completionPercentage: 40,
        hasConsistencyWarnings: false,
        certificateType: null,
      } as any)

      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /baixar certificado/i })
      expect(button).toBeDisabled()
    })
  })

  describe('Consistency Warnings', () => {
    it('displays warnings when present', async () => {
      // Override mock for this test
      const useCertificateDataMock = await import('@/hooks/use-certificate-data')
      vi.mocked(useCertificateDataMock.useCertificateData).mockReturnValueOnce({
        telemetry: {
          requiredVideosCompleted: 5,
          totalRequiredVideos: 5,
          totalVideoWatchTimeSeconds: 7200,
          requiredReadingsCompleted: 3,
          totalRequiredReadings: 3,
          diaryEntries: 3,
          chatMessages: 15,
          totalTimeMinutes: 240,
          videosCompleted: 5,
          readingsCompleted: 3,
        },
        validation: {
          completedRequirements: 6,
          totalRequirements: 6,
          requirements: [],
        },
        consistency: {
          warnings: ['Video watch time inconsistent', 'XP anomaly detected'],
          isConsistent: false,
        },
        dailyActivity: {},
        canGenerateCertificate: true,
        completionPercentage: 100,
        hasConsistencyWarnings: true,
        certificateType: { emoji: '🎓', label: 'Complete' },
      } as any)

      render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Avisos de Consistencia')).toBeInTheDocument()
      expect(screen.getByText('Video watch time inconsistent')).toBeInTheDocument()
      expect(screen.getByText('XP anomaly detected')).toBeInTheDocument()
    })
  })

  describe('User Not Available', () => {
    it('returns null when user is null', async () => {
      const useAgoraMock = await import('@/hooks/use-agora')
      vi.mocked(useAgoraMock.useAgora).mockReturnValueOnce({
        user: null,
        xpTransactions: [],
        diaryEntries: [],
        sessions: [],
        isAuthenticated: false,
      } as any)

      const { container } = render(<CertificateModal isOpen={true} onClose={() => {}} />)

      expect(container.firstChild).toBeNull()
    })
  })
})
