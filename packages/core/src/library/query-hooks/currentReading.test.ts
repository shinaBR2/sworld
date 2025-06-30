import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useCurrentReading } from './currentReading';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useCurrentReading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseDate = new Date();

  const mockProgress = {
    id: 'progress-1',
    currentPage: 50,
    totalPages: 100,
    percentage: 50,
    lastReadAt: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    book: {
      id: 'book-1',
      title: 'Book Title',
      totalPages: 100,
      thumbnailUrl: 'cover.jpg',
    },
  };

  it('should fetch and transform current reading data correctly (hours ago)', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { reading_progresses: [mockProgress] },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useCurrentReading());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['current-reading'],
      document: expect.anything(),
    });

    expect(result.current.data).toMatchObject({
      id: mockProgress.book.id,
      title: mockProgress.book.title,
      currentPage: mockProgress.currentPage,
      totalPages: mockProgress.totalPages,
      lastReadAt: '2 hours ago',
      coverUrl: mockProgress.book.thumbnailUrl,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return null if there is no progress', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { reading_progresses: [] },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useCurrentReading());
    expect(result.current.data).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    const { result } = renderHook(() => useCurrentReading());
    expect(result.current).toEqual({ data: null, isLoading: true, error: null });
  });

  it('should handle error state', () => {
    const error = new Error('API error');
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
      error,
    });
    const { result } = renderHook(() => useCurrentReading());
    expect(result.current).toEqual({ data: null, isLoading: false, error });
  });

  it('should show lastReadText as days ago if > 24 hours', () => {
    const threeDaysAgo = new Date(baseDate.getTime() - 72 * 60 * 60 * 1000).toISOString();
    vi.mocked(useRequest).mockReturnValue({
      data: { reading_progresses: [{ ...mockProgress, lastReadAt: threeDaysAgo }] },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useCurrentReading());
    expect(result.current.data?.lastReadAt).toMatch(/3 days ago/);
  });

  it('should show lastReadText as "Just now" if < 1 hour', () => {
    const tenMinutesAgo = new Date(baseDate.getTime() - 10 * 60 * 1000).toISOString();
    vi.mocked(useRequest).mockReturnValue({
      data: { reading_progresses: [{ ...mockProgress, lastReadAt: tenMinutesAgo }] },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useCurrentReading());
    expect(result.current.data?.lastReadAt).toBe('Just now');
  });
});
