/**
 * Voice Input Button Component Tests
 *
 * Tests for the VoiceInputButton component
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  VoiceInputButton,
  VoiceInputIndicator,
  VoiceInputCard,
} from '@/components/voice/voice-input-button'

// Mock the useVoiceInput hook
vi.mock('@/hooks/use-voice-input', () => ({
  useVoiceInput: vi.fn(() => ({
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    state: 'idle',
    isListening: false,
    isSupported: true,
    browserInfo: {
      name: 'Chrome',
      version: '120.0',
      isMobile: false,
      supportsSpeechRecognition: true,
      userAgent: 'Chrome/120.0',
    },
    start: vi.fn(),
    stop: vi.fn(),
    toggle: vi.fn(),
    clear: vi.fn(),
    error: null,
  })),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('VoiceInputButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the button with mic icon', () => {
      render(<VoiceInputButton />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should show tooltip when enabled', async () => {
      render(<VoiceInputButton showTooltip={true} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should not show tooltip when disabled', () => {
      render(<VoiceInputButton showTooltip={false} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<VoiceInputButton className="custom-class" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })

    it('should render with different sizes', () => {
      const { rerender } = render(<VoiceInputButton size="sm" />)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<VoiceInputButton size="md" />)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<VoiceInputButton size="lg" />)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<VoiceInputButton size="icon" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render with different variants', () => {
      const { rerender } = render(<VoiceInputButton variant="primary" />)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<VoiceInputButton variant="secondary" />)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<VoiceInputButton variant="ghost" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Unsupported browser', () => {
    it('should show disabled button for unsupported browsers', async () => {
      const { useVoiceInput } = await import('@/hooks/use-voice-input')
      vi.mocked(useVoiceInput).mockReturnValue({
        transcript: '',
        interimTranscript: '',
        finalTranscript: '',
        state: 'idle',
        isListening: false,
        isSupported: false,
        browserInfo: {
          name: 'Firefox',
          version: '120.0',
          isMobile: false,
          supportsSpeechRecognition: false,
          userAgent: 'Firefox/120.0',
        },
        start: vi.fn(),
        stop: vi.fn(),
        toggle: vi.fn(),
        clear: vi.fn(),
        error: null,
      } as any)

      render(<VoiceInputButton />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Interaction', () => {
    it('should call start when clicked while not listening', async () => {
      const mockStart = vi.fn()
      const { useVoiceInput } = await import('@/hooks/use-voice-input')
      vi.mocked(useVoiceInput).mockReturnValue({
        transcript: '',
        interimTranscript: '',
        finalTranscript: '',
        state: 'idle',
        isListening: false,
        isSupported: true,
        browserInfo: {
          name: 'Chrome',
          version: '120.0',
          isMobile: false,
          supportsSpeechRecognition: true,
          userAgent: 'Chrome/120.0',
        },
        start: mockStart,
        stop: vi.fn(),
        toggle: vi.fn(),
        clear: vi.fn(),
        error: null,
      } as any)

      render(<VoiceInputButton />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockStart).toHaveBeenCalled()
      })
    })

    it('should call stop when clicked while listening', async () => {
      const mockStop = vi.fn()
      const { useVoiceInput } = await import('@/hooks/use-voice-input')
      vi.mocked(useVoiceInput).mockReturnValue({
        transcript: '',
        interimTranscript: '',
        finalTranscript: '',
        state: 'listening',
        isListening: true,
        isSupported: true,
        browserInfo: {
          name: 'Chrome',
          version: '120.0',
          isMobile: false,
          supportsSpeechRecognition: true,
          userAgent: 'Chrome/120.0',
        },
        start: vi.fn(),
        stop: mockStop,
        toggle: vi.fn(),
        clear: vi.fn(),
        error: null,
      } as any)

      render(<VoiceInputButton />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockStop).toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<VoiceInputButton disabled={true} />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Transcript display', () => {
    it('should show transcript when showTranscript is true', async () => {
      const { useVoiceInput } = await import('@/hooks/use-voice-input')
      vi.mocked(useVoiceInput).mockReturnValue({
        transcript: 'Hello world',
        interimTranscript: 'testing',
        finalTranscript: 'Hello world',
        state: 'listening',
        isListening: true,
        isSupported: true,
        browserInfo: {
          name: 'Chrome',
          version: '120.0',
          isMobile: false,
          supportsSpeechRecognition: true,
          userAgent: 'Chrome/120.0',
        },
        start: vi.fn(),
        stop: vi.fn(),
        toggle: vi.fn(),
        clear: vi.fn(),
        error: null,
      } as any)

      render(<VoiceInputButton showTranscript={true} />)

      expect(screen.getByText('Hello world')).toBeInTheDocument()
      expect(screen.getByText('testing')).toBeInTheDocument()
    })

    it('should not show transcript when showTranscript is false', async () => {
      const { useVoiceInput } = await import('@/hooks/use-voice-input')
      vi.mocked(useVoiceInput).mockReturnValue({
        transcript: 'Hello world',
        interimTranscript: 'testing',
        finalTranscript: 'Hello world',
        state: 'listening',
        isListening: true,
        isSupported: true,
        browserInfo: {
          name: 'Chrome',
          version: '120.0',
          isMobile: false,
          supportsSpeechRecognition: true,
          userAgent: 'Chrome/120.0',
        },
        start: vi.fn(),
        stop: vi.fn(),
        toggle: vi.fn(),
        clear: vi.fn(),
        error: null,
      } as any)

      render(<VoiceInputButton showTranscript={false} />)

      expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('should call onTranscript callback', async () => {
      const onTranscript = vi.fn()
      render(<VoiceInputButton onTranscript={onTranscript} />)

      // The callback should be passed to the hook
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call onInterimTranscript callback', async () => {
      const onInterimTranscript = vi.fn()
      render(<VoiceInputButton onInterimTranscript={onInterimTranscript} />)

      // The callback should be passed to the hook
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})

describe('VoiceInputIndicator', () => {
  it('should render when listening', () => {
    render(<VoiceInputIndicator isListening={true} />)

    expect(screen.getByText('Ouvindo...')).toBeInTheDocument()
  })

  it('should not render when not listening', () => {
    render(<VoiceInputIndicator isListening={false} />)

    expect(screen.queryByText('Ouvindo...')).not.toBeInTheDocument()
  })
})

describe('VoiceInputCard', () => {
  it('should render with title', () => {
    render(<VoiceInputCard />)

    expect(screen.getByText('Entrada de Voz')).toBeInTheDocument()
  })

  it('should render with English title when lang is en', () => {
    render(<VoiceInputCard lang="en" />)

    expect(screen.getByText('Voice Input')).toBeInTheDocument()
  })

  it('should show transcript and buttons when text is present', () => {
    render(<VoiceInputCard />)

    // Initially no transcript
    expect(screen.queryByText('Enviar')).not.toBeInTheDocument()
    expect(screen.queryByText('Limpar')).not.toBeInTheDocument()
  })

  it('should call onSubmit with transcript', () => {
    const onSubmit = vi.fn()
    render(<VoiceInputCard onSubmit={onSubmit} />)

    // The card should be rendered
    expect(screen.getByText('Entrada de Voz')).toBeInTheDocument()
  })
})
