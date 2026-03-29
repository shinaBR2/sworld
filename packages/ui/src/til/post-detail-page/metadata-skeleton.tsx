import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import type { MuiStyledProps } from '../../universal';

const SkeletonPostMetadata = (props: MuiStyledProps) => (
  <Box sx={props.sx} aria-busy={true}>
    <Skeleton
      variant="text"
      width="85%"
      height={48}
      sx={{ mb: 2, maxWidth: 600 }}
    />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Skeleton variant="circular" width={16} height={16} />
      <Skeleton variant="text" width={80} height={20} />
    </Box>
  </Box>
);

export { SkeletonPostMetadata };
