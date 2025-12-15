/**
 * Tests for MobileChatContainer, MobileChatMessageList, and MobileChatHeader
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MobileChatContainer,
  MobileChatMessageList,
  MobileChatHeader,
} from '../mobile-chat-container'

// Mock hooks
vi.mock('@/hooks/use-virtual-keyboard', () => ({
  useVirtualKeyboard: vi.fn(() => ({
    isOpen: false,
    height: 0,
  })),
  useSafeHeight: vi.fn((defaultHeight: string) => defaultHeight),
}))

// Mock scrollTo for DOM elements
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn()
})

vi.mock('@/lib/mobile-touch', () => ({
  touchFeedback: {
    minimal: 'touch-minimal',
    button: 'touch-button',
    icon: 'touch-icon',
  },
  scrollBehavior: {
    momentum: 'scroll-momentum',
  },
  safeArea: {
    top: 'safe-top',
    bottom: 'safe-bottom',
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, className, width, height }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  ),
}))

describe('MobileChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <MobileChatContainer>
          <div data-testid="child">Child content</div>
        </MobileChatContainer>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MobileChatContainer className="custom-class">
          <div>Content</div>
        </MobileChatContainer>
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('renders message list container with correct attributes', () => {
      render(
        <MobileChatContainer>
          <div>Content</div>
        </MobileChatContainer>
      )

      const messageList = screen.getByTestId('chat-messages')
      expect(messageList).toHaveAttribute('role', 'log')
      expect(messageList).toHaveAttribute('aria-live', 'polite')
      expect(messageList).toHaveAttribute('aria-label', 'Chat messages')
    })

    it('renders scroll-to-bottom button by default', () => {
      render(
        <MobileChatContainer>
          <div>Content</div>
        </MobileChatContainer>
      )

      expect(screen.getByRole('button', { name: /rolar para o final/i })).toBeInTheDocument()
    })

    it('hides scroll button when showScrollButton is false', () => {
      render(
        <MobileChatContainer showScrollButton={false}>
          <div>Content</div>
        </MobileChatContainer>
      )

      expect(screen.queryByRole('button', { name: /rolar para o final/i })).not.toBeInTheDocument()
    })
  })

  describe('Scroll to Bottom', () => {
    it('scrolls to bottom when scroll button is clicked', () => {
      const scrollToMock = vi.fn()

      render(
        <MobileChatContainer>
          <div style={{ height: '2000px' }}>Long content</div>
        </MobileChatContainer>
      )

      // Get the scroll button
      const scrollButton = screen.getByRole('button', { name: /rolar para o final/i })

      // Mock scrollTo on the message list
      const messageList = screen.getByTestId('chat-messages')
      messageList.scrollTo = scrollToMock

      // Use fireEvent since button has pointer-events: none by default (hidden state)
      fireEvent.click(scrollButton)

      expect(scrollToMock).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      })
    })

    it('has correct aria-label on scroll button', () => {
      render(
        <MobileChatContainer>
          <div>Content</div>
        </MobileChatContainer>
      )

      const scrollButton = screen.getByRole('button', { name: /rolar para o final/i })
      expect(scrollButton).toHaveAttribute('aria-label', 'Rolar para o final')
    })
  })
})

describe('MobileChatMessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders messages using children render function', () => {
      const messages = [
        { id: '1', content: 'Hello' },
        { id: '2', content: 'World' },
      ]

      render(
        <MobileChatMessageList messages={messages}>
          {(message) => <span data-testid={`msg-${message.id}`}>{message.content}</span>}
        </MobileChatMessageList>
      )

      expect(screen.getByTestId('msg-1')).toHaveTextContent('Hello')
      expect(screen.getByTestId('msg-2')).toHaveTextContent('World')
    })

    it('renders empty state when no messages', () => {
      render(
        <MobileChatMessageList
          messages={[]}
          emptyState={<div data-testid="empty">No messages</div>}
        >
          {() => null}
        </MobileChatMessageList>
      )

      expect(screen.getByTestId('empty')).toHaveTextContent('No messages')
    })

    it('does not render empty state when loading', () => {
      render(
        <MobileChatMessageList
          messages={[]}
          loading
          emptyState={<div data-testid="empty">No messages</div>}
        >
          {() => null}
        </MobileChatMessageList>
      )

      expect(screen.queryByTestId('empty')).not.toBeInTheDocument()
    })

    it('shows loading spinner when loading', () => {
      const { container } = render(
        <MobileChatMessageList messages={[]} loading>
          {() => null}
        </MobileChatMessageList>
      )

      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MobileChatMessageList messages={[]} className="custom-class">
          {() => null}
        </MobileChatMessageList>
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('uses message index as key when id is not available', () => {
      const messages = [{ content: 'No ID message' }]

      render(
        <MobileChatMessageList messages={messages}>
          {(message, index) => <span data-testid={`msg-${index}`}>{message.content}</span>}
        </MobileChatMessageList>
      )

      expect(screen.getByTestId('msg-0')).toHaveTextContent('No ID message')
    })
  })
})

describe('MobileChatHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders back button when onBack provided', () => {
      render(<MobileChatHeader onBack={() => {}} />)

      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
    })

    it('does not render back button when onBack not provided', () => {
      render(<MobileChatHeader />)

      expect(screen.queryByRole('button', { name: /voltar/i })).not.toBeInTheDocument()
    })

    it('renders agent info when agent provided', () => {
      const agent = {
        name: 'Tiradentes',
        avatar: '/agents/tiradentes.png',
        status: 'Disponível',
      }

      render(<MobileChatHeader agent={agent} onAgentClick={() => {}} />)

      expect(screen.getByText('Tiradentes')).toBeInTheDocument()
      expect(screen.getByText('Disponível')).toBeInTheDocument()
      expect(screen.getByAltText('Tiradentes')).toBeInTheDocument()
    })

    it('renders new chat button when onNewChat provided', () => {
      render(<MobileChatHeader onNewChat={() => {}} />)

      expect(screen.getByRole('button', { name: /nova conversa/i })).toBeInTheDocument()
    })

    it('renders history button when onSettings provided', () => {
      render(<MobileChatHeader onSettings={() => {}} />)

      expect(screen.getByRole('button', { name: /histórico/i })).toBeInTheDocument()
    })

    it('renders user avatar when user provided', () => {
      const user = {
        name: 'João',
        avatar: '/avatars/joao.png',
      }

      render(<MobileChatHeader user={user} />)

      expect(screen.getByAltText('João')).toBeInTheDocument()
    })

    it('renders user initials when no avatar', () => {
      const user = {
        name: 'Maria',
      }

      render(<MobileChatHeader user={user} />)

      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('renders default initial when user has no name', () => {
      const user = {}

      render(<MobileChatHeader user={user} />)

      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<MobileChatHeader className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Chat Mode', () => {
    it('shows cidadao mode badge by default', () => {
      const agent = { name: 'Agent', avatar: '/avatar.png' }

      render(<MobileChatHeader agent={agent} chatMode="cidadao" onAgentClick={() => {}} />)

      expect(screen.getByText('🏛️')).toBeInTheDocument()
    })

    it('shows maritaca mode badge when chatMode is maritaca', () => {
      const agent = { name: 'Agent', avatar: '/avatar.png' }

      render(<MobileChatHeader agent={agent} chatMode="maritaca" onAgentClick={() => {}} />)

      expect(screen.getByText('🦜')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('calls onBack when back button clicked', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()

      render(<MobileChatHeader onBack={onBack} />)

      await user.click(screen.getByRole('button', { name: /voltar/i }))

      expect(onBack).toHaveBeenCalled()
    })

    it('calls onAgentClick when agent info clicked', async () => {
      const user = userEvent.setup()
      const onAgentClick = vi.fn()
      const agent = { name: 'Agent', avatar: '/avatar.png' }

      render(<MobileChatHeader agent={agent} onAgentClick={onAgentClick} />)

      await user.click(screen.getByRole('button', { name: /selecionar agente/i }))

      expect(onAgentClick).toHaveBeenCalled()
    })

    it('calls onNewChat when new chat button clicked', async () => {
      const user = userEvent.setup()
      const onNewChat = vi.fn()

      render(<MobileChatHeader onNewChat={onNewChat} />)

      await user.click(screen.getByRole('button', { name: /nova conversa/i }))

      expect(onNewChat).toHaveBeenCalled()
    })

    it('calls onSettings when history button clicked', async () => {
      const user = userEvent.setup()
      const onSettings = vi.fn()

      render(<MobileChatHeader onSettings={onSettings} />)

      await user.click(screen.getByRole('button', { name: /histórico/i }))

      expect(onSettings).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has correct aria-labels on all buttons', () => {
      render(<MobileChatHeader onBack={() => {}} onNewChat={() => {}} onSettings={() => {}} />)

      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nova conversa/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /histórico/i })).toBeInTheDocument()
    })

    it('agent button has accessible label', () => {
      const agent = { name: 'Agent', avatar: '/avatar.png' }

      render(<MobileChatHeader agent={agent} onAgentClick={() => {}} />)

      expect(screen.getByRole('button', { name: /selecionar agente/i })).toBeInTheDocument()
    })
  })
})
