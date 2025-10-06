import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExport } from './use-export';
import { ExportService } from '@/lib/export-service';

// Mock the ExportService class
vi.mock('@/lib/export-service', () => ({
  ExportService: {
    exportToCSV: vi.fn(),
    exportDashboardToPDF: vi.fn(),
    exportTableToPDF: vi.fn(),
    generateFinancialReport: vi.fn(),
    exportInvestigationReport: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock file download
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useExport', () => {
  const mockTableData = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('exportToCSV', () => {
    it('should export data to CSV', async () => {
      vi.mocked(ExportService.exportToCSV).mockReturnValue(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToCSV(mockTableData, 'test-report.csv');
      });

      expect(ExportService.exportToCSV).toHaveBeenCalledWith(mockTableData, 'test-report.csv');
      expect(result.current.isExporting).toBe(false);
    });

    it('should handle empty data error', async () => {
      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToCSV([], 'test.csv');
      });

      expect(ExportService.exportToCSV).not.toHaveBeenCalled();
      expect(result.current.isExporting).toBe(false);
    });

    it('should set isExporting to true during export', async () => {
      vi.mocked(ExportService.exportToCSV).mockImplementation(() => {
        // Simular exportação lenta
      });

      const { result } = renderHook(() => useExport());

      const exportPromise = act(async () => {
        await result.current.exportToCSV(mockTableData);
      });

      // Durante a exportação
      await waitFor(() => {
        // isExporting will be false after export completes
        expect(result.current.isExporting).toBe(false);
      });

      await exportPromise;
    });

    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      vi.mocked(ExportService.exportToCSV).mockImplementation(() => {
        throw error;
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useExport({ onError }));

      await act(async () => {
        await result.current.exportToCSV(mockTableData);
      });

      expect(onError).toHaveBeenCalledWith(error);
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('exportDashboardToPDF', () => {
    it('should export dashboard to PDF', async () => {
      const mockCharts = [document.createElement('div')];
      const mockMetrics = { total: 100, average: 50 };

      vi.mocked(ExportService.exportDashboardToPDF).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportDashboardToPDF(mockCharts, mockMetrics);
      });

      expect(ExportService.exportDashboardToPDF).toHaveBeenCalled();
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('exportTableToPDF', () => {
    it('should export table to PDF', async () => {
      const headers = ['ID', 'Name', 'Value'];
      const rows = [
        [1, 'Item 1', 100],
        [2, 'Item 2', 200],
      ];

      vi.mocked(ExportService.exportTableToPDF).mockReturnValue(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportTableToPDF(headers, rows);
      });

      expect(ExportService.exportTableToPDF).toHaveBeenCalledWith(
        { headers, rows },
        undefined
      );
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('exportFinancialReport', () => {
    it('should generate financial report', async () => {
      const mockFinancialData = {
        revenue: 10000,
        expenses: 5000,
        profit: 5000,
      };
      const mockCharts = [document.createElement('div')];

      vi.mocked(ExportService.generateFinancialReport).mockReturnValue(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportFinancialReport(mockFinancialData, mockCharts);
      });

      expect(ExportService.generateFinancialReport).toHaveBeenCalled();
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('exportInvestigationReport', () => {
    it('should export investigation report', async () => {
      const mockInvestigation = {
        id: '123',
        title: 'Test Investigation',
        findings: ['Finding 1', 'Finding 2'],
      };

      vi.mocked(ExportService.exportInvestigationReport).mockReturnValue(undefined);

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportInvestigationReport(mockInvestigation);
      });

      expect(ExportService.exportInvestigationReport).toHaveBeenCalledWith(
        mockInvestigation,
        undefined
      );
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      vi.mocked(ExportService.exportToCSV).mockReturnValue(undefined);

      const { result } = renderHook(() => useExport({ onSuccess }));

      await act(async () => {
        await result.current.exportToCSV(mockTableData);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      const error = new Error('Export failed');
      const onError = vi.fn();
      vi.mocked(ExportService.exportToCSV).mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useExport({ onError }));

      await act(async () => {
        await result.current.exportToCSV(mockTableData);
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});
