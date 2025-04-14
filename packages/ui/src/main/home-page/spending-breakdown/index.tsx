import { CardContent, Skeleton, Typography } from '@mui/material';
import { DonutChart } from './donut-chart';
import { BreakdownCard } from './styled';
import { useLoadTransactionsByPeriod } from 'core/finance/query-hooks';
import { CategoryType } from 'core/finance';

interface SpendingBreakdownProps {
  isLoading: boolean;
  categoryData?: NonNullable<ReturnType<typeof useLoadTransactionsByPeriod>['data']>['categories'];
  handleCategoryClick: (category: CategoryType) => void;
  selectedCategory?: CategoryType;
}

const SpendingBreakdown = (props: SpendingBreakdownProps) => {
  const { isLoading, categoryData = [], handleCategoryClick, selectedCategory } = props;

  if (isLoading) {
    return (
      <BreakdownCard>
        <CardContent>
          <Skeleton variant="text" width={180} height={32} sx={{ mb: 1 }} />
          <DonutChart isLoading={true} data={[]} />
        </CardContent>
      </BreakdownCard>
    );
  }

  return (
    <BreakdownCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Spending Breakdown
        </Typography>
        <DonutChart
          isLoading={false}
          data={categoryData.filter(d => d.category !== 'total')}
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory}
        />
      </CardContent>
    </BreakdownCard>
  );
};

export { SpendingBreakdown };
