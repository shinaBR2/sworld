import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { chunk, groupPhotosByMonth } from '../home-page/utils';

// The virtualizer's row model for one album: a fixed leading header row (album
// title, description, count), then either an empty-state row or — like the
// timeline — the photos grouped by the month they were taken, each month a
// heading row followed by its photos chunked into rows of `columns`.
type AlbumRow =
  | { type: 'header'; key: string }
  | { type: 'empty'; key: string }
  | { type: 'month'; key: string; label: string }
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

  for (const group of groupPhotosByMonth(photos)) {
    rows.push({
      type: 'month',
      key: `album-month-${group.key}`,
      label: group.label,
    });
    chunk(group.photos, columns).forEach((rowPhotos, index) => {
      rows.push({
        type: 'photos',
        key: `album-row-${group.key}-${index}`,
        photos: rowPhotos,
      });
    });
  }
  return rows;
};

const formatPhotoCount = (count: number): string =>
  count === 1 ? '1 photo' : `${count} photos`;

export { buildAlbumRows, formatPhotoCount };
export type { AlbumRow };
