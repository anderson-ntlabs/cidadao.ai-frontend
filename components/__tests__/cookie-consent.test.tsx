import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieConsent } from '../cookie-consent'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return {
    ...actual,
    X: () => <svg data-testid="x-icon" />,
    Cookie: () => <svg data-testid="cookie-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    GraduationCap: () => <svg data-testid="grad-icon" />,
  }
})

describe('CookieConsent', () => {
  let store: { [key: string]: string } = {}
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    store = {}

    // Create a proper mock that updates the store
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('visibility', () => {
    it('shows banner when no consent stored', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText('Cookies & Privacidade')).toBeInTheDocument()
    })

    it('hides banner when consent is accepted', () => {
      store['cookie-consent'] = 'accepted'
      const { container } = render(<CookieConsent locale="pt" />)
      expect(container.firstChild).toBeNull()
    })

    it('hides banner when consent is rejected', () => {
      store['cookie-consent'] = 'rejected'
      const { container } = render(<CookieConsent locale="pt" />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Portuguese locale', () => {
    it('renders Portuguese title', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText('Cookies & Privacidade')).toBeInTheDocument()
    })

    it('renders Portuguese message', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText(/transparência pública/)).toBeInTheDocument()
    })

    it('renders Portuguese features', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText(/Cookies essenciais/)).toBeInTheDocument()
      expect(screen.getByText(/Analytics anônimos/)).toBeInTheDocument()
      expect(screen.getByText(/Pesquisa acadêmica/)).toBeInTheDocument()
    })

    it('renders Portuguese buttons', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText('Aceitar Tudo')).toBeInTheDocument()
      expect(screen.getByText('Apenas Essenciais')).toBeInTheDocument()
    })

    it('renders Portuguese policy links', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByText('Política de Privacidade')).toHaveAttribute('href', '/pt/privacy')
      expect(screen.getByText('Política de Cookies')).toHaveAttribute('href', '/pt/cookies')
      expect(screen.getByText('Conheça o Projeto')).toHaveAttribute('href', '/pt/about')
    })
  })

  describe('English locale', () => {
    it('renders English title', () => {
      render(<CookieConsent locale="en" />)
      expect(screen.getByText('Cookies & Privacy')).toBeInTheDocument()
    })

    it('renders English message', () => {
      render(<CookieConsent locale="en" />)
      expect(screen.getByText(/public transparency/)).toBeInTheDocument()
    })

    it('renders English features', () => {
      render(<CookieConsent locale="en" />)
      expect(screen.getByText(/Essential cookies/)).toBeInTheDocument()
      expect(screen.getByText(/Anonymous analytics/)).toBeInTheDocument()
      expect(screen.getByText(/LGPD-compliant/)).toBeInTheDocument()
    })

    it('renders English buttons', () => {
      render(<CookieConsent locale="en" />)
      expect(screen.getByText('Accept All')).toBeInTheDocument()
      expect(screen.getByText('Essential Only')).toBeInTheDocument()
    })

    it('renders English policy links', () => {
      render(<CookieConsent locale="en" />)
      expect(screen.getByText('Privacy Policy')).toHaveAttribute('href', '/en/privacy')
      expect(screen.getByText('Cookie Policy')).toHaveAttribute('href', '/en/cookies')
      expect(screen.getByText('About the Project')).toHaveAttribute('href', '/en/about')
    })
  })

  describe('accept button', () => {
    it('sets localStorage to accepted on click', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Aceitar Tudo'))
      expect(store['cookie-consent']).toBe('accepted')
    })

    it('hides banner after accept', () => {
      const { container, rerender } = render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Aceitar Tudo'))
      expect(container.querySelector('[role="banner"]')).toBeNull()
    })

    it('dispatches consent-updated event', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Aceitar Tudo'))
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))
    })
  })

  describe('reject button', () => {
    it('sets localStorage to rejected on click', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Apenas Essenciais'))
      expect(store['cookie-consent']).toBe('rejected')
    })

    it('hides banner after reject', () => {
      const { container } = render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Apenas Essenciais'))
      expect(screen.queryByText('Cookies & Privacidade')).not.toBeInTheDocument()
    })

    it('dispatches consent-updated event', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByText('Apenas Essenciais'))
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))
    })
  })

  describe('close button', () => {
    it('closes banner when X clicked', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByLabelText('Close'))
      expect(screen.queryByText('Cookies & Privacidade')).not.toBeInTheDocument()
    })

    it('sets consent to rejected when closed', () => {
      render(<CookieConsent locale="pt" />)
      fireEvent.click(screen.getByLabelText('Close'))
      expect(store['cookie-consent']).toBe('rejected')
    })
  })

  describe('styling', () => {
    it('has fixed positioning at bottom', () => {
      const { container } = render(<CookieConsent locale="pt" />)
      expect(container.firstChild).toHaveClass('fixed', 'bottom-0')
    })

    it('has gradient background', () => {
      const { container } = render(<CookieConsent locale="pt" />)
      expect(container.firstChild).toHaveClass('bg-gradient-to-r')
    })

    it('has high z-index', () => {
      const { container } = render(<CookieConsent locale="pt" />)
      expect(container.firstChild).toHaveClass('z-50')
    })
  })

  describe('icons', () => {
    it('renders cookie icon in header', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getAllByTestId('cookie-icon').length).toBeGreaterThan(0)
    })

    it('renders shield icon for privacy link', () => {
      render(<CookieConsent locale="pt" />)
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
    })
  })
})
