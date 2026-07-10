import { describe, expect, it, vi } from 'vitest';

import { isPdfPage, parsePdfDocument } from './pdf';

const mockPdfDocument = {
  numPages: 5,
  getMetadata: vi.fn().mockResolvedValue({
    info: {
      Title: 'Test Document',
      Author: 'Test Author',
    },
  }),
};

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve(mockPdfDocument),
  })),
}));

describe('isPdfPage', () => {
  it('returns true for .pdf URLs', () => {
    expect(isPdfPage('https://example.com/doc.pdf')).toBe(true);
  });

  it('returns true for .pdf URLs with query params', () => {
    expect(isPdfPage('https://example.com/doc.pdf?token=abc')).toBe(true);
  });

  it('returns true for .PDF (case insensitive)', () => {
    expect(isPdfPage('https://example.com/DOC.PDF')).toBe(true);
  });

  it('returns true when content type is application/pdf', () => {
    expect(isPdfPage('https://example.com/doc', 'application/pdf')).toBe(true);
  });

  it('returns false for non-PDF URLs', () => {
    expect(isPdfPage('https://example.com/doc.html')).toBe(false);
  });

  it('returns false for URLs without extension', () => {
    expect(isPdfPage('https://example.com/doc')).toBe(false);
  });

  it('returns false when content type is not PDF', () => {
    expect(isPdfPage('https://example.com/doc', 'text/html')).toBe(false);
  });
});

describe('parsePdfDocument', () => {
  it('extracts PDF metadata correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
    });

    const result = await parsePdfDocument('https://example.com/doc.pdf');

    expect(result).toEqual({
      url: 'https://example.com/doc.pdf',
      title: 'Test Document',
      author: 'Test Author',
      pageCount: 5,
      fileSize: 1024,
    });
  });

  it('handles missing metadata gracefully', async () => {
    vi.mocked(mockPdfDocument.getMetadata).mockResolvedValueOnce({ info: {} });

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(512)),
    });

    const result = await parsePdfDocument('https://example.com/doc.pdf');

    expect(result).toEqual({
      url: 'https://example.com/doc.pdf',
      title: undefined,
      author: undefined,
      pageCount: 5,
      fileSize: 512,
    });
  });
});
