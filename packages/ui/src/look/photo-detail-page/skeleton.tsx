import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// Loading placeholder for a deep-linked photo route, before the photo resolves.
const PhotoLightboxSkeleton = () => (
  <Stack
    sx={{
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
    }}
  >
    <Skeleton
      variant="rounded"
      sx={{
        width: '100%',
        height: '100%',
        maxWidth: '80vw',
        maxHeight: '80vh',
      }}
    />
  </Stack>
);

export { PhotoLightboxSkeleton };
