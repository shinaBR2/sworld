import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export type CategoryType = 'must' | 'nice' | 'waste' | 'total';

export interface SummaryCardProps {
  category: CategoryType;
  amount: number;
  count?: number;
  onClick?: () => void;
  selected?: boolean;
}

const getCategoryColor = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return '#ef4444'; // red-500
    case 'nice':
      return '#3b82f6'; // blue-500
    case 'waste':
      return '#f59e0b'; // amber-500
    case 'total':
      return '#8b5cf6'; // violet-500
    default:
      return '#6b7280'; // gray-500
  }
};

const getCategoryIcon = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return '🔴';
    case 'nice':
      return '🔵';
    case 'waste':
      return '🟠';
    case 'total':
      return '💰';
    default:
      return '📊';
  }
};

const getCategoryTitle = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return 'Must';
    case 'nice':
      return 'Nice';
    case 'waste':
      return 'Waste';
    case 'total':
      return 'Total';
    default:
      return 'Expenses';
  }
};

const StyledCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'category' && prop !== 'selected',
})<{ category: CategoryType; selected: boolean }>(({ theme, category, selected }) => ({
  borderLeft: `4px solid ${getCategoryColor(category)}`,
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',
  backgroundColor: selected ? `${getCategoryColor(category)}20` : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    backgroundColor: `${getCategoryColor(category)}10`,
  },
  '&::after': selected
    ? {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: getCategoryColor(category),
      }
    : {},
}));

const SummaryCard = ({ category, amount, count = 0, onClick, selected = false }: SummaryCardProps) => {
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
