import type { TransformedAlbum } from 'core/look/query-hooks/types';

const ALBUM_ROUTE = '/album/$albumId';

const genAlbumLinkProps = (album: TransformedAlbum) => ({
  to: ALBUM_ROUTE,
  params: { albumId: album.slug || album.id },
});

const formatPhotoCount = (count: number): string =>
  count === 1 ? '1 photo' : `${count} photos`;

export { formatPhotoCount, genAlbumLinkProps };
