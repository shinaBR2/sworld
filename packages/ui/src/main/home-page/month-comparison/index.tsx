import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

export interface MonthData {
  month: string; // Format: "YYYY-MM"
  displayMonth: string; // Format: "Jan", "Feb", etc.
  total: number;
}

export interface MonthComparisonProps {
  data: MonthData[];
  currentMonthIndex: number;
}

const MonthComparison = ({ data, currentMonthIndex }: MonthComparisonProps) => {
  // Calculate percentage change
  const getCurrentMonthChange = () => {
    if (data.length < 2 || currentMonthIndex <= 0) {
      return { percentage: 0, isIncrease: false };
    }

    const currentMonth = data[currentMonthIndex];
    const previousMonth = data[currentMonthIndex - 1];

    if (previousMonth.total === 0) {
      return { percentage: 0, isIncrease: false };
    }

    const change = currentMonth.total - previousMonth.total;
    const percentage = (change / previousMonth.total) * 100;

    return {
      percentage: Math.abs(percentage),
      isIncrease: percentage > 0,
    };
  };

  const { percentage, isIncrease } = getCurrentMonthChange();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Spending Trend
        </Typography>

        {data.length >= 2 && (
          <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                color: isIncrease ? 'error.main' : 'success.main',
              }}
            >
              {isIncrease ? (
                <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, mr: 0.5 }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              {isIncrease ? 'more than' : 'less than'} last month
            </Typography>
          </Box>
        )}

        <Box sx={{ width: '100%', height: 160 }}>
          {data.length === 0 ? (
            <Box
              sx={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                No data available
              </Typography>
            </Box>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
};

export { MonthComparison };
