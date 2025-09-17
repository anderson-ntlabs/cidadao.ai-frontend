import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://neural-thinker-cidadao-ai-backend.hf.space';
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
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
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
      if (status === 401) {
        // Clear auth data and redirect to login if needed
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // Could trigger a redirect here if needed
        }
      }

      // Format error message
      const errorMessage = data?.detail 
        ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg)
        : data?.message || 'An unexpected error occurred';

      return Promise.reject({
        message: errorMessage,
        status,
        code: data?.code,
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
    return {
      error: {
        message: error.message || 'An error occurred',
        status: error.status,
        code: error.code,
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