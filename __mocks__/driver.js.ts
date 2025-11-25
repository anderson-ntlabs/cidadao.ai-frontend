/**
 * Mock for driver.js
 * Used in tests to avoid installing the dependency
 */
import { vi } from 'vitest'

export const driver = vi.fn((options: any) => ({
  setSteps: vi.fn(),
  drive: vi.fn(),
  destroy: vi.fn(),
  highlight: vi.fn(),
  moveNext: vi.fn(),
  movePrevious: vi.fn(),
  hasNextStep: vi.fn(() => false),
  hasPreviousStep: vi.fn(() => false),
  isFirstStep: vi.fn(() => true),
  isLastStep: vi.fn(() => true),
  getActiveIndex: vi.fn(() => 0),
  isActive: vi.fn(() => false),
  refresh: vi.fn(),
  getConfig: vi.fn(() => options),
  setConfig: vi.fn(),
  getState: vi.fn(() => ({})),
}))

export default driver
