import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, createRetryWrapper, type RetryOptions } from './retry';

describe('retry utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn);
      
      // First attempt fails
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);
      
      // Wait for first retry delay (1000ms default)
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);
      
      // Wait for second retry delay (2000ms with backoff)
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(3);
      
      const result = await promise;
      expect(result).toBe('success');
    });

    it('should throw error after max attempts', async () => {
      const error = new Error('Always fails');
      const fn = vi.fn().mockRejectedValue(error);
      
      const promise = withRetry(fn, { maxAttempts: 3 });
      
      // Advance through all retry attempts
      await vi.advanceTimersByTimeAsync(0); // First attempt
      await vi.advanceTimersByTimeAsync(1000); // Second attempt
      await vi.advanceTimersByTimeAsync(2000); // Third attempt
      
      await expect(promise).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use custom retry options', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const onRetry = vi.fn();
      
      const promise = withRetry(fn, {
        maxAttempts: 2,
        initialDelay: 500,
        backoffFactor: 3,
        onRetry,
      });
      
      // First attempt fails
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);
      
      // Wait for custom delay (500ms)
      await vi.advanceTimersByTimeAsync(500);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
      
      const result = await promise;
      expect(result).toBe('success');
    });

    it('should respect maxDelay option', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn, {
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 2000,
        backoffFactor: 10, // Would be 1000, 10000, 100000 without max
      });
      
      // First attempt fails
      await vi.advanceTimersByTimeAsync(0);
      
      // Second attempt after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);
      
      // Third attempt should be capped at maxDelay (2000ms)
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(3);
      
      // Fourth attempt also at maxDelay
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(4);
      
      const result = await promise;
      expect(result).toBe('success');
    });

    describe('retryCondition', () => {
      it('should use default retry condition for network errors', async () => {
        const networkError = new Error('Network error');
        const fn = vi.fn()
          .mockRejectedValueOnce(networkError)
          .mockResolvedValue('success');
        
        const promise = withRetry(fn);
        await vi.advanceTimersByTimeAsync(1000);
        
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('should retry on 5xx errors by default', async () => {
        const serverError = new Error('Server error');
        (serverError as any).response = { status: 503 };
        
        const fn = vi.fn()
          .mockRejectedValueOnce(serverError)
          .mockResolvedValue('success');
        
        const promise = withRetry(fn);
        await vi.advanceTimersByTimeAsync(1000);
        
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('should not retry on 4xx errors by default', async () => {
        const clientError = new Error('Client error');
        (clientError as any).response = { status: 404 };
        
        const fn = vi.fn().mockRejectedValue(clientError);
        
        await expect(withRetry(fn)).rejects.toThrow('Client error');
        expect(fn).toHaveBeenCalledTimes(1);
      });

      it('should use custom retry condition', async () => {
        const customError = new Error('Custom error');
        (customError as any).code = 'CUSTOM_RETRY';
        
        const fn = vi.fn()
          .mockRejectedValueOnce(customError)
          .mockResolvedValue('success');
        
        const retryCondition = (error: any) => error.code === 'CUSTOM_RETRY';
        
        const promise = withRetry(fn, { retryCondition });
        await vi.advanceTimersByTimeAsync(1000);
        
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('should not retry when condition returns false', async () => {
        const error = new Error('No retry');
        const fn = vi.fn().mockRejectedValue(error);
        
        const retryCondition = () => false;
        
        await expect(withRetry(fn, { retryCondition })).rejects.toThrow('No retry');
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onRetry callback with correct arguments', async () => {
      const error1 = new Error('Fail 1');
      const error2 = new Error('Fail 2');
      const fn = vi.fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue('success');
      
      const onRetry = vi.fn();
      
      const promise = withRetry(fn, { onRetry, maxAttempts: 3 });
      
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      
      await promise;
      
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, error1);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, error2);
    });

    it('should log warnings by default on retry', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn);
      await vi.advanceTimersByTimeAsync(1000);
      await promise;
      
      expect(warnSpy).toHaveBeenCalledWith('Retry attempt 1:', 'Test error');
      
      warnSpy.mockRestore();
    });

    it('should handle async errors correctly', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Async error');
      });
      
      const promise = withRetry(fn, { maxAttempts: 1 });
      
      await vi.advanceTimersByTimeAsync(100);
      
      await expect(promise).rejects.toThrow('Async error');
    });

    it('should preserve error type', async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const fn = vi.fn().mockRejectedValue(new CustomError('Custom'));
      
      try {
        await withRetry(fn, { maxAttempts: 1 });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as Error).name).toBe('CustomError');
      }
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapped function', async () => {
      const original = vi.fn().mockResolvedValue('result');
      const wrapped = createRetryWrapper(original);
      
      const result = await wrapped();
      
      expect(result).toBe('result');
      expect(original).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', async () => {
      const original = vi.fn((a: number, b: string) => Promise.resolve(`${a}-${b}`));
      const wrapped = createRetryWrapper(original);
      
      const result = await wrapped(42, 'test');
      
      expect(result).toBe('42-test');
      expect(original).toHaveBeenCalledWith(42, 'test');
    });

    it('should apply retry logic to wrapped function', async () => {
      const original = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const wrapped = createRetryWrapper(original, { maxAttempts: 2 });
      
      const promise = wrapped();
      await vi.advanceTimersByTimeAsync(1000);
      
      const result = await promise;
      expect(result).toBe('success');
      expect(original).toHaveBeenCalledTimes(2);
    });

    it('should maintain function signature', async () => {
      const original = async (x: number, y: number): Promise<number> => x + y;
      const wrapped = createRetryWrapper(original);
      
      // TypeScript should recognize the same signature
      const result: number = await wrapped(1, 2);
      expect(result).toBe(3);
    });

    it('should use provided options', async () => {
      const onRetry = vi.fn();
      const original = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const wrapped = createRetryWrapper(original, {
        maxAttempts: 2,
        initialDelay: 200,
        onRetry,
      });
      
      const promise = wrapped();
      await vi.advanceTimersByTimeAsync(200);
      
      await promise;
      expect(onRetry).toHaveBeenCalled();
    });

  });

  describe('edge cases', () => {
    it('should handle maxAttempts = 1', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));
      
      await expect(withRetry(fn, { maxAttempts: 1 })).rejects.toThrow('Fail');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle maxAttempts = 0', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      await expect(withRetry(fn, { maxAttempts: 0 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(0);
    });

    it('should handle initialDelay = 0', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn, { initialDelay: 0 });
      await vi.advanceTimersByTimeAsync(0);
      
      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle backoffFactor = 1 (no backoff)', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn, {
        initialDelay: 100,
        backoffFactor: 1,
      });
      
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100); // Same delay
      await vi.advanceTimersByTimeAsync(100); // Same delay
      
      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});