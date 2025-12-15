/**
 * Tests for NotificationItem component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationItem } from '../notification-item'
import type { Notification } from '@/types/notification'

// Mock Badge component
vi.mock('../badge', () => ({
  Badge: ({ children, variant, size }: any) => (
    <span data-testid="badge" data-variant={variant} data-size={size}>
      {children}
    </span>
  ),
}))

describe('NotificationItem', () => {
  const baseNotification: Notification = {
    id: 'notif-1',
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'info',
    priority: 'medium',
    read: false,
    timestamp: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders notification title', () => {
      render(<NotificationItem notification={baseNotification} />)

      expect(screen.getByText('Test Notification')).toBeInTheDocument()
    })

    it('renders notification message', () => {
      render(<NotificationItem notification={baseNotification} />)

      expect(screen.getByText('This is a test notification message')).toBeInTheDocument()
    })

    it('renders time ago', () => {
      render(<NotificationItem notification={baseNotification} />)

      // Should show "há menos de um minuto" or similar
      expect(screen.getByText(/há/i)).toBeInTheDocument()
    })

    it('renders unread indicator when not read', () => {
      const { container } = render(<NotificationItem notification={baseNotification} />)

      const indicator = container.querySelector('.bg-blue-500')
      expect(indicator).toBeInTheDocument()
    })

    it('does not render unread indicator when read', () => {
      const readNotification = { ...baseNotification, read: true }
      const { container } = render(<NotificationItem notification={readNotification} />)

      const indicator = container.querySelector('.bg-blue-500')
      expect(indicator).not.toBeInTheDocument()
    })
  })

  describe('Notification Types', () => {
    it('renders info notification', () => {
      const notification = { ...baseNotification, type: 'info' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-blue-600')).toBeInTheDocument()
    })

    it('renders success notification', () => {
      const notification = { ...baseNotification, type: 'success' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-green-600')).toBeInTheDocument()
    })

    it('renders warning notification', () => {
      const notification = { ...baseNotification, type: 'warning' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument()
    })

    it('renders error notification', () => {
      const notification = { ...baseNotification, type: 'error' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-red-600')).toBeInTheDocument()
    })

    it('renders investigation notification', () => {
      const notification = { ...baseNotification, type: 'investigation' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-purple-600')).toBeInTheDocument()
    })

    it('renders anomaly notification', () => {
      const notification = { ...baseNotification, type: 'anomaly' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-orange-600')).toBeInTheDocument()
    })

    it('renders agent notification', () => {
      const notification = { ...baseNotification, type: 'agent' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-indigo-600')).toBeInTheDocument()
    })

    it('renders system notification', () => {
      const notification = { ...baseNotification, type: 'system' as const }
      const { container } = render(<NotificationItem notification={notification} />)

      expect(container.querySelector('.text-gray-600')).toBeInTheDocument()
    })
  })

  describe('Priority Badges', () => {
    it('does not show badge for low priority', () => {
      const notification = { ...baseNotification, priority: 'low' as const }
      render(<NotificationItem notification={notification} />)

      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })

    it('shows badge for medium priority', () => {
      const notification = { ...baseNotification, priority: 'medium' as const }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('Média')).toBeInTheDocument()
    })

    it('shows badge for high priority', () => {
      const notification = { ...baseNotification, priority: 'high' as const }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('Alta')).toBeInTheDocument()
    })

    it('shows badge for urgent priority', () => {
      const notification = { ...baseNotification, priority: 'urgent' as const }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('Urgente')).toBeInTheDocument()
    })
  })

  describe('Metadata', () => {
    it('shows agent ID when present', () => {
      const notification = { ...baseNotification, agentId: 'tiradentes' }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByText('tiradentes')).toBeInTheDocument()
    })

    it('shows anomaly score when present', () => {
      const notification = { ...baseNotification, anomalyScore: 0.85 }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByText('Score: 85%')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders action button when actionUrl and actionLabel present', () => {
      const notification = {
        ...baseNotification,
        actionUrl: '/test-action',
        actionLabel: 'Ver detalhes',
      }
      render(<NotificationItem notification={notification} />)

      expect(screen.getByText('Ver detalhes →')).toBeInTheDocument()
    })

    it('does not render action button when actionUrl missing', () => {
      const notification = {
        ...baseNotification,
        actionLabel: 'Ver detalhes',
      }
      render(<NotificationItem notification={notification} />)

      expect(screen.queryByText('Ver detalhes →')).not.toBeInTheDocument()
    })

    it('does not render action button when actionLabel missing', () => {
      const notification = {
        ...baseNotification,
        actionUrl: '/test-action',
      }
      render(<NotificationItem notification={notification} />)

      expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    })
  })

  describe('Click Handlers', () => {
    it('calls onClick when notification clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()

      render(<NotificationItem notification={baseNotification} onClick={onClick} />)

      await user.click(screen.getByText('Test Notification'))

      expect(onClick).toHaveBeenCalled()
    })

    it('calls onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup()
      const onDismiss = vi.fn()

      render(<NotificationItem notification={baseNotification} onDismiss={onDismiss} />)

      // Find and click the dismiss button (X icon)
      const dismissButton = screen.getByRole('button')
      await user.click(dismissButton)

      expect(onDismiss).toHaveBeenCalled()
    })

    it('does not call onClick when dismiss button clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const onDismiss = vi.fn()

      render(
        <NotificationItem notification={baseNotification} onClick={onClick} onDismiss={onDismiss} />
      )

      const dismissButton = screen.getByRole('button')
      await user.click(dismissButton)

      expect(onDismiss).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('navigates to actionUrl when action button clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()

      // Mock window.location
      const originalLocation = window.location
      delete (window as any).location
      window.location = { ...originalLocation, href: '' } as Location

      const notification = {
        ...baseNotification,
        actionUrl: '/test-action',
        actionLabel: 'Ver detalhes',
      }

      render(<NotificationItem notification={notification} onClick={onClick} />)

      await user.click(screen.getByText('Ver detalhes →'))

      expect(window.location.href).toBe('/test-action')
      expect(onClick).not.toHaveBeenCalled()

      // Restore
      window.location = originalLocation
    })
  })

  describe('Styling', () => {
    it('applies unread background styling when not read', () => {
      const { container } = render(<NotificationItem notification={baseNotification} />)

      const item = container.firstChild as HTMLElement
      expect(item.className).toContain('bg-blue-50/50')
    })

    it('does not apply unread background when read', () => {
      const readNotification = { ...baseNotification, read: true }
      const { container } = render(<NotificationItem notification={readNotification} />)

      const item = container.firstChild as HTMLElement
      expect(item.className).not.toContain('bg-blue-50/50')
    })

    it('applies font-semibold to title when unread', () => {
      render(<NotificationItem notification={baseNotification} />)

      const title = screen.getByText('Test Notification')
      expect(title.className).toContain('font-semibold')
    })

    it('applies font-medium to title when read', () => {
      const readNotification = { ...baseNotification, read: true }
      render(<NotificationItem notification={readNotification} />)

      const title = screen.getByText('Test Notification')
      expect(title.className).toContain('font-medium')
      expect(title.className).not.toContain('font-semibold')
    })
  })

  describe('No Dismiss Button', () => {
    it('does not render dismiss button when onDismiss not provided', () => {
      render(<NotificationItem notification={baseNotification} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
