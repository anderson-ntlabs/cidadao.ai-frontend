/**
 * Retry utility with exponential backoff
 * Sprint 1 - Épico 1.3
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Improved type safety (Sprint 2.2)
 */

import { logger } from '@/lib/logger'

/**
 * Error type with optional response property for HTTP errors
 */
export interface RetryableError extends Error {
  response?: {
    status: number
    [key: string]: unknown
  }
}

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: RetryableError) => boolean
  onRetry?: (attempt: number, error: RetryableError) => void
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: RetryableError): boolean => {
    // Retry on network errors or 5xx status codes
    if (!error.response) return true // Network error
    const status = error.response.status
    return status >= 500 && status < 600
  },
  onRetry: (attempt: number, error: RetryableError): void => {
    logger.warn('Retry attempt', {
      context: 'RetryUtil',
      attempt,
      error: error.message,
    })
  },
}

/**
 * Execute a function with retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry options
 * @returns Promise with the result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * const result = await withRetry(
 *   () => fetchData('/api/data'),
 *   { maxAttempts: 5, initialDelay: 500 }
 * );
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let lastError: RetryableError | null = null

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Normalize error to RetryableError
      lastError = normalizeError(error)

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition(lastError)) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      )

      // Call onRetry callback
      opts.onRetry(attempt, lastError)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Normalize unknown error to RetryableError
 */
function normalizeError(error: unknown): RetryableError {
  if (error instanceof Error) {
    // Check if it has a response property (axios-like error)
    const httpError = error as RetryableError
    return httpError
  }

  // Create a new error for non-Error types
  const message = typeof error === 'string' ? error : 'Unknown error'
  return new Error(message) as RetryableError
}

/**
 * Create a retry wrapper for a specific function
 *
 * @param fn - Async function to wrap
 * @param options - Retry options
 * @returns Wrapped function with retry logic
 *
 * @example
 * const fetchWithRetry = createRetryWrapper(fetchData, { maxAttempts: 3 });
 * const result = await fetchWithRetry('/api/data');
 */
export function createRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: RetryOptions
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    return withRetry(() => fn(...args), options)
  }
}
