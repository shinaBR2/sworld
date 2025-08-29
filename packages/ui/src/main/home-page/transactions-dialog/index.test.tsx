import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionsDialog } from './index';

// Mock the useMediaQuery hook
let isMobileView = false;
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => isMobileView, // Will be controlled by our tests
  };
});

describe('TransactionsDialog', () => {
  const mockTransactions = [
    {
      id: '1',
      name: 'Groceries',
      amount: 50.25,
      month: 1,
      year: 2023,
      category: 'must',
      createdAt: '2023-01-15T12:00:00Z',
    },
    {
      id: '2',
      name: 'Movie Tickets',
      amount: 25.99,
      month: 1,
      year: 2023,
      category: 'nice',
      createdAt: '2023-01-20T18:30:00Z',
    },
    {
      id: '3',
      name: 'Fast Food',
      amount: 15.75,
      month: 1,
      year: 2023,
      category: 'waste',
      createdAt: '2023-01-22T19:45:00Z',
    },
  ];

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    transactions: mockTransactions,
    selectedCategory: 'total' as const,
  };

  const renderWithTheme = (props = {}) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <TransactionsDialog {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    isMobileView = false; // Reset to desktop view before each test
  });

  it('renders the dialog with the correct title', () => {
    renderWithTheme();

    expect(screen.getByText('All Expenses')).toBeInTheDocument();
  });

  it('displays all transactions when selectedCategory is total', () => {
    renderWithTheme();

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Movie Tickets')).toBeInTheDocument();
    expect(screen.getByText('Fast Food')).toBeInTheDocument();

    // Check amounts are displayed
    expect(screen.getByText('50.25')).toBeInTheDocument();
    expect(screen.getByText('25.99')).toBeInTheDocument();
    expect(screen.getByText('15.75')).toBeInTheDocument();
  });

  it('filters transactions based on selected category', () => {
    renderWithTheme({ selectedCategory: 'must' });

    expect(screen.getByText('Must Expenses')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Movie Tickets')).not.toBeInTheDocument();
    expect(screen.queryByText('Fast Food')).not.toBeInTheDocument();
  });

  it('shows empty state when no transactions match the category', () => {
    renderWithTheme({
      selectedCategory: 'must',
      transactions: [mockTransactions[1], mockTransactions[2]], // Only nice and waste transactions
    });

    expect(
      screen.getByText('No expenses found for this category'),
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithTheme();

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('displays the correct category label for each transaction', () => {
    renderWithTheme();

    // Check category labels
    expect(screen.getByText('Must')).toBeInTheDocument();
    expect(screen.getByText('Nice')).toBeInTheDocument();
    expect(screen.getByText('Waste')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    renderWithTheme();

    // This will depend on the locale of the test environment
    // For US locale, it would be something like:
    const dateStrings = mockTransactions.map((t) =>
      new Date(t.createdAt).toLocaleDateString(),
    );

    dateStrings.forEach((dateString) => {
      expect(screen.getByText(dateString)).toBeInTheDocument();
    });
  });

  // Test mobile view
  it('renders with AppBar in mobile view', () => {
    // Set to mobile view for this test
    isMobileView = true;

    renderWithTheme();

    // In mobile view, we should have a toolbar
    const toolbar = document.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();
  });
});
