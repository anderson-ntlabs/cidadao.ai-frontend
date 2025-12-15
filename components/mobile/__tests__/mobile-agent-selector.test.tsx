/**
 * Tests for MobileAgentSelector
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileAgentSelector } from '../mobile-agent-selector'

// Mock dependencies
vi.mock('@/hooks/use-haptic', () => ({
  useHaptic: vi.fn(() => ({
    vibrate: vi.fn(),
  })),
}))

vi.mock('@/lib/mobile-touch', () => ({
  touchFeedback: {
    minimal: 'touch-minimal',
    button: 'touch-button',
    icon: 'touch-icon',
    card: 'touch-card',
  },
  tapTarget: {
    small: 'tap-small',
    medium: 'tap-medium',
    large: 'tap-large',
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, className, width, height }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  ),
}))

// Mock agents data
vi.mock('@/data/agents', () => ({
  agents: [
    {
      id: 'tiradentes',
      name: 'Tiradentes',
      image: '/agents/tiradentes.png',
      role: { pt: 'Investigador' },
    },
    { id: 'zumbi', name: 'Zumbi', image: '/agents/zumbi.png', role: { pt: 'Analista' } },
    {
      id: 'anita',
      name: 'Anita Garibaldi',
      image: '/agents/anita.png',
      role: { pt: 'Estrategista' },
    },
  ],
}))

describe('MobileAgentSelector', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedAgentId: null,
    onSelectAgent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = ''
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(<MobileAgentSelector {...defaultProps} isOpen={false} />)

      // Should not have visible content
      expect(screen.queryByText('Cidadão.AI')).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
      render(<MobileAgentSelector {...defaultProps} />)

      expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument()
    })

    it('renders agent list', () => {
      render(<MobileAgentSelector {...defaultProps} />)

      expect(screen.getByText('Tiradentes')).toBeInTheDocument()
      expect(screen.getByText('Zumbi')).toBeInTheDocument()
      expect(screen.getByText('Anita Garibaldi')).toBeInTheDocument()
    })

    it('shows tabs for Cidadao and Maritaca modes', () => {
      render(<MobileAgentSelector {...defaultProps} onModeChange={() => {}} />)

      expect(screen.getByText(/cidadão/i)).toBeInTheDocument()
      expect(screen.getByText(/maritaca/i)).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MobileAgentSelector {...defaultProps} className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('calls onSelectAgent when agent is clicked', async () => {
      const user = userEvent.setup()
      const onSelectAgent = vi.fn()

      render(<MobileAgentSelector {...defaultProps} onSelectAgent={onSelectAgent} />)

      await user.click(screen.getByText('Tiradentes'))

      expect(onSelectAgent).toHaveBeenCalledWith('tiradentes')
    })

    it('highlights selected agent', () => {
      render(<MobileAgentSelector {...defaultProps} selectedAgentId="zumbi" />)

      // Selected agent should have visual indicator (checkmark or ring)
      const zumbiCard = screen.getByText('Zumbi').closest('button')
      expect(zumbiCard).toBeInTheDocument()
    })

    it('calls onClose after selection', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<MobileAgentSelector {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByText('Anita Garibaldi'))

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Mode Switching', () => {
    it('has mode tabs when onModeChange provided', () => {
      render(
        <MobileAgentSelector
          {...defaultProps}
          onModeChange={() => {}}
          onMaritacaModelChange={() => {}}
        />
      )

      // Should have both mode tabs
      expect(screen.getByText(/cidadão/i)).toBeInTheDocument()
      expect(screen.getByText(/maritaca/i)).toBeInTheDocument()
    })
  })

  describe('Close Behavior', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<MobileAgentSelector {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: /fechar/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose on Escape key', () => {
      const onClose = vi.fn()

      render(<MobileAgentSelector {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onClose).toHaveBeenCalled()
    })

    it('prevents body scroll when open', () => {
      render(<MobileAgentSelector {...defaultProps} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when closed', () => {
      const { rerender } = render(<MobileAgentSelector {...defaultProps} />)

      rerender(<MobileAgentSelector {...defaultProps} isOpen={false} />)

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('close button has aria-label', () => {
      render(<MobileAgentSelector {...defaultProps} />)

      expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument()
    })
  })

  describe('Maritaca Models', () => {
    it('shows Maritaca models in Maritaca tab', async () => {
      const user = userEvent.setup()

      render(
        <MobileAgentSelector
          {...defaultProps}
          chatMode="maritaca"
          onModeChange={() => {}}
          onMaritacaModelChange={() => {}}
        />
      )

      // Check for model names
      expect(screen.getByText('Sabiazinho-3')).toBeInTheDocument()
      expect(screen.getByText(/sabiá-3/i)).toBeInTheDocument()
    })

    it('calls onMaritacaModelChange when model selected', async () => {
      const user = userEvent.setup()
      const onMaritacaModelChange = vi.fn()

      render(
        <MobileAgentSelector
          {...defaultProps}
          chatMode="maritaca"
          onModeChange={() => {}}
          onMaritacaModelChange={onMaritacaModelChange}
        />
      )

      await user.click(screen.getByText('Sabiazinho-3'))

      expect(onMaritacaModelChange).toHaveBeenCalledWith('sabiazinho-3')
    })
  })
})
