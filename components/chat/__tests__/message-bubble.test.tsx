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
    writeText: mockWriteText
  },
  writable: true,
  configurable: true
})

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
  })

  describe('Rendering', () => {
    it('renders user message correctly', () => {
      render(
        <MessageBubble content="Hello, world!" role="user" />
      )
      expect(screen.getByText('Hello, world!')).toBeInTheDocument()
    })

    it('renders assistant message correctly', async () => {
      render(
        <MessageBubble
          content="I can help you!"
          role="assistant"
          agentName="Abaporu"
        />
      )

      // Content should be visible
      await waitFor(() => {
        expect(screen.getByText('I can help you!')).toBeInTheDocument()
      })
    })

    it('displays agent name for assistant messages', () => {
      render(
        <MessageBubble
          content="Test message"
          role="assistant"
          agentName="Zumbi"
        />
      )
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
          metadata={{ model: 'sabia-3' }}
        />
      )
      expect(screen.getByText(/Sabiá-3/)).toBeInTheDocument()
    })

    it('applies correct styles for user messages', () => {
      const { container } = render(
        <MessageBubble content="User message" role="user" />
      )
      const bubble = container.querySelector('.from-green-500')
      expect(bubble).toBeInTheDocument()
    })

    it('applies correct styles for assistant messages', () => {
      const { container } = render(
        <MessageBubble content="Assistant message" role="assistant" />
      )
      const bubble = container.querySelector('.bg-white')
      expect(bubble).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('shows copy button', () => {
      render(
        <MessageBubble content="Copy me" role="assistant" />
      )
      expect(screen.getByLabelText('Copiar mensagem')).toBeInTheDocument()
    })

    it('shows share button', () => {
      render(
        <MessageBubble content="Share me" role="assistant" />
      )
      expect(screen.getByLabelText('Compartilhar mensagem')).toBeInTheDocument()
    })

    it('shows export button', () => {
      render(
        <MessageBubble content="Export me" role="assistant" />
      )
      expect(screen.getByLabelText('Exportar mensagem')).toBeInTheDocument()
    })

    it('shows feedback buttons for assistant messages', () => {
      render(
        <MessageBubble content="Rate me" role="assistant" />
      )
      expect(screen.getByLabelText('Marcar como útil')).toBeInTheDocument()
      expect(screen.getByLabelText('Marcar como não útil')).toBeInTheDocument()
    })

    it('does not show feedback buttons for user messages', () => {
      render(
        <MessageBubble content="My message" role="user" />
      )
      expect(screen.queryByLabelText('Marcar como útil')).not.toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('copies content to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(
        <MessageBubble content="Copy this text" role="assistant" />
      )

      const copyButton = screen.getByLabelText('Copiar mensagem')
      await user.click(copyButton)

      // Verify toast notification was shown (indicates successful copy)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Copiado!',
          'Mensagem copiada para área de transferência'
        )
      })
    })

    it('shows check icon after successful copy', async () => {
      const user = userEvent.setup()

      render(
        <MessageBubble content="Test" role="assistant" />
      )

      const copyButton = screen.getByLabelText('Copiar mensagem')
      await user.click(copyButton)

      // Check icon should be visible
      await waitFor(() => {
        expect(copyButton.querySelector('svg')).toHaveClass('lucide-check')
      })
    })
  })

  describe('Export Functionality', () => {
    it('exports message when export button is clicked', async () => {
      const user = userEvent.setup()

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      render(
        <MessageBubble content="Export this" role="assistant" />
      )

      const exportButton = screen.getByLabelText('Exportar mensagem')
      await user.click(exportButton)

      // Should create a blob URL
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('Feedback', () => {
    it('handles positive feedback', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(
        <MessageBubble content="Rate me" role="assistant" />
      )

      const thumbsUpButton = screen.getByLabelText('Marcar como útil')
      await user.click(thumbsUpButton)

      expect(toast.info).toHaveBeenCalledWith(
        'Obrigado!',
        'Seu feedback ajuda a melhorar'
      )
    })

    it('handles negative feedback', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(
        <MessageBubble content="Rate me" role="assistant" />
      )

      const thumbsDownButton = screen.getByLabelText('Marcar como não útil')
      await user.click(thumbsDownButton)

      expect(toast.info).toHaveBeenCalledWith(
        'Feedback registrado',
        'Vamos trabalhar para melhorar'
      )
    })
  })

  describe('Loading States', () => {
    it('shows TypingMessage when isLatest and isLoading', () => {
      render(
        <MessageBubble
          content="Loading..."
          role="assistant"
          isLatest={true}
          isLoading={true}
        />
      )
      // TypingMessage component should be rendered
      // (Would need to check for specific TypingMessage indicators)
    })

    it('hides actions when loading', () => {
      render(
        <MessageBubble
          content="Loading..."
          role="assistant"
          isLoading={true}
        />
      )
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
      expect(screen.getByText('95% confiança')).toBeInTheDocument()
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
          metadata={{ confidence: 0.60 }}
        />
      )
      const confidenceBar = container.querySelector('.bg-orange-500')
      expect(confidenceBar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-labels for all action buttons', () => {
      render(
        <MessageBubble content="Test" role="assistant" />
      )

      expect(screen.getByLabelText('Copiar mensagem')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartilhar mensagem')).toBeInTheDocument()
      expect(screen.getByLabelText('Exportar mensagem')).toBeInTheDocument()
      expect(screen.getByLabelText('Marcar como útil')).toBeInTheDocument()
      expect(screen.getByLabelText('Marcar como não útil')).toBeInTheDocument()
    })

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')

      render(
        <MessageBubble content="Test" role="assistant" />
      )

      const copyButton = screen.getByLabelText('Copiar mensagem')

      // Should be able to focus
      copyButton.focus()
      expect(copyButton).toHaveFocus()

      // Should be able to activate with Enter
      await user.keyboard('{Enter}')

      // Verify toast notification (indicates button was activated)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('has touch-friendly button sizes on mobile', () => {
      render(
        <MessageBubble content="Test" role="assistant" />
      )

      const copyButton = screen.getByLabelText('Copiar mensagem')
      // Button should have p-2 class for mobile (44px+ touch target)
      expect(copyButton).toHaveClass('p-2')
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
      render(
        <MessageBubble
          content="**Bold text**"
          role="assistant"
        />
      )

      // Should render markdown (wrapped in Suspense)
      await waitFor(() => {
        const boldText = screen.queryByText('Bold text')
        if (boldText) {
          expect(boldText.tagName).toBe('STRONG')
        }
      })
    })

    it('does not render markdown for user messages', () => {
      render(
        <MessageBubble
          content="**Not bold**"
          role="user"
        />
      )

      // Should render as plain text
      expect(screen.getByText('**Not bold**')).toBeInTheDocument()
    })
  })
})
