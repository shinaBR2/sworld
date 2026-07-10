import type {
  PageContent,
  PageType,
  VideoMetadata,
} from 'core/universal/extension/communication/types';
import { extractYouTubeMetadata } from './youtube';
import { extractVimeoMetadata } from './vimeo';

const YOUTUBE_RE = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/)/;
const VIMEO_RE = /^(https?:\/\/)?(www\.)?vimeo\.com\//;
const PDF_URL_RE = /\.pdf$/i;

const detectPageType = (url?: string): PageType => {
  if (!url) return 'unknown';
  if (YOUTUBE_RE.test(url)) return 'youtube';
  if (VIMEO_RE.test(url)) return 'vimeo';
  if (PDF_URL_RE.test(url)) return 'pdf';
  return 'webpage';
};

const hasVideoElement = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.querySelector('video') !== null;
};

type DetectResult = {
  pageType: PageType;
  content: PageContent | VideoMetadata | null;
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

  if (hasVideoElement()) {
    return { pageType: 'video-generic', content: null };
  }

  return { pageType, content: null };
};

export type { DetectResult };
export { detect, detectPageType, hasVideoElement };
