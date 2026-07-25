import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { genPhotoLinkProps, resolveColumns } from '../../home-page/utils';
import { PhotoCard } from '../../photos/photo-card';
import { PhotoSkeleton } from '../../photos/photo-card/skeleton';
import type { LinkComponentType } from '../../photos/types';
import { formatPhotoCount } from '../utils';

// Own scroll region: the page shell is a fixed-height column with overflow
// hidden, so this flex child must shrink (`minHeight: 0`) and scroll itself.
const CONTENT_SX = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  py: 4,
  px: { xs: 2, sm: 3 },
} as const;
const SKELETON_KEYS = Array.from(
  { length: 12 },
  (_, index) => `album-photo-skeleton-${index}`,
);

interface AlbumDetailContainerProps {
  queryRs: ReturnType<typeof useLoadAlbumDetail>;
  LinkComponent: LinkComponentType;
}

// One album's photos, in stored position order. Reuses the same square PhotoCard
// + blur placeholder as the timeline, but laid out as a plain responsive grid —
// an album is a bounded, ordered set, so it is not month-grouped or virtualized.
const AlbumDetailContainer = (props: AlbumDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { album, isLoading } = queryRs;
  const theme = useTheme();

  const columns = resolveColumns({
    isSm: useMediaQuery(theme.breakpoints.up('sm')),
    isMd: useMediaQuery(theme.breakpoints.up('md')),
    isLg: useMediaQuery(theme.breakpoints.up('lg')),
    isXl: useMediaQuery(theme.breakpoints.up('xl')),
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
    <Container maxWidth={false} sx={CONTENT_SX}>
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
      {album.photos.length === 0 ? (
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No photos in this album
          </Typography>
        </Stack>
      ) : (
        <Grid container spacing={1} columns={columns}>
          {album.photos.map((photo) => (
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
    </Container>
  );
};

export { AlbumDetailContainer };
