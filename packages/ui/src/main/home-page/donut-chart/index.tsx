// packages/ui/src/finance/donut-chart/index.tsx
import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryType } from '../summary-card';

export interface CategoryData {
  category: CategoryType;
  amount: number;
  count: number;
}

export interface DonutChartProps {
  data: CategoryData[];
  onCategoryClick?: (category: CategoryType) => void;
  selectedCategory?: CategoryType | null;
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

const getCategoryTitle = (category: CategoryType) => {
  switch (category) {
    case 'must':
      return 'Must-Have';
    case 'nice':
      return 'Nice-to-Have';
    case 'waste':
      return 'Waste';
    case 'total':
      return 'Total';
    default:
      return 'Unknown';
  }
};

const DonutChart = ({ data, onCategoryClick, selectedCategory }: DonutChartProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter out any 'total' category and zero values for chart display
  const chartData = data
    .filter(item => item.category !== 'total' && item.amount > 0)
    .map(item => ({
      name: getCategoryTitle(item.category),
      value: item.amount,
      category: item.category,
    }));

  // Calculate the total for the center text
  const total = data.reduce((sum, item) => (item.category !== 'total' ? sum + item.amount : sum), 0);

  const handlePieClick = (data: any, index: number) => {
    if (onCategoryClick) {
      onCategoryClick(data.category);
    }
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${getCategoryColor(data.category)}`,
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="subtitle2" sx={{ color: getCategoryColor(data.category) }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            ${data.value.toFixed(2)} ({((data.value / total) * 100).toFixed(1)}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onClick={handlePieClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(entry.category)}
                stroke={getCategoryColor(entry.category)}
                strokeWidth={selectedCategory === entry.category ? 2 : 1}
                opacity={selectedCategory && selectedCategory !== entry.category ? 0.6 : 1}
                style={{
                  filter: activeIndex === index ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.3))' : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ${total.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export { DonutChart };
