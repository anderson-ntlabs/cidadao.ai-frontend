import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LogoutModal } from '../logout-modal'

describe('LogoutModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = render(<LogoutModal {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders modal when open', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByText('Sair da Ágora')).toBeInTheDocument()
    })

    it('renders confirmation message', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByText(/Tem certeza que deseja sair/)).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('renders logout button', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has dialog role', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal attribute', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      render(<LogoutModal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'logout-title')
    })

    it('close button has aria-label', () => {
      render(<LogoutModal {...defaultProps} />)
      expect(screen.getByLabelText('Fechar')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when cancel button clicked', () => {
      const onClose = vi.fn()
      render(<LogoutModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Cancelar'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when logout button clicked', () => {
      const onConfirm = vi.fn()
      render(<LogoutModal {...defaultProps} onConfirm={onConfirm} />)

      fireEvent.click(screen.getByText('Sair'))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close icon clicked', () => {
      const onClose = vi.fn()
      render(<LogoutModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByLabelText('Fechar'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn()
      render(<LogoutModal {...defaultProps} onClose={onClose} />)

      // Find backdrop by aria-hidden attribute
      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).toBeInTheDocument()
      fireEvent.click(backdrop!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('styling', () => {
    it('has backdrop blur', () => {
      render(<LogoutModal {...defaultProps} />)
      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).toHaveClass('backdrop-blur-sm')
    })

    it('modal has shadow', () => {
      render(<LogoutModal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('shadow-2xl')
    })
  })
})
