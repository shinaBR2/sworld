import { CardContent, Skeleton, Typography } from '@mui/material';
import { CategoryType } from 'core/finance';
import { StyledAmount, StyledCard, StyledCategoryName, StyledCategoryWrapper } from './styled';

const SummaryCardSkeleton = () => {
  return (
    <StyledCard category={'' as CategoryType} selected={false}>
      <CardContent>
        <StyledCategoryWrapper>
          <StyledCategoryName variant="h6" component="div">
            <Skeleton variant="circular" width={24} height={24} sx={{ marginRight: '8px' }} />
            <Skeleton width={40} />
          </StyledCategoryName>
        </StyledCategoryWrapper>

        <StyledAmount variant="h4" component="div">
          <Skeleton width={100} height={40} />
        </StyledAmount>

        <Typography variant="body2" color="text.secondary">
          <Skeleton width={80} />
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export { SummaryCardSkeleton };
