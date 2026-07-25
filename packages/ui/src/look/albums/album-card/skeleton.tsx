import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// Loading placeholder for an album tile: a square cover plus two text lines,
// matching AlbumCard's shape so the grid does not shift when albums resolve.
const AlbumCardSkeleton = () => (
  <Stack sx={{ gap: 1 }}>
    <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '1 / 1' }} />
    <Stack sx={{ px: 0.5, gap: 0.5 }}>
      <Skeleton variant="text" sx={{ width: '70%' }} />
      <Skeleton variant="text" sx={{ width: '40%' }} />
    </Stack>
  </Stack>
);

export { AlbumCardSkeleton };
