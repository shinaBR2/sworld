import { Card, CardContent, Skeleton } from '@mui/material';

const SkeletonPostContent = () => (
  <Card aria-busy="true">
    <CardContent>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" width="100%" height={200} />
    </CardContent>
  </Card>
);

export { SkeletonPostContent };
