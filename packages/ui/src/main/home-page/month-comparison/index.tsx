import { Box, Card, CardContent, Typography } from '@mui/material';
// import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

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
  // const theme = useTheme();
  // const isDarkMode = theme.palette.mode === 'dark';

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

  // Process the chart data
  // const monthNames = data.map(month => month.displayMonth);
  // const monthValues = data.map(month => month.total);

  // // Set different colors for the current month
  // const itemColors = data.map((_, index) =>
  //   index === currentMonthIndex ? theme.palette.primary.main : theme.palette.primary.light
  // );

  // Generate ECharts option
  // const getOption = (): EChartsOption => {
  //   return {
  //     grid: {
  //       left: '3%',
  //       right: '4%',
  //       bottom: '8%',
  //       top: '3%',
  //       containLabel: true,
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: monthNames,
  //       axisLine: { show: false },
  //       axisTick: { show: false },
  //       axisLabel: {
  //         color: isDarkMode ? '#aaa' : '#666',
  //       },
  //     },
  //     yAxis: {
  //       type: 'value',
  //       show: false,
  //     },
  //     tooltip: {
  //       trigger: 'item',
  //       formatter: (params: any) => {
  //         return `${params.name}: $${params.value.toFixed(2)}`;
  //       },
  //       backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
  //       borderColor: isDarkMode ? '#333' : '#ddd',
  //       textStyle: {
  //         color: isDarkMode ? '#fff' : '#333',
  //       },
  //     },
  //     series: [
  //       {
  //         data: monthValues.map((value, index) => ({
  //           value,
  //           itemStyle: {
  //             color: itemColors[index],
  //             opacity: index === currentMonthIndex ? 1 : 0.7,
  //             borderRadius: [4, 4, 0, 0],
  //           },
  //         })),
  //         type: 'bar',
  //         barWidth: '60%',
  //         emphasis: {
  //           itemStyle: {
  //             opacity: 1,
  //           },
  //         },
  //       },
  //     ],
  //   };
  // };

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
          {data.length === 0 ? (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No data available
              </Typography>
            </Box>
          ) : null}
          {/* <ReactECharts
            option={getOption()}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          /> */}
        </Box>
      </CardContent>
    </Card>
  );
};

export { MonthComparison };
