/**
 * Result Type Tests
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12
 */

import { describe, it, expect } from 'vitest'
import {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  map,
  flatMap,
  tryCatch,
  combine,
  ErrorCodes,
  type Result,
} from '../result'

describe('Result Type', () => {
  // ============================================
  // Factory Functions
  // ============================================
  describe('success', () => {
    it('should create a success result with data', () => {
      const result = success({ id: '123', name: 'Test' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: '123', name: 'Test' })
    })

    it('should work with primitive values', () => {
      expect(success(42).data).toBe(42)
      expect(success('hello').data).toBe('hello')
      expect(success(true).data).toBe(true)
      expect(success(null).data).toBe(null)
    })

    it('should work with arrays', () => {
      const result = success([1, 2, 3])
      expect(result.data).toEqual([1, 2, 3])
    })
  })

  describe('failure', () => {
    it('should create a failure result with code and message', () => {
      const result = failure('NOT_FOUND', 'User not found')

      expect(result.success).toBe(false)
      expect(result.error.code).toBe('NOT_FOUND')
      expect(result.error.message).toBe('User not found')
    })

    it('should include cause when provided', () => {
      const originalError = new Error('DB connection failed')
      const result = failure('DB_ERROR', 'Database error', originalError)

      expect(result.error.cause).toBe(originalError)
    })

    it('should include details when provided', () => {
      const result = failure('VALIDATION_ERROR', 'Invalid input', undefined, {
        field: 'email',
        constraint: 'must be valid email',
      })

      expect(result.error.details).toEqual({
        field: 'email',
        constraint: 'must be valid email',
      })
    })
  })

  // ============================================
  // Type Guards
  // ============================================
  describe('isSuccess', () => {
    it('should return true for success results', () => {
      const result = success('data')
      expect(isSuccess(result)).toBe(true)
    })

    it('should return false for failure results', () => {
      const result = failure('ERROR', 'message')
      expect(isSuccess(result)).toBe(false)
    })

    it('should narrow type correctly', () => {
      const result: Result<string> = success('hello')

      if (isSuccess(result)) {
        // TypeScript should know result.data is string here
        expect(result.data.toUpperCase()).toBe('HELLO')
      }
    })
  })

  describe('isFailure', () => {
    it('should return true for failure results', () => {
      const result = failure('ERROR', 'message')
      expect(isFailure(result)).toBe(true)
    })

    it('should return false for success results', () => {
      const result = success('data')
      expect(isFailure(result)).toBe(false)
    })

    it('should narrow type correctly', () => {
      const result: Result<string> = failure('ERROR', 'test error')

      if (isFailure(result)) {
        // TypeScript should know result.error exists here
        expect(result.error.code).toBe('ERROR')
      }
    })
  })

  // ============================================
  // Utility Functions
  // ============================================
  describe('unwrap', () => {
    it('should return data for success results', () => {
      const result = success({ value: 42 })
      expect(unwrap(result)).toEqual({ value: 42 })
    })

    it('should throw for failure results', () => {
      const result = failure('ERROR', 'Something went wrong')

      expect(() => unwrap(result)).toThrow('ERROR: Something went wrong')
    })
  })

  describe('unwrapOr', () => {
    it('should return data for success results', () => {
      const result = success('actual')
      expect(unwrapOr(result, 'default')).toBe('actual')
    })

    it('should return default value for failure results', () => {
      const result = failure('ERROR', 'message')
      expect(unwrapOr(result, 'default')).toBe('default')
    })
  })

  describe('map', () => {
    it('should transform success data', () => {
      const result = success(5)
      const mapped = map(result, (x) => x * 2)

      expect(isSuccess(mapped)).toBe(true)
      if (isSuccess(mapped)) {
        expect(mapped.data).toBe(10)
      }
    })

    it('should pass through failures unchanged', () => {
      const result = failure('ERROR', 'message')
      const mapped = map(result, (x: number) => x * 2)

      expect(isFailure(mapped)).toBe(true)
      if (isFailure(mapped)) {
        expect(mapped.error.code).toBe('ERROR')
      }
    })

    it('should allow type transformation', () => {
      const result = success({ name: 'John', age: 30 })
      const mapped = map(result, (user) => user.name)

      if (isSuccess(mapped)) {
        expect(mapped.data).toBe('John')
      }
    })
  })

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      const getUser = (): Result<{ id: string }> => success({ id: '123' })
      const getProfile = (userId: string): Result<{ userId: string; bio: string }> =>
        success({ userId, bio: 'Hello!' })

      const result = flatMap(getUser(), (user) => getProfile(user.id))

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual({ userId: '123', bio: 'Hello!' })
      }
    })

    it('should short-circuit on first failure', () => {
      const getUser = (): Result<{ id: string }> => failure('NOT_FOUND', 'User not found')
      const getProfile = (userId: string): Result<{ userId: string; bio: string }> =>
        success({ userId, bio: 'Hello!' })

      const result = flatMap(getUser(), (user) => getProfile(user.id))

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe('NOT_FOUND')
      }
    })

    it('should propagate failure from chained operation', () => {
      const getUser = (): Result<{ id: string }> => success({ id: '123' })
      const getProfile = (): Result<{ userId: string; bio: string }> =>
        failure('PROFILE_ERROR', 'Profile not found')

      const result = flatMap(getUser(), () => getProfile())

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe('PROFILE_ERROR')
      }
    })
  })

  describe('tryCatch', () => {
    it('should wrap successful async operations', async () => {
      const result = await tryCatch(async () => ({ data: 'success' }), 'ERROR', 'Operation failed')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual({ data: 'success' })
      }
    })

    it('should catch and wrap errors', async () => {
      const result = await tryCatch(
        async () => {
          throw new Error('Boom!')
        },
        'ASYNC_ERROR',
        'Async operation failed'
      )

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe('ASYNC_ERROR')
        expect(result.error.message).toBe('Async operation failed')
        expect(result.error.cause).toBeInstanceOf(Error)
      }
    })
  })

  describe('combine', () => {
    it('should combine multiple success results', () => {
      const results = [success(1), success('two'), success({ three: 3 })] as const

      const combined = combine(results)

      expect(isSuccess(combined)).toBe(true)
      if (isSuccess(combined)) {
        expect(combined.data).toEqual([1, 'two', { three: 3 }])
      }
    })

    it('should return first failure if any result fails', () => {
      const results = [
        success(1),
        failure('FIRST_ERROR', 'First error'),
        failure('SECOND_ERROR', 'Second error'),
      ] as const

      const combined = combine(results)

      expect(isFailure(combined)).toBe(true)
      if (isFailure(combined)) {
        expect(combined.error.code).toBe('FIRST_ERROR')
      }
    })

    it('should work with empty array', () => {
      const results: Result<unknown>[] = []
      const combined = combine(results)

      expect(isSuccess(combined)).toBe(true)
      if (isSuccess(combined)) {
        expect(combined.data).toEqual([])
      }
    })
  })

  // ============================================
  // Error Codes
  // ============================================
  describe('ErrorCodes', () => {
    it('should have standard authentication codes', () => {
      expect(ErrorCodes.NOT_AUTHENTICATED).toBe('NOT_AUTHENTICATED')
      expect(ErrorCodes.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS')
      expect(ErrorCodes.SESSION_EXPIRED).toBe('SESSION_EXPIRED')
    })

    it('should have standard resource codes', () => {
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCodes.ALREADY_EXISTS).toBe('ALREADY_EXISTS')
      expect(ErrorCodes.CONFLICT).toBe('CONFLICT')
    })

    it('should have standard database codes', () => {
      expect(ErrorCodes.DB_ERROR).toBe('DB_ERROR')
      expect(ErrorCodes.DB_CONNECTION_ERROR).toBe('DB_CONNECTION_ERROR')
      expect(ErrorCodes.DB_QUERY_ERROR).toBe('DB_QUERY_ERROR')
    })
  })
})
