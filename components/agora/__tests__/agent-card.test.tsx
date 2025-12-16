/**
 * Tests for AgentCard component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentCard } from '../agent-card'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
  ),
}))

// Mock Card component
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
}))

// Mock Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span data-testid="badge" className={className} {...props}>
      {children}
    </span>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-icon">ArrowRight</span>,
  MessageCircle: () => <span data-testid="message-icon">MessageCircle</span>,
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
}))

describe('AgentCard', () => {
  const defaultProps = {
    id: 'zumbi',
    name: 'Zumbi dos Palmares',
    role: 'Detector de Anomalias',
  }

  describe('Rendering', () => {
    it('renders agent name', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.getByText('Zumbi dos Palmares')).toBeInTheDocument()
    })

    it('renders agent role', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.getByText('Detector de Anomalias')).toBeInTheDocument()
    })

    it('renders link to agent chat', () => {
      render(<AgentCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/pt/agora/chat?agent=zumbi')
    })

    it('renders Card component', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders arrow icon', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
    })
  })

  describe('Avatar', () => {
    it('renders avatar image when provided', () => {
      render(<AgentCard {...defaultProps} avatar="/agents/zumbi.png" />)

      const img = screen.getByAltText('Zumbi dos Palmares')
      expect(img).toHaveAttribute('src', '/agents/zumbi.png')
    })

    it('renders emoji when avatar is not provided', () => {
      render(<AgentCard {...defaultProps} emoji="⚔️" />)

      expect(screen.getByText('⚔️')).toBeInTheDocument()
    })

    it('renders default robot emoji when neither avatar nor emoji is provided', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.getByText('🤖')).toBeInTheDocument()
    })
  })

  describe('Status', () => {
    it('renders online status by default', () => {
      const { container } = render(<AgentCard {...defaultProps} />)

      const statusIndicator = container.querySelector('.bg-green-500')
      expect(statusIndicator).toBeInTheDocument()
    })

    it('renders offline status', () => {
      const { container } = render(<AgentCard {...defaultProps} status="offline" />)

      const statusIndicator = container.querySelector('.bg-gray-400')
      expect(statusIndicator).toBeInTheDocument()
    })

    it('renders busy status', () => {
      const { container } = render(<AgentCard {...defaultProps} status="busy" />)

      const statusIndicator = container.querySelector('.bg-yellow-500')
      expect(statusIndicator).toBeInTheDocument()
    })
  })

  describe('New Badge', () => {
    it('shows new badge when isNew is true', () => {
      render(<AgentCard {...defaultProps} isNew />)

      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    })

    it('hides new badge when isNew is false', () => {
      render(<AgentCard {...defaultProps} isNew={false} />)

      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })

    it('hides new badge when isNew is not provided', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })
  })

  describe('Message Count', () => {
    it('shows message count when provided and greater than 0', () => {
      render(<AgentCard {...defaultProps} messageCount={5} />)

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByTestId('message-icon')).toBeInTheDocument()
    })

    it('hides message count when 0', () => {
      render(<AgentCard {...defaultProps} messageCount={0} />)

      expect(screen.queryByTestId('message-icon')).not.toBeInTheDocument()
    })

    it('hides message count when not provided', () => {
      render(<AgentCard {...defaultProps} />)

      expect(screen.queryByTestId('message-icon')).not.toBeInTheDocument()
    })
  })

  describe('Specialty/Description', () => {
    it('shows specialty when provided', () => {
      render(<AgentCard {...defaultProps} specialty="Especialista em padrões" />)

      expect(screen.getByText('Especialista em padrões')).toBeInTheDocument()
    })

    it('shows description when provided', () => {
      render(<AgentCard {...defaultProps} description="Analisa contratos públicos" />)

      expect(screen.getByText('Analisa contratos públicos')).toBeInTheDocument()
    })

    it('shows specialty over description when both provided', () => {
      render(
        <AgentCard
          {...defaultProps}
          specialty="Especialista em padrões"
          description="Analisa contratos públicos"
        />
      )

      expect(screen.getByText('Especialista em padrões')).toBeInTheDocument()
      expect(screen.queryByText('Analisa contratos públicos')).not.toBeInTheDocument()
    })

    it('hides specialty/description area when neither provided', () => {
      const { container } = render(<AgentCard {...defaultProps} />)

      // Check that line-clamp-2 element is not present
      const descriptionElement = container.querySelector('.line-clamp-2')
      expect(descriptionElement).not.toBeInTheDocument()
    })
  })

  describe('Custom ClassName', () => {
    it('applies custom className to Card', () => {
      render(<AgentCard {...defaultProps} className="custom-card-class" />)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card-class')
    })
  })

  describe('Different Agents', () => {
    it('renders Anita agent', () => {
      render(<AgentCard id="anita" name="Anita Garibaldi" role="Analista de Padrões" emoji="⚔️" />)

      expect(screen.getByText('Anita Garibaldi')).toBeInTheDocument()
      expect(screen.getByText('Analista de Padrões')).toBeInTheDocument()
      expect(screen.getByText('⚔️')).toBeInTheDocument()
    })

    it('renders Tiradentes agent', () => {
      render(
        <AgentCard
          id="tiradentes"
          name="Tiradentes"
          role="Jornalista de Dados"
          avatar="/agents/tiradentes.png"
        />
      )

      expect(screen.getByText('Tiradentes')).toBeInTheDocument()
      expect(screen.getByText('Jornalista de Dados')).toBeInTheDocument()
      const img = screen.getByAltText('Tiradentes')
      expect(img).toHaveAttribute('src', '/agents/tiradentes.png')
    })
  })
})
