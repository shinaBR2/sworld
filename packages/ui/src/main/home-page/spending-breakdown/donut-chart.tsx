import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { CategoryType } from 'core/finance';
import { formatNumber } from 'core/universal/common';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
// Import the ESM build (real `export default`), not lib/core (CJS with
// `__esModule` + `exports.default`). Under the vite 8/rolldown build the CJS
// default import resolves to the module object instead of the component,
// which crashes the finance page with React error #130 (SWO-356).
import ReactEChartsCore from 'echarts-for-react/esm/core';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

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

const DonutChart = ({
  isLoading,
  data,
  onCategoryClick,
  selectedCategory,
}: DonutChartProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { finance, grey, common, text, divider } = theme.palette;
  // Canvas (not CSS) surfaces read from the theme's mode: the glass tokens are
  // translucent, so an opaque tooltip/slice-gap colour comes from the grey
  // scale picked by mode. Everything else is a real, mode-aware theme token.
  const chartSurface = isDarkMode ? grey[900] : common.white;

  const getCategoryColor = (category: CategoryType) =>
    finance[category] ?? finance.default;

  // Filter out any 'total' category and zero values for chart display
  const chartData = data
    .filter((item) => item.category !== 'total' && item.amount > 0)
    .map((item) => ({
      value: item.amount,
      name: getCategoryTitle(item.category),
      category: item.category,
      // Reduce opacity for non-selected categories if a category is selected
      itemStyle: {
        color: getCategoryColor(item.category),
        opacity:
          selectedCategory && item.category !== selectedCategory ? 0.6 : 1,
      },
    }));

  // Calculate the total for the center text
  const total = data.reduce(
    (sum, item) => (item.category !== 'total' ? sum + item.amount : sum),
    0,
  );

  // Generate ECharts option
  const getOption = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value, percent } = params;
          return `${name}: ${formatNumber(value)} (${percent}%)`;
        },
        backgroundColor: chartSurface,
        borderColor: divider,
        textStyle: {
          color: text.primary,
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
            borderColor: chartSurface,
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
              shadowColor: alpha(common.black, 0.5),
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
        <Skeleton
          variant="circular"
          width={196}
          height={196}
          sx={{ mx: 'auto' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
      <ReactEChartsCore
        echarts={echarts}
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
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Total
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {formatNumber(total)}
        </Typography>
      </Box>
    </Box>
  );
};

export { DonutChart };
