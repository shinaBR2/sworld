import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { VideoListItemSkeleton } from '../../videos/list-item/skeleton';

const SKELETON_ITEMS_COUNT = 6;

const MainContentSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16/9',
        }}
        aria-label="Loading video player"
      >
        <Skeleton variant="rounded" width="100%" height="100%" />
      </Box>
      <Skeleton
        variant="text"
        width="50%"
        sx={theme => ({
          ...theme.typography.h4,
          my: 2, // px doesn't work
        })}
        animation="wave"
      />
    </Box>
  );
};

const RelatedContentSkeleton = () => {
  return (
    <Box>
      {/* Title skeleton */}
      <Skeleton aria-label="Loading related videos" variant="text" width={120} height={32} sx={{ mx: 2, mb: 2 }} />

      {/* Related videos list */}
      {Array.from(new Array(SKELETON_ITEMS_COUNT)).map((_, index) => (
        <VideoListItemSkeleton key={index} />
      ))}
    </Box>
  );
};

export { MainContentSkeleton, RelatedContentSkeleton };
