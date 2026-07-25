import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { useMemo, useRef } from 'react';
import { genPhotoLinkProps, resolveColumns } from '../../home-page/utils';
import { PhotoCard } from '../../photos/photo-card';
import { PhotoSkeleton } from '../../photos/photo-card/skeleton';
import type { LinkComponentType } from '../../photos/types';
import { buildAlbumRows, formatPhotoCount } from '../utils';

// Row-height estimates (px) the virtualizer starts from before it measures the
// real DOM heights — a virtualizer API contract, not a styling value.
const HEADER_ROW_ESTIMATE = 96;
const PHOTO_ROW_ESTIMATE = 220;
const OVERSCAN = 6;
const SKELETON_KEYS = Array.from(
  { length: 12 },
  (_, index) => `album-photo-skeleton-${index}`,
);
// Own scroll region: the page shell is a fixed-height column with overflow
// hidden, so this flex child must shrink (`minHeight: 0`) and scroll itself.
const CONTENT_SX = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  py: 4,
  px: { xs: 2, sm: 3 },
} as const;

interface AlbumDetailContainerProps {
  queryRs: ReturnType<typeof useLoadAlbumDetail>;
  LinkComponent: LinkComponentType;
}

// One album's photos, in stored position order. Reuses the same square PhotoCard
// + blur placeholder as the timeline, and the same virtualized row model so a
// large album mounts only the visible rows — but as a flat header + grid (no
// month grouping), since an album is a single ordered set.
const AlbumDetailContainer = (props: AlbumDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { album, isLoading } = queryRs;
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const columns = resolveColumns({
    isSm: useMediaQuery(theme.breakpoints.up('sm')),
    isMd: useMediaQuery(theme.breakpoints.up('md')),
    isLg: useMediaQuery(theme.breakpoints.up('lg')),
    isXl: useMediaQuery(theme.breakpoints.up('xl')),
  });

  const rows = useMemo(
    () => buildAlbumRows(album?.photos ?? [], columns),
    [album?.photos, columns],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index].type === 'photos' ? PHOTO_ROW_ESTIMATE : HEADER_ROW_ESTIMATE,
    // Key by the stable row key, not the default index, so a measured height
    // isn't misapplied to a different row when the column count re-chunks.
    getItemKey: (index) => rows[index].key,
    overscan: OVERSCAN,
  });

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={CONTENT_SX}>
        <Stack sx={{ gap: 1, pb: 3 }}>
          <Skeleton variant="text" sx={{ width: '40%', fontSize: '2rem' }} />
          <Skeleton variant="text" sx={{ width: '20%' }} />
        </Stack>
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

  if (!album) {
    return (
      <Container maxWidth={false} sx={CONTENT_SX}>
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            Album not found
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container ref={scrollRef} maxWidth={false} sx={CONTENT_SX}>
      <Stack
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
                <Stack sx={{ gap: 0.5, pb: 3 }}>
                  <Typography variant="h5" component="h1" color="text.primary">
                    {album.title}
                  </Typography>
                  {album.description ? (
                    <Typography variant="body1" color="text.secondary">
                      {album.description}
                    </Typography>
                  ) : null}
                  <Typography variant="body2" color="text.secondary">
                    {formatPhotoCount(album.photos.length)}
                  </Typography>
                </Stack>
              ) : null}
              {row.type === 'empty' ? (
                <Stack sx={{ alignItems: 'center', py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No photos in this album
                  </Typography>
                </Stack>
              ) : null}
              {row.type === 'photos' ? (
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
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Container>
  );
};

export { AlbumDetailContainer };
