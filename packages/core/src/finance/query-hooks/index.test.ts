import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadTransactionsByPeriod } from './index';

// Mock the useRequest hook
vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('Finance Query Hooks', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');
  const mockMonth = 5;
  const mockYear = 2023;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useRequest with correct parameters', () => {
    // Mock the useRequest return value
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const result = useLoadTransactionsByPeriod({
      getAccessToken: mockGetAccessToken,
      month: mockMonth,
      year: mockYear,
    });

    // Verify useRequest was called with correct parameters
    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['finance-transactions', mockMonth, mockYear],
        getAccessToken: mockGetAccessToken,
        document: expect.anything(),
        variables: {
          month: mockMonth,
          year: mockYear,
        },
      })
    );

    // Verify the returned result
    expect(result).toEqual({
      videos: [],
      isLoading: true,
      error: null,
    });
  });

  it('should return transactions data when available', () => {
    const mockTransactions = [
      {
        id: '1',
        name: 'Groceries',
        amount: 50.25,
        month: 5,
        year: 2023,
        category: 'must',
        createdAt: '2023-05-10T12:00:00Z',
        updatedAt: '2023-05-10T12:00:00Z',
      },
      {
        id: '2',
        name: 'Coffee',
        amount: 4.5,
        month: 5,
        year: 2023,
        category: 'nice',
        createdAt: '2023-05-11T12:00:00Z',
        updatedAt: '2023-05-11T12:00:00Z',
      },
    ];

    // Mock the useRequest return value with data
    vi.mocked(useRequest).mockReturnValue({
      data: {
        finance_transactions: mockTransactions,
      },
      isLoading: false,
      error: null,
    });

    const result = useLoadTransactionsByPeriod({
      getAccessToken: mockGetAccessToken,
      month: mockMonth,
      year: mockYear,
    });

    // Verify the returned result contains the transactions
    expect(result).toEqual({
      videos: mockTransactions,
      isLoading: false,
      error: null,
    });
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch transactions');

    // Mock the useRequest return value with error
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const result = useLoadTransactionsByPeriod({
      getAccessToken: mockGetAccessToken,
      month: mockMonth,
      year: mockYear,
    });

    // Verify the returned result contains the error
    expect(result).toEqual({
      videos: [],
      isLoading: false,
      error: mockError,
    });
  });
});
