/**
 * NPS Question Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NPSQuestion } from '../questions/nps-question'

describe('NPSQuestion', () => {
  it('renders all 11 buttons (0-10)', () => {
    render(<NPSQuestion value={undefined} onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(11)
  })

  it('calls onChange when a button is clicked', () => {
    const onChange = vi.fn()
    render(<NPSQuestion value={undefined} onChange={onChange} />)

    const button5 = screen.getByText('5')
    fireEvent.click(button5)

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('marks the selected value as checked', () => {
    render(<NPSQuestion value={7} onChange={vi.fn()} />)

    const button7 = screen.getByRole('radio', { name: '7 de 10' })
    expect(button7).toHaveAttribute('aria-checked', 'true')

    const button5 = screen.getByRole('radio', { name: '5 de 10' })
    expect(button5).toHaveAttribute('aria-checked', 'false')
  })

  it('renders custom labels', () => {
    render(
      <NPSQuestion
        value={undefined}
        onChange={vi.fn()}
        labelMin="Not at all"
        labelMax="Extremely likely"
      />
    )

    expect(screen.getByText('Not at all')).toBeInTheDocument()
    expect(screen.getByText('Extremely likely')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    const { container } = render(<NPSQuestion value={8} onChange={vi.fn()} />)

    // Check for the selected value display (not the button)
    const valueDisplay = container.querySelector('.text-2xl.font-bold')
    expect(valueDisplay).toHaveTextContent('8')
  })

  it('displays error message when provided', () => {
    render(<NPSQuestion value={undefined} onChange={vi.fn()} error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('disables buttons when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<NPSQuestion value={undefined} onChange={onChange} disabled={true} />)

    const button5 = screen.getByText('5')
    fireEvent.click(button5)

    expect(onChange).not.toHaveBeenCalled()
    expect(button5).toBeDisabled()
  })

  it('has correct accessibility labels', () => {
    render(<NPSQuestion value={undefined} onChange={vi.fn()} />)

    const button0 = screen.getByRole('radio', { name: '0 de 10' })
    const button10 = screen.getByRole('radio', { name: '10 de 10' })

    expect(button0).toBeInTheDocument()
    expect(button10).toBeInTheDocument()
  })

  it('has a radiogroup role', () => {
    render(<NPSQuestion value={undefined} onChange={vi.fn()} />)

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})
