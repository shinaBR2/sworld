import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { useLoadAlbums } from 'core/look/query-hooks/albums';
import type { LinkComponentType } from '../../photos/types';
import { AlbumCard } from '../album-card';
import { AlbumCardSkeleton } from '../album-card/skeleton';
import { genAlbumLinkProps } from '../utils';

const SKELETON_KEYS = Array.from(
  { length: 8 },
  (_, index) => `album-skeleton-${index}`,
);
// Own scroll region: the page shell is a fixed-height column with overflow
// hidden, so this flex child must shrink (`minHeight: 0`) and scroll itself.
const GRID_SX = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  py: 4,
  px: { xs: 2, sm: 3 },
} as const;
// Album tiles are larger than photo tiles: 2 up on phones, 3 on tablets, 4 on
// desktop (out of MUI Grid's default 12 columns).
const ALBUM_GRID_SIZE = { xs: 6, sm: 4, md: 3 } as const;

interface AlbumListContainerProps {
  queryRs: ReturnType<typeof useLoadAlbums>;
  LinkComponent: LinkComponentType;
}

// The album index: a responsive grid of album covers. Albums are a curated,
// small set, so this renders plainly (no virtualization) — the virtualized
// timeline is only for the full, unbounded photo stream.
const AlbumListContainer = (props: AlbumListContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { albums, isLoading } = queryRs;

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={GRID_SX}>
        <Grid container spacing={2}>
          {SKELETON_KEYS.map((key) => (
            <Grid size={ALBUM_GRID_SIZE} key={key}>
              <AlbumCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (albums.length === 0) {
    return (
      <Container maxWidth={false} sx={GRID_SX}>
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No albums yet
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={GRID_SX}>
      <Grid container spacing={2}>
        {albums.map((album) => (
          <Grid size={ALBUM_GRID_SIZE} key={album.id}>
            <AlbumCard
              album={album}
              LinkComponent={LinkComponent}
              linkProps={genAlbumLinkProps(album)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export { AlbumListContainer };
