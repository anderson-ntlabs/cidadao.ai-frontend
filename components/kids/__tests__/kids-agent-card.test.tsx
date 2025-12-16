/**
 * Tests for KidsAgentCard component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KidsAgentCard } from '../kids-agent-card'
import { Agent } from '@/types/agent'

// Mock dependencies
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: any) => (
    <img src={src} alt={alt} data-fill={fill} className={className} data-testid="agent-image" />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('KidsAgentCard', () => {
  const mockMonteiroLobato: Agent = {
    id: 'monteiro_lobato',
    name: 'Monteiro Lobato',
    image: '/agents/monteiro_lobato.png',
    role: {
      pt: 'Contador de Histórias',
      en: 'Storyteller',
    },
    description: {
      pt: 'Criador do Sítio do Picapau Amarelo',
      en: 'Creator of Yellow Woodpecker Farm',
    },
    tier: 1,
  }

  const mockTarsila: Agent = {
    id: 'tarsila',
    name: 'Tarsila do Amaral',
    image: '/agents/tarsila.png',
    role: {
      pt: 'Artista',
      en: 'Artist',
    },
    description: {
      pt: 'Uma das principais pintoras do modernismo brasileiro',
      en: 'One of the main painters of Brazilian modernism',
    },
    tier: 1,
  }

  const defaultAgent: Agent = {
    id: 'default_agent',
    name: 'Default Agent',
    image: '/agents/default.png',
    role: {
      pt: 'Agente',
      en: 'Agent',
    },
    description: {
      pt: 'Agente padrão',
      en: 'Default agent',
    },
    tier: 1,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders agent name', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} />)

      expect(screen.getByText('Monteiro Lobato')).toBeInTheDocument()
    })

    it('renders agent image', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const image = screen.getByTestId('agent-image')
      expect(image).toHaveAttribute('src', '/agents/monteiro_lobato.png')
      expect(image).toHaveAttribute('alt', 'Monteiro Lobato')
    })

    it('renders agent role in PT', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="pt" />)

      expect(screen.getByText('Contador de Histórias')).toBeInTheDocument()
    })

    it('renders agent role in EN', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="en" />)

      expect(screen.getByText('Storyteller')).toBeInTheDocument()
    })

    it('renders agent description in PT', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="pt" />)

      expect(screen.getByText('Criador do Sítio do Picapau Amarelo')).toBeInTheDocument()
    })

    it('renders agent description in EN', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="en" />)

      expect(screen.getByText('Creator of Yellow Woodpecker Farm')).toBeInTheDocument()
    })

    it('renders CTA button in PT', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="pt" />)

      expect(screen.getByText('Conversar!')).toBeInTheDocument()
    })

    it('renders CTA button in EN', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} lang="en" />)

      expect(screen.getByText('Chat!')).toBeInTheDocument()
    })
  })

  describe('Card Colors', () => {
    it('applies green color for Monteiro Lobato', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('border-kids-green')
    })

    it('applies coral color for Tarsila', () => {
      const { container } = render(<KidsAgentCard agent={mockTarsila} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('border-kids-coral')
    })

    it('applies turquoise color for default agent', () => {
      const { container } = render(<KidsAgentCard agent={defaultAgent} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('border-kids-turquoise')
    })
  })

  describe('Icon Colors', () => {
    it('renders green icon background for Monteiro Lobato', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      // The icon wrapper should have bg-kids-green
      expect(container.innerHTML).toContain('bg-kids-green')
    })

    it('renders coral icon background for Tarsila', () => {
      const { container } = render(<KidsAgentCard agent={mockTarsila} />)

      expect(container.innerHTML).toContain('bg-kids-coral')
    })
  })

  describe('Interaction', () => {
    it('calls onSelect with agent id when clicked', async () => {
      const onSelect = vi.fn()
      const user = userEvent.setup()

      render(<KidsAgentCard agent={mockMonteiroLobato} onSelect={onSelect} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(onSelect).toHaveBeenCalledWith('monteiro_lobato')
    })

    it('does not throw when clicked without onSelect', async () => {
      const user = userEvent.setup()

      render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = screen.getByRole('button')

      // Should not throw
      await expect(user.click(button)).resolves.not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('is a button element', () => {
      render(<KidsAgentCard agent={mockMonteiroLobato} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has text-left alignment', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('text-left')
    })
  })

  describe('Styling', () => {
    it('has kids-card class', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('kids-card')
    })

    it('has hover effects', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('hover:shadow-xl')
    })

    it('has focus ring', () => {
      const { container } = render(<KidsAgentCard agent={mockMonteiroLobato} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('focus:ring-4')
    })
  })
})
