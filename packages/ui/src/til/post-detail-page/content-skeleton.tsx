import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const SkeletonPostContent = () => (
  <Box sx={{ py: 4 }} aria-busy="true">
    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1.5 }} />
    <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1.5 }} />
    <Skeleton variant="text" width="90%" height={24} sx={{ mb: 4 }} />
    <Skeleton
      variant="rounded"
      width="100%"
      height={200}
      sx={{ borderRadius: 2 }}
    />
  </Box>
);

export { SkeletonPostContent };
