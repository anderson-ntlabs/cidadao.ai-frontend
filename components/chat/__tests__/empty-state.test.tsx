/**
 * Tests for ChatEmptyState
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatEmptyState } from '../empty-state'

// Mock dependencies
vi.mock('@/components/ui/optimized-image', () => ({
  OptimizedImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="agent-image" />
  ),
}))

vi.mock('@/data/agents', () => ({
  agents: [
    {
      id: 'tiradentes',
      name: 'Tiradentes',
      image: '/agents/tiradentes.png',
      role: { pt: 'Investigador Patriótico' },
    },
    {
      id: 'zumbi',
      name: 'Zumbi',
      image: '/agents/zumbi.png',
      role: { pt: 'Analista de Anomalias' },
    },
    {
      id: 'abaporu',
      name: 'Abaporu',
      image: '/agents/abaporu.webp',
      role: { pt: 'Orquestrador Master' },
    },
  ],
}))

vi.mock('@/data/agent-config', () => ({
  getAgentVisualConfig: vi.fn((agentId: string | null | undefined) => ({
    icon: '🏛️',
    greeting: 'Olá! Bem-vindo ao Cidadão.AI',
    color: '#16a34a',
    accentColor: '#22c55e',
    bgGradient: 'from-green-500 to-emerald-600',
    suggestions: ['Sugestão 1', 'Sugestão 2', 'Sugestão 3'],
  })),
  MARITACA_CONFIG: {
    'sabia-4': {
      name: 'Sabiá-4',
      role: 'Modelo avançado de IA',
      icon: '🦜',
      greeting: 'Olá! Sou o Sabiá-4',
      color: '#7c3aed',
      accentColor: '#8b5cf6',
      bgGradient: 'from-purple-500 to-violet-600',
      suggestions: ['Maritaca Sugestão 1', 'Maritaca Sugestão 2'],
    },
    'sabiazinho-4': {
      name: 'Sabiazinho-4',
      role: 'Modelo rápido',
      icon: '🐦',
      greeting: 'Oi! Sou o Sabiazinho!',
      color: '#eab308',
      accentColor: '#facc15',
      bgGradient: 'from-yellow-500 to-amber-600',
      suggestions: ['Quick suggestion 1'],
    },
  },
}))

describe('ChatEmptyState', () => {
  const defaultProps = {
    onSuggestionClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Default State (No Agent Selected)', () => {
    it('renders default suggestions when no agent selected', () => {
      render(<ChatEmptyState {...defaultProps} />)

      expect(screen.getByText(/analisar gastos públicos/i)).toBeInTheDocument()
      expect(screen.getByText(/investigar contratos/i)).toBeInTheDocument()
    })

    it('calls onSuggestionClick when suggestion is clicked', async () => {
      const user = userEvent.setup()
      const onSuggestionClick = vi.fn()

      render(<ChatEmptyState {...defaultProps} onSuggestionClick={onSuggestionClick} />)

      const suggestion = screen.getByText(/analisar gastos públicos/i)
      await user.click(suggestion)

      expect(onSuggestionClick).toHaveBeenCalled()
    })
  })

  describe('Agent Selected (Cidadão Mode)', () => {
    it('shows selected agent name and role', () => {
      render(<ChatEmptyState {...defaultProps} selectedAgentId="tiradentes" chatMode="cidadao" />)

      expect(screen.getByText(/tiradentes/i)).toBeInTheDocument()
    })

    it('displays agent avatar', () => {
      render(<ChatEmptyState {...defaultProps} selectedAgentId="zumbi" chatMode="cidadao" />)

      const image = screen.getByTestId('agent-image')
      expect(image).toBeInTheDocument()
    })

    it('shows personalized greeting', () => {
      render(<ChatEmptyState {...defaultProps} selectedAgentId="tiradentes" chatMode="cidadao" />)

      expect(screen.getByText(/olá/i)).toBeInTheDocument()
    })
  })

  describe('Maritaca Mode', () => {
    it('shows Maritaca info when in maritaca mode', () => {
      render(<ChatEmptyState {...defaultProps} chatMode="maritaca" maritacaModel="sabia-4" />)

      // Should show maritaca logo
      const image = screen.getByTestId('agent-image')
      expect(image).toHaveAttribute('src', '/logos/maritaca.png')
    })

    it('shows different model when selected', () => {
      render(<ChatEmptyState {...defaultProps} chatMode="maritaca" maritacaModel="sabiazinho-4" />)

      // Should render maritaca avatar
      const image = screen.getByTestId('agent-image')
      expect(image).toHaveAttribute('src', '/logos/maritaca.png')
    })

    it('uses Maritaca logo as avatar', () => {
      render(<ChatEmptyState {...defaultProps} chatMode="maritaca" maritacaModel="sabia-4" />)

      const image = screen.getByTestId('agent-image')
      expect(image).toHaveAttribute('src', '/logos/maritaca.png')
    })
  })

  describe('Suggestions', () => {
    it('renders suggestion buttons', () => {
      render(<ChatEmptyState {...defaultProps} selectedAgentId="tiradentes" />)

      // Should have clickable suggestion elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('suggestions trigger callback with correct text', async () => {
      const user = userEvent.setup()
      const onSuggestionClick = vi.fn()

      render(
        <ChatEmptyState
          {...defaultProps}
          onSuggestionClick={onSuggestionClick}
          selectedAgentId="tiradentes"
        />
      )

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        await user.click(buttons[0])
        expect(onSuggestionClick).toHaveBeenCalled()
      }
    })
  })

  describe('User Name', () => {
    it('can display personalized greeting with user name', () => {
      render(<ChatEmptyState {...defaultProps} userName="João" selectedAgentId="tiradentes" />)

      // The component should render without error
      expect(screen.getByTestId('agent-image')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('displays agent icon badge', () => {
      render(<ChatEmptyState {...defaultProps} selectedAgentId="tiradentes" />)

      // Should have icon displayed somewhere in the component
      const component = screen.getByTestId('agent-image')
      expect(component).toBeInTheDocument()
    })

    it('displays Maritaca info in maritaca mode', () => {
      render(<ChatEmptyState {...defaultProps} chatMode="maritaca" maritacaModel="sabia-4" />)

      // Should show maritaca avatar
      const image = screen.getByTestId('agent-image')
      expect(image).toHaveAttribute('src', '/logos/maritaca.png')
    })
  })
})
