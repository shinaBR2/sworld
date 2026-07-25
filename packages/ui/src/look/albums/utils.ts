import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { chunk } from '../home-page/utils';

// The virtualizer's row model for one album: a single header row (album title,
// description, count), then either an empty-state row or the photos chunked into
// rows of `columns`. Unlike the timeline there is no month grouping — an album
// is one ordered set — so this is a flat list with a fixed leading header.
type AlbumRow =
  | { type: 'header'; key: string }
  | { type: 'empty'; key: string }
  | { type: 'photos'; key: string; photos: TransformedPhoto[] };

const buildAlbumRows = (
  photos: TransformedPhoto[],
  columns: number,
): AlbumRow[] => {
  const rows: AlbumRow[] = [{ type: 'header', key: 'album-header' }];

  if (photos.length === 0) {
    rows.push({ type: 'empty', key: 'album-empty' });
    return rows;
  }

  chunk(photos, columns).forEach((rowPhotos, index) => {
    rows.push({ type: 'photos', key: `album-row-${index}`, photos: rowPhotos });
  });
  return rows;
};

const formatPhotoCount = (count: number): string =>
  count === 1 ? '1 photo' : `${count} photos`;

export { buildAlbumRows, formatPhotoCount };
export type { AlbumRow };
