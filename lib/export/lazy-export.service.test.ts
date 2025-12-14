/**
 * Tests for Lazy Export Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LazyExportService } from './lazy-export.service'

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

// Mock document.createElement for link element
const mockClick = vi.fn()
const mockLink = {
  href: '',
  download: '',
  click: mockClick,
}
vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
  if (tag === 'a') {
    return mockLink as unknown as HTMLElement
  }
  return document.createElement(tag)
})

// Mock Blob
global.Blob = vi.fn((content, options) => ({
  content,
  options,
  size: content?.[0]?.length || 0,
  type: options?.type || '',
})) as unknown as typeof Blob

describe('LazyExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLink.href = ''
    mockLink.download = ''
  })

  describe('exportToCSV', () => {
    it('should not export empty data', () => {
      LazyExportService.exportToCSV([])

      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('should export data with proper headers', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]

      LazyExportService.exportToCSV(data, 'test.csv')

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.csv')
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should escape values with commas', () => {
      const data = [{ value: 'hello, world' }]

      LazyExportService.exportToCSV(data)

      // Blob was called with escaped content
      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"hello, world"')
    })

    it('should escape values with quotes', () => {
      const data = [{ value: 'say "hello"' }]

      LazyExportService.exportToCSV(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"say ""hello"""')
    })

    it('should escape values with newlines', () => {
      const data = [{ value: 'line1\nline2' }]

      LazyExportService.exportToCSV(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"line1\nline2"')
    })

    it('should handle null and undefined values', () => {
      const data = [{ a: null, b: undefined, c: 'value' }]

      LazyExportService.exportToCSV(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      // Should have empty values for null/undefined
      expect(content).toContain(',,value')
    })

    it('should use default filename when not provided', () => {
      const data = [{ name: 'test' }]

      LazyExportService.exportToCSV(data)

      expect(mockLink.download).toBe('export.csv')
    })

    it('should add BOM for UTF-8 Excel compatibility', () => {
      const data = [{ name: 'test' }]

      LazyExportService.exportToCSV(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      // UTF-8 BOM is \uFEFF
      expect(content.charCodeAt(0)).toBe(0xfeff)
    })
  })

  describe('exportToJSON', () => {
    it('should export data as JSON', () => {
      const data = { name: 'test', value: 123 }

      LazyExportService.exportToJSON(data, 'test.json')

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.json')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should use default filename when not provided', () => {
      LazyExportService.exportToJSON({ data: 'test' })

      expect(mockLink.download).toBe('export.json')
    })

    it('should format JSON with indentation', () => {
      const data = { a: 1, b: 2 }

      LazyExportService.exportToJSON(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      // Check for indentation (2 spaces)
      expect(content).toContain('  "a": 1')
    })

    it('should handle arrays', () => {
      const data = [1, 2, 3]

      LazyExportService.exportToJSON(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('[')
      expect(content).toContain('1,')
    })

    it('should handle nested objects', () => {
      const data = { parent: { child: 'value' } }

      LazyExportService.exportToJSON(data)

      const blobCall = (global.Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"child": "value"')
    })
  })

  describe('exportToPDF', () => {
    it('should be a function', () => {
      expect(typeof LazyExportService.exportToPDF).toBe('function')
    })

    // PDF tests would require mocking jsPDF which is complex
    // In a real scenario, these would be integration tests
  })

  describe('exportChartAsImage', () => {
    it('should be a function', () => {
      expect(typeof LazyExportService.exportChartAsImage).toBe('function')
    })

    // Chart export tests would require mocking html2canvas
  })

  describe('exportFullReport', () => {
    it('should be a function', () => {
      expect(typeof LazyExportService.exportFullReport).toBe('function')
    })

    // Full report tests would require mocking both jsPDF and html2canvas
  })
})
