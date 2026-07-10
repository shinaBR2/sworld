import { describe, expect, it } from 'vitest';
import type {
  ClipboardContent,
  ContentImportRequest,
  ExtensionMessage,
  ImportStatus,
  PageContent,
  PageType,
  PdfMetadata,
  VideoMetadata,
} from './types';

describe('PageType', () => {
  it('should accept valid page types', () => {
    const types: PageType[] = [
      'pdf',
      'youtube',
      'vimeo',
      'video-generic',
      'webpage',
      'unknown',
    ];
    expect(types).toHaveLength(6);
  });
});

describe('PageContent', () => {
  it('should create a valid PageContent object', () => {
    const content: PageContent = {
      url: 'https://example.com',
      title: 'Example',
      pageType: 'webpage',
    };
    expect(content.url).toBe('https://example.com');
  });

  it('should allow optional fields', () => {
    const content: PageContent = {
      url: 'https://example.com',
      title: 'Example',
      pageType: 'webpage',
      description: 'A description',
      favicon: 'https://example.com/favicon.ico',
    };
    expect(content.description).toBe('A description');
    expect(content.favicon).toBe('https://example.com/favicon.ico');
  });
});

describe('PdfMetadata', () => {
  it('should create a valid PdfMetadata object', () => {
    const metadata: PdfMetadata = {
      url: 'https://example.com/doc.pdf',
    };
    expect(metadata.url).toBe('https://example.com/doc.pdf');
  });

  it('should allow all optional fields', () => {
    const metadata: PdfMetadata = {
      url: 'https://example.com/doc.pdf',
      title: 'Document',
      author: 'Author',
      pageCount: 10,
      fileSize: 1024,
    };
    expect(metadata.pageCount).toBe(10);
    expect(metadata.fileSize).toBe(1024);
  });
});

describe('VideoMetadata', () => {
  it('should create a valid VideoMetadata object', () => {
    const metadata: VideoMetadata = {
      url: 'https://youtube.com/watch?v=abc123',
      platform: 'youtube',
    };
    expect(metadata.platform).toBe('youtube');
  });

  it('should allow all optional fields', () => {
    const metadata: VideoMetadata = {
      url: 'https://vimeo.com/12345',
      title: 'My Video',
      platform: 'vimeo',
      videoId: '12345',
      duration: 120,
      thumbnailUrl: 'https://example.com/thumb.jpg',
    };
    expect(metadata.duration).toBe(120);
  });
});

describe('ClipboardContent', () => {
  it('should create a valid ClipboardContent object', () => {
    const content: ClipboardContent = {
      text: 'https://example.com',
      detectedType: 'url',
    };
    expect(content.detectedType).toBe('url');
  });

  it('should allow optional url field', () => {
    const content: ClipboardContent = {
      text: 'some text',
      url: 'https://example.com',
      detectedType: 'text',
    };
    expect(content.url).toBe('https://example.com');
  });
});

describe('ContentImportRequest', () => {
  it('should create a valid ContentImportRequest with PageContent', () => {
    const request: ContentImportRequest = {
      contentId: '123',
      targetApp: 'library',
      metadata: {
        url: 'https://example.com',
        title: 'Example',
        pageType: 'webpage',
      },
    };
    expect(request.targetApp).toBe('library');
  });

  it('should create a valid ContentImportRequest with PdfMetadata', () => {
    const request: ContentImportRequest = {
      contentId: '456',
      targetApp: 'watch',
      metadata: {
        url: 'https://example.com/doc.pdf',
        title: 'PDF Doc',
      },
    };
    expect(request.targetApp).toBe('watch');
  });

  it('should create a valid ContentImportRequest with VideoMetadata', () => {
    const request: ContentImportRequest = {
      contentId: '789',
      targetApp: 'library',
      metadata: {
        url: 'https://youtube.com/watch?v=abc',
        platform: 'youtube',
      },
    };
    expect(request.contentId).toBe('789');
  });
});

