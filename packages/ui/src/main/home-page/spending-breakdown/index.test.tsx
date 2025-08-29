import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SpendingBreakdown } from './index';

// Mock the DonutChart component
vi.mock('./donut-chart', () => ({
  DonutChart: ({ isLoading, data, onCategoryClick, selectedCategory }: any) => (
    <div data-testid="mock-donut-chart">
      <div data-testid="donut-loading">{isLoading.toString()}</div>
      <div data-testid="donut-data">{JSON.stringify(data)}</div>
      <div data-testid="donut-selected">{selectedCategory || 'none'}</div>
      {onCategoryClick && (
        <button
          data-testid="category-click-button"
          onClick={() => onCategoryClick('must')}
        >
          Click Category
        </button>
      )}
    </div>
  ),
}));

describe('SpendingBreakdown', () => {
  const theme = createTheme();

  const mockCategoryData = [
    { category: 'must', amount: 100, count: 2 },
    { category: 'nice', amount: 50, count: 1 },
    { category: 'waste', amount: 25, count: 1 },
    { category: 'total', amount: 175, count: 4 },
  ];

  const mockHandleCategoryClick = vi.fn();

  const renderComponent = (
    props: Partial<Parameters<typeof SpendingBreakdown>[0]> = {},
  ) => {
    return render(
      <ThemeProvider theme={theme}>
        <SpendingBreakdown
          isLoading={false}
          categoryData={mockCategoryData}
          handleCategoryClick={mockHandleCategoryClick}
          {...props}
        />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    renderComponent({ isLoading: true });

    // Check if skeleton is rendered - use class selector instead of data-testid
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).not.toBeNull();

    // Check if DonutChart is rendered with isLoading=true
    const donutLoading = screen.getByTestId('donut-loading');
    expect(donutLoading.textContent).toBe('true');
  });

  it('renders with data correctly', () => {
    renderComponent();

    // Check if title is rendered
    const title = screen.getByText('Spending Breakdown');
    expect(title).toBeInTheDocument();

    // Check if DonutChart is rendered with isLoading=false
    const donutLoading = screen.getByTestId('donut-loading');
    expect(donutLoading.textContent).toBe('false');

    // Check if data is filtered (total category should be removed)
    const donutData = screen.getByTestId('donut-data');
    const parsedData = JSON.parse(donutData.textContent || '[]');
    expect(parsedData.length).toBe(3); // 4 items - 1 (total) = 3
    expect(
      parsedData.find((item: any) => item.category === 'total'),
    ).toBeUndefined();
  });

  it('passes selectedCategory to DonutChart', () => {
    renderComponent({ selectedCategory: 'nice' });

    const donutSelected = screen.getByTestId('donut-selected');
    expect(donutSelected.textContent).toBe('nice');
  });

  it('calls handleCategoryClick when a category is clicked', async () => {
    renderComponent();

    const clickButton = screen.getByTestId('category-click-button');
    await userEvent.click(clickButton);

    expect(mockHandleCategoryClick).toHaveBeenCalledWith('must');
  });

  it('handles empty categoryData', () => {
    renderComponent({ categoryData: [] });

    const donutData = screen.getByTestId('donut-data');
    const parsedData = JSON.parse(donutData.textContent || '[]');
    expect(parsedData).toEqual([]);
  });

  it('handles undefined categoryData', () => {
    renderComponent({ categoryData: undefined });

    const donutData = screen.getByTestId('donut-data');
    const parsedData = JSON.parse(donutData.textContent || '[]');
    expect(parsedData).toEqual([]);
  });
});
