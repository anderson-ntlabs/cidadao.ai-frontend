/**
 * Mock for jspdf-autotable
 * Used in tests to avoid installing the dependency
 */
import { vi } from 'vitest'

const autoTable = vi.fn((doc: any, options: any) => {
  // Simulate autoTable behavior
  ;(doc as any).lastAutoTable = { finalY: 100 }
  return doc
})

export default autoTable
