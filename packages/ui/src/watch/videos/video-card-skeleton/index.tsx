import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

const VideoSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton
      variant="rectangular"
      height={200}
      sx={{ aspectRatio: '16/9', width: '100%' }}
    />
    <CardContent>
      <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton width="60%" height={20} />
    </CardContent>
  </Card>
);

export { VideoSkeleton };
