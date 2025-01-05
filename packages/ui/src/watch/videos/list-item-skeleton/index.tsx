import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const VideoListItemSkeleton = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1,
      }}
    >
      {/* Thumbnail skeleton */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Skeleton
          variant="rectangular"
          width={64}
          height={64}
          sx={{ borderRadius: 1 }}
        />
        {/* Duration skeleton */}
        {/* <Skeleton
          variant="rectangular"
          width={35}
          height={20}
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            borderRadius: 0.5,
          }}
        /> */}
      </Box>

      {/* Text content skeletons */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton
          variant="text"
          width="85%"
          height={20}
          sx={{ marginBottom: 0.5 }}
        />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Box>
  );
};

export { VideoListItemSkeleton };
