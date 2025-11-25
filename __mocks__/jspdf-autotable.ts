/**
 * Mock for jspdf-autotable
 * Used in tests to avoid installing the dependency
 */

const autoTable = (doc: any, options: any) => {
  // Mock implementation that does nothing
  return doc
}

export default autoTable
