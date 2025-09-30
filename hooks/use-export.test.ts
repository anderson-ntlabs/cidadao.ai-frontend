import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from './use-export';
import { exportService } from '@/lib/export-service';

// Mock the export service
vi.mock('@/lib/export-service', () => ({
  exportService: {
    exportToPDF: vi.fn(),
    exportToJSON: vi.fn(),
    exportToCSV: vi.fn(),
  },
}));

// Mock file download
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useExport', () => {
  const mockData = {
    title: 'Test Report',
    content: 'Test content',
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  it('should export data to PDF', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    vi.mocked(exportService.exportToPDF).mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData, 'pdf', 'test-report.pdf');
    });

    expect(exportService.exportToPDF).toHaveBeenCalledWith(mockData);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should export data to JSON', async () => {
    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData, 'json', 'test-data.json');
    });

    expect(exportService.exportToJSON).toHaveBeenCalledWith(mockData);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should export data to CSV', async () => {
    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData.items, 'csv', 'test-data.csv');
    });

    expect(exportService.exportToCSV).toHaveBeenCalledWith(mockData.items);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set isExporting to true during export', async () => {
    const mockBlob = new Blob(['mock data'], { type: 'application/json' });
    vi.mocked(exportService.exportToJSON).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockBlob), 100))
    );

    const { result } = renderHook(() => useExport());

    const exportPromise = act(async () => {
      await result.current.exportData(mockData, 'json');
    });

    // Check isExporting is true while exporting
    expect(result.current.isExporting).toBe(true);

    await exportPromise;

    // Check isExporting is false after completion
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle export errors', async () => {
    const error = new Error('Export failed');
    vi.mocked(exportService.exportToPDF).mockRejectedValue(error);

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData, 'pdf');
    });

    expect(result.current.error).toBe('Export failed');
    expect(result.current.isExporting).toBe(false);
  });

  it('should create download link and trigger download', async () => {
    const mockBlob = new Blob(['mock data'], { type: 'application/json' });
    vi.mocked(exportService.exportToJSON).mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData, 'json', 'download.json');
    });

    // Check that a download link was created
    const downloadLinks = document.querySelectorAll('a[download]');
    expect(downloadLinks.length).toBe(0); // Link should be removed after download
    
    // Verify URL methods were called
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should generate default filename if not provided', async () => {
    const mockBlob = new Blob(['mock data'], { type: 'application/json' });
    vi.mocked(exportService.exportToJSON).mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportData(mockData, 'json');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isExporting).toBe(false);
  });

  it('should clear previous error when starting new export', async () => {
    const { result } = renderHook(() => useExport());

    // Set an error first
    vi.mocked(exportService.exportToPDF).mockRejectedValueOnce(new Error('First error'));
    await act(async () => {
      await result.current.exportData(mockData, 'pdf');
    });
    expect(result.current.error).toBe('First error');

    // Now successful export should clear the error
    const mockBlob = new Blob(['mock data'], { type: 'application/json' });
    vi.mocked(exportService.exportToJSON).mockResolvedValue(mockBlob);
    
    await act(async () => {
      await result.current.exportData(mockData, 'json');
    });

    expect(result.current.error).toBeNull();
  });
});