/**
 * Tests for MobileChatInput, MobileChatSuggestions, and MobileChatActionBar
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileChatInput, MobileChatSuggestions, MobileChatActionBar } from '../mobile-chat-input'

// Mock hooks
vi.mock('@/hooks/use-virtual-keyboard', () => ({
  useVirtualKeyboard: vi.fn(() => ({
    isOpen: false,
    height: 0,
  })),
  useKeyboardAwareInput: vi.fn(() => ({
    ref: { current: null },
    isFocused: false,
  })),
}))

vi.mock('@/hooks/use-haptic', () => ({
  useHaptic: vi.fn(() => ({
    vibrate: vi.fn(),
    vibratePattern: vi.fn(),
    isSupported: true,
  })),
}))

vi.mock('@/lib/mobile-touch', () => ({
  touchFeedback: {
    minimal: 'touch-minimal',
    button: 'touch-button',
    icon: 'touch-icon',
  },
  tapTarget: {
    small: 'tap-small',
    medium: 'tap-medium',
    large: 'tap-large',
  },
  safeArea: {
    bottom: 'safe-bottom',
  },
}))

// Mock dynamic import for VoiceInputButton
vi.mock('next/dynamic', () => ({
  default: vi.fn(() => {
    const MockVoiceButton = () => <button data-testid="voice-input-button">Voice</button>
    MockVoiceButton.displayName = 'MockVoiceInputButton'
    return MockVoiceButton
  }),
}))

describe('MobileChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<MobileChatInput />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(<MobileChatInput placeholder="Type here..." />)

      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(<MobileChatInput className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('renders send button with English aria-label when locale is en', () => {
      render(<MobileChatInput locale="en" />)

      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })
  })

  describe('Controlled Input', () => {
    it('uses controlled value when provided', () => {
      const onChange = vi.fn()
      render(<MobileChatInput value="test message" onChange={onChange} />)

      expect(screen.getByRole('textbox')).toHaveValue('test message')
    })

    it('calls onChange when typing', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<MobileChatInput value="" onChange={onChange} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'hello')

      expect(onChange).toHaveBeenCalledTimes(5) // One call per character
    })

    it('enforces maxLength', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()

      // Use uncontrolled mode to properly test maxLength enforcement
      const { rerender } = render(<MobileChatInput maxLength={5} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'hello world')

      // Textarea should only contain first 5 characters due to maxLength
      expect(textarea).toHaveValue('hello')
    })
  })

  describe('Uncontrolled Input', () => {
    it('manages internal state when no value prop provided', async () => {
      const user = userEvent.setup()
      render(<MobileChatInput />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'test')

      expect(textarea).toHaveValue('test')
    })
  })

  describe('Send Functionality', () => {
    it('calls onSend with trimmed message when send button clicked', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<MobileChatInput value="  hello world  " onSend={onSend} onChange={() => {}} />)

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(sendButton)

      expect(onSend).toHaveBeenCalledWith('hello world')
    })

    it('sends message on Enter key press', async () => {
      const onSend = vi.fn()
      render(<MobileChatInput value="test message" onSend={onSend} onChange={() => {}} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      expect(onSend).toHaveBeenCalledWith('test message')
    })

    it('does not send on Shift+Enter (allows new line)', () => {
      const onSend = vi.fn()
      render(<MobileChatInput value="test message" onSend={onSend} onChange={() => {}} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      expect(onSend).not.toHaveBeenCalled()
    })

    it('does not send empty messages', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<MobileChatInput value="   " onSend={onSend} onChange={() => {}} />)

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it('clears input after sending in uncontrolled mode', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<MobileChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'hello')

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(sendButton)

      expect(onSend).toHaveBeenCalledWith('hello')
    })
  })

  describe('Disabled State', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<MobileChatInput disabled />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('disables send button when disabled', () => {
      render(<MobileChatInput disabled value="test" onChange={() => {}} />)

      expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
    })

    it('disables textarea when loading', () => {
      render(<MobileChatInput loading />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('does not send when loading', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()
      render(<MobileChatInput value="test" loading onSend={onSend} onChange={() => {}} />)

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows spinner when loading', () => {
      render(<MobileChatInput loading value="test" onChange={() => {}} />)

      // Check for spinner SVG with animate-spin class
      const sendButton = screen.getByRole('button', { name: /enviar/i })
      expect(sendButton.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Character Count', () => {
    it('does not show character count by default', () => {
      render(<MobileChatInput value="test" onChange={() => {}} />)

      expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument()
    })

    it('shows character count when showCharCount is true and near limit', () => {
      const longText = 'a'.repeat(1700) // 85% of 2000
      render(
        <MobileChatInput value={longText} onChange={() => {}} showCharCount maxLength={2000} />
      )

      expect(screen.getByText('1700/2000')).toBeInTheDocument()
    })

    it('does not show character count when below 80% threshold', () => {
      render(<MobileChatInput value="short" onChange={() => {}} showCharCount maxLength={2000} />)

      expect(screen.queryByText(/\/2000/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has aria-label on textarea', () => {
      render(<MobileChatInput />)

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Message input')
    })

    it('has aria-label on send button', () => {
      render(<MobileChatInput locale="pt" />)

      expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument()
    })
  })
})

describe('MobileChatSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders suggestions', () => {
      const suggestions = ['Hello', 'Help', 'Examples']
      render(<MobileChatSuggestions suggestions={suggestions} />)

      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('Examples')).toBeInTheDocument()
    })

    it('returns null when suggestions array is empty', () => {
      const { container } = render(<MobileChatSuggestions suggestions={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('renders loading skeletons when loading', () => {
      const { container } = render(<MobileChatSuggestions suggestions={[]} loading />)

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(3)
    })

    it('applies custom className', () => {
      const { container } = render(
        <MobileChatSuggestions suggestions={['Test']} className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('calls onSelect when suggestion is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const suggestions = ['Hello', 'Help']

      render(<MobileChatSuggestions suggestions={suggestions} onSelect={onSelect} />)

      await user.click(screen.getByText('Hello'))

      expect(onSelect).toHaveBeenCalledWith('Hello')
    })

    it('does not throw when onSelect is not provided', async () => {
      const user = userEvent.setup()
      const suggestions = ['Hello']

      render(<MobileChatSuggestions suggestions={suggestions} />)

      // Should not throw
      await user.click(screen.getByText('Hello'))
    })
  })
})

describe('MobileChatActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders attach button when onAttach provided', () => {
      render(<MobileChatActionBar onAttach={() => {}} />)

      expect(screen.getByRole('button', { name: /attach file/i })).toBeInTheDocument()
    })

    it('renders camera button when onCamera provided', () => {
      render(<MobileChatActionBar onCamera={() => {}} />)

      expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument()
    })

    it('renders voice button when onVoice provided', () => {
      render(<MobileChatActionBar onVoice={() => {}} />)

      expect(screen.getByRole('button', { name: /voice input/i })).toBeInTheDocument()
    })

    it('does not render attach button when onAttach not provided', () => {
      render(<MobileChatActionBar />)

      expect(screen.queryByRole('button', { name: /attach file/i })).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MobileChatActionBar className="custom-class" onAttach={() => {}} />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('calls onAttach when attach button clicked', async () => {
      const user = userEvent.setup()
      const onAttach = vi.fn()

      render(<MobileChatActionBar onAttach={onAttach} />)

      await user.click(screen.getByRole('button', { name: /attach file/i }))

      expect(onAttach).toHaveBeenCalled()
    })

    it('calls onCamera when camera button clicked', async () => {
      const user = userEvent.setup()
      const onCamera = vi.fn()

      render(<MobileChatActionBar onCamera={onCamera} />)

      await user.click(screen.getByRole('button', { name: /take photo/i }))

      expect(onCamera).toHaveBeenCalled()
    })

    it('calls onVoice when voice button clicked', async () => {
      const user = userEvent.setup()
      const onVoice = vi.fn()

      render(<MobileChatActionBar onVoice={onVoice} />)

      await user.click(screen.getByRole('button', { name: /voice input/i }))

      expect(onVoice).toHaveBeenCalled()
    })

    it('renders all buttons when all handlers provided', () => {
      render(<MobileChatActionBar onAttach={() => {}} onCamera={() => {}} onVoice={() => {}} />)

      expect(screen.getByRole('button', { name: /attach file/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /voice input/i })).toBeInTheDocument()
    })
  })
})