describe('ImportStatus', () => {
  it('should create a valid ImportStatus object', () => {
    const status: ImportStatus = {
      importId: 'import-1',
      status: 'pending',
      targetApp: 'library',
    };
    expect(status.status).toBe('pending');
  });

  it('should allow completed status with title', () => {
    const status: ImportStatus = {
      importId: 'import-2',
      status: 'completed',
      targetApp: 'watch',
      title: 'My Import',
    };
    expect(status.title).toBe('My Import');
  });

  it('should allow failed status with error', () => {
    const status: ImportStatus = {
      importId: 'import-3',
      status: 'failed',
      targetApp: 'library',
      error: 'Something went wrong',
    };
    expect(status.error).toBe('Something went wrong');
  });
});

describe('ExtensionMessage discriminated union', () => {
  it('should create a PAGE_CONTENT_DETECTED message', () => {
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'PAGE_CONTENT_DETECTED',
      payload: {
        url: 'https://example.com',
        title: 'Example',
        pageType: 'webpage',
      },
    };
    expect(message.type).toBe('PAGE_CONTENT_DETECTED');
    expect(message.source).toBe('content-script');
  });

  it('should create a USER_CLIPBOARD_ACTION message', () => {
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'USER_CLIPBOARD_ACTION',
      payload: {
        text: 'https://example.com',
        detectedType: 'url',
      },
    };
    expect(message.type).toBe('USER_CLIPBOARD_ACTION');
  });

  it('should create a PDF_METADATA_EXTRACTED message', () => {
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'PDF_METADATA_EXTRACTED',
      payload: {
        url: 'https://example.com/doc.pdf',
      },
    };
    expect(message.type).toBe('PDF_METADATA_EXTRACTED');
  });

  it('should create a VIDEO_METADATA_EXTRACTED message', () => {
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'VIDEO_METADATA_EXTRACTED',
      payload: {
        url: 'https://youtube.com/watch?v=abc',
        platform: 'youtube',
      },
    };
    expect(message.type).toBe('VIDEO_METADATA_EXTRACTED');
  });

  it('should create a CONTENT_IMPORT_REQUEST message', () => {
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'CONTENT_IMPORT_REQUEST',
      payload: {
        contentId: '123',
        targetApp: 'library',
        metadata: {
          url: 'https://example.com',
          title: 'Example',
          pageType: 'webpage',
        },
      },
    };
    expect(message.type).toBe('CONTENT_IMPORT_REQUEST');
  });

  it('should create a CURRENT_TAB_CONTENT message', () => {
    const message: ExtensionMessage = {
      source: 'background',
      target: 'popup',
      type: 'CURRENT_TAB_CONTENT',
      payload: {
        url: 'https://example.com',
        title: 'Example',
        pageType: 'webpage',
      },
    };
    expect(message.payload).toBeTruthy();
  });

  it('should create a CURRENT_TAB_CONTENT message with null payload', () => {
    const message: ExtensionMessage = {
      source: 'background',
      target: 'popup',
      type: 'CURRENT_TAB_CONTENT',
      payload: null,
    };
    expect(message.payload).toBeNull();
  });

  it('should create an IMPORT_STATUS message', () => {
    const message: ExtensionMessage = {
      source: 'background',
      target: 'popup',
      type: 'IMPORT_STATUS',
      payload: {
        importId: 'import-1',
        status: 'completed',
        targetApp: 'library',
      },
    };
    expect(message.type).toBe('IMPORT_STATUS');
  });

  it('should create an AUTH_STATE_CHANGED message', () => {
    const message: ExtensionMessage = {
      source: 'background',
      target: 'popup',
      type: 'AUTH_STATE_CHANGED',
      payload: { authenticated: true },
    };
    expect(message.payload.authenticated).toBe(true);
  });

  it('should create a REQUEST_TAB_CONTENT message', () => {
    const message: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'REQUEST_TAB_CONTENT',
    };
    expect(message.type).toBe('REQUEST_TAB_CONTENT');
  });

  it('should create an IMPORT_CONTENT message', () => {
    const message: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'IMPORT_CONTENT',
      payload: { contentId: '123', targetApp: 'watch' },
    };
    expect(message.payload.targetApp).toBe('watch');
  });

  it('should create a RETRY_IMPORT message', () => {
    const message: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'RETRY_IMPORT',
      payload: { importId: 'import-1' },
    };
    expect(message.payload.importId).toBe('import-1');
  });
});
