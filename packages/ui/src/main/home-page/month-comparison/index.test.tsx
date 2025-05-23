import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MonthComparison } from './index';
import { ThemeProvider, createTheme } from '@mui/material';

describe('MonthComparison', () => {
  const theme = createTheme();

  const mockData = [
    { month: '2023-01', displayMonth: 'Jan', total: 100 },
    { month: '2023-02', displayMonth: 'Feb', total: 150 },
    { month: '2023-03', displayMonth: 'Mar', total: 120 },
  ];

  const renderComponent = (props: Partial<Parameters<typeof MonthComparison>[0]> = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <MonthComparison data={mockData} currentMonthIndex={2} {...props} />
      </ThemeProvider>
    );
  };

  it('renders the title correctly', () => {
    renderComponent();

    expect(screen.getByText('Monthly Spending Trend')).toBeInTheDocument();
  });

  it('shows percentage decrease correctly', () => {
    renderComponent();

    // Current month (index 2) has total 120, previous month (index 1) has total 150
    // Percentage change: (120 - 150) / 150 * 100 = -20%
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.getByText('less than last month')).toBeInTheDocument();
  });

  it('shows percentage increase correctly', () => {
    // Modify data to show an increase
    const increasingData = [
      { month: '2023-01', displayMonth: 'Jan', total: 100 },
      { month: '2023-02', displayMonth: 'Feb', total: 80 },
      { month: '2023-03', displayMonth: 'Mar', total: 120 },
    ];

    renderComponent({ data: increasingData });

    // Current month (index 2) has total 120, previous month (index 1) has total 80
    // Percentage change: (120 - 80) / 80 * 100 = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('more than last month')).toBeInTheDocument();
  });

  it('does not show percentage change when there is only one month of data', () => {
    const singleMonthData = [{ month: '2023-01', displayMonth: 'Jan', total: 100 }];

    renderComponent({ data: singleMonthData, currentMonthIndex: 0 });

    // Percentage change section should not be rendered
    expect(screen.queryByText('more than last month')).not.toBeInTheDocument();
    expect(screen.queryByText('less than last month')).not.toBeInTheDocument();
  });

  it('handles zero previous month total correctly', () => {
    const zeroData = [
      { month: '2023-01', displayMonth: 'Jan', total: 0 },
      { month: '2023-02', displayMonth: 'Feb', total: 100 },
    ];

    renderComponent({ data: zeroData, currentMonthIndex: 1 });

    // Should show 0% change
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('shows "No data available" when data is empty', () => {
    renderComponent({ data: [] });

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
