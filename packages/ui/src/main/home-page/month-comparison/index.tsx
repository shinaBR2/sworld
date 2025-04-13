// packages/ui/src/finance/month-comparison/index.tsx
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { CategoryType } from '../summary-card';

export interface MonthData {
  month: string; // Format: "YYYY-MM"
  displayMonth: string; // Format: "Jan", "Feb", etc.
  total: number;
  categories: {
    [key in Exclude<CategoryType, 'total'>]?: number;
  };
}

export interface MonthComparisonProps {
  data: MonthData[];
  currentMonthIndex: number;
}

const MonthComparison = ({ data, currentMonthIndex }: MonthComparisonProps) => {
  const theme = useTheme();

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

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2">${payload[0].value.toFixed(2)}</Typography>
        </Box>
      );
    }
    return null;
  };

  // Process the chart data
  const chartData = data.map(month => ({
    name: month.displayMonth,
    amount: month.total,
    isCurrentMonth: month === data[currentMonthIndex],
  }));

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
            <Typography variant="body2" color="text.secondary">
              {isIncrease ? 'more than' : 'less than'} last month
            </Typography>
          </Box>
        )}

        <Box sx={{ width: '100%', height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
                barSize={30}
                // Apply different styling to the current month
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.isCurrentMonth ? theme.palette.primary.main : theme.palette.primary.light}
                    opacity={entry.isCurrentMonth ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {data.length === 0 && (
          <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export { MonthComparison };
