import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../stat-card'
import { Star, Trophy, Zap } from 'lucide-react'

describe('StatCard', () => {
  const defaultProps = {
    icon: Star,
    value: '100',
    label: 'Points',
  }

  describe('rendering', () => {
    it('renders value', () => {
      render(<StatCard {...defaultProps} value="500" />)
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('renders numeric value', () => {
      render(<StatCard {...defaultProps} value={250} />)
      expect(screen.getByText('250')).toBeInTheDocument()
    })

    it('renders label', () => {
      render(<StatCard {...defaultProps} label="Experience Points" />)
      expect(screen.getByText('Experience Points')).toBeInTheDocument()
    })

    it('renders sublabel when provided', () => {
      render(<StatCard {...defaultProps} sublabel="Level 5" />)
      expect(screen.getByText('Level 5')).toBeInTheDocument()
    })

    it('renders icon', () => {
      const { container } = render(<StatCard {...defaultProps} />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('progress bar', () => {
    it('renders progress bar when progress provided', () => {
      const { container } = render(
        <StatCard {...defaultProps} progress={{ current: 50, max: 100 }} />
      )
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('calculates correct progress percentage', () => {
      const { container } = render(
        <StatCard {...defaultProps} progress={{ current: 75, max: 100 }} />
      )
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle({ width: '75%' })
    })

    it('caps progress at 100%', () => {
      const { container } = render(
        <StatCard {...defaultProps} progress={{ current: 150, max: 100 }} />
      )
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('shows progress values', () => {
      render(<StatCard {...defaultProps} progress={{ current: 500, max: 1000 }} />)
      expect(screen.getByText('500 XP')).toBeInTheDocument()
      // toLocaleString formats differently based on locale (1,000 vs 1.000)
      expect(screen.getByText(/1[.,]000 XP/)).toBeInTheDocument()
    })

    it('shows progress label when provided', () => {
      render(
        <StatCard {...defaultProps} progress={{ current: 50, max: 100, label: 'To next level' }} />
      )
      expect(screen.getByText('To next level')).toBeInTheDocument()
    })

    it('hides sublabel when progress is shown', () => {
      render(
        <StatCard {...defaultProps} sublabel="Hidden text" progress={{ current: 50, max: 100 }} />
      )
      expect(screen.queryByText('Hidden text')).not.toBeInTheDocument()
    })
  })

  describe('trend indicator', () => {
    it('renders positive trend', () => {
      render(<StatCard {...defaultProps} trend={{ value: 15, isPositive: true }} />)
      expect(screen.getByText('↑')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
    })

    it('renders negative trend', () => {
      render(<StatCard {...defaultProps} trend={{ value: -10, isPositive: false }} />)
      expect(screen.getByText('↓')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
    })

    it('shows absolute value for negative trend', () => {
      render(<StatCard {...defaultProps} trend={{ value: -25, isPositive: false }} />)
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })

  describe('icon colors', () => {
    it('applies green color by default', () => {
      const { container } = render(<StatCard {...defaultProps} />)
      const iconContainer = container.querySelector('.from-green-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies blue color', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor="blue" />)
      const iconContainer = container.querySelector('.from-blue-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies purple color', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor="purple" />)
      const iconContainer = container.querySelector('.from-purple-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies orange color', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor="orange" />)
      const iconContainer = container.querySelector('.from-orange-500')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies yellow color', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor="yellow" />)
      const iconContainer = container.querySelector('.from-yellow-400')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies red color', () => {
      const { container } = render(<StatCard {...defaultProps} iconColor="red" />)
      const iconContainer = container.querySelector('.from-red-500')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<StatCard {...defaultProps} className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('different icons', () => {
    it('renders Trophy icon', () => {
      const { container } = render(<StatCard {...defaultProps} icon={Trophy} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders Zap icon', () => {
      const { container } = render(<StatCard {...defaultProps} icon={Zap} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})
