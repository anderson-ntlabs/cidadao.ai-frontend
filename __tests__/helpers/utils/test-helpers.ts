import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

export const createMockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  forward: vi.fn(),
})

export const createMockSearchParams = (params: Record<string, string> = {}) => {
  return new URLSearchParams(params)
}

export const setupUserEvent = () => {
  return userEvent.setup()
}

export const waitForAsync = async (ms: number = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mockFetch = (response: any, options: { ok?: boolean; status?: number } = {}) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  })
}

export const mockLocalStorage = () => {
  const storage: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key])
    }),
  }
}
