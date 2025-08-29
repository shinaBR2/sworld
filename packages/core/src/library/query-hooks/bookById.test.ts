import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useBookById } from './bookById';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

vi.mock('../../providers/auth', () => ({
  useAuthContext: () => ({ getAccessToken: vi.fn() }),
}));

describe('useBookById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBook = {
    id: 'book-1',
    title: 'Test Book',
    author: 'Author',
    thumbnailUrl: 'cover.jpg',
    source: 'manual',
    totalPages: 123,
    createdAt: '2024-01-01T00:00:00.000Z',
    reading_progresses: [
      {
        id: 'progress-1',
        currentPage: 10,
        totalPages: 123,
        percentage: 8,
        readingTimeMinutes: 30,
        lastReadAt: '2024-07-01T10:00:00.000Z',
        createdAt: '2024-07-01T09:00:00.000Z',
      },
    ],
  };

  it('should fetch and return book data by id', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { books_by_pk: mockBook },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useBookById('book-1'));
    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['book', 'book-1'],
      getAccessToken: expect.any(Function),
      document: expect.anything(),
      variables: { id: 'book-1' },
    });
    expect(result.current.data).toEqual({ books_by_pk: mockBook });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useRequest>);
    const { result } = renderHook(() => useBookById('book-2'));
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should handle error state', () => {
    const error = new Error('API error');
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
      error,
    } as unknown as ReturnType<typeof useRequest>);
    const { result } = renderHook(() => useBookById('book-3'));
    expect(result.current).toEqual({ data: null, isLoading: false, error });
  });

  it('should return null data if book is not found', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { books_by_pk: null },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useRequest>);
    const { result } = renderHook(() => useBookById('book-404'));
    expect(result.current.data).toEqual({ books_by_pk: null });
  });
});
