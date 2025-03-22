import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { MuiStyledProps } from '../../universal';

const SkeletonPostMetadata = (props: MuiStyledProps) => (
  <Card sx={props.sx} aria-busy={true}>
    <CardContent>
      <Skeleton variant="text" width="80%" height={50} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="20%" height={30} />
    </CardContent>
  </Card>
);

export { SkeletonPostMetadata };
