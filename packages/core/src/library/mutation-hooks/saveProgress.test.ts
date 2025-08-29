import { renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import { useSaveProgress } from './saveProgress';

// Mock dependencies
vi.mock('../../providers/auth');
vi.mock('../../providers/query');
vi.mock('../../universal/hooks/useMutation');

const mockAccessToken = vi.fn();
const mockInvalidateQuery = vi.fn();

// Spy on console.error to silence it during tests
const originalConsoleError = console.error;
console.error = vi.fn();

describe('useSaveProgress Mutation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: mockAccessToken,
    });
    vi.mocked(useQueryContext).mockReturnValue({
      invalidateQuery: mockInvalidateQuery,
    });
    vi.mocked(useMutationRequest).mockReturnValue({ mutateAsync: vi.fn() });
  });

  afterAll(() => {
    // Restore original console.error after tests
    console.error = originalConsoleError;
  });

  it('should save progress and invalidate relevant queries', () => {
    const mockOnSuccess = vi.fn();
    renderHook(() => useSaveProgress({ onSuccess: mockOnSuccess }));

    // Get the onSuccess callback from the mutation options
    const mutationOptions =
      vi.mocked(useMutationRequest).mock.calls[0][0].options;
    const onSuccessCallback = mutationOptions?.onSuccess;

    // Mock data and variables
    const mockData = {
      insert_reading_progresses_one: {
        id: '1',
        currentPage: 10,
        percentage: 25,
        lastReadAt: '2025-06-30T12:00:00Z',
      },
    };
    const mockVariables = {
      bookId: 'book-1',
      currentPage: 10,
      totalPages: 100,
      readingTimeMinutes: 30,
    };

    // Call the onSuccess callback directly
    onSuccessCallback?.(mockData, mockVariables);

    // Verify invalidation of all relevant queries
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['books']);
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['current-reading']);
    expect(mockInvalidateQuery).toHaveBeenCalledWith(['reading-stats']);
    expect(mockInvalidateQuery).toHaveBeenCalledWith([
      'book',
      mockVariables.bookId,
    ]);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should handle errors', () => {
    const mockOnError = vi.fn();
    renderHook(() => useSaveProgress({ onError: mockOnError }));

    // Get the onError callback from the mutation options
    const mutationOptions =
      vi.mocked(useMutationRequest).mock.calls[0][0].options;
    const onErrorCallback = mutationOptions?.onError;

    // Create a mock error
    const mockError = new Error('Failed');

    // Call the onError callback directly
    onErrorCallback?.(mockError);

    // Verify error handler was called
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });
});
