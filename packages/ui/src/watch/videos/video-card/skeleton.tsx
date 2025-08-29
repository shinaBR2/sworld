import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

const VideoSkeleton = () => (
  <Card aria-busy="true" sx={{ height: '100%', boxShadow: 'none' }}>
    <Skeleton
      variant="rounded"
      height={200}
      sx={{ aspectRatio: '16/9', width: '100%' }}
    />
    <CardContent sx={{ px: 0, pt: 2, '&:last-child': { pb: 1 } }}>
      <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton width="60%" height={20} />
    </CardContent>
  </Card>
);

export { VideoSkeleton };
