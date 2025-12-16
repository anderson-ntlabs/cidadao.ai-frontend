/**
 * Tests for KidsHeader component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KidsHeader } from '../kids-header'

// Hoist mock functions so they're available at mock definition time
const { mockPush, mockDisableKidsMode, mockClearMode } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockDisableKidsMode: vi.fn(),
  mockClearMode: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/hooks/use-kids', () => ({
  useKids: () => ({
    childName: 'Maria',
    childAvatar: 'panda',
    disableKidsMode: mockDisableKidsMode,
  }),
}))

vi.mock('@/hooks/use-agora-mode', () => ({
  useAgoraMode: () => ({
    clearMode: mockClearMode,
  }),
}))

vi.mock('@/components/agora/agora-header', () => ({
  AgoraHeader: ({ user, onLogout, isKidsMode, kidsChildName }: any) => (
    <header data-testid="agora-header">
      <span data-testid="user-name">{user.name}</span>
      <span data-testid="user-avatar">{user.avatar}</span>
      <span data-testid="is-kids-mode">{isKidsMode?.toString()}</span>
      <span data-testid="kids-child-name">{kidsChildName || ''}</span>
      <button data-testid="logout-button" onClick={onLogout}>
        Exit
      </button>
    </header>
  ),
}))

vi.mock('../kids-avatar-selector', () => ({
  getAvatarPath: (avatar: string) => `/avatars/${avatar}.png`,
}))

describe('KidsHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock navigator.sendBeacon
    Object.defineProperty(navigator, 'sendBeacon', {
      value: vi.fn(),
      writable: true,
    })
  })

  describe('Rendering', () => {
    it('renders AgoraHeader component', () => {
      render(<KidsHeader />)

      expect(screen.getByTestId('agora-header')).toBeInTheDocument()
    })

    it('passes child name to AgoraHeader', () => {
      render(<KidsHeader />)

      expect(screen.getByTestId('user-name')).toHaveTextContent('Maria')
    })

    it('passes avatar path to AgoraHeader', () => {
      render(<KidsHeader />)

      expect(screen.getByTestId('user-avatar')).toHaveTextContent('/avatars/panda.png')
    })

    it('passes isKidsMode as true', () => {
      render(<KidsHeader />)

      expect(screen.getByTestId('is-kids-mode')).toHaveTextContent('true')
    })

    it('passes kidsChildName prop', () => {
      render(<KidsHeader />)

      expect(screen.getByTestId('kids-child-name')).toHaveTextContent('Maria')
    })
  })

  describe('Exit Kids Mode', () => {
    it('calls disableKidsMode when exit button clicked', async () => {
      const user = userEvent.setup()

      render(<KidsHeader />)

      await user.click(screen.getByTestId('logout-button'))

      expect(mockDisableKidsMode).toHaveBeenCalled()
    })

    it('calls clearMode when exit button clicked', async () => {
      const user = userEvent.setup()

      render(<KidsHeader />)

      await user.click(screen.getByTestId('logout-button'))

      expect(mockClearMode).toHaveBeenCalled()
    })

    it('redirects to selection page when exit button clicked', async () => {
      const user = userEvent.setup()

      render(<KidsHeader />)

      await user.click(screen.getByTestId('logout-button'))

      expect(mockPush).toHaveBeenCalledWith('/pt/agora/selecao')
    })

    it('sends telemetry via beacon when exiting', async () => {
      const user = userEvent.setup()

      render(<KidsHeader />)

      await user.click(screen.getByTestId('logout-button'))

      expect(navigator.sendBeacon).toHaveBeenCalledWith('/api/kids/end-session', expect.any(String))
    })
  })

  describe('User Object', () => {
    it('creates user object with expected properties', () => {
      render(<KidsHeader />)

      // User should have name, avatar, and hidden gamification values
      expect(screen.getByTestId('user-name')).toBeInTheDocument()
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument()
    })
  })
})
