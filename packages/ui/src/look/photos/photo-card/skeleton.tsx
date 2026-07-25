import Skeleton from '@mui/material/Skeleton';

const PhotoSkeleton = () => (
  <Skeleton
    variant="rectangular"
    sx={{
      aspectRatio: '1 / 1',
      width: '100%',
      height: 'auto',
      borderRadius: 1,
    }}
  />
);

export { PhotoSkeleton };
