type PageType = 'pdf' | 'youtube' | 'vimeo' | 'video-generic' | 'webpage' | 'unknown'

type PageContent = {
  url: string
  title: string
  pageType: PageType
  description?: string
  favicon?: string
}

type PdfMetadata = {
  url: string
  title?: string
  author?: string
  pageCount?: number
  fileSize?: number
}

type VideoMetadata = {
  url: string
  title?: string
  platform: 'youtube' | 'vimeo' | 'other'
  videoId?: string
  duration?: number
  thumbnailUrl?: string
}

type ClipboardContent = {
  text: string
  url?: string
  detectedType: 'url' | 'text' | 'isbn' | 'unknown'
}

type ContentImportRequest = {
  contentId: string
  targetApp: 'library' | 'watch'
  metadata: PageContent | PdfMetadata | VideoMetadata
}

type ImportStatus = {
  importId: string
  status: 'pending' | 'importing' | 'completed' | 'failed'
  targetApp: 'library' | 'watch'
  title?: string
  error?: string
}

type ExtensionMessage =
  | { source: 'content-script'; target: 'background'; type: 'PAGE_CONTENT_DETECTED'; payload: PageContent }
  | { source: 'content-script'; target: 'background'; type: 'USER_CLIPBOARD_ACTION'; payload: ClipboardContent }
  | { source: 'content-script'; target: 'background'; type: 'PDF_METADATA_EXTRACTED'; payload: PdfMetadata }
  | { source: 'content-script'; target: 'background'; type: 'VIDEO_METADATA_EXTRACTED'; payload: VideoMetadata }
  | { source: 'content-script'; target: 'background'; type: 'CONTENT_IMPORT_REQUEST'; payload: ContentImportRequest }
  | { source: 'background'; target: 'popup'; type: 'CURRENT_TAB_CONTENT'; payload: PageContent | null }
  | { source: 'background'; target: 'popup'; type: 'IMPORT_STATUS'; payload: ImportStatus }
  | { source: 'background'; target: 'popup'; type: 'AUTH_STATE_CHANGED'; payload: { authenticated: boolean } }
  | { source: 'popup'; target: 'background'; type: 'REQUEST_TAB_CONTENT' }
  | { source: 'popup'; target: 'background'; type: 'IMPORT_CONTENT'; payload: { contentId: string; targetApp: 'library' | 'watch' } }
  | { source: 'popup'; target: 'background'; type: 'RETRY_IMPORT'; payload: { importId: string } }

export type {
  PageType,
  PageContent,
  PdfMetadata,
  VideoMetadata,
  ClipboardContent,
  ContentImportRequest,
  ImportStatus,
  ExtensionMessage,
}
