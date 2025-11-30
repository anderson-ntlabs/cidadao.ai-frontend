/**
 * Multiple Choice Question Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MultipleChoiceQuestion } from '../questions/multiple-choice-question'
import type { QuestionOption } from '@/types/survey'

describe('MultipleChoiceQuestion', () => {
  const defaultOptions: QuestionOption[] = [
    { value: 'option1', label_pt: 'Opção 1', label_en: 'Option 1' },
    { value: 'option2', label_pt: 'Opção 2', label_en: 'Option 2' },
    { value: 'option3', label_pt: 'Opção 3', label_en: 'Option 3' },
  ]

  describe('Single Select Mode', () => {
    it('renders all options', () => {
      render(
        <MultipleChoiceQuestion value={undefined} onChange={vi.fn()} options={defaultOptions} />
      )

      expect(screen.getByText('Opção 1')).toBeInTheDocument()
      expect(screen.getByText('Opção 2')).toBeInTheDocument()
      expect(screen.getByText('Opção 3')).toBeInTheDocument()
    })

    it('calls onChange with selected value', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion value={undefined} onChange={onChange} options={defaultOptions} />
      )

      fireEvent.click(screen.getByText('Opção 2'))
      expect(onChange).toHaveBeenCalledWith('option2')
    })

    it('marks selected option as checked', () => {
      render(<MultipleChoiceQuestion value="option2" onChange={vi.fn()} options={defaultOptions} />)

      const buttons = screen.getAllByRole('radio')
      expect(buttons[1]).toHaveAttribute('aria-checked', 'true')
      expect(buttons[0]).toHaveAttribute('aria-checked', 'false')
    })

    it('has radiogroup role in single select mode', () => {
      render(
        <MultipleChoiceQuestion value={undefined} onChange={vi.fn()} options={defaultOptions} />
      )

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('renders English labels when locale is en', () => {
      render(
        <MultipleChoiceQuestion
          value={undefined}
          onChange={vi.fn()}
          options={defaultOptions}
          locale="en"
        />
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })

  describe('Multiple Select Mode', () => {
    it('allows multiple selections', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion
          value={[]}
          onChange={onChange}
          options={defaultOptions}
          multiple={true}
        />
      )

      fireEvent.click(screen.getByText('Opção 1'))
      expect(onChange).toHaveBeenCalledWith(['option1'])
    })

    it('toggles selection in multi-select mode', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion
          value={['option1', 'option2']}
          onChange={onChange}
          options={defaultOptions}
          multiple={true}
        />
      )

      // Deselect option1
      fireEvent.click(screen.getByText('Opção 1'))
      expect(onChange).toHaveBeenCalledWith(['option2'])
    })

    it('has checkbox role in multiple select mode', () => {
      render(
        <MultipleChoiceQuestion
          value={[]}
          onChange={vi.fn()}
          options={defaultOptions}
          multiple={true}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
    })

    it('shows selection count when items are selected', () => {
      render(
        <MultipleChoiceQuestion
          value={['option1', 'option2']}
          onChange={vi.fn()}
          options={defaultOptions}
          multiple={true}
        />
      )

      expect(screen.getByText('2 selecionados')).toBeInTheDocument()
    })

    it('shows singular form when one item selected', () => {
      render(
        <MultipleChoiceQuestion
          value={['option1']}
          onChange={vi.fn()}
          options={defaultOptions}
          multiple={true}
        />
      )

      expect(screen.getByText('1 selecionado')).toBeInTheDocument()
    })
  })

  describe('Accessibility and Error States', () => {
    it('displays error message when provided', () => {
      render(
        <MultipleChoiceQuestion
          value={undefined}
          onChange={vi.fn()}
          options={defaultOptions}
          error="Please select an option"
        />
      )

      expect(screen.getByText('Please select an option')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('disables buttons when disabled prop is true', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion
          value={undefined}
          onChange={onChange}
          options={defaultOptions}
          disabled={true}
        />
      )

      const buttons = screen.getAllByRole('radio')
      fireEvent.click(buttons[0])

      expect(onChange).not.toHaveBeenCalled()
      expect(buttons[0]).toBeDisabled()
    })

    it('handles keyboard navigation with Enter key', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion value={undefined} onChange={onChange} options={defaultOptions} />
      )

      const button = screen.getByText('Opção 1')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith('option1')
    })

    it('handles keyboard navigation with Space key', () => {
      const onChange = vi.fn()
      render(
        <MultipleChoiceQuestion value={undefined} onChange={onChange} options={defaultOptions} />
      )

      const button = screen.getByText('Opção 2')
      fireEvent.keyDown(button, { key: ' ' })

      expect(onChange).toHaveBeenCalledWith('option2')
    })
  })
})
