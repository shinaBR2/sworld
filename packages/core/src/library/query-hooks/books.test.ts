import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useBooks } from './books';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBooks = [
    {
      id: '1',
      title: 'Book 1',
      author: 'Author 1',
      thumbnailUrl: 'url1',
      source: 'source1',
      totalPages: 300,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      reading_progresses: [
        {
          id: 'p1',
          currentPage: 300,
          totalPages: 300,
          percentage: 100,
          readingTimeMinutes: 120,
          lastReadAt: '2025-06-30T10:00:00Z',
          createdAt: '2025-06-28T10:00:00Z',
        },
      ],
    },
    {
      id: '2',
      title: 'Book 2',
      author: 'Author 2',
      thumbnailUrl: 'url2',
      source: 'source2',
      totalPages: 200,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      reading_progresses: [],
    },
  ];

  it('should fetch and transform books data correctly', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { books: mockBooks },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useBooks());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['books', 50, 0, 'all'],
      document: expect.anything(),
    });

    // Check transformation
    expect(result.current.data).toMatchObject([
      {
        ...mockBooks[0],
        currentProgress: mockBooks[0].reading_progresses[0],
        progressPercentage: 100,
        isCompleted: true,
        isNew: false,
      },
      {
        ...mockBooks[1],
        currentProgress: undefined,
        progressPercentage: 0,
        isCompleted: false,
        isNew: true,
      },
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    const { result } = renderHook(() => useBooks());
    expect(result.current).toEqual({ data: null, isLoading: true, error: null });
  });

  it('should handle error state', () => {
    const error = new Error('API error');
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
      error,
    });
    const { result } = renderHook(() => useBooks());
    expect(result.current).toEqual({ data: null, isLoading: false, error });
  });
});
