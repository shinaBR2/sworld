import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SummaryCard } from './index';

// Mock the styled components and utils
vi.mock('./styled', () => ({
  StyledCard: ({ children, category, selected, onClick }: any) => (
    <div data-testid="styled-card" data-category={category} data-selected={selected.toString()} onClick={onClick}>
      {children}
    </div>
  ),
  StyledAmount: ({ children }: any) => <div data-testid="styled-amount">{children}</div>,
  StyledCategoryName: ({ children }: any) => <div data-testid="styled-category-name">{children}</div>,
  StyledCategoryWrapper: ({ children }: any) => <div data-testid="styled-category-wrapper">{children}</div>,
}));

vi.mock('./utils', () => ({
  getCategoryIcon: (category: string) => `${category}-icon`,
  getCategoryTitle: (category: string) => `${category.charAt(0).toUpperCase() + category.slice(1)} Title`,
}));

vi.mock('./skeleton', () => ({
  SummaryCardSkeleton: () => <div data-testid="summary-card-skeleton" />,
}));

describe('SummaryCard', () => {
  const defaultProps = {
    isLoading: false,
    category: 'must' as const,
    amount: 123.45,
    count: 5,
  };

  it('renders loading skeleton when isLoading is true', () => {
    render(<SummaryCard {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('summary-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('styled-card')).not.toBeInTheDocument();
  });

  it('renders card with correct category and selected state', () => {
    render(<SummaryCard {...defaultProps} selected={true} />);

    const card = screen.getByTestId('styled-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('data-category', 'must');
    expect(card).toHaveAttribute('data-selected', 'true');
  });

  it('displays the correct amount formatted as currency', () => {
    render(<SummaryCard {...defaultProps} />);

    const amount = screen.getByTestId('styled-amount');
    expect(amount).toHaveTextContent('$123.45');
  });

  it('displays the correct category icon and title', () => {
    render(<SummaryCard {...defaultProps} />);

    const categoryName = screen.getByTestId('styled-category-name');
    expect(categoryName).toHaveTextContent('must-icon');
    expect(categoryName).toHaveTextContent('Must Title');
  });

  it('displays the correct transaction count for multiple transactions', () => {
    render(<SummaryCard {...defaultProps} count={5} />);

    expect(screen.getByText('5 transactions')).toBeInTheDocument();
  });

  it('displays the correct transaction count for a single transaction', () => {
    render(<SummaryCard {...defaultProps} count={1} />);

    expect(screen.getByText('1 transaction')).toBeInTheDocument();
  });

  it('displays a non-breaking space when count is 0', () => {
    render(<SummaryCard {...defaultProps} count={0} />);

    const paragraph = screen.getByText(/^\s*$/, {
      selector: 'p.MuiTypography-body2',
    });
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.textContent?.trim()).toBe('');
  });

  it('calls onClick handler when card is clicked', () => {
    const handleClick = vi.fn();
    render(<SummaryCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByTestId('styled-card');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
