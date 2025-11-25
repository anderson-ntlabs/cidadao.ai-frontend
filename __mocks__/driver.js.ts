/**
 * Mock for driver.js
 * Used in tests to avoid installing the dependency
 */

export const driver = (options: any) => ({
  setSteps: () => {},
  drive: () => {},
  destroy: () => {},
  highlight: () => {},
  moveNext: () => {},
  movePrevious: () => {},
  hasNextStep: () => false,
  hasPreviousStep: () => false,
  isFirstStep: () => true,
  isLastStep: () => true,
  getActiveIndex: () => 0,
  isActive: () => false,
  refresh: () => {},
  getConfig: () => options,
  setConfig: () => {},
  getState: () => ({}),
})

export default driver
