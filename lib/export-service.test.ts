import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExportService } from './export-service'
import jsPDF from 'jspdf'
// autoTable import removed - library removed for bundle optimization
import html2canvas from 'html2canvas'
// papaparse removed - using native CSV implementation

// Mock dependencies
vi.mock('jspdf')
// jspdf-autotable mock removed - library removed for bundle optimization
vi.mock('html2canvas')
// papaparse mock removed - native implementation used
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '01 de janeiro de 2024'),
}))

// Hoisted mocks to survive vi.clearAllMocks()
const { mockClick, mockLink, mockCreateObjectURL, mockRevokeObjectURL, mockBlob } = vi.hoisted(
  () => {
    const mockClick = vi.fn()
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: {},
      setAttribute: vi.fn(),
      remove: vi.fn(),
    }
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    const mockBlob = vi.fn((content, options) => ({
      content,
      type: options?.type,
    }))
    return { mockClick, mockLink, mockCreateObjectURL, mockRevokeObjectURL, mockBlob }
  }
)

describe('ExportService', () => {
  let mockPdfInstance: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset link state
    mockLink.href = ''
    mockLink.download = ''
    mockCreateObjectURL.mockReturnValue('blob:mock-url')

    // Mock jsPDF instance
    mockPdfInstance = {
      internal: {
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
          getHeight: vi.fn().mockReturnValue(297),
        },
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      setFillColor: vi.fn(),
      rect: vi.fn(),
      setTextColor: vi.fn(),
      addPage: vi.fn(),
      addImage: vi.fn(),
      getNumberOfPages: vi.fn().mockReturnValue(1),
      setPage: vi.fn(),
      save: vi.fn(),
    }

    vi.mocked(jsPDF).mockImplementation(() => mockPdfInstance)

    // Mock document.createElement for anchor elements only
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink as unknown as HTMLElement
      }
      // Return a real element for other tags
      return Object.getPrototypeOf(document).createElement.call(document, tagName)
    })

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock Blob
    global.Blob = mockBlob as unknown as typeof Blob

    // Mock html2canvas
    vi.mocked(html2canvas).mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
      width: 800,
      height: 600,
    } as any)

    // Native CSV implementation - no Papa mock needed

    // Mock Intl.NumberFormat
    global.Intl = {
      NumberFormat: vi.fn().mockImplementation(() => ({
        format: vi.fn((value) => `R$ ${value.toFixed(2).replace('.', ',')}`),
      })),
    } as any

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('exportToCSV', () => {
    it('should export data to CSV with default filename', () => {
      const data = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ]

      ExportService.exportToCSV(data)

      // Native implementation - check Blob was created with CSV content
      expect(mockBlob).toHaveBeenCalled()
      const blobCall = mockBlob.mock.calls[0]
      expect(blobCall[1]).toEqual({ type: 'text/csv;charset=utf-8;' })

      // Check BOM prefix for Excel compatibility
      const content = blobCall[0][0] as string
      expect(content.startsWith('\uFEFF')).toBe(true)
      expect(content).toContain('id,name,value')
      expect(content).toContain('1,Item 1,100')
      expect(content).toContain('2,Item 2,200')

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')

      // mockLink is the mock anchor element
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toBe('export.csv')
      expect(mockClick).toHaveBeenCalled()

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should export data to CSV with custom filename', () => {
      const data = [{ test: 'data' }]

      ExportService.exportToCSV(data, 'custom-file.csv')

      expect(mockLink.download).toBe('custom-file.csv')
    })

    it('should handle empty data gracefully', () => {
      ExportService.exportToCSV([])

      // Should not create blob for empty data
      expect(mockBlob).not.toHaveBeenCalled()
    })

    it('should escape CSV special characters', () => {
      const data = [{ name: 'Item, with comma', desc: 'Has "quotes"' }]

      ExportService.exportToCSV(data)

      const blobCall = mockBlob.mock.calls[0]
      const content = blobCall[0][0] as string
      // Commas and quotes should be properly escaped
      expect(content).toContain('"Item, with comma"')
      expect(content).toContain('"Has ""quotes"""')
    })
  })

  describe('exportDashboardToPDF', () => {
    it('should export dashboard with default options', async () => {
      const charts = [
        {
          chartElement: document.createElement('div'),
          title: 'Test Chart',
          description: 'Test Description',
        },
      ]
      const metrics = {
        totalContracts: 100,
        totalValue: 1000000,
      }

      await ExportService.exportDashboardToPDF(charts, metrics)

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Check header
      expect(mockPdfInstance.setFontSize).toHaveBeenCalledWith(20)
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Dashboard de Transparencia - Cidadao.AI',
        105,
        15,
        { align: 'center' }
      )

      // Check metrics section
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Metricas Principais',
        15,
        expect.any(Number)
      )

      // autoTable removed for bundle optimization - metrics now rendered manually
      // Check chart processing
      expect(html2canvas).toHaveBeenCalledWith(charts[0].chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })

      expect(mockPdfInstance.addImage).toHaveBeenCalled()
      expect(mockPdfInstance.save).toHaveBeenCalledWith('dashboard-cidadao-ai.pdf')
    })

    it('should handle custom options', async () => {
      const charts = [] as any[]
      const metrics = {}
      const options = {
        filename: 'custom-dashboard.pdf',
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        author: 'Test Author',
        orientation: 'portrait' as const,
        pageFormat: 'letter' as const,
      }

      await ExportService.exportDashboardToPDF(charts, metrics, options)

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      })

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Custom Title', expect.any(Number), 15, {
        align: 'center',
      })

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Custom Subtitle', expect.any(Number), 25, {
        align: 'center',
      })

      expect(mockPdfInstance.save).toHaveBeenCalledWith('custom-dashboard.pdf')
    })

    it('should handle multiple charts with page breaks', async () => {
      const charts = [
        { chartElement: document.createElement('div'), title: 'Chart 1' },
        { chartElement: document.createElement('div'), title: 'Chart 2' },
        { chartElement: document.createElement('div'), title: 'Chart 3' },
      ]
      const metrics = {}

      // Mock to simulate need for page break
      let yPosition = 250
      mockPdfInstance.text.mockImplementation(() => {
        yPosition += 10
      })
      mockPdfInstance.addImage.mockImplementation(() => {
        yPosition += 100
      })

      await ExportService.exportDashboardToPDF(charts, metrics)

      expect(mockPdfInstance.addPage).toHaveBeenCalled()
    })

    it('should handle html2canvas errors', async () => {
      vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas error'))

      const charts = [
        {
          chartElement: document.createElement('div'),
          title: 'Test Chart',
        },
      ]
      const metrics = {}

      await ExportService.exportDashboardToPDF(charts, metrics)

      // Logger uses structured format, check that error was logged
      expect(console.error).toHaveBeenCalled()
      expect(mockPdfInstance.save).toHaveBeenCalled() // Should still save the PDF
    })

    it('should add page numbers to all pages', async () => {
      mockPdfInstance.getNumberOfPages.mockReturnValue(3)

      const charts = [] as any[]
      const metrics = {}

      await ExportService.exportDashboardToPDF(charts, metrics)

      expect(mockPdfInstance.setPage).toHaveBeenCalledTimes(3)
      expect(mockPdfInstance.setPage).toHaveBeenCalledWith(1)
      expect(mockPdfInstance.setPage).toHaveBeenCalledWith(2)
      expect(mockPdfInstance.setPage).toHaveBeenCalledWith(3)

      // Check page number text
      expect(mockPdfInstance.text).toHaveBeenCalledWith('Pagina 1 de 3', 105, 287, {
        align: 'center',
      })
    })
  })

  describe('exportTableToPDF', () => {
    it('should export table with default options', async () => {
      const tableData = {
        headers: ['ID', 'Nome', 'Valor'],
        rows: [
          ['1', 'Item 1', 'R$ 100,00'],
          ['2', 'Item 2', 'R$ 200,00'],
        ],
      }

      await ExportService.exportTableToPDF(tableData)

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Relatorio de Transparencia', 105, 15, {
        align: 'center',
      })

      // autoTable removed for bundle optimization - table now rendered manually

      expect(mockPdfInstance.save).toHaveBeenCalledWith('relatorio-cidadao-ai.pdf')
    })

    it('should handle custom options', async () => {
      const tableData = {
        headers: ['Col1'],
        rows: [['Data1']],
      }
      const options = {
        filename: 'custom-table.pdf',
        title: 'Custom Table Report',
        subtitle: 'Custom Subtitle',
        orientation: 'landscape' as const,
      }

      await ExportService.exportTableToPDF(tableData, options)

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'Custom Table Report',
        expect.any(Number),
        15,
        { align: 'center' }
      )

      expect(mockPdfInstance.save).toHaveBeenCalledWith('custom-table.pdf')
    })
  })

  describe('generateFinancialReport', () => {
    it('should generate financial report with all data', async () => {
      const financialData = {
        totalInvestigated: 5000000,
        totalSavings: 1000000,
        suspiciousContracts: [
          {
            id: 'CT001',
            description: 'Contract 1',
            value: 100000,
            risk: 'High',
            date: '2024-01-01',
          },
        ],
        recoveryRate: 20,
        monthlyData: [],
      }
      const charts = [] as any[]

      await ExportService.generateFinancialReport(financialData, charts)

      // Check cover page
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(16, 185, 129)
      expect(mockPdfInstance.rect).toHaveBeenCalledWith(0, 0, 210, 60, 'F')

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Relatorio Financeiro', 105, 30, {
        align: 'center',
      })

      // autoTable removed for bundle optimization - tables now rendered manually
      expect(mockPdfInstance.save).toHaveBeenCalledWith('relatorio-financeiro-cidadao-ai.pdf')
    })

    it('should handle empty suspicious contracts', async () => {
      const financialData = {
        totalInvestigated: 1000000,
        totalSavings: 200000,
        suspiciousContracts: [],
        recoveryRate: 20,
        monthlyData: [],
      }
      const charts = [] as any[]

      await ExportService.generateFinancialReport(financialData, charts)

      // Should still save the file
      expect(mockPdfInstance.save).toHaveBeenCalledWith('relatorio-financeiro-cidadao-ai.pdf')
    })

    it('should use custom filename', async () => {
      const financialData = {
        totalInvestigated: 0,
        totalSavings: 0,
        suspiciousContracts: [],
        recoveryRate: 0,
        monthlyData: [],
      }
      const charts = [] as any[]
      const options = { filename: 'custom-financial.pdf' }

      await ExportService.generateFinancialReport(financialData, charts, options)

      expect(mockPdfInstance.save).toHaveBeenCalledWith('custom-financial.pdf')
    })
  })

  describe('exportInvestigationReport', () => {
    it('should export completed investigation', async () => {
      const investigation = {
        id: 'INV001',
        title: 'Test Investigation',
        status: 'completed',
        agent: 'Abaporu',
        startDate: '2024-01-01T10:00:00',
        lastUpdate: '2024-01-02T15:00:00',
        anomalyScore: 0.85,
        category: 'Contratos',
      }

      await ExportService.exportInvestigationReport(investigation)

      // Check header with green color for completed
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(16, 185, 129)
      expect(mockPdfInstance.rect).toHaveBeenCalledWith(0, 0, 210, 40, 'F')

      expect(mockPdfInstance.text).toHaveBeenCalledWith('Investigacao #INV001', 105, 20, {
        align: 'center',
      })

      // autoTable removed for bundle optimization - details table now rendered manually
      expect(mockPdfInstance.save).toHaveBeenCalledWith('investigacao-INV001.pdf')
    })

    it('should handle in_progress investigation with yellow color', async () => {
      const investigation = {
        id: 'INV002',
        title: 'Ongoing Investigation',
        status: 'in_progress',
        agent: 'Zumbi',
        startDate: '2024-01-01T10:00:00',
        lastUpdate: '2024-01-02T15:00:00',
        anomalyScore: 0.65,
        category: 'Servidores',
      }

      await ExportService.exportInvestigationReport(investigation)

      // Check header with yellow color for in_progress
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(245, 158, 11)
    })

    it('should handle other status with red color', async () => {
      const investigation = {
        id: 'INV003',
        title: 'Failed Investigation',
        status: 'failed',
        agent: 'Anita',
        startDate: '2024-01-01T10:00:00',
        lastUpdate: '2024-01-02T15:00:00',
        anomalyScore: 0.95,
        category: 'Despesas',
      }

      await ExportService.exportInvestigationReport(investigation)

      // Check header with red color for failed
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(239, 68, 68)
    })

    it('should use custom filename', async () => {
      const investigation = {
        id: 'INV004',
        title: 'Test',
        status: 'completed',
        agent: 'Test',
        startDate: '2024-01-01',
        lastUpdate: '2024-01-01',
        anomalyScore: 0.5,
        category: 'Test',
      }
      const options = { filename: 'custom-investigation.pdf' }

      await ExportService.exportInvestigationReport(investigation, options)

      expect(mockPdfInstance.save).toHaveBeenCalledWith('custom-investigation.pdf')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      // Access private method through class
      const formatCurrency = (ExportService as any).formatCurrency

      expect(formatCurrency(1000)).toBe('R$ 1000,00')
      expect(formatCurrency(1234.56)).toBe('R$ 1234,56')
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })
  })
})
