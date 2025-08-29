import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type CategoryData, DonutChart } from './donut-chart';

// Mock echarts core modules
vi.mock('echarts/core', () => ({
  __esModule: true,
  use: vi.fn(),
  default: {
    use: vi.fn(),
  },
}));

vi.mock('echarts/charts', () => ({
  __esModule: true,
  PieChart: vi.fn(),
}));

vi.mock('echarts/components', () => ({
  __esModule: true,
  TooltipComponent: vi.fn(),
  LegendComponent: vi.fn(),
}));

vi.mock('echarts/renderers', () => ({
  __esModule: true,
  CanvasRenderer: vi.fn(),
}));

// Mock the echarts-for-react core component
vi.mock('echarts-for-react/lib/core', () => ({
  default: ({ onEvents, option }: any) => {
    return (
      <div
        data-testid="mock-echarts"
        onClick={(e) => {
          // Simulate chart click with mock data
          if (onEvents && onEvents.click) {
            onEvents.click({
              data: {
                category: 'must',
                name: 'Must',
                value: 100,
              },
            });
          }
        }}
      >
        <div data-testid="chart-options">{JSON.stringify(option)}</div>
      </div>
    );
  },
}));

describe('DonutChart', () => {
  const theme = createTheme();

  const mockData: CategoryData[] = [
    { category: 'must', amount: 100, count: 2 },
    { category: 'nice', amount: 50, count: 1 },
    { category: 'waste', amount: 25, count: 1 },
  ];

  const renderComponent = (
    props: Partial<Parameters<typeof DonutChart>[0]> = {},
  ) => {
    return render(
      <ThemeProvider theme={theme}>
        <DonutChart isLoading={false} data={mockData} {...props} />
      </ThemeProvider>,
    );
  };

  it('renders loading skeleton when isLoading is true', () => {
    renderComponent({ isLoading: true });

    // Find the loading container by its aria-label
    const loadingContainer = screen.getByLabelText('Loading');
    expect(loadingContainer).toBeInTheDocument();

    // Verify it contains a skeleton
    const skeleton = loadingContainer.querySelector('.MuiSkeleton-root');
    expect(skeleton).not.toBeNull();
  });

  it('renders chart when data is provided and not loading', () => {
    renderComponent();

    const chart = screen.getByTestId('mock-echarts');
    expect(chart).toBeInTheDocument();

    // Check if total is displayed correctly
    const totalText = screen.getByText('Total');
    expect(totalText).toBeInTheDocument();

    const totalAmount = screen.getByText('175');
    expect(totalAmount).toBeInTheDocument();
  });

  it('calculates total correctly excluding total category', () => {
    const dataWithTotal = [
      ...mockData,
      { category: 'total', amount: 1000, count: 4 }, // This should be excluded from chart total
    ];

    renderComponent({ data: dataWithTotal });

    // Total should still be $175.00, not including the 'total' category
    const totalAmount = screen.getByText('175');
    expect(totalAmount).toBeInTheDocument();
  });

  it('filters out zero amount items', () => {
    const dataWithZero = [
      ...mockData,
      { category: 'nice', amount: 0, count: 0 }, // This should be filtered out
    ];

    renderComponent({ data: dataWithZero });

    // Check chart options to ensure zero items are filtered
    const chartOptions = screen.getByTestId('chart-options');
    const optionsJson = JSON.parse(chartOptions.textContent || '{}');

    // The chart data should only have 3 items (not 4)
    expect(optionsJson.series[0].data.length).toBe(3);
  });

  it('calls onCategoryClick when a category is clicked', () => {
    const onCategoryClick = vi.fn();

    renderComponent({ onCategoryClick });

    // Click on the chart
    const chart = screen.getByTestId('mock-echarts');
    fireEvent.click(chart);

    // Check if onCategoryClick was called with the correct category
    expect(onCategoryClick).toHaveBeenCalledWith('must');
  });

  it('applies opacity to non-selected categories when a category is selected', () => {
    renderComponent({ selectedCategory: 'must' });

    // Check chart options to ensure opacity is applied correctly
    const chartOptions = screen.getByTestId('chart-options');
    const optionsJson = JSON.parse(chartOptions.textContent || '{}');

    // Find the 'must' category data
    const mustData = optionsJson.series[0].data.find(
      (d: any) => d.category === 'must',
    );
    const niceData = optionsJson.series[0].data.find(
      (d: any) => d.category === 'nice',
    );

    // Must should have opacity 1, nice should have opacity 0.6
    expect(mustData.itemStyle.opacity).toBe(1);
    expect(niceData.itemStyle.opacity).toBe(0.6);
  });

  it('uses correct colors for each category', () => {
    renderComponent();

    // Check chart options to ensure colors are applied correctly
    const chartOptions = screen.getByTestId('chart-options');
    const optionsJson = JSON.parse(chartOptions.textContent || '{}');

    // Find each category data
    const mustData = optionsJson.series[0].data.find(
      (d: any) => d.category === 'must',
    );
    const niceData = optionsJson.series[0].data.find(
      (d: any) => d.category === 'nice',
    );
    const wasteData = optionsJson.series[0].data.find(
      (d: any) => d.category === 'waste',
    );

    // Check colors
    expect(mustData.itemStyle.color).toBe('#ef4444');
    expect(niceData.itemStyle.color).toBe('#3b82f6');
    expect(wasteData.itemStyle.color).toBe('#f59e0b');
  });
});
