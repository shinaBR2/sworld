import type {
  PageContent,
  PageType,
  TelegramChannelMetadata,
  VideoMetadata,
} from 'core/universal/extension/communication/types';
import { extractTelegramMetadata } from './telegram';
import { extractVimeoMetadata } from './vimeo';
import { extractYouTubeMetadata } from './youtube';

const YOUTUBE_RE = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/)/;
const VIMEO_RE = /^(https?:\/\/)?(www\.)?vimeo\.com\//;
// Covers both the web app (web.telegram.org) and Telegram's public sharing domain (t.me) —
// see telegram.ts for how the channel identifier is parsed out of each.
const TELEGRAM_RE = /^(https?:\/\/)?(web\.telegram\.org\/|(www\.)?t\.me\/)/;
const PDF_URL_RE = /\.pdf$/i;

const detectPageType = (url?: string): PageType => {
  if (!url) return 'unknown';
  if (YOUTUBE_RE.test(url)) return 'youtube';
  if (VIMEO_RE.test(url)) return 'vimeo';
  if (TELEGRAM_RE.test(url)) return 'telegram';
  if (PDF_URL_RE.test(url)) return 'pdf';
  return 'webpage';
};

const hasVideoElement = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.querySelector('video') !== null;
};

type DetectResult = {
  pageType: PageType;
  content: PageContent | VideoMetadata | TelegramChannelMetadata | null;
};

const detect = (url?: string): DetectResult => {
  const pageType = detectPageType(url);

  if (pageType === 'youtube') {
    const metadata = extractYouTubeMetadata();
    return { pageType, content: metadata };
  }

  if (pageType === 'vimeo') {
    const metadata = extractVimeoMetadata();
    return { pageType, content: metadata };
  }

  if (pageType === 'telegram') {
    const metadata = extractTelegramMetadata();
    return { pageType, content: metadata };
  }

  if (hasVideoElement()) {
    return { pageType: 'video-generic', content: null };
  }

  return { pageType, content: null };
};

export type { DetectResult };
export { detect, detectPageType, hasVideoElement };
