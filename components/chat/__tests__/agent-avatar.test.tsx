/**
 * Tests for AgentAvatar Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentAvatar, AgentAvatarGroup } from '../agent-avatar'

describe('AgentAvatar', () => {
  const defaultProps = {
    agentId: 'abaporu',
    agentImage: '/avatars/abaporu.png',
    agentName: 'Abaporu'
  }

  describe('Rendering', () => {
    it('renders avatar with correct image and alt text', () => {
      render(<AgentAvatar {...defaultProps} />)

      const img = screen.getByAltText('Abaporu')
      expect(img).toBeInTheDocument()
    })

    it('renders with default medium size', () => {
      const { container } = render(<AgentAvatar {...defaultProps} />)

      const avatar = container.querySelector('.w-9.h-9')
      expect(avatar).toBeInTheDocument()
    })

    it('renders with small size when specified', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} size="sm" />
      )

      const avatar = container.querySelector('.w-8.h-8')
      expect(avatar).toBeInTheDocument()
    })

    it('renders with large size when specified', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} size="lg" />
      )

      const avatar = container.querySelector('.w-12.h-12')
      expect(avatar).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} className="custom-class" />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Thinking State', () => {
    it('shows thinking indicator when isThinking is true', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} isThinking={true} />
      )

      // Brain icon should be visible
      const brainIcon = container.querySelector('.lucide-brain')
      expect(brainIcon).toBeInTheDocument()
    })

    it('applies thinking animations when isThinking is true', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} isThinking={true} />
      )

      // Check for pulse animation on brain icon
      const brainIcon = container.querySelector('.lucide-brain.animate-pulse')
      expect(brainIcon).toBeInTheDocument()

      // Check for ping animation on thinking indicator
      const pingEffect = container.querySelector('.animate-ping')
      expect(pingEffect).toBeInTheDocument()
    })

    it('scales avatar when thinking', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} isThinking={true} />
      )

      const scaledAvatar = container.querySelector('.scale-110')
      expect(scaledAvatar).toBeInTheDocument()
    })

    it('shows gradient overlay when thinking', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} isThinking={true} />
      )

      const overlay = container.querySelector('.from-emerald-500\\/20')
      expect(overlay).toBeInTheDocument()
    })

    it('does not show thinking indicator when isThinking is false', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} isThinking={false} />
      )

      const brainIcon = container.querySelector('.lucide-brain')
      expect(brainIcon).not.toBeInTheDocument()
    })
  })

  describe('Sparkle Indicator', () => {
    it('shows sparkle indicator when showSparkle is true', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} showSparkle={true} />
      )

      const sparkleIcon = container.querySelector('.lucide-sparkles')
      expect(sparkleIcon).toBeInTheDocument()
    })

    it('applies bounce animation to sparkle', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} showSparkle={true} />
      )

      const sparkleIcon = container.querySelector('.lucide-sparkles.animate-bounce')
      expect(sparkleIcon).toBeInTheDocument()
    })

    it('does not show sparkle when showSparkle is false', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} showSparkle={false} />
      )

      const sparkleIcon = container.querySelector('.lucide-sparkles')
      expect(sparkleIcon).not.toBeInTheDocument()
    })
  })

  describe('Icon Sizes', () => {
    it('uses correct icon size for small avatar', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} size="sm" isThinking={true} />
      )

      const brainIcon = container.querySelector('.lucide-brain.w-3.h-3')
      expect(brainIcon).toBeInTheDocument()
    })

    it('uses correct icon size for medium avatar', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} size="md" isThinking={true} />
      )

      const brainIcon = container.querySelector('.lucide-brain.w-4.h-4')
      expect(brainIcon).toBeInTheDocument()
    })

    it('uses correct icon size for large avatar', () => {
      const { container } = render(
        <AgentAvatar {...defaultProps} size="lg" isThinking={true} />
      )

      const brainIcon = container.querySelector('.lucide-brain.w-5.h-5')
      expect(brainIcon).toBeInTheDocument()
    })
  })

  describe('Image Dimensions', () => {
    it('uses 32x32 dimensions for small size', () => {
      render(<AgentAvatar {...defaultProps} size="sm" />)

      const img = screen.getByAltText('Abaporu')
      expect(img).toHaveAttribute('width', '32')
      expect(img).toHaveAttribute('height', '32')
    })

    it('uses 36x36 dimensions for medium size', () => {
      render(<AgentAvatar {...defaultProps} size="md" />)

      const img = screen.getByAltText('Abaporu')
      expect(img).toHaveAttribute('width', '36')
      expect(img).toHaveAttribute('height', '36')
    })

    it('uses 48x48 dimensions for large size', () => {
      render(<AgentAvatar {...defaultProps} size="lg" />)

      const img = screen.getByAltText('Abaporu')
      expect(img).toHaveAttribute('width', '48')
      expect(img).toHaveAttribute('height', '48')
    })
  })
})

describe('AgentAvatarGroup', () => {
  const mockAgents = [
    { id: 'agent1', image: '/avatar1.png', name: 'Agent 1' },
    { id: 'agent2', image: '/avatar2.png', name: 'Agent 2' },
    { id: 'agent3', image: '/avatar3.png', name: 'Agent 3' },
    { id: 'agent4', image: '/avatar4.png', name: 'Agent 4' },
    { id: 'agent5', image: '/avatar5.png', name: 'Agent 5' }
  ]

  describe('Rendering', () => {
    it('renders all agents when count is less than max', () => {
      render(<AgentAvatarGroup agents={mockAgents.slice(0, 2)} />)

      expect(screen.getByAltText('Agent 1')).toBeInTheDocument()
      expect(screen.getByAltText('Agent 2')).toBeInTheDocument()
    })

    it('renders max agents when count exceeds max', () => {
      render(<AgentAvatarGroup agents={mockAgents} max={3} />)

      expect(screen.getByAltText('Agent 1')).toBeInTheDocument()
      expect(screen.getByAltText('Agent 2')).toBeInTheDocument()
      expect(screen.getByAltText('Agent 3')).toBeInTheDocument()
      expect(screen.queryByAltText('Agent 4')).not.toBeInTheDocument()
    })

    it('shows remaining count badge when agents exceed max', () => {
      render(<AgentAvatarGroup agents={mockAgents} max={3} />)

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('does not show remaining count when all agents fit', () => {
      render(<AgentAvatarGroup agents={mockAgents.slice(0, 3)} max={3} />)

      expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents} className="custom-class" />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Sizing', () => {
    it('uses default small size for avatars', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 2)} />
      )

      const avatars = container.querySelectorAll('.w-8.h-8')
      expect(avatars.length).toBeGreaterThan(0)
    })

    it('respects size prop for avatars', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 2)} size="lg" />
      )

      const avatars = container.querySelectorAll('.w-12.h-12')
      expect(avatars.length).toBeGreaterThan(0)
    })

    it('matches remaining count badge size to avatar size', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents} max={2} size="lg" />
      )

      const badge = container.querySelector('.w-12.h-12')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Stacking', () => {
    it('applies negative space to stack avatars', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 3)} />
      )

      const stack = container.querySelector('.-space-x-2')
      expect(stack).toBeInTheDocument()
    })

    it('applies ring to separate stacked avatars', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 3)} />
      )

      const rings = container.querySelectorAll('.ring-2')
      expect(rings.length).toBeGreaterThan(0)
    })
  })

  describe('Z-Index Ordering', () => {
    it('renders first agent with highest z-index', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 3)} />
      )

      const firstAvatarWrapper = container.querySelector('[style*="z-index: 3"]')
      expect(firstAvatarWrapper).toBeInTheDocument()
    })

    it('decreases z-index for each subsequent agent', () => {
      const { container } = render(
        <AgentAvatarGroup agents={mockAgents.slice(0, 3)} />
      )

      const secondAvatarWrapper = container.querySelector('[style*="z-index: 2"]')
      const thirdAvatarWrapper = container.querySelector('[style*="z-index: 1"]')

      expect(secondAvatarWrapper).toBeInTheDocument()
      expect(thirdAvatarWrapper).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty agents array', () => {
      const { container } = render(<AgentAvatarGroup agents={[]} />)

      expect(container.querySelector('.-space-x-2')?.children).toHaveLength(0)
    })

    it('handles single agent', () => {
      render(<AgentAvatarGroup agents={[mockAgents[0]]} />)

      expect(screen.getByAltText('Agent 1')).toBeInTheDocument()
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
    })

    it('handles agents without IDs', () => {
      const agentsWithoutIds = [
        { image: '/avatar1.png', name: 'Agent 1' },
        { image: '/avatar2.png', name: 'Agent 2' }
      ]

      render(<AgentAvatarGroup agents={agentsWithoutIds} />)

      expect(screen.getByAltText('Agent 1')).toBeInTheDocument()
      expect(screen.getByAltText('Agent 2')).toBeInTheDocument()
    })
  })
})
