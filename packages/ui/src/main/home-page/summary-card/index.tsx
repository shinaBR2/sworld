import { CardContent, Typography, Box, Skeleton } from '@mui/material';
import { StyledCard } from './styled';
import { CategoryType } from './types';
import { getCategoryIcon, getCategoryTitle } from './utils';

export interface SummaryCardProps {
  isLoading: boolean;
  category: CategoryType;
  amount: number;
  count?: number;
  onClick?: () => void;
  selected?: boolean;
}

const SummaryCard = (props: SummaryCardProps) => {
  const { isLoading, category, amount, count = 0, onClick, selected = false } = props;

  if (isLoading) {
    return (
      <StyledCard category={category} selected={selected}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ marginRight: '8px' }} />
              <Skeleton width={40} />
            </Typography>
          </Box>

          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            <Skeleton width={100} height={40} />
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <Skeleton width={80} />
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard category={category} selected={selected} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>{getCategoryIcon(category)}</span>
            {getCategoryTitle(category)}
          </Typography>
        </Box>

        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          ${amount.toFixed(2)}
        </Typography>

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
