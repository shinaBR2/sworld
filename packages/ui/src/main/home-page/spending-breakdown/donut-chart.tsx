import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { CategoryType } from 'core/finance';

export interface CategoryData {
  category: CategoryType;
  amount: number;
  count: number;
}

export interface DonutChartProps {
  isLoading: boolean;
  data: CategoryData[];
  onCategoryClick?: (category: CategoryType) => void;
  selectedCategory?: CategoryType;
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
      return 'Must';
    case 'nice':
      return 'Nice';
    case 'waste':
      return 'Waste';
    case 'total':
      return 'Total';
    default:
      return 'Unknown';
  }
};

const DonutChart = ({ isLoading, data, onCategoryClick, selectedCategory }: DonutChartProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Filter out any 'total' category and zero values for chart display
  const chartData = data
    .filter(item => item.category !== 'total' && item.amount > 0)
    .map(item => ({
      value: item.amount,
      name: getCategoryTitle(item.category),
      category: item.category,
      // Reduce opacity for non-selected categories if a category is selected
      itemStyle: {
        color: getCategoryColor(item.category),
        opacity: selectedCategory && item.category !== selectedCategory ? 0.6 : 1,
      },
    }));

  // Calculate the total for the center text
  const total = data.reduce((sum, item) => (item.category !== 'total' ? sum + item.amount : sum), 0);

  // Generate ECharts option
  const getOption = (): EChartsOption => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value, percent } = params;
          return `${name}: $${value.toFixed(2)} (${percent.toFixed(1)}%)`;
        },
        backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
        borderColor: isDarkMode ? '#333' : '#ddd',
        textStyle: {
          color: isDarkMode ? '#fff' : '#333',
        },
      },
      series: [
        {
          name: 'Spending',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: isDarkMode ? '#121212' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: chartData,
        },
      ],
    };
  };

  // Handle chart events
  const handleChartEvents = {
    click: (params: any) => {
      if (onCategoryClick && params.data.category) {
        onCategoryClick(params.data.category);
      }
    },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 280,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Loading"
        aria-busy="true"
      >
        <Skeleton variant="circular" width={196} height={196} sx={{ mx: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
      <ReactECharts
        option={getOption()}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={handleChartEvents}
      />

      {/* Center text */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none', // So clicks pass through to the chart
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
