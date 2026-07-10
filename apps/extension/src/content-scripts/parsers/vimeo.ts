import type { VideoMetadata } from 'core/universal/extension/communication/types';

const VIMEO_VIDEO_RE = /^\/+(\d+)\/?/;

const getMetaContent = (property: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const el =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);
  return el?.getAttribute('content') ?? undefined;
};

const getVideoId = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const pathname = window.location.pathname;
  const match = pathname.match(VIMEO_VIDEO_RE);
  return match?.[1] ?? undefined;
};

const extractVimeoMetadata = (): VideoMetadata => {
  if (typeof document === 'undefined') {
    return { url: '', platform: 'vimeo' };
  }

  const videoId = getVideoId();
  const ogTitle = getMetaContent('og:title');
  const docTitle = document.title?.replace(/ - Vimeo$/, '');
  const title = ogTitle || docTitle || undefined;
  const ogImage = getMetaContent('og:image');
  const thumbnailUrl = ogImage || undefined;
  const videoUrl = window.location.href;

  return {
    url: videoUrl,
    title,
    platform: 'vimeo',
    videoId,
    thumbnailUrl,
  };
};

export { extractVimeoMetadata, getVideoId };
