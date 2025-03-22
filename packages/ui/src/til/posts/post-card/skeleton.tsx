import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { StyledCard, StyledDescription } from './Styled';

const SkeletonPostCard = () => (
  <StyledCard aria-busy="true">
    <CardContent>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
      <StyledDescription>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
      </StyledDescription>
      <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1.5 }} />
    </CardContent>
  </StyledCard>
);

export { SkeletonPostCard };
