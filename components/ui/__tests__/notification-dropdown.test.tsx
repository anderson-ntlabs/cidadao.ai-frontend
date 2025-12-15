/**
 * Tests for NotificationDropdown component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationDropdown } from '../notification-dropdown'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('../notification-badge', () => ({
  NotificationBadge: ({ count }: any) => <span data-testid="notification-badge">{count}</span>,
}))

vi.mock('../notification-item', () => ({
  NotificationItem: ({ notification, onClick, onDismiss }: any) => (
    <div data-testid="notification-item" onClick={onClick}>
      <span>{notification.title}</span>
      <button
        data-testid="dismiss-btn"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss?.()
        }}
      >
        X
      </button>
    </div>
  ),
}))

const mockStore = {
  notifications: [
    {
      id: '1',
      title: 'Notification 1',
      read: false,
      type: 'info',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      message: 'Test',
    },
    {
      id: '2',
      title: 'Notification 2',
      read: true,
      type: 'success',
      priority: 'low',
      timestamp: new Date().toISOString(),
      message: 'Test',
    },
    {
      id: '3',
      title: 'Notification 3',
      read: false,
      type: 'warning',
      priority: 'high',
      timestamp: new Date().toISOString(),
      message: 'Test',
    },
  ],
  isLoading: false,
  getUnreadCount: vi.fn(() => 2),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  removeNotification: vi.fn(),
  fetchNotifications: vi.fn(),
}

vi.mock('@/store/notification-store', () => ({
  useNotificationStore: () => mockStore,
}))

describe('NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Reset store state
    mockStore.notifications = [
      {
        id: '1',
        title: 'Notification 1',
        read: false,
        type: 'info',
        priority: 'medium',
        timestamp: new Date().toISOString(),
        message: 'Test',
      },
      {
        id: '2',
        title: 'Notification 2',
        read: true,
        type: 'success',
        priority: 'low',
        timestamp: new Date().toISOString(),
        message: 'Test',
      },
    ]
    mockStore.getUnreadCount.mockReturnValue(1)
    mockStore.isLoading = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders bell button', () => {
      render(<NotificationDropdown locale="pt" />)

      expect(screen.getByRole('button', { name: /notificações/i })).toBeInTheDocument()
    })

    it('shows notification badge after mount', async () => {
      render(<NotificationDropdown locale="pt" />)

      // Wait for client mount
      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(screen.getByTestId('notification-badge')).toBeInTheDocument()
    })

    it('uses English label when locale is en', () => {
      render(<NotificationDropdown locale="en" />)

      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    })
  })

  describe('Dropdown Toggle', () => {
    it('opens dropdown when bell clicked', async () => {
      render(<NotificationDropdown locale="pt" />)

      // Mount and click
      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })

    it('closes dropdown when bell clicked again', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      const button = screen.getByRole('button', { name: /notificações/i })

      // Open
      fireEvent.click(button)
      expect(screen.getByText('Notificações')).toBeInTheDocument()

      // Close
      fireEvent.click(button)
      expect(screen.queryByText(/ver todas as notificações/i)).not.toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <NotificationDropdown locale="pt" />
        </div>
      )

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))
      expect(screen.getByText('Notificações')).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(screen.queryByText(/ver todas as notificações/i)).not.toBeInTheDocument()
    })
  })

  describe('Notifications List', () => {
    it('shows notification items', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      const items = screen.getAllByTestId('notification-item')
      expect(items.length).toBe(2)
    })

    it('shows empty state when no notifications', async () => {
      mockStore.notifications = []

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.getByText(/nenhuma notificação no momento/i)).toBeInTheDocument()
    })

    it('shows English empty state when locale is en', async () => {
      mockStore.notifications = []

      render(<NotificationDropdown locale="en" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

      expect(screen.getByText(/no notifications at the moment/i)).toBeInTheDocument()
    })

    it('shows loading state', async () => {
      mockStore.isLoading = true

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      // Should show loader
      expect(screen.queryByTestId('notification-item')).not.toBeInTheDocument()
    })
  })

  describe('Mark All as Read', () => {
    it('shows mark all as read button when unread exist', async () => {
      mockStore.getUnreadCount.mockReturnValue(2)

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.getByText(/marcar todas como lidas/i)).toBeInTheDocument()
    })

    it('hides mark all as read button when no unread', async () => {
      mockStore.getUnreadCount.mockReturnValue(0)

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.queryByText(/marcar todas como lidas/i)).not.toBeInTheDocument()
    })

    it('calls markAllAsRead when button clicked', async () => {
      mockStore.getUnreadCount.mockReturnValue(2)

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))
      fireEvent.click(screen.getByText(/marcar todas como lidas/i))

      expect(mockStore.markAllAsRead).toHaveBeenCalled()
    })
  })

  describe('Notification Actions', () => {
    it('marks notification as read when clicked', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      const items = screen.getAllByTestId('notification-item')
      fireEvent.click(items[0])

      expect(mockStore.markAsRead).toHaveBeenCalledWith('1')
    })

    it('removes notification when dismiss clicked', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      const dismissButtons = screen.getAllByTestId('dismiss-btn')
      fireEvent.click(dismissButtons[0])

      expect(mockStore.removeNotification).toHaveBeenCalledWith('1')
    })
  })

  describe('Footer', () => {
    it('shows view all link when notifications exist', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.getByText(/ver todas as notificações/i)).toBeInTheDocument()
    })

    it('hides view all link when no notifications', async () => {
      mockStore.notifications = []

      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      expect(screen.queryByText(/ver todas as notificações/i)).not.toBeInTheDocument()
    })

    it('links to correct locale path', async () => {
      render(<NotificationDropdown locale="en" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

      const link = screen.getByText(/view all notifications/i)
      expect(link.closest('a')).toHaveAttribute('href', '/en/notificacoes')
    })
  })

  describe('Polling', () => {
    it('fetches notifications on mount', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(mockStore.fetchNotifications).toHaveBeenCalled()
    })

    it('polls for notifications every 30 seconds', async () => {
      render(<NotificationDropdown locale="pt" />)

      // Initial mount
      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(mockStore.fetchNotifications).toHaveBeenCalledTimes(1)

      // After 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      expect(mockStore.fetchNotifications).toHaveBeenCalledTimes(2)

      // After another 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      expect(mockStore.fetchNotifications).toHaveBeenCalledTimes(3)
    })

    it('clears polling interval on unmount', async () => {
      const { unmount } = render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      unmount()

      // Advance time after unmount
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Should only have been called once (on mount)
      expect(mockStore.fetchNotifications).toHaveBeenCalledTimes(1)
    })
  })

  describe('Settings Link', () => {
    it('has settings link to correct locale', async () => {
      render(<NotificationDropdown locale="pt" />)

      act(() => {
        vi.advanceTimersByTime(0)
      })

      fireEvent.click(screen.getByRole('button', { name: /notificações/i }))

      const settingsLink = screen.getByRole('link', { name: '' })
      expect(settingsLink).toHaveAttribute('href', '/pt/settings')
    })
  })
})
