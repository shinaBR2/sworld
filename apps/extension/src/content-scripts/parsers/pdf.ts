import type { PdfMetadata } from 'core/universal/extension/communication/types';

const parsePdfDocument = async (url: string): Promise<PdfMetadata> => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const meta = await pdf.getMetadata();
  const info = meta.info as Record<string, unknown>;

  const title = info?.Title as string | undefined;
  const author = info?.Author as string | undefined;
  const pageCount = pdf.numPages;
  const fileSize = buffer.byteLength;

  return {
    url,
    title: title || undefined,
    author: author || undefined,
    pageCount,
    fileSize,
  };
};

const isPdfPage = (url: string, contentType?: string): boolean => {
  if (contentType?.includes('application/pdf')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    if (pathname.endsWith('.pdf')) {
      return true;
    }
  } catch {
    // Invalid URL — fall through
  }

  return false;
};

export { isPdfPage, parsePdfDocument };
