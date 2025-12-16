/**
 * Tests for BackendStatusBanner component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BackendStatusBanner } from '../backend-status-banner'

// Mock health state
const mockHealthState = vi.hoisted(() => ({
  status: 'healthy' as 'healthy' | 'checking' | 'degraded' | 'unavailable',
  lastCheck: null as Date | null,
  error: null as string | null,
}))

vi.mock('@/hooks/use-backend-health', () => ({
  useBackendHealth: () => mockHealthState,
}))

describe('BackendStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHealthState.status = 'healthy'
    mockHealthState.lastCheck = null
    mockHealthState.error = null
  })

  describe('Healthy Status', () => {
    it('returns null when backend is healthy', () => {
      mockHealthState.status = 'healthy'

      const { container } = render(<BackendStatusBanner />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Checking Status', () => {
    it('shows checking banner', () => {
      mockHealthState.status = 'checking'

      render(<BackendStatusBanner />)

      expect(screen.getByText('Verificando conexão...')).toBeInTheDocument()
      expect(screen.getByText('Conectando ao backend')).toBeInTheDocument()
    })

    it('shows blue styling for checking', () => {
      mockHealthState.status = 'checking'

      render(<BackendStatusBanner />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-blue-50')
    })
  })

  describe('Degraded Status', () => {
    it('shows degraded banner', () => {
      mockHealthState.status = 'degraded'

      render(<BackendStatusBanner />)

      expect(screen.getByText('Modo Limitado')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Backend operando com limitações. Algumas funcionalidades podem estar indisponíveis.'
        )
      ).toBeInTheDocument()
    })

    it('shows yellow styling for degraded', () => {
      mockHealthState.status = 'degraded'

      render(<BackendStatusBanner />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-yellow-50')
    })
  })

  describe('Unavailable Status', () => {
    it('shows unavailable banner', () => {
      mockHealthState.status = 'unavailable'

      render(<BackendStatusBanner />)

      expect(screen.getByText('Backend Indisponível')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Não foi possível conectar ao backend. Operando em modo demonstração com dados de exemplo.'
        )
      ).toBeInTheDocument()
    })

    it('shows red styling for unavailable', () => {
      mockHealthState.status = 'unavailable'

      render(<BackendStatusBanner />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-red-50')
    })

    it('shows last check time when unavailable', () => {
      mockHealthState.status = 'unavailable'
      mockHealthState.lastCheck = new Date('2025-12-15T10:30:00')

      render(<BackendStatusBanner />)

      expect(screen.getByText(/Última verificação:/)).toBeInTheDocument()
    })

    it('shows error message when unavailable', () => {
      mockHealthState.status = 'unavailable'
      mockHealthState.error = 'Connection refused'

      render(<BackendStatusBanner />)

      expect(screen.getByText('Connection refused')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has alert role', () => {
      mockHealthState.status = 'checking'

      render(<BackendStatusBanner />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-live polite', () => {
      mockHealthState.status = 'degraded'

      render(<BackendStatusBanner />)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })
  })
})
