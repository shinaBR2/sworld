import type { StyledComponent } from '@emotion/styled';
import { Box, Card, type CardProps, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import type { CategoryType } from 'core/finance';
import { getFinanceColor } from '../../../universal/minimalism/domainPalette';

const StyledCard: StyledComponent<
  CardProps & { category: CategoryType; selected: boolean }
> = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'category' && prop !== 'selected',
})<{ category: CategoryType; selected: boolean }>(
  ({ theme, category, selected }) => {
    const categoryColor = getFinanceColor(theme, category);

    return {
      borderLeft: `4px solid ${categoryColor}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      // 0.125 / 0.063 preserve the old `${color}20` / `${color}10` hex-alpha.
      backgroundColor: selected
        ? alpha(categoryColor, 0.125)
        : theme.palette.background.paper,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
        backgroundColor: alpha(categoryColor, 0.063),
      },
      '&::after': selected
        ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: categoryColor,
          }
        : {},
    };
  },
);

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
