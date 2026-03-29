import Skeleton from '@mui/material/Skeleton';

const SkeletonPostMetadata = () => (
  <>
    <Skeleton variant="text" width="80%" height={50} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="20%" height={30} />
  </>
);

export { SkeletonPostMetadata };
