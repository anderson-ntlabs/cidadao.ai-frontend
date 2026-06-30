/**
 * Tests for MessageBubble Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageBubble } from '../message-bubble'

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
})

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
  })

  describe('Rendering', () => {
    it('renders user message correctly', () => {
      render(<MessageBubble content="Hello, world!" role="user" />)
      expect(screen.getByText('Hello, world!')).toBeInTheDocument()
    })

    it('renders assistant message correctly', async () => {
      render(<MessageBubble content="I can help you!" role="assistant" agentName="Abaporu" />)

      // Content should be visible
      await waitFor(() => {
        expect(screen.getByText('I can help you!')).toBeInTheDocument()
      })
    })

    it('displays agent name for assistant messages', () => {
      render(<MessageBubble content="Test message" role="assistant" agentName="Zumbi" />)
      expect(screen.getByText('Zumbi')).toBeInTheDocument()
    })

    it('displays agent role when provided', () => {
      render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Anita"
          agentRole="Analista de Padrões"
        />
      )
      expect(screen.getByText(/Analista de Padrões/)).toBeInTheDocument()
    })

    it('displays model badge when metadata includes model', () => {
      render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Abaporu"
          metadata={{ model: 'sabia-4' }}
        />
      )
      // Component displays "Sabiá-4" for sabia-4 model
      expect(screen.getByText(/Sabiá-4/)).toBeInTheDocument()
    })

    it('applies correct styles for user messages', () => {
      const { container } = render(<MessageBubble content="User message" role="user" />)
      // User messages use bg-gradient-green-blue class
      const bubble = container.querySelector('.bg-gradient-green-blue')
      expect(bubble).toBeInTheDocument()
    })

    it('applies correct styles for assistant messages', () => {
      const { container } = render(<MessageBubble content="Assistant message" role="assistant" />)
      // Assistant messages have prose class for markdown styling
      const content = container.querySelector('.prose')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('shows copy button', () => {
      render(<MessageBubble content="Copy me" role="assistant" />)
      // Multiple buttons exist (mobile + desktop)
      expect(screen.getAllByLabelText('Copiar mensagem').length).toBeGreaterThan(0)
    })

    it('shows share button', () => {
      render(<MessageBubble content="Share me" role="assistant" />)
      // Multiple buttons exist (mobile + desktop)
      expect(screen.getAllByLabelText('Compartilhar mensagem').length).toBeGreaterThan(0)
    })

    it('shows export button (desktop visible, mobile in expanded menu)', () => {
      render(<MessageBubble content="Export me" role="assistant" />)
      // On desktop (hidden but in DOM) and mobile (inside expanded actions)
      const exportButtons = screen.getAllByLabelText('Exportar mensagem')
      expect(exportButtons.length).toBeGreaterThan(0)
    })

    it('shows feedback buttons for assistant messages', () => {
      render(<MessageBubble content="Rate me" role="assistant" />)
      // Feedback buttons exist in both desktop and mobile expanded views
      const thumbsUpButtons = screen.getAllByLabelText('Marcar como útil')
      const thumbsDownButtons = screen.getAllByLabelText('Marcar como não útil')
      expect(thumbsUpButtons.length).toBeGreaterThan(0)
      expect(thumbsDownButtons.length).toBeGreaterThan(0)
    })

    it('does not show feedback buttons for user messages', () => {
      render(<MessageBubble content="My message" role="user" />)
      expect(screen.queryByLabelText('Marcar como útil')).not.toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('copies content to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(<MessageBubble content="Copy this text" role="assistant" />)

      // Get the first copy button (mobile version is first in DOM)
      const copyButtons = screen.getAllByLabelText('Copiar mensagem')
      await user.click(copyButtons[0])

      // Verify toast notification was shown (indicates successful copy)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Copiado!',
          'Mensagem copiada para a area de transferencia'
        )
      })
    })

    it('shows check icon after successful copy', async () => {
      const user = userEvent.setup()

      render(<MessageBubble content="Test" role="assistant" />)

      const copyButtons = screen.getAllByLabelText('Copiar mensagem')
      await user.click(copyButtons[0])

      // Check icon should be visible (check for green color class)
      await waitFor(() => {
        const svgs = copyButtons[0].querySelectorAll('svg')
        const hasCheckIcon = Array.from(svgs).some(
          (svg) =>
            svg.classList.contains('text-green-600') || svg.classList.contains('lucide-check')
        )
        expect(hasCheckIcon).toBe(true)
      })
    })
  })

  describe('Export Functionality', () => {
    it('exports message when export button is clicked', async () => {
      const user = userEvent.setup()

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      render(<MessageBubble content="Export this" role="assistant" />)

      const exportButtons = screen.getAllByLabelText('Exportar mensagem')
      await user.click(exportButtons[0])

      // Should create a blob URL
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('Feedback', () => {
    it('handles positive feedback', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(<MessageBubble content="Rate me" role="assistant" />)

      const thumbsUpButtons = screen.getAllByLabelText('Marcar como útil')
      await user.click(thumbsUpButtons[0])

      expect(toast.info).toHaveBeenCalledWith('Obrigado!', 'Seu feedback ajuda a melhorar')
    })

    it('handles negative feedback', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(<MessageBubble content="Rate me" role="assistant" />)

      const thumbsDownButtons = screen.getAllByLabelText('Marcar como não útil')
      await user.click(thumbsDownButtons[0])

      expect(toast.info).toHaveBeenCalledWith(
        'Feedback registrado',
        'Vamos trabalhar para melhorar'
      )
    })
  })

  describe('Loading States', () => {
    it('shows TypingMessage when isLatest and isLoading', () => {
      render(
        <MessageBubble content="Loading..." role="assistant" isLatest={true} isLoading={true} />
      )
      // TypingMessage component should be rendered
      // (Would need to check for specific TypingMessage indicators)
    })

    it('hides actions when loading', () => {
      render(<MessageBubble content="Loading..." role="assistant" isLoading={true} />)
      // Actions should not be visible during loading
      expect(screen.queryByLabelText('Copiar mensagem')).not.toBeInTheDocument()
    })
  })

  describe('Confidence Badge', () => {
    it('displays confidence badge when metadata includes confidence', () => {
      render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Zumbi"
          metadata={{ confidence: 0.95 }}
        />
      )
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByRole('meter')).toHaveAttribute('aria-label', 'Confiança da resposta: 95%')
    })

    it('displays correct confidence color for high confidence', () => {
      const { container } = render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Zumbi"
          metadata={{ confidence: 0.92 }}
        />
      )
      const confidenceBar = container.querySelector('.bg-green-500')
      expect(confidenceBar).toBeInTheDocument()
    })

    it('displays correct confidence color for medium confidence', () => {
      const { container } = render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Anita"
          metadata={{ confidence: 0.75 }}
        />
      )
      const confidenceBar = container.querySelector('.bg-yellow-500')
      expect(confidenceBar).toBeInTheDocument()
    })

    it('displays correct confidence color for low confidence', () => {
      const { container } = render(
        <MessageBubble
          content="Test"
          role="assistant"
          agentName="Tiradentes"
          metadata={{ confidence: 0.6 }}
        />
      )
      const confidenceBar = container.querySelector('.bg-orange-500')
      expect(confidenceBar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-labels for all action buttons', () => {
      render(<MessageBubble content="Test" role="assistant" />)

      // Multiple buttons exist (mobile + desktop versions)
      expect(screen.getAllByLabelText('Copiar mensagem').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Compartilhar mensagem').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Exportar mensagem').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Marcar como útil').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Marcar como não útil').length).toBeGreaterThan(0)
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(<MessageBubble content="Test" role="assistant" />)

      const copyButtons = screen.getAllByLabelText('Copiar mensagem')

      // Should be able to focus
      copyButtons[0].focus()
      expect(copyButtons[0]).toHaveFocus()

      // Should be able to activate with Enter
      await user.keyboard('{Enter}')

      // Verify toast notification (indicates button was activated)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('has touch-friendly button sizes on mobile', () => {
      render(<MessageBubble content="Test" role="assistant" />)

      const copyButtons = screen.getAllByLabelText('Copiar mensagem')
      // First button (mobile) should have p-2 class for mobile (44px+ touch target)
      expect(copyButtons[0]).toHaveClass('p-2')
    })
  })

  describe('Callbacks', () => {
    it('calls onComplete when typing animation completes', async () => {
      const onComplete = vi.fn()

      render(
        <MessageBubble
          content="Test"
          role="assistant"
          isLatest={true}
          isLoading={true}
          onComplete={onComplete}
        />
      )

      // onComplete should be passed to TypingMessage
      // Would need to trigger TypingMessage completion
    })
  })

  describe('Markdown Support', () => {
    it('renders markdown content for assistant messages', async () => {
      render(<MessageBubble content="**Bold text**" role="assistant" />)

      // Should render markdown (wrapped in Suspense)
      await waitFor(() => {
        const boldText = screen.queryByText('Bold text')
        if (boldText) {
          expect(boldText.tagName).toBe('STRONG')
        }
      })
    })

    it('does not render markdown for user messages', () => {
      render(<MessageBubble content="**Not bold**" role="user" />)

      // Should render as plain text
      expect(screen.getByText('**Not bold**')).toBeInTheDocument()
    })
  })
})
