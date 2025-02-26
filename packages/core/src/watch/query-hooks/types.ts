import { transformPlaylistFragment, transformVideoFragment } from './transformers';

const MEDIA_TYPES = {
  VIDEO: 'video',
  PLAYLIST: 'playlist',
} as const;

type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];
type TransformedVideo = ReturnType<typeof transformVideoFragment>;
type TransformedPlaylist = ReturnType<typeof transformPlaylistFragment>;
type TransformedMediaItem = TransformedVideo | TransformedPlaylist;

interface BaseQueryProps {
  getAccessToken: () => Promise<string>;
}

export {
  MEDIA_TYPES,
  type MediaType,
  type TransformedVideo,
  type TransformedPlaylist,
  type TransformedMediaItem,
  type BaseQueryProps,
};
