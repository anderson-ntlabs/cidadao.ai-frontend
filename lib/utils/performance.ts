/**
 * Performance Utilities
 *
 * Utility functions for optimizing UI performance including
 * debounce, throttle, and memoization helpers.
 */

/**
 * Creates a debounced version of a function that delays execution
 * until after a specified wait time has elapsed since the last call.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 *
 * @example
 * const debouncedSearch = debounce(search, 300)
 * debouncedSearch('query') // Will execute after 300ms of inactivity
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced as T & { cancel: () => void }
}

/**
 * Creates a throttled version of a function that only executes
 * at most once per specified interval.
 *
 * @param fn - The function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function with cancel method
 *
 * @example
 * const throttledScroll = throttle(handleScroll, 100)
 * window.addEventListener('scroll', throttledScroll)
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): T & { cancel: () => void } {
  let lastRun = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastRun >= limit) {
      lastRun = now
      fn(...args)
    } else {
      // Schedule trailing call
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(
        () => {
          lastRun = Date.now()
          fn(...args)
          timeoutId = null
        },
        limit - (now - lastRun)
      )
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return throttled as T & { cancel: () => void }
}

/**
 * Request animation frame throttle for smooth animations.
 *
 * @param fn - The function to throttle
 * @returns RAF-throttled function with cancel method
 *
 * @example
 * const rafScroll = rafThrottle(updatePosition)
 * window.addEventListener('scroll', rafScroll)
 */
export function rafThrottle<Args extends unknown[]>(
  fn: (...args: Args) => void
): ((...args: Args) => void) & { cancel: () => void } {
  let rafId: number | null = null
  let lastArgs: Args | null = null

  const throttled = (...args: Args) => {
    lastArgs = args

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs)
        }
        rafId = null
      })
    }
  }

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  return throttled
}

/**
 * Simple memoization for expensive computations.
 * Uses a Map for caching with configurable max size.
 *
 * @param fn - The function to memoize
 * @param maxSize - Maximum cache size (default: 100)
 * @returns Memoized function with clear method
 *
 * @example
 * const memoizedCompute = memoize(expensiveComputation)
 * memoizedCompute(args) // Cached after first call
 */
export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  maxSize = 100
): ((...args: Args) => Result) & { clear: () => void } {
  const cache = new Map<string, Result>()

  const memoized = (...args: Args): Result => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)

    // Evict oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, result)
    return result
  }

  memoized.clear = () => {
    cache.clear()
  }

  return memoized
}

/**
 * Creates an idle callback wrapper that executes when the browser is idle.
 * Falls back to setTimeout for browsers without requestIdleCallback.
 *
 * @param fn - The function to execute when idle
 * @param timeout - Maximum wait time in milliseconds (default: 2000)
 * @returns Function to schedule idle execution
 *
 * @example
 * const idleTask = createIdleCallback(heavyTask, 1000)
 * idleTask() // Executes when browser is idle or after 1s
 */
export function createIdleCallback(fn: () => void, timeout = 2000): () => number {
  const hasIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window

  return () => {
    if (hasIdleCallback) {
      return (
        window as Window & {
          requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number
        }
      ).requestIdleCallback(fn, { timeout })
    } else {
      return window.setTimeout(fn, 1) as unknown as number
    }
  }
}

/**
 * Batches multiple state updates into a single render.
 * Useful for React concurrent mode optimizations.
 *
 * @param updates - Array of update functions
 * @returns Promise that resolves after all updates are batched
 *
 * @example
 * await batchUpdates([
 *   () => setState1(value1),
 *   () => setState2(value2),
 * ])
 */
export async function batchUpdates(updates: (() => void)[]): Promise<void> {
  // React 18+ automatically batches updates, but this ensures it
  await Promise.resolve()
  updates.forEach((update) => update())
}
