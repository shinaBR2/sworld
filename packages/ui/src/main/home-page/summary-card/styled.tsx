import { StyledComponent } from '@emotion/styled';
import { Box, Card, CardProps, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CategoryType } from 'core/finance';

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

const StyledCard: StyledComponent<CardProps & { category: CategoryType; selected: boolean }> = styled(Card, {
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

const StyledCategoryWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  mb: theme.spacing(1),
})) as typeof Box;

const StyledCategoryName = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
}) as typeof Typography;

const StyledAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  mb: theme.spacing(0.5),
})) as typeof Typography;

export { StyledCard, StyledCategoryWrapper, StyledCategoryName, StyledAmount };
