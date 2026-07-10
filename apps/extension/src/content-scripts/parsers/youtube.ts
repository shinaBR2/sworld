import type { VideoMetadata } from 'core/universal/extension/communication/types';

const ISO_8601_DURATION_RE = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

const parseDuration = (isoDuration: string): number | undefined => {
  const match = isoDuration.match(ISO_8601_DURATION_RE);
  if (!match) return undefined;
  const hours = Number.parseInt(match[1] || '0', 10);
  const minutes = Number.parseInt(match[2] || '0', 10);
  const seconds = Number.parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
};

const getMetaContent = (property: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const el =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`) ||
    document.querySelector(`meta[itemprop="${property}"]`);
  return el?.getAttribute('content') ?? undefined;
};

const getVideoId = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const pathname = window.location.pathname;
  if (pathname === '/watch') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v') ?? undefined;
  }
  if (pathname.startsWith('/embed/')) {
    return pathname.split('/')[2];
  }
  return undefined;
};

const extractYouTubeMetadata = (): VideoMetadata => {
  if (typeof document === 'undefined') {
    return { url: '', platform: 'youtube' };
  }

  const videoId = getVideoId();
  const ogTitle = getMetaContent('og:title');
  const docTitle = document.title?.replace(/ - YouTube$/, '');
  const title = ogTitle || docTitle || undefined;
  const durationIso = getMetaContent('duration');
  const durationSeconds = durationIso ? parseDuration(durationIso) : undefined;
  const ogImage = getMetaContent('og:image');
  const thumbnailUrl =
    ogImage ||
    (videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : undefined);
  const videoUrl = window.location.href;

  return {
    url: videoUrl,
    title,
    platform: 'youtube',
    videoId,
    duration: durationSeconds,
    thumbnailUrl,
  };
};

export { extractYouTubeMetadata, parseDuration, getMetaContent, getVideoId };
