import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const FeelingListSkeleton = () => {
  return (
    <Box display="flex" gap={1.5} my={2} role="status" aria-label="Loading feelings list">
      {[1, 2, 3, 4, 5].map(item => (
        <Skeleton key={item} variant="rounded" width={66} height={32} />
      ))}
    </Box>
  );
};

export { FeelingListSkeleton };
