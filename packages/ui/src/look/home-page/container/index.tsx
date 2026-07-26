import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useMemo, useRef } from 'react';
import { PhotoCard } from '../../photos/photo-card';
import { PhotoSkeleton } from '../../photos/photo-card/skeleton';
import type { LinkComponentType } from '../../photos/types';
import { LookEmptyState } from '../empty-state';
import {
  buildTimelineRows,
  genPhotoLinkProps,
  groupPhotosByMonth,
  photoRowHeight,
  resolveColumns,
} from '../utils';

// Row-height estimates (px) the virtualizer starts from before it measures the
// real DOM heights — a virtualizer API contract, not a styling value.
const HEADER_ROW_ESTIMATE = 64;
// Only a first-paint fallback: photo rows are perfect squares, so once the
// content width is known the real row height is computed exactly (see
// `photoRowHeight`) and this constant is no longer used. A wrong estimate here
// is what made rows snap/resize as they scrolled into view.
const PHOTO_ROW_ESTIMATE = 220;
const OVERSCAN = 6;
const SKELETON_KEYS = Array.from(
  { length: 18 },
  (_, index) => `skeleton-${index}`,
);
// `minHeight: 0` lets this flex child shrink below its (very tall, virtualized)
// content so `overflow: auto` scrolls it — without it the default
// `min-height: auto` makes it grow past the fixed-height page and get clipped.
const SCROLL_SX = {
  flex: 1,
  minHeight: 0,
  py: 3,
  px: { xs: 2, sm: 3 },
  overflow: 'auto',
} as const;

interface PhotoTimelineContainerProps {
  queryRs: ReturnType<typeof useLoadPhotos>;
  LinkComponent: LinkComponentType;
}

const PhotoTimelineContainer = (props: PhotoTimelineContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { photos, isLoading } = queryRs;
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const columns = resolveColumns({
    isSm: useMediaQuery(theme.breakpoints.up('sm')),
    isMd: useMediaQuery(theme.breakpoints.up('md')),
    isLg: useMediaQuery(theme.breakpoints.up('lg')),
    isXl: useMediaQuery(theme.breakpoints.up('xl')),
  });

  const rows = useMemo(
    () => buildTimelineRows(groupPhotosByMonth(photos), columns),
    [photos, columns],
  );

  // The `spacing={1}` Grid gap and the row's `pb: 1` are both one spacing unit.
  const rowGap = Number.parseFloat(theme.spacing(1));

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    // Every photo tile is a perfect square, so a row's height is exactly its
    // width divided across the columns — read the live grid width straight from
    // the DOM instead of guessing. That makes the estimate match what gets
    // rendered, so `measureElement` finds nothing to correct and rows no longer
    // snap/resize as they scroll in. The virtualizer re-runs this on scroll and
    // on resize, so it tracks breakpoint and window changes on its own.
    estimateSize: (index) =>
      rows[index].type === 'header'
        ? HEADER_ROW_ESTIMATE
        : photoRowHeight({
            contentWidth: contentRef.current?.clientWidth ?? 0,
            columns,
            gap: rowGap,
            rowPadding: rowGap,
          }) || PHOTO_ROW_ESTIMATE,
    // Key measurements by the stable row key, not the default index — so a
    // header's cached height isn't misapplied to a photo row when the column
    // count changes and the rows re-chunk.
    getItemKey: (index) => rows[index].key,
    overscan: OVERSCAN,
  });

  if (isLoading) {
    return (
      <Container maxWidth={false} disableGutters sx={SCROLL_SX}>
        <Grid container spacing={1} columns={columns}>
          {SKELETON_KEYS.map((key) => (
            <Grid size={1} key={key}>
              <PhotoSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (photos.length === 0) {
    return (
      <Container maxWidth={false} disableGutters sx={SCROLL_SX}>
        <LookEmptyState />
      </Container>
    );
  }

  return (
    <Container
      ref={scrollRef}
      maxWidth={false}
      disableGutters
      data-scroll-restoration-id="look-home"
      sx={SCROLL_SX}
    >
      <Stack
        ref={contentRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <Stack
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.type === 'header' ? (
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ pt: 3, pb: 1, color: 'text.primary' }}
                >
                  {row.label}
                </Typography>
              ) : (
                <Grid container spacing={1} columns={columns} sx={{ pb: 1 }}>
                  {row.photos.map((photo) => (
                    <Grid size={1} key={photo.id}>
                      <PhotoCard
                        photo={photo}
                        LinkComponent={LinkComponent}
                        linkProps={genPhotoLinkProps(photo)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Container>
  );
};

export { PhotoTimelineContainer };
