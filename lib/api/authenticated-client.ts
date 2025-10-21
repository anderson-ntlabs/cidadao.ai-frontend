import axios, { AxiosInstance, AxiosError } from 'axios';
import { authIntegrationService } from './auth-integration.service';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

class AuthenticatedApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      async (config) => {
        const headers = await authIntegrationService.getAuthHeaders();
        // Merge headers properly for Axios
        Object.entries(headers).forEach(([key, value]) => {
          config.headers.set(key, value);
        });
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token might be expired, try to refresh
          console.log('Authentication error, attempting to refresh session...');
          // The Supabase client handles refresh automatically
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        // Server responded with error
        return {
          success: false,
          error: {
            message: axiosError.response.data?.message || axiosError.message,
            code: axiosError.response.data?.code || String(axiosError.response.status),
            details: axiosError.response.data,
          },
        };
      } else if (axiosError.request) {
        // Request made but no response
        return {
          success: false,
          error: {
            message: 'Network error - no response from server',
            code: 'NETWORK_ERROR',
          },
        };
      }
    }

    // Other errors
    return {
      success: false,
      error: {
        message: error?.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export const authenticatedApi = new AuthenticatedApiClient();