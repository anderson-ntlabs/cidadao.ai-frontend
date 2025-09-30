import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuth } from './use-auth';
import { authService } from '@/lib/api/auth.service';
import { toast } from './use-toast';

// Mock dependencies
vi.mock('next/navigation');
vi.mock('@/lib/api/auth.service');
vi.mock('./use-toast');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('useAuth', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(toast).success = mockToast.success;
    vi.mocked(toast).error = mockToast.error;
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      
      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should check auth on mount', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('checkAuth', () => {
    it('should set user from backend when authenticated', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
      
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        ...mockUser,
        avatar: expect.stringContaining('https://ui-avatars.com/api/?name=Test'),
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should use mock auth from localStorage when backend auth fails', async () => {
      const mockUser = {
        id: 'mock123',
        name: 'Mock User',
        email: 'mock@example.com',
      };
      
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'isAuthenticated') return 'true';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle auth check errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should login successfully and redirect to dashboard', async () => {
      const mockResponse = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        access_token: 'token123',
      };
      
      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.user).toEqual({
        ...mockResponse.user,
        avatar: expect.stringContaining('https://ui-avatars.com/api/?name=Test'),
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Bem-vindo(a), Test User!',
        'Login realizado com sucesso'
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/pt/dashboard');
    });

    it('should redirect to saved URL after login', async () => {
      const mockResponse = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        access_token: 'token123',
      };
      
      vi.mocked(authService.login).mockResolvedValue(mockResponse);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'redirectAfterLogin') return '/pt/chat';
        return null;
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
      expect(mockRouter.push).toHaveBeenCalledWith('/pt/chat');
    });

    it('should handle login errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(mockToast.error).toHaveBeenCalledWith(
        'Falha no login',
        'Verifique suas credenciais e tente novamente'
      );
      expect(result.current.isAuthenticated).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('loginWithProvider', () => {
    it('should login with OAuth provider using mock', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.loginWithProvider('google');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('João Silva')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAuthenticated', 'true');
      expect(result.current.user?.name).toBe('João Silva');
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Bem-vindo(a), João Silva!',
        'Login realizado com sucesso'
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/pt/dashboard');
    });

    it('should handle provider login errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Override setTimeout to throw
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation(() => {
        throw new Error('Provider error');
      }) as any;

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.loginWithProvider('google');
        })
      ).rejects.toThrow('Provider error');

      expect(mockToast.error).toHaveBeenCalledWith(
        'Falha no login',
        'Tente novamente mais tarde'
      );
      
      global.setTimeout = originalSetTimeout;
      consoleSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should logout and clear all data', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      
      // Set initial state
      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('isAuthenticated');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.push).toHaveBeenCalledWith('/pt/login');
    });

    it('should handle logout errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.logout).mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local data even if backend logout fails
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('isAuthenticated');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.push).toHaveBeenCalledWith('/pt/login');
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should manage loading state during login', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      vi.mocked(authService.login).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          user: { id: '123', name: 'Test', email: 'test@test.com', role: 'user' },
          access_token: 'token',
        }), 100))
      );

      const { result } = renderHook(() => useAuth());
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loadingDuringLogin = false;
      
      // Start login
      const loginPromise = act(async () => {
        // Capture loading state during login
        loadingDuringLogin = result.current.isLoading;
        await result.current.login('test@test.com', 'password');
      });

      await loginPromise;

      // Should not be loading after login completes
      expect(result.current.isLoading).toBe(false);
    });
  });
});