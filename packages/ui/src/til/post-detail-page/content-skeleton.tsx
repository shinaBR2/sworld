import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const SkeletonPostContent = () => (
  <Stack spacing={2} mt={4} aria-busy="true">
    <Skeleton variant="text" width="60%" height={40} />
    <Skeleton variant="text" width="100%" height={24} />
    <Skeleton variant="text" width="95%" height={24} />
    <Skeleton variant="text" width="90%" height={24} />
    <Skeleton variant="rectangular" width="100%" height={200} />
  </Stack>
);

export { SkeletonPostContent };
