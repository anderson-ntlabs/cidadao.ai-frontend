import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';
const API_TIMEOUT = 30000; // 30 seconds

// Types for API responses
export interface ApiError {
  message: string;
  detail?: string | { msg: string; type: string }[];
  code?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Important for CORS
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add API key if available
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401 && typeof window !== 'undefined') {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Try to refresh token if not already retrying
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Dynamic import to avoid circular dependency
            const { authService } = await import('./auth.service');
            await authService.refreshToken();
            
            // Retry original request with new token
            const newToken = localStorage.getItem('access_token');
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth data
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            // Redirect to login could be triggered here
          }
        }
      }

      // Format error message
      const errorMessage = data?.detail 
        ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg)
        : data?.message || 'An unexpected error occurred';

      console.error(`API Error ${status}:`, errorMessage, data);

      return Promise.reject({
        message: errorMessage,
        status,
        code: data?.code,
        response: error.response,
        originalError: error,
      });
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
      });
    }

    if (!error.response && error.message === 'Network Error') {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      originalError: error,
    });
  }
);

// Helper function for API calls with error handling
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>(config);
    return {
      data: response.data,
      success: true,
    };
  } catch (error: any) {
    console.error('API request error:', error.response?.data || error.message);
    return {
      error: {
        message: error.message || 'An error occurred',
        status: error.status,
        code: error.code,
        detail: error.response?.data?.detail,
      },
      success: false,
    };
  }
}

// Export configured client and helper methods
export default apiClient;

// Convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'GET', url }),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'DELETE', url }),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
};

// Export base URL for WebSocket connections
export const WS_BASE_URL = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');