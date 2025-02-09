import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const VideoListItemSkeleton = () => {
  return (
    <Box
      component="article"
      role="article"
      aria-busy="true"
      aria-label="Loading video item"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1,
        mx: 2,
      }}
    >
      {/* Thumbnail skeleton */}
      <Box aria-label="Loading thumbnail" sx={{ position: 'relative', flexShrink: 0 }}>
        <Skeleton variant="rectangular" width={(64 / 9) * 16} height={64} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>

      {/* Text content skeletons */}
      <Box role="presentation" sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton variant="text" width="85%" height={20} sx={{ marginBottom: 0.5 }} animation="wave" />
        <Skeleton variant="text" width="40%" height={16} animation="wave" />
      </Box>
    </Box>
  );
};

export { VideoListItemSkeleton };
