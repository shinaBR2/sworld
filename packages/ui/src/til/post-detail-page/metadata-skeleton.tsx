import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { MuiStyledProps } from '../../universal';

const SkeletonPostMetadata = (props: MuiStyledProps) => (
  <Stack sx={props.sx} spacing={2} aria-busy={true}>
    <Skeleton variant="text" width="80%" height={40} />
    <Stack direction="row" alignItems="center" spacing={1}>
      <Skeleton variant="circular" width={16} height={16} />
      <Skeleton variant="text" width={80} height={20} />
    </Stack>
  </Stack>
);

export { SkeletonPostMetadata };
