import type { TransformedAlbum } from 'core/look/query-hooks/types';

const ALBUM_ROUTE = '/album/$albumId';

// The route param is the album id (uuid): the detail route fetches by primary
// key, so the id — not the slug — is what the URL must carry.
const genAlbumLinkProps = (album: TransformedAlbum) => ({
  to: ALBUM_ROUTE,
  params: { albumId: album.id },
});

const formatPhotoCount = (count: number): string =>
  count === 1 ? '1 photo' : `${count} photos`;

export { formatPhotoCount, genAlbumLinkProps };
