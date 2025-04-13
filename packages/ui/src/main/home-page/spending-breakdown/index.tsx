import { Card, CardContent, Typography } from '@mui/material';
import { DonutChart } from './donut-chart';

interface SpendingBreakdownProps {
  categoryData: { category: string; amount: number; count: number }[];
  handleCategoryClick: (category: string) => void;
  selectedCategory: string | null;
}

const SpendingBreakdown = (props: SpendingBreakdownProps) => {
  const { categoryData, handleCategoryClick, selectedCategory } = props;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Spending Breakdown
        </Typography>
        <DonutChart
          data={categoryData.filter(d => d.category !== 'total')}
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory}
        />
      </CardContent>
    </Card>
  );
};

export { SpendingBreakdown };
