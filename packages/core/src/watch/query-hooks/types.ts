const MEDIA_TYPES = {
  VIDEO: 'video',
  PLAYLIST: 'playlist',
} as const;

type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

export { type MediaType, MEDIA_TYPES };
