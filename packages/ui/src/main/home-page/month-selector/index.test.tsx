import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MonthSelector } from './index';

// First, let's modify the mock to add data-testid to the buttons
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

describe('MonthSelector', () => {
  const defaultProps = {
    displayMonth: 'January 2024',
    onPreviousMonth: vi.fn(),
    onNextMonth: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the month correctly', () => {
    render(<MonthSelector {...defaultProps} />);

    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('calls onPreviousMonth when previous button is clicked', async () => {
    render(<MonthSelector {...defaultProps} />);

    // Use data-testid instead of role and name
    const previousButton = screen
      .getByTestId('ChevronLeftIcon')
      .closest('button');
    await userEvent.click(previousButton!);

    expect(defaultProps.onPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it('calls onNextMonth when next button is clicked', async () => {
    render(<MonthSelector {...defaultProps} />);

    // Use data-testid instead of role and name
    const nextButton = screen.getByTestId('ChevronRightIcon').closest('button');
    await userEvent.click(nextButton!);

    expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('disables previous button when disablePrevious is true', () => {
    render(<MonthSelector {...defaultProps} disablePrevious={true} />);

    // Use data-testid instead of role and name
    const previousButton = screen
      .getByTestId('ChevronLeftIcon')
      .closest('button');
    expect(previousButton).toBeDisabled();
  });

  it('disables next button when disableNext is true', () => {
    render(<MonthSelector {...defaultProps} disableNext={true} />);

    // Use data-testid instead of role and name
    const nextButton = screen.getByTestId('ChevronRightIcon').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('renders with card variant by default', () => {
    render(<MonthSelector {...defaultProps} />);

    // Use data-testid instead of role and name
    const card = screen.getByTestId('ChevronLeftIcon').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders without card when variant is plain', () => {
    render(<MonthSelector {...defaultProps} variant="plain" />);

    // Check that the buttons are in the document using data-testid
    expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();

    // But there should be no card
    const card = document.querySelector('.MuiCard-root');
    expect(card).not.toBeInTheDocument();
  });
});
