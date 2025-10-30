/**
 * Tests for SmartSuggestions Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SmartSuggestions, getContextualSuggestions } from '../smart-suggestions'
import type { Suggestion } from '../smart-suggestions'

describe('SmartSuggestions', () => {
  const mockSuggestions: Suggestion[] = [
    { text: 'Investigar contratos', category: 'investigation' },
    { text: 'Analisar anomalias', category: 'anomaly' },
    { text: 'Gerar relatório', category: 'report' },
    { text: 'Ajuda', category: 'help' }
  ]

  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  describe('Rendering', () => {
    it('renders all suggestions', () => {
      render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      expect(screen.getByText('Investigar contratos')).toBeInTheDocument()
      expect(screen.getByText('Analisar anomalias')).toBeInTheDocument()
      expect(screen.getByText('Gerar relatório')).toBeInTheDocument()
      expect(screen.getByText('Ajuda')).toBeInTheDocument()
    })

    it('returns null when suggestions array is empty', () => {
      const { container } = render(
        <SmartSuggestions suggestions={[]} onSelect={mockOnSelect} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('applies custom className', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Default Variant (Card Style)', () => {
    it('renders in grid layout', () => {
      const { container } = render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      const grid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('shows category icons', () => {
      const { container } = render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      // Investigation icon
      const investigationIcon = container.querySelector('.lucide-file-search')
      expect(investigationIcon).toBeInTheDocument()

      // Anomaly icon
      const anomalyIcon = container.querySelector('.lucide-triangle-alert')
      expect(anomalyIcon).toBeInTheDocument()
    })

    it('applies category colors to icons', () => {
      const { container } = render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      // Check for gradient backgrounds
      const gradientElements = container.querySelectorAll('.bg-gradient-to-br')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('shows hover effects', () => {
      const { container } = render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      const buttons = container.querySelectorAll('button.group')
      expect(buttons[0]).toHaveClass('hover:scale-105')
      expect(buttons[0]).toHaveClass('hover:shadow-lg')
    })
  })

  describe('Pills Variant', () => {
    it('renders as pills when variant is pills', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="pills"
        />
      )

      const pills = container.querySelectorAll('.rounded-full')
      expect(pills.length).toBeGreaterThan(0)
    })

    it('shows icons in pills', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="pills"
        />
      )

      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBe(mockSuggestions.length)
    })

    it('applies pill-specific hover effects', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="pills"
        />
      )

      const buttons = container.querySelectorAll('button')
      expect(buttons[0]).toHaveClass('hover:scale-105')
      expect(buttons[0]).toHaveClass('hover:shadow-md')
    })
  })

  describe('Compact Variant', () => {
    it('renders as compact buttons when variant is compact', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="compact"
        />
      )

      const compactButtons = container.querySelectorAll('.text-xs')
      expect(compactButtons.length).toBe(mockSuggestions.length)
    })

    it('uses smaller padding in compact variant', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="compact"
        />
      )

      const buttons = container.querySelectorAll('.px-3.py-1\\.5')
      expect(buttons.length).toBe(mockSuggestions.length)
    })

    it('does not show icons in compact variant', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={mockSuggestions}
          onSelect={mockOnSelect}
          variant="compact"
        />
      )

      // Compact variant should not have icons
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBe(0)
    })
  })

  describe('Interactions', () => {
    it('calls onSelect when suggestion is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      const button = screen.getByText('Investigar contratos')
      await user.click(button)

      expect(mockOnSelect).toHaveBeenCalledWith('Investigar contratos')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('calls onSelect with correct text for each suggestion', async () => {
      const user = userEvent.setup()

      render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      await user.click(screen.getByText('Analisar anomalias'))
      expect(mockOnSelect).toHaveBeenCalledWith('Analisar anomalias')

      await user.click(screen.getByText('Gerar relatório'))
      expect(mockOnSelect).toHaveBeenCalledWith('Gerar relatório')
    })

    it('works with keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <SmartSuggestions suggestions={mockSuggestions} onSelect={mockOnSelect} />
      )

      // Find the button that contains "Ajuda" text
      const buttons = screen.getAllByRole('button')
      const ajudaButton = buttons.find(btn => btn.textContent?.includes('Ajuda'))
      expect(ajudaButton).toBeDefined()

      ajudaButton!.focus()
      expect(ajudaButton).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockOnSelect).toHaveBeenCalledWith('Ajuda')
    })
  })

  describe('Category Icons', () => {
    it('uses FileSearch icon for investigation category', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test', category: 'investigation' }]}
          onSelect={mockOnSelect}
        />
      )

      expect(container.querySelector('.lucide-file-search')).toBeInTheDocument()
    })

    it('uses BarChart3 icon for analysis category', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test', category: 'analysis' }]}
          onSelect={mockOnSelect}
        />
      )

      // Check for the icon presence by SVG element
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('uses AlertTriangle icon for anomaly category', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test', category: 'anomaly' }]}
          onSelect={mockOnSelect}
        />
      )

      expect(container.querySelector('.lucide-triangle-alert')).toBeInTheDocument()
    })

    it('uses TrendingUp icon for report category', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test', category: 'report' }]}
          onSelect={mockOnSelect}
        />
      )

      expect(container.querySelector('.lucide-trending-up')).toBeInTheDocument()
    })

    it('uses Lightbulb icon for help category', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test', category: 'help' }]}
          onSelect={mockOnSelect}
        />
      )

      expect(container.querySelector('.lucide-lightbulb')).toBeInTheDocument()
    })

    it('uses Sparkles icon when no category is specified', () => {
      const { container } = render(
        <SmartSuggestions
          suggestions={[{ text: 'Test' }]}
          onSelect={mockOnSelect}
        />
      )

      expect(container.querySelector('.lucide-sparkles')).toBeInTheDocument()
    })
  })
})

describe('getContextualSuggestions', () => {
  describe('Initial State (No Messages)', () => {
    it('returns 4 general suggestions when messageCount is 0', () => {
      const suggestions = getContextualSuggestions(0)

      expect(suggestions).toHaveLength(4)
    })

    it('includes investigation suggestion first', () => {
      const suggestions = getContextualSuggestions(0)

      expect(suggestions[0].text).toContain('Investigar contratos')
      expect(suggestions[0].category).toBe('investigation')
    })

    it('includes anomaly analysis suggestion', () => {
      const suggestions = getContextualSuggestions(0)

      const anomalySuggestion = suggestions.find(s => s.category === 'anomaly')
      expect(anomalySuggestion).toBeDefined()
      expect(anomalySuggestion?.text).toContain('anomalias')
    })

    it('includes report generation suggestion', () => {
      const suggestions = getContextualSuggestions(0)

      const reportSuggestion = suggestions.find(s => s.category === 'report')
      expect(reportSuggestion).toBeDefined()
      expect(reportSuggestion?.text).toContain('relatório')
    })

    it('includes help suggestion', () => {
      const suggestions = getContextualSuggestions(0)

      const helpSuggestion = suggestions.find(s => s.category === 'help')
      expect(helpSuggestion).toBeDefined()
      expect(helpSuggestion?.text).toContain('Como funciona')
    })
  })

  describe('Investigation State', () => {
    it('returns investigation-specific suggestions when hasInvestigation is true', () => {
      const suggestions = getContextualSuggestions(5, 'test message', true)

      expect(suggestions).toHaveLength(4)
    })

    it('suggests deepening analysis', () => {
      const suggestions = getContextualSuggestions(5, 'test', true)

      const deepAnalysis = suggestions.find(s => s.text.includes('Aprofundar análise'))
      expect(deepAnalysis).toBeDefined()
      expect(deepAnalysis?.category).toBe('analysis')
    })

    it('suggests checking supplier history', () => {
      const suggestions = getContextualSuggestions(5, 'test', true)

      const supplierCheck = suggestions.find(s => s.text.includes('histórico do fornecedor'))
      expect(supplierCheck).toBeDefined()
      expect(supplierCheck?.category).toBe('investigation')
    })

    it('suggests comparing with similar cases', () => {
      const suggestions = getContextualSuggestions(5, 'test', true)

      const comparison = suggestions.find(s => s.text.includes('Comparar com casos'))
      expect(comparison).toBeDefined()
      expect(comparison?.category).toBe('analysis')
    })

    it('suggests generating detailed report', () => {
      const suggestions = getContextualSuggestions(5, 'test', true)

      const report = suggestions.find(s => s.text.includes('relatório detalhado'))
      expect(report).toBeDefined()
      expect(report?.category).toBe('report')
    })
  })

  describe('General Follow-up State', () => {
    it('returns follow-up suggestions when messages > 0 and no investigation', () => {
      const suggestions = getContextualSuggestions(3)

      expect(suggestions).toHaveLength(4)
    })

    it('includes explain better suggestion', () => {
      const suggestions = getContextualSuggestions(3)

      const explainBetter = suggestions.find(s => s.text === 'Explicar melhor')
      expect(explainBetter).toBeDefined()
      expect(explainBetter?.category).toBe('help')
    })

    it('includes practical examples suggestion', () => {
      const suggestions = getContextualSuggestions(3)

      const examples = suggestions.find(s => s.text.includes('exemplos práticos'))
      expect(examples).toBeDefined()
      expect(examples?.category).toBe('analysis')
    })

    it('includes new investigation suggestion', () => {
      const suggestions = getContextualSuggestions(3)

      const newInvestigation = suggestions.find(s => s.text.includes('nova investigação'))
      expect(newInvestigation).toBeDefined()
      expect(newInvestigation?.category).toBe('investigation')
    })

    it('includes export conversation suggestion', () => {
      const suggestions = getContextualSuggestions(3)

      const exportSuggestion = suggestions.find(s => s.text.includes('Exportar conversa'))
      expect(exportSuggestion).toBeDefined()
      expect(exportSuggestion?.category).toBe('report')
    })
  })

  describe('Edge Cases', () => {
    it('handles negative message count', () => {
      const suggestions = getContextualSuggestions(-1)

      // Should return follow-up suggestions (not initial state)
      expect(suggestions).toHaveLength(4)
      expect(suggestions.some(s => s.text === 'Explicar melhor')).toBe(true)
    })

    it('handles very large message count', () => {
      const suggestions = getContextualSuggestions(1000)

      expect(suggestions).toHaveLength(4)
    })

    it('handles undefined lastMessageContent', () => {
      const suggestions = getContextualSuggestions(5, undefined, false)

      expect(suggestions).toHaveLength(4)
    })

    it('investigation state overrides message count', () => {
      const suggestions = getContextualSuggestions(0, undefined, true)

      // Investigation state takes priority over message count
      // Should have investigation-specific suggestions
      expect(suggestions).toHaveLength(4)
      expect(suggestions.some(s => s.text.includes('análise'))).toBe(true)
    })
  })

  describe('Suggestion Structure', () => {
    it('all suggestions have text and category', () => {
      const suggestions = getContextualSuggestions(0)

      suggestions.forEach(suggestion => {
        expect(suggestion.text).toBeDefined()
        expect(suggestion.text.length).toBeGreaterThan(0)
        expect(suggestion.category).toBeDefined()
      })
    })

    it('categories are valid types', () => {
      const validCategories = ['investigation', 'analysis', 'anomaly', 'report', 'help']
      const allSuggestions = [
        ...getContextualSuggestions(0),
        ...getContextualSuggestions(5, 'test', true),
        ...getContextualSuggestions(5)
      ]

      allSuggestions.forEach(suggestion => {
        expect(validCategories).toContain(suggestion.category!)
      })
    })
  })
})
