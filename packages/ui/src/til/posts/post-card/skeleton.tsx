import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { StyledCard, StyledDescription } from './styled';

const SkeletonPostCard = () => (
  <StyledCard aria-busy="true">
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Skeleton variant="text" width="85%" height={28} sx={{ mb: 2 }} />
      <StyledDescription>
        <Skeleton variant="text" width="100%" height={18} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={18} />
      </StyledDescription>
      <Skeleton
        variant="text"
        width="25%"
        height={24}
        sx={{ mt: 2, borderRadius: 1 }}
      />
    </CardContent>
  </StyledCard>
);

export { SkeletonPostCard };
