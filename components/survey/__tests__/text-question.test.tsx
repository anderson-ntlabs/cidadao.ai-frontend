/**
 * Text Question Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextQuestion } from '../questions/text-question'

describe('TextQuestion', () => {
  it('renders textarea with placeholder', () => {
    render(<TextQuestion value="" onChange={vi.fn()} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Digite sua resposta...')
  })

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn()
    render(<TextQuestion value="" onChange={onChange} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test input' } })

    expect(onChange).toHaveBeenCalledWith('Test input')
  })

  it('displays current value', () => {
    render(<TextQuestion value="Existing text" onChange={vi.fn()} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Existing text')
  })

  it('shows character counter', () => {
    render(<TextQuestion value="Hello" onChange={vi.fn()} maxLength={100} />)

    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('prevents input beyond maxLength', () => {
    const onChange = vi.fn()
    render(<TextQuestion value="12345" onChange={onChange} maxLength={5} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '123456' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('displays custom placeholder', () => {
    render(<TextQuestion value="" onChange={vi.fn()} placeholder="Enter your feedback..." />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Enter your feedback...')
  })

  it('displays error message when provided', () => {
    render(<TextQuestion value="" onChange={vi.fn()} error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-invalid attribute when error exists', () => {
    render(<TextQuestion value="" onChange={vi.fn()} error="Error message" />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables textarea when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<TextQuestion value="" onChange={onChange} disabled={true} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('shows optional text when not required and empty', () => {
    render(<TextQuestion value="" onChange={vi.fn()} required={false} />)

    expect(screen.getByText('Esta pergunta é opcional')).toBeInTheDocument()
  })

  it('hides optional text when required is true', () => {
    render(<TextQuestion value="" onChange={vi.fn()} required={true} />)

    expect(screen.queryByText('Esta pergunta é opcional')).not.toBeInTheDocument()
  })

  it('hides optional text when value is not empty', () => {
    render(<TextQuestion value="Some text" onChange={vi.fn()} required={false} />)

    expect(screen.queryByText('Esta pergunta é opcional')).not.toBeInTheDocument()
  })
})
