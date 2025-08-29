import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../../universal/hooks/use-request';
import { useLoadMonthlyComparison } from './index';

// Mock the useRequest hook
vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadMonthlyComparison', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data when request is successful', async () => {
    // Mock the useRequest hook to return successful data
    const mockData = {
      monthly_totals: {
        nodes: [
          { month: 1, year: 2023 },
          { month: 12, year: 2022 },
        ],
        aggregate: {
          sum: { amount: 1500 },
          count: 25,
        },
      },
    };

    (useRequest as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    // Render the hook
    const { result } = renderHook(() =>
      useLoadMonthlyComparison({ getAccessToken: mockGetAccessToken }),
    );

    // Verify the result
    expect(result.current.data).toEqual(mockData.monthly_totals);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Verify that useRequest was called with the correct parameters
    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['monthly_totals'],
        getAccessToken: mockGetAccessToken,
      }),
    );
  });

  it('should return empty array when data is undefined', () => {
    // Mock the useRequest hook to return undefined data
    (useRequest as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    // Render the hook
    const { result } = renderHook(() =>
      useLoadMonthlyComparison({ getAccessToken: mockGetAccessToken }),
    );

    // Verify the result
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    // Mock the useRequest hook to return loading state
    (useRequest as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    // Render the hook
    const { result } = renderHook(() =>
      useLoadMonthlyComparison({ getAccessToken: mockGetAccessToken }),
    );

    // Verify the result
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch data');

    // Mock the useRequest hook to return error state
    (useRequest as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    // Render the hook
    const { result } = renderHook(() =>
      useLoadMonthlyComparison({ getAccessToken: mockGetAccessToken }),
    );

    // Verify the result
    expect(result.current.error).toEqual(mockError);
  });
});
