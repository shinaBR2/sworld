import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useReadingStats } from './readingStats';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useReadingStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    books_aggregate: { aggregate: { count: 10 } },
    completed_books: { aggregate: { count: 4 } },
    currently_reading: { aggregate: { count: 2 } },
    reading_time_this_month: { aggregate: { sum: { readingTimeMinutes: 123 } } },
  };

  it('should fetch and transform reading stats data correctly', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useReadingStats());

    const monthStart = `${new Date().toISOString().slice(0, 7)}-01`;
    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['reading-stats', monthStart],
      document: expect.anything(),
      variables: { monthStart },
    });

    expect(result.current.data).toEqual({
      totalBooks: 10,
      completedBooks: 4,
      currentlyReading: 2,
      readingTimeThisMonth: 123,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing aggregates and default to 0', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: {
        books_aggregate: { aggregate: {} },
        completed_books: { aggregate: {} },
        currently_reading: { aggregate: {} },
        reading_time_this_month: { aggregate: { sum: {} } },
      },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useReadingStats());
    expect(result.current.data).toEqual({
      totalBooks: 0,
      completedBooks: 0,
      currentlyReading: 0,
      readingTimeThisMonth: 0,
    });
  });

  it('should handle loading state', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    const { result } = renderHook(() => useReadingStats());
    expect(result.current).toEqual({ data: null, isLoading: true, error: null });
  });

  it('should handle error state', () => {
    const error = new Error('API error');
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
      error,
    });
    const { result } = renderHook(() => useReadingStats());
    expect(result.current).toEqual({ data: null, isLoading: false, error });
  });
});
