import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import type { MuiStyledProps } from '../../universal';

const SkeletonPostMetadata = (props: MuiStyledProps) => (
  <CardContent sx={props.sx} aria-busy={true}>
    <Skeleton variant="text" width="80%" height={50} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="20%" height={30} />
  </CardContent>
);

export { SkeletonPostMetadata };
