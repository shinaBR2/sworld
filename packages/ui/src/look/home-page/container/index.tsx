import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
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

// Track a mounted element's content-box width via ResizeObserver. We need the
// width reactively (not just read on demand) so the exact row height changes
// when the window resizes or the breakpoint flips — that height change is what
// triggers the cache invalidation below. Holds the node in state (not a ref) so
// it re-observes when the content mounts after the loading placeholder, and
// no-ops where ResizeObserver is absent (SSR / tests).
const useObservedWidth = (element: HTMLElement | null): number => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return width;
};

interface PhotoTimelineContainerProps {
  queryRs: ReturnType<typeof useLoadPhotos>;
  LinkComponent: LinkComponentType;
}

const PhotoTimelineContainer = (props: PhotoTimelineContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { photos, isLoading } = queryRs;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
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

  // Every photo tile is a perfect square, so a row's height is exactly the grid
  // width divided across the columns (`spacing={1}` gap and the row's `pb: 1`
  // are both one spacing unit). Computing it exactly makes the estimate match
  // what gets rendered, so `measureElement` finds nothing to correct and rows
  // no longer snap/resize as they scroll in.
  const contentWidth = useObservedWidth(contentEl);
  const rowGap = Number.parseFloat(theme.spacing(1));
  const photoRow = photoRowHeight({
    contentWidth,
    columns,
    gap: rowGap,
    rowPadding: rowGap,
  });

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index].type === 'header'
        ? HEADER_ROW_ESTIMATE
        : photoRow || PHOTO_ROW_ESTIMATE,
    // Key measurements by the stable row key, not the default index — so a
    // header's cached height isn't misapplied to a photo row when the column
    // count changes and the rows re-chunk.
    getItemKey: (index) => rows[index].key,
    overscan: OVERSCAN,
  });

  // `measureElement` caches each row's measured height, but a resize or
  // breakpoint change makes those cached heights wrong — and offscreen rows
  // keep the stale value until they re-render, drifting the scroll offsets.
  // The exact row height changing is the signal to drop the cache and
  // re-estimate every row (skip it until the width is known, when there is
  // nothing meaningful cached yet). The virtualizer instance is stable.
  useLayoutEffect(() => {
    if (photoRow > 0) {
      virtualizer.measure();
    }
  }, [virtualizer, photoRow]);

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
        ref={setContentEl}
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
