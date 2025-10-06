import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContrastToggle } from './contrast-toggle';

// Mock dependencies
vi.mock('./button', () => ({
  ButtonV2: ({ children, onClick, leftIcon, 'aria-label': ariaLabel, 'aria-pressed': ariaPressed, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} aria-pressed={ariaPressed} {...props}>
      {leftIcon}
      {children}
    </button>
  ),
}));

vi.mock('./tooltip', () => ({
  StrategicTooltip: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
}));

describe('ContrastToggle', () => {
  beforeEach(() => {
    // Clear document state
    document.documentElement.className = '';
    // Clear localStorage
    localStorage.clear();
    // Clear any existing high-contrast styles
    const link = document.getElementById('high-contrast-styles');
    if (link) link.remove();
  });

  afterEach(() => {
    // Cleanup
    document.documentElement.className = '';
    localStorage.clear();
    const link = document.getElementById('high-contrast-styles');
    if (link) link.remove();
  });

  it('should render contrast toggle button', () => {
    render(<ContrastToggle />);

    const button = screen.getByRole('button', { name: /ativar modo de alto contraste/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle high contrast mode when clicked', async () => {
    render(<ContrastToggle />);

    const button = screen.getByRole('button', { name: /ativar modo de alto contraste/i });

    // Initially should not have high-contrast class
    expect(document.documentElement).not.toHaveClass('high-contrast');

    // Click to enable high contrast
    fireEvent.click(button);
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('high-contrast');
    });

    // Click again to disable
    fireEvent.click(button);
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('high-contrast');
    });
  });

  it('should show correct icon based on contrast state', async () => {
    render(<ContrastToggle />);

    // Initially should show EyeOff icon (contrast disabled)
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

    // Enable high contrast
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should now show Eye icon (contrast enabled)
    await waitFor(() => {
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });
  });

  it('should persist high contrast preference', async () => {
    render(<ContrastToggle />);

    const button = screen.getByRole('button', { name: /ativar modo de alto contraste/i });

    // Enable high contrast
    fireEvent.click(button);

    await waitFor(() => {
      // Check localStorage was called with correct key
      expect(localStorage.getItem('theme-contrast')).toBe('high');
    });

    // Disable high contrast
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem('theme-contrast')).toBe('normal');
    });
  });

  it('should load high contrast preference from localStorage on mount', async () => {
    // Set saved preference
    localStorage.setItem('theme-contrast', 'high');

    render(<ContrastToggle />);

    // Should have high-contrast class from localStorage
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('high-contrast');
    });
  });

  it('should have proper accessibility attributes', async () => {
    render(<ContrastToggle />);

    const button = screen.getByRole('button', { name: /ativar modo de alto contraste/i });

    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Enable high contrast
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('should render text content for larger screens', () => {
    render(<ContrastToggle />);

    // Component renders "Contraste" for normal mode
    expect(screen.getByText('Contraste')).toBeInTheDocument();
  });

  it('should render A11y abbreviation for small screens', () => {
    render(<ContrastToggle />);

    // Component renders "A11y" for small screens
    expect(screen.getByText('A11y')).toBeInTheDocument();
  });

  it('should inject high contrast stylesheet when enabled', async () => {
    render(<ContrastToggle />);

    const button = screen.getByRole('button');

    // Enable high contrast
    fireEvent.click(button);

    await waitFor(() => {
      const link = document.getElementById('high-contrast-styles');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/styles/high-contrast.css');
    });
  });
});