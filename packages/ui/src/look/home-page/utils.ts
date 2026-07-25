import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { COLUMNS_BY_BREAKPOINT } from './columns';

interface MonthGroup {
  key: string;
  label: string;
  photos: TransformedPhoto[];
}

type TimelineRow =
  | { type: 'header'; key: string; label: string }
  | { type: 'photos'; key: string; photos: TransformedPhoto[] };

interface ColumnBreakpointFlags {
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const UNDATED_KEY = 'undated';
const UNDATED_LABEL = 'Undated';
const PHOTO_ROUTE = '/photo/$photoId';

// Group by the stored timestamp's calendar month via a string slice
// ('2023-01-01T…' -> '2023-01'). String-based, not Date-based, so grouping is
// deterministic and free of local-timezone/DST conversion bugs. Assumes takenAt
// is UTC-normalized (the Hasura timestamptz default), so the slice is the UTC month.
const monthKeyOf = (takenAt: string | null): string => {
  if (!takenAt) {
    return UNDATED_KEY;
  }
  return takenAt.slice(0, 7);
};

const labelOf = (key: string): string => {
  if (key === UNDATED_KEY) {
    return UNDATED_LABEL;
  }
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const step = Math.max(1, size);
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += step) {
    rows.push(items.slice(index, index + step));
  }
  return rows;
};

// Bucket photos into month groups, newest month first. Dated groups are sorted
// by month key descending so the order holds regardless of input order (the
// 'YYYY-MM' key sorts lexicographically = chronologically); undated photos
// always come last. Photos keep their incoming order within each month.
const groupPhotosByMonth = (photos: TransformedPhoto[]): MonthGroup[] => {
  const groups = new Map<string, MonthGroup>();

  for (const photo of photos) {
    const key = monthKeyOf(photo.takenAt);
    const existing = groups.get(key);
    if (existing) {
      existing.photos.push(photo);
      continue;
    }
    groups.set(key, { key, label: labelOf(key), photos: [photo] });
  }

  const ordered = Array.from(groups.values());
  const dated = ordered
    .filter((group) => group.key !== UNDATED_KEY)
    .sort((a, b) => b.key.localeCompare(a.key));
  const undated = ordered.filter((group) => group.key === UNDATED_KEY);
  return [...dated, ...undated];
};

// Flatten month groups into the virtualizer's row model: one header row per
// month, then its photos chunked into rows of `columns`.
const buildTimelineRows = (
  groups: MonthGroup[],
  columns: number,
): TimelineRow[] => {
  const rows: TimelineRow[] = [];

  for (const group of groups) {
    rows.push({
      type: 'header',
      key: `header-${group.key}`,
      label: group.label,
    });
    chunk(group.photos, columns).forEach((photos, index) => {
      rows.push({ type: 'photos', key: `row-${group.key}-${index}`, photos });
    });
  }

  return rows;
};

const resolveColumns = (flags: ColumnBreakpointFlags): number => {
  if (flags.isXl) {
    return COLUMNS_BY_BREAKPOINT.xl;
  }
  if (flags.isLg) {
    return COLUMNS_BY_BREAKPOINT.lg;
  }
  if (flags.isMd) {
    return COLUMNS_BY_BREAKPOINT.md;
  }
  if (flags.isSm) {
    return COLUMNS_BY_BREAKPOINT.sm;
  }
  return COLUMNS_BY_BREAKPOINT.xs;
};

// The route param is the photo id (uuid): the timeline loads the photo list
// and the lightbox matches the active photo by id, so the id — not the slug —
// is what the URL must carry.
const genPhotoLinkProps = (photo: TransformedPhoto) => ({
  to: PHOTO_ROUTE,
  params: { photoId: photo.id },
});

export {
  buildTimelineRows,
  genPhotoLinkProps,
  groupPhotosByMonth,
  resolveColumns,
};
export type { ColumnBreakpointFlags, MonthGroup, TimelineRow };
