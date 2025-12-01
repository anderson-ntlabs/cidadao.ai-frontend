import { debounce, throttle, rafThrottle, memoize, batchUpdates } from '../performance'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset delay on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)

    debounced()
    vi.advanceTimersByTime(50)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to the debounced function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should cancel pending execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should execute immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should prevent execution within limit period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should allow execution after limit period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should schedule trailing call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled('third')

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('first')

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('third')
  })

  it('should cancel pending execution', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled.cancel()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('first')
  })
})

describe('rafThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        return setTimeout(() => cb(performance.now()), 16) as unknown as number
      })
    )
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => clearTimeout(id))
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('should throttle to animation frames', () => {
    const fn = vi.fn()
    const throttled = rafThrottle(fn)

    throttled('first')
    throttled('second')
    throttled('third')

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(16)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('should cancel pending frame', () => {
    const fn = vi.fn()
    const throttled = rafThrottle(fn)

    throttled()
    throttled.cancel()
    vi.advanceTimersByTime(16)

    expect(fn).not.toHaveBeenCalled()
  })
})

describe('memoize', () => {
  it('should cache function results', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(5)).toBe(10)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple arguments', () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const memoized = memoize(fn)

    expect(memoized(1, 2)).toBe(3)
    expect(memoized(1, 2)).toBe(3)
    expect(memoized(2, 3)).toBe(5)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should respect maxSize limit', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn, 2)

    memoized(1) // Cache: [1]
    memoized(2) // Cache: [1, 2]
    expect(fn).toHaveBeenCalledTimes(2)

    memoized(1) // Cache hit
    memoized(2) // Cache hit
    expect(fn).toHaveBeenCalledTimes(2)

    memoized(3) // Cache: [2, 3] - evicts 1
    expect(fn).toHaveBeenCalledTimes(3)

    memoized(1) // Cache miss - 1 was evicted
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('should clear cache', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    memoized(5)
    expect(fn).toHaveBeenCalledTimes(1)

    memoized.clear()

    memoized(5)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('batchUpdates', () => {
  it('should execute all updates', async () => {
    const update1 = vi.fn()
    const update2 = vi.fn()
    const update3 = vi.fn()

    await batchUpdates([update1, update2, update3])

    expect(update1).toHaveBeenCalledTimes(1)
    expect(update2).toHaveBeenCalledTimes(1)
    expect(update3).toHaveBeenCalledTimes(1)
  })

  it('should handle empty array', async () => {
    await expect(batchUpdates([])).resolves.toBeUndefined()
  })
})
