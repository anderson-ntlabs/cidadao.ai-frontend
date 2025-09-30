import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContrastToggle } from './contrast-toggle';

describe('ContrastToggle', () => {
  let originalClassList: DOMTokenList;

  beforeEach(() => {
    // Save original classList
    originalClassList = document.documentElement.classList;
    // Clear any existing classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    // Restore original classList
    document.documentElement.classList = originalClassList;
  });

  it('should render contrast toggle button', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    expect(button).toBeInTheDocument();
  });

  it('should toggle high contrast mode when clicked', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    // Initially should not have high-contrast class
    expect(document.documentElement).not.toHaveClass('high-contrast');
    
    // Click to enable high contrast
    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('high-contrast');
    
    // Click again to disable
    fireEvent.click(button);
    expect(document.documentElement).not.toHaveClass('high-contrast');
  });

  it('should show correct icon based on contrast state', () => {
    render(<ContrastToggle />);
    
    // Should show the contrast icon initially
    expect(screen.getByTestId('contrast-icon')).toBeInTheDocument();
  });

  it('should persist high contrast preference', () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    // Enable high contrast
    fireEvent.click(button);
    
    // Check localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('highContrast', 'true');
    
    // Disable high contrast
    fireEvent.click(button);
    
    // Check localStorage was updated
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('highContrast');
  });

  it('should load high contrast preference from localStorage on mount', () => {
    const mockLocalStorage = {
      getItem: vi.fn((key) => key === 'highContrast' ? 'true' : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    render(<ContrastToggle />);
    
    // Should have high-contrast class from localStorage
    expect(document.documentElement).toHaveClass('high-contrast');
  });

  it('should have proper accessibility attributes', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    
    // Enable high contrast
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should handle keyboard interactions', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    // Focus the button
    button.focus();
    expect(document.activeElement).toBe(button);
    
    // Press Enter
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(document.documentElement).toHaveClass('high-contrast');
    
    // Press Space
    fireEvent.keyDown(button, { key: ' ' });
    expect(document.documentElement).not.toHaveClass('high-contrast');
  });

  it('should apply correct styling classes', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    expect(button).toHaveClass('rounded-lg', 'p-2', 'transition-colors');
    expect(button).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');
  });

  it('should be focusable and show focus indicator', () => {
    render(<ContrastToggle />);
    
    const button = screen.getByLabelText(/alternar alto contraste/i);
    
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });
});