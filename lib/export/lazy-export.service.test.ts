/**
 * Tests for Lazy Export Service
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LazyExportService } from './lazy-export.service'

// Use hoisted mocks to survive vi.clearAllMocks()
const { mockCreateObjectURL, mockRevokeObjectURL, mockClick, mockLink, mockBlob } = vi.hoisted(
  () => {
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    const mockClick = vi.fn()
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    }
    const mockBlob = vi.fn((content, options) => ({
      content,
      options,
      size: content?.[0]?.length || 0,
      type: options?.type || '',
    }))
    return { mockCreateObjectURL, mockRevokeObjectURL, mockClick, mockLink, mockBlob }
  }
)

// Apply URL mocks
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

// Apply Blob mock
global.Blob = mockBlob as unknown as typeof Blob

describe('LazyExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset link state
    mockLink.href = ''
    mockLink.download = ''
    // Re-setup mocks after clearAllMocks
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
    // Re-mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return mockLink as unknown as HTMLElement
      }
      // Return a real element for other tags
      const realElement = Object.getPrototypeOf(document).createElement.call(document, tag)
      return realElement
    })
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
      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"hello, world"')
    })

    it('should escape values with quotes', () => {
      const data = [{ value: 'say "hello"' }]

      LazyExportService.exportToCSV(data)

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"say ""hello"""')
    })

    it('should escape values with newlines', () => {
      const data = [{ value: 'line1\nline2' }]

      LazyExportService.exportToCSV(data)

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"line1\nline2"')
    })

    it('should handle null and undefined values', () => {
      const data = [{ a: null, b: undefined, c: 'value' }]

      LazyExportService.exportToCSV(data)

      const blobCall = mockBlob.mock.calls[0]
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

      const blobCall = mockBlob.mock.calls[0]
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

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      // Check for indentation (2 spaces)
      expect(content).toContain('  "a": 1')
    })

    it('should handle arrays', () => {
      const data = [1, 2, 3]

      LazyExportService.exportToJSON(data)

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('[')
      expect(content).toContain('1,')
    })

    it('should handle nested objects', () => {
      const data = { parent: { child: 'value' } }

      LazyExportService.exportToJSON(data)

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0]

      expect(content).toContain('"child": "value"')
    })
  })

  describe('exportToPDF', () => {
    const mockDocSave = vi.fn()
    const mockDocText = vi.fn()
    const mockDocSetFontSize = vi.fn()
    const mockDocSetProperties = vi.fn()
    const mockDocAutoTable = vi.fn()

    beforeEach(() => {
      vi.doMock('jspdf', () => ({
        default: vi.fn().mockImplementation(() => ({
          save: mockDocSave,
          text: mockDocText,
          setFontSize: mockDocSetFontSize,
          setProperties: mockDocSetProperties,
          autoTable: mockDocAutoTable,
        })),
      }))
    })

    it('should be a function', () => {
      expect(typeof LazyExportService.exportToPDF).toBe('function')
    })

    it('should export PDF with default options', async () => {
      const tableData = {
        headers: ['Name', 'Age'],
        rows: [
          ['John', '30'],
          ['Jane', '25'],
        ],
      }

      // Import the mocked version
      const { default: jsPDF } = await import('jspdf')
      const mockInstance = {
        save: mockDocSave,
        text: mockDocText,
        setFontSize: mockDocSetFontSize,
        setProperties: mockDocSetProperties,
        autoTable: mockDocAutoTable,
      }
      ;(jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)

      await LazyExportService.exportToPDF(tableData)

      expect(jsPDF).toHaveBeenCalled()
    })

    it('should use provided options', async () => {
      const tableData = {
        headers: ['Name'],
        rows: [['Test']],
      }

      const options = {
        filename: 'custom.pdf',
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        author: 'Test Author',
        orientation: 'landscape' as const,
        pageFormat: 'letter' as const,
      }

      const { default: jsPDF } = await import('jspdf')
      const mockInstance = {
        save: mockDocSave,
        text: mockDocText,
        setFontSize: mockDocSetFontSize,
        setProperties: mockDocSetProperties,
        autoTable: mockDocAutoTable,
      }
      ;(jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)

      await LazyExportService.exportToPDF(tableData, options)

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'landscape',
          format: 'letter',
        })
      )
    })
  })

  describe('exportChartAsImage', () => {
    const mockToBlob = vi.fn()
    const mockCanvas = {
      toBlob: mockToBlob,
    }

    beforeEach(() => {
      vi.doMock('html2canvas', () => ({
        default: vi.fn().mockResolvedValue(mockCanvas),
      }))
    })

    it('should be a function', () => {
      expect(typeof LazyExportService.exportChartAsImage).toBe('function')
    })

    it('should export chart element as PNG', async () => {
      const mockElement = document.createElement('div')

      const { default: html2canvas } = await import('html2canvas')
      ;(html2canvas as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        toBlob: (callback: (blob: Blob | null) => void) => {
          callback(new Blob(['test'], { type: 'image/png' }) as unknown as Blob)
        },
      })

      await LazyExportService.exportChartAsImage(mockElement, 'chart.png')

      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
    })

    it('should use default filename when not provided', async () => {
      const mockElement = document.createElement('div')

      const { default: html2canvas } = await import('html2canvas')
      ;(html2canvas as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        toBlob: (callback: (blob: Blob | null) => void) => {
          callback(new Blob(['test'], { type: 'image/png' }) as unknown as Blob)
        },
      })

      await LazyExportService.exportChartAsImage(mockElement)

      expect(html2canvas).toHaveBeenCalled()
    })
  })

  describe('exportFullReport', () => {
    const mockDocSave = vi.fn()
    const mockDocText = vi.fn()
    const mockDocSetFontSize = vi.fn()
    const mockDocAddPage = vi.fn()
    const mockDocAddImage = vi.fn()
    const mockDocAutoTable = vi.fn()

    beforeEach(() => {
      vi.doMock('jspdf', () => ({
        default: vi.fn().mockImplementation(() => ({
          save: mockDocSave,
          text: mockDocText,
          setFontSize: mockDocSetFontSize,
          addPage: mockDocAddPage,
          addImage: mockDocAddImage,
          autoTable: mockDocAutoTable,
        })),
      }))
    })

    it('should be a function', () => {
      expect(typeof LazyExportService.exportFullReport).toBe('function')
    })

    it('should export full report with table and charts', async () => {
      const tableData = {
        headers: ['Name'],
        rows: [['Test']],
      }

      const chartElement = document.createElement('div')
      const charts = [
        {
          chartElement,
          title: 'Chart 1',
          description: 'Description 1',
        },
      ]

      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const mockInstance = {
        save: mockDocSave,
        text: mockDocText,
        setFontSize: mockDocSetFontSize,
        addPage: mockDocAddPage,
        addImage: mockDocAddImage,
        autoTable: mockDocAutoTable,
      }
      ;(jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)
      ;(html2canvas as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
      })

      await LazyExportService.exportFullReport(tableData, charts)

      expect(jsPDF).toHaveBeenCalled()
      expect(html2canvas).toHaveBeenCalledWith(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
    })

    it('should handle charts without description', async () => {
      const tableData = {
        headers: ['Name'],
        rows: [['Test']],
      }

      const chartElement = document.createElement('div')
      const charts = [
        {
          chartElement,
          title: 'Chart 1',
        },
      ]

      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const mockInstance = {
        save: mockDocSave,
        text: mockDocText,
        setFontSize: mockDocSetFontSize,
        addPage: mockDocAddPage,
        addImage: mockDocAddImage,
        autoTable: mockDocAutoTable,
      }
      ;(jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)
      ;(html2canvas as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
      })

      await LazyExportService.exportFullReport(tableData, charts)

      expect(jsPDF).toHaveBeenCalled()
    })

    it('should use provided options', async () => {
      const tableData = {
        headers: ['Name'],
        rows: [['Test']],
      }

      const options = {
        title: 'Custom Report',
        filename: 'custom_report.pdf',
        orientation: 'landscape' as const,
        pageFormat: 'letter' as const,
      }

      const { default: jsPDF } = await import('jspdf')
      const mockInstance = {
        save: mockDocSave,
        text: mockDocText,
        setFontSize: mockDocSetFontSize,
        addPage: mockDocAddPage,
        addImage: mockDocAddImage,
        autoTable: mockDocAutoTable,
      }
      ;(jsPDF as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockInstance)

      await LazyExportService.exportFullReport(tableData, [], options)

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'landscape',
          format: 'letter',
        })
      )
    })
  })
})
