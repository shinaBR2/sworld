type PageType =
  | 'pdf'
  | 'youtube'
  | 'vimeo'
  | 'telegram'
  | 'video-generic'
  | 'webpage'
  | 'unknown';

type PageContent = {
  url: string;
  title: string;
  pageType: PageType;
  description?: string;
  favicon?: string;
};

type PdfMetadata = {
  url: string;
  title?: string;
  author?: string;
  pageCount?: number;
  fileSize?: number;
};

type VideoMetadata = {
  url: string;
  title?: string;
  platform: 'youtube' | 'vimeo' | 'other';
  videoId?: string;
  duration?: number;
  thumbnailUrl?: string;
};

type ClipboardContent = {
  text: string;
  url?: string;
  detectedType: 'url' | 'text' | 'isbn' | 'unknown';
};

// Discriminated on `source` because the two URL families carry genuinely different shapes
// of extra data (web app: which UI variant; share link: which message) — flattening them
// into one bag of optional fields would let a consumer infer the source from which fields
// happen to be set, which breaks the moment a third shape is added. `channelId` itself is
// common to both, but deliberately NOT normalized to a single form across sources:
//   - '@username'   from a web.telegram.org hash (e.g. '#@somechannel')
//   - '-1234567890' the raw numeric peer id from a web.telegram.org hash (sign kept)
//   - 'username'    (no '@') from a t.me/<username> link
// Undefined when the page doesn't identify a specific channel (e.g. the chat list,
// a personal/direct chat, or an unsupported t.me path like /c/, /joinchat/, /+invite).
type TelegramChannelMetadata =
  | {
      url: string;
      source: 'web-app';
      channelId?: string;
      // web.telegram.org client UI variant.
      variant?: 'k' | 'a' | 'z';
    }
  | {
      url: string;
      source: 'share-link';
      channelId?: string;
      // Message id, when the URL points at a specific post (t.me's `/s/<messageId>`
      // "single post preview" link shape). Not used by this sub-task; carried through so a
      // later sub-issue can jump straight to that message.
      messageId?: string;
    };

type ContentImportRequest = {
  contentId: string;
  targetApp: 'library' | 'watch';
  metadata: PageContent | PdfMetadata | VideoMetadata;
};

type ImportStatus = {
  importId: string;
  status: 'pending' | 'importing' | 'completed' | 'failed';
  targetApp: 'library' | 'watch';
  title?: string;
  error?: string;
};

type ExtensionMessage =
  | {
      source: 'content-script';
      target: 'background';
      type: 'PAGE_CONTENT_DETECTED';
      payload: PageContent;
    }
  | {
      source: 'content-script';
      target: 'background';
      type: 'USER_CLIPBOARD_ACTION';
      payload: ClipboardContent;
    }
  | {
      source: 'content-script';
      target: 'background';
      type: 'PDF_METADATA_EXTRACTED';
      payload: PdfMetadata;
    }
  | {
      source: 'content-script';
      target: 'background';
      type: 'VIDEO_METADATA_EXTRACTED';
      payload: VideoMetadata;
    }
  | {
      source: 'content-script';
      target: 'background';
      type: 'TELEGRAM_CHANNEL_DETECTED';
      payload: TelegramChannelMetadata;
    }
  | {
      source: 'content-script';
      target: 'background';
      type: 'CONTENT_IMPORT_REQUEST';
      payload: ContentImportRequest;
    }
  | {
      source: 'background';
      target: 'popup';
      type: 'CURRENT_TAB_CONTENT';
      payload: PageContent | null;
    }
  | {
      source: 'background';
      target: 'popup';
      type: 'IMPORT_STATUS';
      payload: ImportStatus;
    }
  | {
      source: 'background';
      target: 'popup';
      type: 'AUTH_STATE_CHANGED';
      payload: { authenticated: boolean };
    }
  | { source: 'popup'; target: 'background'; type: 'REQUEST_TAB_CONTENT' }
  | {
      source: 'popup';
      target: 'background';
      type: 'IMPORT_CONTENT';
      payload: { contentId: string; targetApp: 'library' | 'watch' };
    }
  | {
      source: 'popup';
      target: 'background';
      type: 'RETRY_IMPORT';
      payload: { importId: string };
    };

export type {
  PageType,
  PageContent,
  PdfMetadata,
  VideoMetadata,
  TelegramChannelMetadata,
  ClipboardContent,
  ContentImportRequest,
  ImportStatus,
  ExtensionMessage,
};
