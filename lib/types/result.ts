/**
 * Result Type Pattern
 *
 * A type-safe way to handle operations that can succeed or fail.
 * Eliminates silent `return null` and provides consistent error handling.
 *
 * Usage:
 * ```typescript
 * function fetchUser(id: string): Promise<Result<User>> {
 *   try {
 *     const user = await db.users.findById(id)
 *     if (!user) {
 *       return failure('USER_NOT_FOUND', 'User not found')
 *     }
 *     return success(user)
 *   } catch (error) {
 *     return failure('DB_ERROR', 'Database error', error)
 *   }
 * }
 *
 * // Consumer
 * const result = await fetchUser('123')
 * if (result.success) {
 *   console.log(result.data.name)
 * } else {
 *   console.error(result.error.code, result.error.message)
 * }
 * ```
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12
 * @see ADR-001 Result Type Pattern for Error Handling
 */

// ============================================
// Core Types
// ============================================

/**
 * Represents a successful operation result
 */
export interface Success<T> {
  success: true
  data: T
}

/**
 * Error details for failed operations
 */
export interface ResultError {
  /** Machine-readable error code (e.g., 'USER_NOT_FOUND', 'VALIDATION_ERROR') */
  code: string
  /** Human-readable error message */
  message: string
  /** Original error for debugging (not exposed to clients) */
  cause?: unknown
  /** Additional context */
  details?: Record<string, unknown>
}

/**
 * Represents a failed operation result
 */
export interface Failure {
  success: false
  error: ResultError
}

/**
 * Union type representing either success or failure
 */
export type Result<T> = Success<T> | Failure

// ============================================
// Async Result Type
// ============================================

/**
 * Promise that resolves to a Result
 * Convenience type for async operations
 */
export type AsyncResult<T> = Promise<Result<T>>

// ============================================
// Factory Functions
// ============================================

/**
 * Create a successful result
 *
 * @param data The success data
 * @returns A Success result
 *
 * @example
 * return success({ id: '123', name: 'John' })
 */
export function success<T>(data: T): Success<T> {
  return { success: true, data }
}

/**
 * Create a failure result
 *
 * @param code Machine-readable error code
 * @param message Human-readable error message
 * @param cause Original error (optional)
 * @param details Additional context (optional)
 * @returns A Failure result
 *
 * @example
 * return failure('USER_NOT_FOUND', 'User with ID 123 not found')
 * return failure('DB_ERROR', 'Database connection failed', error)
 */
export function failure(
  code: string,
  message: string,
  cause?: unknown,
  details?: Record<string, unknown>
): Failure {
  return {
    success: false,
    error: { code, message, cause, details },
  }
}

// ============================================
// Type Guards
// ============================================

/**
 * Type guard to check if result is successful
 *
 * @example
 * if (isSuccess(result)) {
 *   console.log(result.data) // TypeScript knows this is Success<T>
 * }
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success === true
}

/**
 * Type guard to check if result is a failure
 *
 * @example
 * if (isFailure(result)) {
 *   console.error(result.error.message) // TypeScript knows this is Failure
 * }
 */
export function isFailure<T>(result: Result<T>): result is Failure {
  return result.success === false
}

// ============================================
// Utility Functions
// ============================================

/**
 * Unwrap a result, throwing if it's a failure
 * Use sparingly - prefer pattern matching with isSuccess/isFailure
 *
 * @throws Error if result is a failure
 *
 * @example
 * const user = unwrap(await fetchUser('123')) // throws if failure
 */
export function unwrap<T>(result: Result<T>): T {
  if (isSuccess(result)) {
    return result.data
  }
  throw new Error(`${result.error.code}: ${result.error.message}`)
}

/**
 * Unwrap a result with a default value for failures
 *
 * @example
 * const user = unwrapOr(await fetchUser('123'), defaultUser)
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data
  }
  return defaultValue
}

/**
 * Map over a successful result
 *
 * @example
 * const nameResult = map(userResult, user => user.name)
 */
export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isSuccess(result)) {
    return success(fn(result.data))
  }
  return result
}

/**
 * FlatMap (chain) over a successful result
 *
 * @example
 * const profileResult = flatMap(userResult, user => fetchProfile(user.id))
 */
export function flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
  if (isSuccess(result)) {
    return fn(result.data)
  }
  return result
}

/**
 * Convert a Promise that might throw to an AsyncResult
 *
 * @example
 * const result = await tryCatch(
 *   () => fetch('/api/user'),
 *   'FETCH_ERROR',
 *   'Failed to fetch user'
 * )
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode: string,
  errorMessage: string
): AsyncResult<T> {
  try {
    const data = await fn()
    return success(data)
  } catch (error) {
    return failure(errorCode, errorMessage, error)
  }
}

/**
 * Combine multiple results into a single result
 * If any result is a failure, returns the first failure
 *
 * @example
 * const combined = combine([userResult, profileResult, settingsResult])
 * if (combined.success) {
 *   const [user, profile, settings] = combined.data
 * }
 */
export function combine<T extends readonly Result<unknown>[]>(
  results: T
): Result<{ [K in keyof T]: T[K] extends Result<infer U> ? U : never }> {
  const data: unknown[] = []

  for (const result of results) {
    if (isFailure(result)) {
      return result
    }
    data.push(result.data)
  }

  return success(data as { [K in keyof T]: T[K] extends Result<infer U> ? U : never })
}

// ============================================
// Common Error Codes
// ============================================

/**
 * Standard error codes for consistency across the application
 */
export const ErrorCodes = {
  // Authentication
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Database
  DB_ERROR: 'DB_ERROR',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',

  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
