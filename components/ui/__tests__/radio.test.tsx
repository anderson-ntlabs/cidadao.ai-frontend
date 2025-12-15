import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio, RadioGroup } from '../radio'

describe('RadioGroup', () => {
  const renderRadioGroup = (props = {}) => {
    return render(
      <RadioGroup name="test-group" {...props}>
        <Radio value="option1" label="Option 1" />
        <Radio value="option2" label="Option 2" />
        <Radio value="option3" label="Option 3" />
      </RadioGroup>
    )
  }

  describe('rendering', () => {
    it('renders all radio options', () => {
      renderRadioGroup()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('has radiogroup role', () => {
      renderRadioGroup()
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('renders vertical by default', () => {
      renderRadioGroup()
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('flex-col')
    })

    it('renders horizontal when specified', () => {
      renderRadioGroup({ orientation: 'horizontal' })
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('flex-row')
    })
  })

  describe('selection', () => {
    it('has no selection by default', () => {
      renderRadioGroup()
      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).not.toBeChecked()
      })
    })

    it('selects defaultValue', () => {
      renderRadioGroup({ defaultValue: 'option2' })
      const radio = screen.getByDisplayValue('option2')
      expect(radio).toBeChecked()
    })

    it('controlled value works', () => {
      renderRadioGroup({ value: 'option1' })
      const radio = screen.getByDisplayValue('option1')
      expect(radio).toBeChecked()
    })

    it('calls onValueChange when selection changes', () => {
      const handleChange = vi.fn()
      renderRadioGroup({ onValueChange: handleChange })

      const radioOption2 = screen.getByText('Option 2')
      fireEvent.click(radioOption2)

      expect(handleChange).toHaveBeenCalledWith('option2')
    })
  })

  describe('disabled state', () => {
    it('disables all radios when group is disabled', () => {
      renderRadioGroup({ disabled: true })
      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).toBeDisabled()
      })
    })

    it('does not call onValueChange when disabled', () => {
      const handleChange = vi.fn()
      renderRadioGroup({ disabled: true, onValueChange: handleChange })

      const radioOption2 = screen.getByText('Option 2')
      fireEvent.click(radioOption2)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('variants', () => {
    it('applies error variant to group', () => {
      render(
        <RadioGroup name="test" error={true}>
          <Radio value="opt" label="Error Label" />
        </RadioGroup>
      )
      const label = screen.getByText('Error Label')
      expect(label).toHaveClass('text-destructive')
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      renderRadioGroup({ className: 'custom-group' })
      const group = screen.getByRole('radiogroup')
      expect(group).toHaveClass('custom-group')
    })
  })
})

describe('Radio', () => {
  it('renders with label', () => {
    render(
      <RadioGroup name="test">
        <Radio value="option" label="My Label" />
      </RadioGroup>
    )
    expect(screen.getByText('My Label')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <RadioGroup name="test">
        <Radio value="option" label="Label" description="Description text" />
      </RadioGroup>
    )
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders without label or description', () => {
    render(
      <RadioGroup name="test">
        <Radio value="option" />
      </RadioGroup>
    )
    const radio = screen.getByRole('radio')
    expect(radio).toBeInTheDocument()
  })

  describe('checked state', () => {
    it('shows indicator when checked', () => {
      render(
        <RadioGroup name="test" value="option">
          <Radio value="option" label="Checked" />
        </RadioGroup>
      )
      const container = screen.getByRole('radio').parentElement?.parentElement
      const indicator = container?.querySelector('[data-state="checked"]')
      expect(indicator).toBeInTheDocument()
    })

    it('does not show indicator when unchecked', () => {
      render(
        <RadioGroup name="test">
          <Radio value="option" label="Unchecked" />
        </RadioGroup>
      )
      const container = screen.getByRole('radio').parentElement?.parentElement
      const indicator = container?.querySelector('[data-state="unchecked"]')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('applies small size', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt" size="sm" />
        </RadioGroup>
      )
      const container = screen.getByRole('radio').parentElement?.parentElement
      const visual = container?.querySelector('[data-state]')
      expect(visual).toHaveClass('h-4', 'w-4')
    })

    it('applies default size', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt" size="default" />
        </RadioGroup>
      )
      const container = screen.getByRole('radio').parentElement?.parentElement
      const visual = container?.querySelector('[data-state]')
      expect(visual).toHaveClass('h-5', 'w-5')
    })

    it('applies large size', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt" size="lg" />
        </RadioGroup>
      )
      const container = screen.getByRole('radio').parentElement?.parentElement
      const visual = container?.querySelector('[data-state]')
      expect(visual).toHaveClass('h-6', 'w-6')
    })
  })

  describe('accessibility', () => {
    it('radio input is sr-only', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt" />
        </RadioGroup>
      )
      const radio = screen.getByRole('radio')
      expect(radio).toHaveClass('sr-only')
    })

    it('label is associated with radio', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt" label="Label" id="my-radio" />
        </RadioGroup>
      )
      const label = screen.getByText('Label')
      expect(label).toHaveAttribute('for', 'my-radio')
    })

    it('radio has correct name attribute from group', () => {
      render(
        <RadioGroup name="group-name">
          <Radio value="opt" />
        </RadioGroup>
      )
      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('name', 'group-name')
    })
  })

  describe('individual disabled', () => {
    it('can be individually disabled', () => {
      render(
        <RadioGroup name="test">
          <Radio value="opt1" label="Enabled" />
          <Radio value="opt2" label="Disabled" disabled />
        </RadioGroup>
      )
      const enabledRadio = screen.getByDisplayValue('opt1')
      const disabledRadio = screen.getByDisplayValue('opt2')
      expect(enabledRadio).not.toBeDisabled()
      expect(disabledRadio).toBeDisabled()
    })
  })
})
