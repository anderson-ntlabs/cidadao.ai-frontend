/**
 * Tests for InternshipContractModal
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InternshipContractModal } from '../internship-contract-modal'

// Mock dependencies
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

const mockAcceptInternshipContract = vi.fn()
vi.mock('@/hooks/use-agora', () => ({
  useAgora: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'João Silva',
      email: 'joao@test.com',
    },
    acceptInternshipContract: mockAcceptInternshipContract,
  })),
}))

// Mock fetch for IP address
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ ip: '192.168.1.1' }),
  })
) as any

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    splitTextToSize: vi.fn(() => ['line1']),
    addPage: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    save: vi.fn(),
  })),
}))

describe('InternshipContractModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(<InternshipContractModal isOpen={false} onClose={() => {}} />)

      expect(container.firstChild).toBeNull()
    })

    it('renders modal when isOpen is true', () => {
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Termos de Uso')).toBeInTheDocument()
      expect(screen.getByText('Academy Cidadão.AI - Plataforma Educacional')).toBeInTheDocument()
    })

    it('displays user name in greeting', () => {
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    it('renders all required checkboxes', () => {
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText(/autorizo a coleta de telemetria/i)).toBeInTheDocument()
      expect(screen.getByText(/autorizo o tratamento dos meus dados/i)).toBeInTheDocument()
      expect(screen.getByText(/concordo com a geração de relatórios/i)).toBeInTheDocument()
      expect(screen.getByText(/estou ciente dos meus direitos/i)).toBeInTheDocument()
      expect(screen.getByText(/aceito participar da plataforma/i)).toBeInTheDocument()
    })

    it('renders legal information sections', () => {
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText(/fundamentação legal/i)).toBeInTheDocument()
      expect(screen.getByText(/o que é a academy/i)).toBeInTheDocument()
      expect(screen.getByText(/métricas e progresso/i)).toBeInTheDocument()
    })

    it('displays accept button disabled initially', () => {
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      expect(button).toBeDisabled()
    })
  })

  describe('Checkbox Interactions', () => {
    it('enables accept button when all checkboxes are checked', async () => {
      const user = userEvent.setup()
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(5)

      // Check all checkboxes
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
      }

      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      expect(button).not.toBeDisabled()
    })

    it('disables accept button if any checkbox is unchecked', async () => {
      const user = userEvent.setup()
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      const checkboxes = screen.getAllByRole('checkbox')

      // Check all checkboxes
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
      }

      // Uncheck one
      await user.click(checkboxes[0])

      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      expect(button).toBeDisabled()
    })
  })

  describe('Accept Flow', () => {
    it('calls acceptInternshipContract and redirects on accept', async () => {
      const user = userEvent.setup()
      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      // Check all checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
      }

      // Click accept
      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockAcceptInternshipContract).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt/agora/onboarding')
      })
    })

    it('calls onClose instead of redirect when redirectToOnboarding is false', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <InternshipContractModal isOpen={true} onClose={onClose} redirectToOnboarding={false} />
      )

      // Check all checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
      }

      // Click accept
      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      await user.click(button)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows loading state while accepting', async () => {
      const user = userEvent.setup()

      // Make accept take longer
      mockAcceptInternshipContract.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      // Check all checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      for (const checkbox of checkboxes) {
        await user.click(checkbox)
      }

      // Click accept
      const button = screen.getByRole('button', { name: /aceitar e baixar termos/i })
      await user.click(button)

      // Should show loading text
      expect(screen.getByText(/gerando termos/i)).toBeInTheDocument()
    })
  })

  describe('User Not Authenticated', () => {
    it('returns null when user is null', async () => {
      // Override mock for this test
      const useAgoraMock = await import('@/hooks/use-agora')
      vi.mocked(useAgoraMock.useAgora).mockReturnValueOnce({
        user: null,
        acceptInternshipContract: mockAcceptInternshipContract,
      } as any)

      const { container } = render(<InternshipContractModal isOpen={true} onClose={() => {}} />)

      expect(container.firstChild).toBeNull()
    })
  })
})
