import { CardContent, Typography } from '@mui/material';
import { StyledCard, StyledAmount, StyledCategoryName, StyledCategoryWrapper } from './styled';
import { getCategoryIcon, getCategoryTitle } from './utils';
import { CategoryType } from 'core/finance';
import { SummaryCardSkeleton } from './skeleton';

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
    return <SummaryCardSkeleton />;
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
