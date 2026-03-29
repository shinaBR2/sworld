import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { StyledCard } from './styled';

const SkeletonPostCard = () => (
  <StyledCard aria-busy="true">
    <CardContent>
      <Stack spacing={2}>
        <Skeleton variant="text" width="80%" height={28} />
        <Stack spacing={1}>
          <Skeleton variant="text" width="100%" height={18} />
          <Skeleton variant="text" width="90%" height={18} />
        </Stack>
        <Skeleton variant="text" width="25%" height={24} />
      </Stack>
    </CardContent>
  </StyledCard>
);

export { SkeletonPostCard };
