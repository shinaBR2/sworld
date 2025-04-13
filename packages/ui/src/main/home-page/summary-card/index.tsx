import { CardContent, Typography, Skeleton } from '@mui/material';
import { StyledCard, StyledAmount, StyledCategoryName, StyledCategoryWrapper } from './styled';
import { CategoryType } from './types';
import { getCategoryIcon, getCategoryTitle } from './utils';

export interface SummaryCardProps {
  isLoading: boolean;
  category: string;
  amount: number;
  count?: number;
  onClick?: () => void;
  selected?: boolean;
}

const SummaryCard = (props: SummaryCardProps) => {
  const { isLoading, category, amount, count = 0, onClick, selected = false } = props;

  if (isLoading) {
    return (
      <StyledCard category={category as CategoryType} selected={selected}>
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
  }

  return (
    <StyledCard category={category as CategoryType} selected={selected} onClick={onClick}>
      <CardContent>
        <StyledCategoryWrapper>
          <StyledCategoryName variant="h6" component="div">
            <span style={{ marginRight: '8px' }}>{getCategoryIcon(category as CategoryType)}</span>
            {getCategoryTitle(category as CategoryType)}
          </StyledCategoryName>
        </StyledCategoryWrapper>

        <StyledAmount variant="h4" component="div">
          ${amount.toFixed(2)}
        </StyledAmount>

        {count > 0 && (
          <Typography variant="body2" color="text.secondary">
            {count} transaction{count !== 1 ? 's' : ''}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

export { SummaryCard };
