import { api } from './client';

/**
 * Authentication service following backend API documentation
 */

// Types from backend documentation
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
  };
}

interface RefreshRequest {
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

class AuthService {
  private refreshPromise: Promise<RefreshResponse> | null = null;

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    // Store tokens and user info
    this.storeAuthData(response.data);

    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshResponse> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = api.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken
    }).then(response => {
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Token refresh failed');
      }

      // Update stored tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      this.refreshPromise = null;
      return response.data;
    }).catch(error => {
      this.refreshPromise = null;
      throw error;
    });

    return this.refreshPromise;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear local data
      this.clearAuthData();
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo> {
    const response = await api.get<UserInfo>('/auth/me');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get user info');
    }

    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Get stored user info
   */
  getStoredUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private storeAuthData(data: LoginResponse): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token_expires_at', String(Date.now() + data.expires_in * 1000));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('isAuthenticated');
  }
}

// Export singleton instance
export const authService = new AuthService();